import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SimpleUndoTest: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testDirectUndo = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Buscar um hábito ativo
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      if (habitsError || !habits || habits.length === 0) {
        setResult({ error: 'Nenhum hábito encontrado', habitsError });
        return;
      }

      const habitId = habits[0].id;
      const today = new Date().toISOString().split('T')[0];

      // 2. Verificar se há completion hoje
      const { data: completions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('date', today);

      console.log('📋 Completions encontradas:', completions);

      // 3. Se não há completion, criar uma para testar
      if (!completions || completions.length === 0) {
        const { error: insertError } = await supabase
          .from('habit_completions')
          .insert({
            habit_id: habitId,
            user_id: user.id,
            date: today,
            percentage: 100,
            completed_at: new Date().toISOString()
          });

        if (insertError) {
          setResult({ error: 'Erro ao criar completion', insertError });
          return;
        }

        console.log('✅ Completion criada para teste');
      }

      // 4. Agora deletar a completion com mais detalhes
      console.log('🗑️ Tentando deletar completion:', {
        habit_id: habitId,
        user_id: user.id,
        date: today
      });

      const { error: deleteError, count: deleteCount } = await supabase
        .from('habit_completions')
        .delete({ count: 'exact' })
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('date', today);

      console.log('🗑️ Resultado da deleção:', { deleteError, deleteCount });

      // 5. Verificar se foi deletada
      const { data: finalCompletions, error: finalError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('date', today);

      console.log('📋 Completions após deleção:', finalCompletions);

      setResult({
        habitId,
        today,
        initialCompletions: completions,
        deleteError,
        deleteCount,
        finalCompletions,
        finalError,
        success: !deleteError && deleteCount > 0 && (!finalCompletions || finalCompletions.length === 0)
      });

    } catch (error) {
      console.error('❌ Erro no teste:', error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste Direto de Undo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testDirectUndo} disabled={loading}>
          {loading ? 'Testando...' : 'Testar Undo Direto'}
        </Button>

        {result && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SimpleUndoTest;
