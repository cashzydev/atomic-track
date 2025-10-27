import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useHabits } from '@/hooks/useHabits';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UndoTestComponent: React.FC = () => {
  const { user } = useAuth();
  const { data: habits, completeHabit, undoHabit, isCompleting, isUndoing, refetch } = useHabits();
  const [testResult, setTestResult] = useState<string>('');

  const testUndoFlow = async () => {
    if (!habits || habits.length === 0) {
      setTestResult('❌ Nenhum hábito encontrado para testar');
      return;
    }

    const habit = habits[0];
    setTestResult(`🧪 Testando com hábito: ${habit.title}`);

    try {
      // 1. Completar o hábito
      if (!habit.completedToday) {
        setTestResult(prev => prev + '\n✅ Completando hábito...');
        await completeHabit({
          habitId: habit.id,
          percentage: 100,
          habitTitle: habit.title
        });
        
        // Aguardar um pouco para a interface atualizar
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // 2. Tentar desfazer
      setTestResult(prev => prev + '\n🔄 Tentando desfazer...');
      await undoHabit(habit.id);
      
      setTestResult(prev => prev + '\n✅ Teste concluído com sucesso!');
      
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Erro: ${error.message}`);
    }
  };

  const testDoubleUndo = async () => {
    if (!habits || habits.length === 0) {
      setTestResult('❌ Nenhum hábito encontrado para testar');
      return;
    }

    const habit = habits[0];
    setTestResult(`🧪 Testando duplo undo com hábito: ${habit.title}`);

    try {
      // Tentar desfazer duas vezes seguidas
      setTestResult(prev => prev + '\n🔄 Primeiro undo...');
      await undoHabit(habit.id);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult(prev => prev + '\n🔄 Segundo undo (deve falhar)...');
      await undoHabit(habit.id);
      
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Erro esperado: ${error.message}`);
    }
  };

  if (!user) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste de Undo de Hábitos</CardTitle>
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

        <div className="flex gap-2">
          <Button 
            onClick={testUndoFlow} 
            disabled={isCompleting || isUndoing}
            className="flex-1"
          >
            {isCompleting || isUndoing ? 'Testando...' : 'Testar Undo'}
          </Button>
          
          <Button 
            onClick={testDoubleUndo} 
            disabled={isCompleting || isUndoing}
            variant="outline"
            className="flex-1"
          >
            Testar Duplo Undo
          </Button>
          
          <Button 
            onClick={() => {
              setTestResult('🔄 Recarregando dados...');
              refetch().then(() => {
                setTestResult('✅ Dados recarregados com sucesso!');
              }).catch((error) => {
                setTestResult(`❌ Erro ao recarregar: ${error.message}`);
              });
            }}
            variant="secondary"
            className="flex-1"
          >
            🔄 Refresh
          </Button>
        </div>

        {testResult && (
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UndoTestComponent;
