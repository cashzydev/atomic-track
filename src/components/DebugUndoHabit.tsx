import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DebugUndoHabit: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debugUndoProcess = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // 1. Obter data do servidor
      const { data: serverDate, error: serverDateError } = await supabase
        .rpc('get_server_date');
      
      console.log('🗓️ Server date:', serverDate, 'Error:', serverDateError);

      // 2. Buscar hábitos do usuário
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1);

      console.log('📋 Habits:', habits, 'Error:', habitsError);

      if (!habits || habits.length === 0) {
        setDebugInfo({ error: 'Nenhum hábito encontrado' });
        return;
      }

      const habitId = habits[0].id;

      // 3. Buscar completions de hoje
      const { data: todayCompletions, error: completionsError } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('date', serverDate || new Date().toISOString().split('T')[0]);

      console.log('✅ Today completions:', todayCompletions, 'Error:', completionsError);

      // 4. Usar RPC para buscar completions
      const { data: rpcCompletions, error: rpcError } = await supabase
        .rpc('get_user_todays_completions', { p_user_id: user.id });

      console.log('🔍 RPC completions:', rpcCompletions, 'Error:', rpcError);

      // 5. Verificar se hábito está marcado como completo
      const isCompleted = rpcCompletions?.some((c: any) => c.habit_id === habitId) || false;

      setDebugInfo({
        serverDate,
        serverDateError,
        habitId,
        habitTitle: habits[0].title,
        todayCompletions,
        completionsError,
        rpcCompletions,
        rpcError,
        isCompleted,
        userTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        clientDate: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('❌ Debug error:', error);
      setDebugInfo({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testUndoHabit = async () => {
    if (!user || !debugInfo?.habitId) return;
    
    setLoading(true);
    try {
      const habitId = debugInfo.habitId;
      const serverDate = debugInfo.serverDate;

      console.log('🔄 Testing undo for habit:', habitId, 'on date:', serverDate);

      // 1. Deletar completion
      const { error: deleteError } = await supabase
        .from('habit_completions')
        .delete()
        .eq('habit_id', habitId)
        .eq('user_id', user.id)
        .eq('date', serverDate);

      console.log('🗑️ Delete result:', deleteError);

      if (deleteError) {
        setDebugInfo(prev => ({ ...prev, deleteError }));
        return;
      }

      // 2. Recalcular streak
      const { data: streakData, error: streakError } = await supabase
        .rpc('calculate_habit_streak', { p_habit_id: habitId });

      console.log('📊 Streak calculation:', streakData, 'Error:', streakError);

      // 3. Atualizar hábito
      const { error: updateError } = await supabase
        .from('habits')
        .update({ 
          streak: streakData?.[0]?.current_streak || 0,
          longest_streak: streakData?.[0]?.longest_streak || 0,
          last_completed: null
        })
        .eq('id', habitId);

      console.log('📝 Update result:', updateError);

      // 4. Verificar novamente
      const { data: newRpcCompletions, error: newRpcError } = await supabase
        .rpc('get_user_todays_completions', { p_user_id: user.id });

      console.log('🔍 New RPC completions:', newRpcCompletions, 'Error:', newRpcError);

      const isStillCompleted = newRpcCompletions?.some((c: any) => c.habit_id === habitId) || false;

      setDebugInfo(prev => ({
        ...prev,
        deleteError,
        streakData,
        streakError,
        updateError,
        newRpcCompletions,
        newRpcError,
        isStillCompleted,
        undoCompleted: true
      }));

    } catch (error) {
      console.error('❌ Undo test error:', error);
      setDebugInfo(prev => ({ ...prev, undoError: error.message }));
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🐛 Debug: Undo Habit</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={debugUndoProcess} disabled={loading}>
            {loading ? 'Debugging...' : 'Debug Undo Process'}
          </Button>
          {debugInfo?.habitId && (
            <Button onClick={testUndoHabit} disabled={loading} variant="outline">
              {loading ? 'Testing...' : 'Test Undo Habit'}
            </Button>
          )}
        </div>

        {debugInfo && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-xs overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DebugUndoHabit;

