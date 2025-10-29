# 📋 Plano de Implementação: Integração Cakto + Controle de Acesso

## 🎯 Objetivo
Integrar gateway de pagamentos Cakto para liberar acesso ao app apenas após pagamento confirmado. Implementar restrições robustas para não pagantes.

---

## 📊 Fluxo de Pagamento Proposto

```
1. Usuário clica em CTA → Abre CheckoutModal
2. Usuário clica "Garantir minha vaga de fundador"
3. Redireciona para Cakto checkout (com email/token)
4. Usuário realiza pagamento no Cakto
5. Cakto envia webhook para Supabase Function
6. Webhook valida e cria subscription
7. Usuário é redirecionado para /auth/success?payment_id=xxx
8. Sistema verifica pagamento e cria conta se necessário
9. Usuário acessa app com subscription ativa
```

---

## 🔧 Componentes a Implementar

### 1. **CheckoutModal.tsx** (Otimizado)
- ✅ Copy otimizada conforme especificado
- ✅ Integração com Cakto checkout URL
- ✅ Geração de token único por sessão
- ✅ Redirecionamento seguro para Cakto

### 2. **Edge Function: cakto-webhook** (Aprimorar)
- ✅ Processar evento `payment.approved`
- ✅ Criar/atualizar subscription na tabela `subscriptions`
- ✅ Atualizar `profiles.tier` para `founder` ou `pro`
- ✅ Criar usuário se não existir (baseado no email)
- ✅ Validar assinatura do webhook
- ✅ Logs detalhados para debug

### 3. **Página de Callback: /auth/payment-success**
- ✅ Verificar status do pagamento
- ✅ Criar conta se necessário
- ✅ Fazer login automático
- ✅ Redirecionar para onboarding/dashboard

### 4. **Hook: usePaymentAccess** (Novo)
- ✅ Verificar se usuário tem subscription ativa
- ✅ Verificar se subscription não expirou
- ✅ Verificar tier válido (`founder`, `pro`, `enterprise`)
- ✅ Cache inteligente com refresh periódico

### 5. **Componente: PaymentGuard** (Novo)
- ✅ Proteger rotas baseado em pagamento
- ✅ Mostrar PaywallModal se não pagou
- ✅ Redirecionar para landing se necessário

### 6. **Migration: Adicionar tier 'founder'**
- ✅ Atualizar CHECK constraint em `subscriptions.tier`
- ✅ Adicionar coluna `cakto_payment_id` para rastreamento
- ✅ Adicionar coluna `is_founder` para benefícios exclusivos

### 7. **Atualizar ProtectedRoute**
- ✅ Adicionar verificação de pagamento
- ✅ Redirecionar para checkout se não pagou

---

## 🔒 Segurança e Validações

### Webhook Security
- ✅ Validar `x-cakto-signature` header
- ✅ Comparar com `CAKTO_WEBHOOK_SECRET`
- ✅ Rate limiting (máximo 10 requisições/minuto por IP)
- ✅ Validar payload structure antes de processar
- ✅ Idempotência: verificar se payment_id já foi processado

### Database Security
- ✅ RLS policies para `subscriptions`
- ✅ Função `SECURITY DEFINER` para criar subscriptions
- ✅ Validação de tier em triggers
- ✅ Índices para performance

### Frontend Security
- ✅ Validação de subscription no servidor (não só frontend)
- ✅ Refresh token de subscription periódico
- ✅ Fallback para verificação manual se cache falhar

---

## 📝 Estrutura de Dados

### Tabela `subscriptions`
```sql
- id: UUID
- user_id: UUID (FK → profiles.id)
- tier: TEXT CHECK ('free', 'founder', 'pro', 'enterprise')
- status: TEXT CHECK ('active', 'cancelled', 'expired', 'trial')
- cakto_payment_id: TEXT (novo)
- expires_at: TIMESTAMPTZ
- started_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Tabela `profiles`
```sql
- Adicionar:
  - payment_email: TEXT (email usado no pagamento)
  - is_founder: BOOLEAN DEFAULT false
```

---

## 🚀 Passos de Implementação

### Fase 1: Preparação (30min)
1. ✅ Criar migration para adicionar `founder` tier
2. ✅ Adicionar coluna `cakto_payment_id` em subscriptions
3. ✅ Adicionar coluna `is_founder` em profiles
4. ✅ Atualizar tipos TypeScript

### Fase 2: Modal Otimizado (20min)
1. ✅ Atualizar CheckoutModal com copy otimizada
2. ✅ Integrar com URL do Cakto
3. ✅ Adicionar token único por sessão
4. ✅ Melhorar design conforme especificado

### Fase 3: Webhook Aprimorado (45min)
1. ✅ Melhorar função `cakto-webhook`
2. ✅ Criar usuário se não existir
3. ✅ Processar pagamento único (R$19,97 por 3 meses)
4. ✅ Adicionar logs detalhados
5. ✅ Tratar idempotência

### Fase 4: Callback de Pagamento (30min)
1. ✅ Criar página `/auth/payment-success`
2. ✅ Verificar status do pagamento
3. ✅ Criar conta se necessário
4. ✅ Fazer login automático
5. ✅ Redirecionar para onboarding

### Fase 5: Proteção de Rotas (45min)
1. ✅ Criar hook `usePaymentAccess`
2. ✅ Criar componente `PaymentGuard`
3. ✅ Atualizar `ProtectedRoute` para verificar pagamento
4. ✅ Criar `PaywallModal` específico para não pagantes
5. ✅ Testar fluxo completo

### Fase 6: Testes e Validação (30min)
1. ✅ Testar fluxo de pagamento completo
2. ✅ Testar webhook manualmente
3. ✅ Validar segurança
4. ✅ Testar edge cases (pagamento duplicado, etc)

---

## ⚠️ Pontos de Atenção

### Idempotência
- Webhook pode ser chamado múltiplas vezes
- Verificar se `cakto_payment_id` já existe antes de criar subscription

### Usuário Não Existente
- Se email não existe no sistema, criar usuário temporário
- Enviar email de confirmação para criar senha
- Ou criar conta automática e enviar senha temporária

### Expiração de Subscription
- `founder` tier: 3 meses (90 dias)
- Criar job para verificar expirações diariamente
- Notificar usuário antes de expirar

### Segurança
- Nunca confiar apenas em validação frontend
- Sempre validar subscription no backend
- Usar RLS policies do Supabase
- Validar assinatura do webhook sempre

---

## 📦 Configuração Necessária

### Variáveis de Ambiente
```env
VITE_CAKTO_CHECKOUT_URL=https://pay.cakto.com.br/zrgzgpv
CAKTO_WEBHOOK_SECRET=d2b87625-20a5-4ac8-a321-f7435fb825b9
SUPABASE_URL=https://gkalmvozhjhnqwmzvuws.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<chave_service_role>
```

### Cakto Dashboard
- Configurar webhook URL: `https://gkalmvozhjhnqwmzvuws.supabase.co/functions/v1/cakto-webhook`
- Configurar webhook secret: `d2b87625-20a5-4ac8-a321-f7435fb825b9`
- Eventos a escutar: `payment.approved`, `payment.rejected`

---

## 🎨 Copy Otimizada (Já Definida)

### Título
"O problema não é você. É o seu sistema."

### Subtítulo
"Seja um dos fundadores do atomicTrack e ajude a construir a ferramenta definitiva para a consistência."

### Benefícios
1. **Simplicidade Guiada**: "Crie um hábito em 3 perguntas. Sem menus complexos, sem distrações."
2. **Progresso Sem Punição**: "Seu heatmap de consistência mostra padrões, não falhas. Celebre o progresso, não a perfeição."
3. **Foco para o seu Cérebro**: "Uma interface minimalista, desenhada para acalmar a mente e evitar a sobrecarga sensorial."
4. **Baseado em Ciência**: "As 4 Leis de 'Hábitos Atômicos' em ação."

### Checklist do Plano Fundador
- ✅ Seja um dos arquitetos do produto
- ✅ Suporte prioritário e acesso direto ao fundador
- ✅ Acesso completo e vitalício à versão atual
- ✅ Pagamento único. Sem mensalidades, sem surpresas.

---

## ✅ Checklist de Implementação

- [ ] Migration para adicionar tier 'founder'
- [ ] Migration para adicionar colunas no subscriptions
- [ ] Atualizar CheckoutModal com copy otimizada
- [ ] Integrar CheckoutModal com URL do Cakto
- [ ] Melhorar função cakto-webhook
- [ ] Criar página /auth/payment-success
- [ ] Criar hook usePaymentAccess
- [ ] Criar componente PaymentGuard
- [ ] Atualizar ProtectedRoute
- [ ] Criar PaywallModal específico
- [ ] Configurar variáveis de ambiente
- [ ] Testar fluxo completo
- [ ] Validar segurança

---

## 📚 Referências

- Cakto Checkout: https://pay.cakto.com.br/zrgzgpv
- Webhook URL: https://gkalmvozhjhnqwmzvuws.supabase.co/functions/v1/cakto-webhook
- Webhook Secret: d2b87625-20a5-4ac8-a321-f7435fb825b9


