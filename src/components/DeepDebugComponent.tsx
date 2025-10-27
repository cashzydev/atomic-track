import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const DeepDebugComponent: React.FC = () => {
  const { user } = useAuth();
  const { data: habits, undoHabit, refetch } = useHabits();
  const [debugResult, setDebugResult] = useState<string>('');

  const deepDebug = async () => {
    if (!user || !habits || habits.length === 0) {
      setDebugResult('❌ Nenhum hábito encontrado');
      return;
    }

    const habit = habits[0];
    const today = new Date().toISOString().split('T')[0];
    
    setDebugResult(`🔍 Debug profundo para hábito: ${habit.title}\n`);
    setDebugResult(prev => prev + `📅 Data do cliente: ${today}\n`);

    try {
      // 1. Verificar data do servidor
      const { data: serverDate, error: serverDateError } = await supabase.rpc('get_server_date');
      setDebugResult(prev => prev + `🗓️ Data do servidor: ${serverDate} (erro: ${serverDateError?.message || 'nenhum'})\n`);

      // 2. Buscar completions usando filtro duplo
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habit.id)
        .eq('user_id', user.id)
        .gte('date', today)
        .lte('date', today)
        .gte('percentage', 100);

      setDebugResult(prev => prev + `📋 Completions encontradas: ${completions?.length || 0}\n`);
      if (completionsError) {
        setDebugResult(prev => prev + `❌ Erro na busca: ${completionsError.message}\n`);
      }
      if (completions && completions.length > 0) {
        setDebugResult(prev => prev + `📝 Detalhes: ${JSON.stringify(completions, null, 2)}\n`);
      }

      // 3. Verificar estado na interface
      setDebugResult(prev => prev + `🎯 Estado na interface: completedToday = ${habit.completedToday}\n`);

      // 4. Verificar usando RPC
      const { data: rpcCompletions, error: rpcError } = await supabase
        .rpc('get_user_todays_completions', { p_user_id: user.id });
      
      setDebugResult(prev => prev + `🔍 RPC completions: ${rpcCompletions?.length || 0}\n`);
      if (rpcError) {
        setDebugResult(prev => prev + `❌ Erro RPC: ${rpcError.message}\n`);
      }
      
      // 4.1. INVESTIGAÇÃO RPC: Verificar detalhes da RPC
      if (rpcCompletions && rpcCompletions.length > 0) {
        setDebugResult(prev => prev + `📝 Detalhes RPC: ${JSON.stringify(rpcCompletions, null, 2)}\n`);
        
        // Verificar se há completions de outros hábitos na RPC
        const otherHabits = rpcCompletions.filter((c: any) => c.habit_id !== habit.id);
        if (otherHabits.length > 0) {
          setDebugResult(prev => prev + `⚠️ RPC inclui outros hábitos: ${otherHabits.length}\n`);
          setDebugResult(prev => prev + `📝 Outros hábitos: ${JSON.stringify(otherHabits, null, 2)}\n`);
        }
      }

      // 5. Verificar se hábito está na lista de completados
      const isInRpc = rpcCompletions?.some((c: any) => c.habit_id === habit.id);
      setDebugResult(prev => prev + `✅ Está na lista RPC: ${isInRpc}\n`);

      // 6. Verificar inconsistência entre query direta e RPC
      const hasCompletion = completions && completions.length > 0;
      const interfaceShowsCompleted = habit.completedToday;
      const rpcShowsCompleted = isInRpc;

      setDebugResult(prev => prev + `\n🔍 ANÁLISE DE INCONSISTÊNCIA:\n`);
      setDebugResult(prev => prev + `- Tem completion no banco: ${hasCompletion}\n`);
      setDebugResult(prev => prev + `- Interface mostra completo: ${interfaceShowsCompleted}\n`);
      setDebugResult(prev => prev + `- RPC mostra completo: ${rpcShowsCompleted}\n`);

      // 7. INVESTIGAÇÃO PROFUNDA: Verificar se há completions duplicadas
      if (rpcCompletions && rpcCompletions.length !== (completions?.length || 0)) {
        setDebugResult(prev => prev + `⚠️ INCONSISTÊNCIA DETECTADA!\n`);
        setDebugResult(prev => prev + `- Query direta encontrou: ${completions?.length || 0}\n`);
        setDebugResult(prev => prev + `- RPC encontrou: ${rpcCompletions.length}\n`);
        
        // Buscar todas as completions do hábito hoje (sem filtros)
        const { data: allCompletions, error: allError } = await supabase
          .from('habit_completions')
          .select('*')
          .eq('habit_id', habit.id)
          .eq('user_id', user.id)
          .eq('date', today);
        
        setDebugResult(prev => prev + `🔍 Todas as completions do hábito hoje: ${allCompletions?.length || 0}\n`);
        if (allCompletions && allCompletions.length > 0) {
          setDebugResult(prev => prev + `📝 Detalhes completos: ${JSON.stringify(allCompletions, null, 2)}\n`);
        }
        
        // Verificar se há completions com percentage < 100
        const lowPercentage = allCompletions?.filter(c => c.percentage < 100) || [];
        if (lowPercentage.length > 0) {
          setDebugResult(prev => prev + `⚠️ Completions com percentage < 100: ${lowPercentage.length}\n`);
          setDebugResult(prev => prev + `📝 Detalhes: ${JSON.stringify(lowPercentage, null, 2)}\n`);
        }
      } else {
        setDebugResult(prev => prev + `✅ Estado consistente\n`);
      }

    } catch (error: any) {
      setDebugResult(prev => prev + `❌ Erro geral: ${error.message}\n`);
    }
  };

  const testUndoWithDebug = async () => {
    if (!habits || habits.length === 0) {
      setDebugResult('❌ Nenhum hábito encontrado');
      return;
    }

    const habit = habits[0];
    setDebugResult(`🧪 Testando undo com debug para: ${habit.title}\n`);

    try {
      // Debug antes do undo
      setDebugResult(prev => prev + `📊 ANTES DO UNDO:\n`);
      await deepDebug();
      
      setDebugResult(prev => prev + `\n🔄 EXECUTANDO UNDO...\n`);
      
      // Executar undo
      await undoHabit(habit.id);
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Debug após o undo
      setDebugResult(prev => prev + `\n📊 APÓS O UNDO:\n`);
      await deepDebug();
      
    } catch (error: any) {
      setDebugResult(prev => prev + `❌ Erro no undo: ${error.message}\n`);
    }
  };

  const forceRefresh = async () => {
    setDebugResult('🔄 Forçando refresh...\n');
    try {
      await refetch();
      setDebugResult(prev => prev + '✅ Refresh concluído\n');
      await deepDebug();
    } catch (error: any) {
      setDebugResult(prev => prev + `❌ Erro no refresh: ${error.message}\n`);
    }
  };

  const cleanDuplicateCompletions = async () => {
    if (!user || !habits || habits.length === 0) {
      setDebugResult('❌ Nenhum hábito encontrado');
      return;
    }

    const habit = habits[0];
    const today = new Date().toISOString().split('T')[0];
    
    setDebugResult(`🧹 Limpando completions duplicadas para: ${habit.title}\n`);

    try {
      // 1. Buscar todas as completions do hábito hoje
      const { data: allCompletions, error: allError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habit.id)
        .eq('user_id', user.id)
        .eq('date', today)
        .gte('percentage', 100);

      if (allError) {
        setDebugResult(prev => prev + `❌ Erro ao buscar completions: ${allError.message}\n`);
        return;
      }

      setDebugResult(prev => prev + `📋 Completions encontradas: ${allCompletions?.length || 0}\n`);

      if (!allCompletions || allCompletions.length <= 1) {
        setDebugResult(prev => prev + `✅ Nenhuma duplicata encontrada\n`);
        return;
      }

      // 2. Manter apenas a mais recente
      const sortedCompletions = allCompletions.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );
      
      const keepCompletion = sortedCompletions[0];
      const deleteCompletions = sortedCompletions.slice(1);

      setDebugResult(prev => prev + `✅ Mantendo completion: ${keepCompletion.id} (${keepCompletion.completed_at})\n`);
      setDebugResult(prev => prev + `🗑️ Deletando ${deleteCompletions.length} duplicatas\n`);

      // 3. Deletar duplicatas
      for (const completion of deleteCompletions) {
        const { error: deleteError } = await supabase
          .from('habit_completions')
          .delete()
          .eq('id', completion.id);

        if (deleteError) {
          setDebugResult(prev => prev + `❌ Erro ao deletar completion ${completion.id}: ${deleteError.message}\n`);
        } else {
          setDebugResult(prev => prev + `✅ Deletada completion ${completion.id}\n`);
        }
      }

      setDebugResult(prev => prev + `🎉 Limpeza concluída!\n`);
      
      // 4. Verificar resultado
      await deepDebug();

    } catch (error: any) {
      setDebugResult(prev => prev + `❌ Erro na limpeza: ${error.message}\n`);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug Profundo - Problema de Sincronização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Hábitos Disponíveis:</h3>
          {habits?.slice(0, 3).map(habit => (
            <div key={habit.id} className="flex items-center justify-between p-2 border rounded">
              <span>{habit.title}</span>
              <Badge variant={habit.completedToday ? "default" : "secondary"}>
                {habit.completedToday ? "Completo" : "Pendente"}
              </Badge>
            </div>
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={deepDebug} className="flex-1 min-w-32">
            🔍 Debug Profundo
          </Button>
          
          <Button onClick={testUndoWithDebug} variant="outline" className="flex-1 min-w-32">
            🧪 Teste Undo + Debug
          </Button>
          
          <Button onClick={forceRefresh} variant="secondary" className="flex-1 min-w-32">
            🔄 Force Refresh
          </Button>
          
          <Button onClick={cleanDuplicateCompletions} variant="destructive" className="flex-1 min-w-32">
            🧹 Limpar Duplicatas
          </Button>
        </div>

        {debugResult && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap max-h-96 overflow-auto">{debugResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeepDebugComponent;
