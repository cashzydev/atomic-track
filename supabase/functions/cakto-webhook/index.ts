import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cakto-signature',
};

interface CaktoWebhookPayload {
  event: string;
  data: {
    id: string;
    customer: {
      email: string;
      name: string;
    };
    status: string;
    amount: number;
    payment_method?: string;
    subscription?: {
      id: string;
      status: string;
      plan: {
        interval: string;
      };
    };
  };
  signature?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('CAKTO_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('CAKTO_WEBHOOK_SECRET não configurado');
    }

    const payload: CaktoWebhookPayload = await req.json();
    console.log('Webhook recebido:', {
      event: payload.event,
      payment_id: payload.data.id,
      email: payload.data.customer.email,
      amount: payload.data.amount
    });

    // Verificar assinatura do webhook
    const signature = req.headers.get('x-cakto-signature');
    if (signature !== webhookSecret) {
      console.error('Assinatura inválida do webhook. Esperado:', webhookSecret, 'Recebido:', signature);
      return new Response(JSON.stringify({ error: 'Assinatura inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const customerEmail = payload.data.customer.email;
    const paymentId = payload.data.id;

    // Buscar usuário pelo email
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Erro ao buscar usuários:', usersError);
      throw usersError;
    }

    const user = users.users.find(u => u.email === customerEmail);

    if (!user) {
      console.error('Usuário não encontrado:', customerEmail);
      // Para pagamento único, podemos criar o usuário automaticamente
      // Por enquanto, retornamos erro (usuário deve criar conta primeiro)
      return new Response(JSON.stringify({ 
        error: 'Usuário não encontrado',
        message: 'Por favor, crie uma conta antes de realizar o pagamento.',
        email: customerEmail
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = user.id;

    // Processar eventos
    switch (payload.event) {
      case 'payment.approved': {
        // Pagamento único aprovado - criar subscription founder (90 dias)
        const tier = 'founder';
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 90); // 3 meses

        // Verificar se já existe subscription com este payment_id (idempotência)
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('cakto_payment_id', paymentId)
          .maybeSingle();

        if (existingSub) {
          console.log(`Pagamento ${paymentId} já processado. Subscription ID: ${existingSub.id}`);
          return new Response(JSON.stringify({ 
            success: true, 
            message: 'Pagamento já processado',
            subscription_id: existingSub.id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Usar função RPC para processar pagamento (idempotente)
        const { data: subscriptionId, error: processError } = await supabase
          .rpc('process_cakto_payment', {
            p_email: customerEmail,
            p_payment_id: paymentId,
            p_amount: payload.data.amount,
            p_tier: tier,
            p_expires_days: 90
          });

        if (processError) {
          console.error('Erro ao processar pagamento:', processError);
          
          // Se falhar por usuário não encontrado, tentar criar subscription manualmente
          if (processError.message.includes('não encontrado')) {
            // Criar subscription diretamente
            const { error: subError } = await supabase
              .from('subscriptions')
              .insert({
                user_id: userId,
                tier: tier,
                status: 'active',
                cakto_payment_id: paymentId,
                expires_at: expiresAt.toISOString(),
                started_at: new Date().toISOString(),
              });

            if (subError) {
              throw subError;
            }

            // Atualizar profile
            await supabase
              .from('profiles')
              .update({
                tier: tier,
                is_founder: true,
                payment_email: customerEmail
              })
              .eq('id', userId);
          } else {
            throw processError;
          }
        }

        console.log(`Pagamento aprovado para user ${userId}. Subscription criada.`);
        break;
      }

      case 'payment.rejected': {
        // Pagamento rejeitado - não fazer nada, apenas log
        console.log(`Pagamento rejeitado para user ${userId}`);
        break;
      }

      case 'subscription.created':
      case 'subscription.renewed': {
        // Para assinaturas recorrentes (não é o caso atual, mas deixar preparado)
        const tier = payload.data.subscription?.plan.interval === 'yearly' ? 'pro' : 'pro';
        const expiresAt = payload.data.subscription?.plan.interval === 'yearly'
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: subError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            tier,
            status: 'active',
            stripe_subscription_id: payload.data.subscription?.id || payload.data.id,
            expires_at: expiresAt,
            started_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          });

        if (subError) {
          console.error('Erro ao atualizar subscription:', subError);
          throw subError;
        }

        console.log(`Subscription ${payload.event} para user ${userId}`);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired': {
        // Cancelar subscription
        const { error: cancelError } = await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            expires_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (cancelError) {
          console.error('Erro ao cancelar subscription:', cancelError);
          throw cancelError;
        }

        console.log(`Subscription cancelada para user ${userId}`);
        break;
      }

      default:
        console.log(`Evento não tratado: ${payload.event}`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Webhook processado com sucesso'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro no webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
