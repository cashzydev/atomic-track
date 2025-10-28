import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
// FloatingActionButton removed from this page to avoid floating CTA on 'Meus Hábitos'
import { useHabits } from '@/hooks/useHabits';
import { useSubscription } from '@/hooks/useSubscription';
import { useRole } from '@/hooks/useRole';
import { PaywallModal } from '@/components/PaywallModal';
import { Button } from '@/components/ui/button';
import NewHabitModal from '@/components/NewHabitModal';
import EditHabitModal from '@/components/EditHabitModal';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AnimatedPage } from '@/components/AnimatedPage';
import { PageLoader } from '@/components/PageLoader';
import { HabitEmptyState } from '@/components/habits/HabitEmptyState';
import { DeleteHabitDialog } from '@/components/DeleteHabitDialog';
import { HabitCard } from '@/components/habits/HabitCard';
import { HabitStatsBar } from '@/components/habits/HabitStatsBar';
import { Card } from '@/components/ui/card';
import { calculateCompletionRate } from '@/utils/habitMetrics';


export default function HabitsPage() {
  const navigate = useNavigate();
  const { data: habits, deleteHabit, isLoading } = useHabits();
  const { isPro, isFree } = useSubscription();
  const { isAdmin } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'streak' | 'name' | 'completion'>('recent');
  const [isNewHabitModalOpen, setIsNewHabitModalOpen] = useState(false);
  const [isEditHabitModalOpen, setIsEditHabitModalOpen] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<number | null>(null);
  const [showHabitLimitModal, setShowHabitLimitModal] = useState(false);
  const [deleteHabitId, setDeleteHabitId] = useState<number | null>(null);

  // Find the habit to delete for the dialog
  const habitToDelete = habits?.find(h => h.id === deleteHabitId);

  // Calculate daily stats
  const completedToday = habits?.filter(h => h.completedToday).length || 0;
  const totalHabits = habits?.filter(h => h.status === 'active').length || 0;
  const xpEarnedToday = completedToday * 10;

  // Filtrar hábitos
  const filteredHabits = habits
    ?.filter((habit) => {
      const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && habit.status === 'active') ||
        (filterStatus === 'archived' && habit.status === 'archived');
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'streak':
          return (b.streak || 0) - (a.streak || 0);
        case 'name':
          return a.title.localeCompare(b.title);
        case 'completion':
          const aRate = a.total_completions || 0;
          const bRate = b.total_completions || 0;
          return bRate - aRate;
        case 'recent':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const handleEdit = (id: number) => {
    setEditingHabitId(id);
    setIsEditHabitModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setDeleteHabitId(id);
  };

  const confirmDelete = () => {
    if (deleteHabitId !== null) {
      deleteHabit(deleteHabitId);
      setDeleteHabitId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteHabitId(null);
  };

  const handleCreateHabit = () => {
    // Checar limite de 3 hábitos para usuários free (admins não têm limite)
    if (!isAdmin && isFree && totalHabits >= 3) {
      setShowHabitLimitModal(true);
      return;
    }
    setIsNewHabitModalOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <PageLoader />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <AnimatedPage>
        <div className="max-w-3xl mx-auto space-y-6">
          <Breadcrumbs />
          
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Hábitos</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalHabits} ativos • {completedToday} de {totalHabits} completados hoje
              </p>
            </div>
          </div>

          {/* Desktop button */}
          <Button 
            onClick={handleCreateHabit} 
            className="w-full sm:w-auto hidden md:flex"
          >
            <Plus className="mr-2" size={20} />
            Novo Hábito
          </Button>

          {/* Floating action button removed for this page (mobile UX tweak) */}

          {/* Stats Bar + Filters */}
          {totalHabits > 0 && (
            <HabitStatsBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              filterStatus={filterStatus}
              onFilterChange={setFilterStatus}
              sortBy={sortBy}
              onSortChange={setSortBy}
              completedToday={completedToday}
              totalHabits={totalHabits}
              xpEarned={xpEarnedToday}
            />
          )}

          {/* Lista de Hábitos */}
          <div className="space-y-3">
            {!habits || habits.length === 0 ? (
              <HabitEmptyState onCreateHabit={() => setIsNewHabitModalOpen(true)} />
            ) : filteredHabits && filteredHabits.length > 0 ? (
              filteredHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? `Nenhum hábito encontrado para "${searchQuery}"`
                    : 'Nenhum hábito encontrado com os filtros selecionados'}
                </p>
              </Card>
            )}
          </div>

          <NewHabitModal
            open={isNewHabitModalOpen}
            onOpenChange={setIsNewHabitModalOpen}
          />

          <EditHabitModal
            open={isEditHabitModalOpen}
            onOpenChange={setIsEditHabitModalOpen}
            habitId={editingHabitId || 0}
          />

          <DeleteHabitDialog
            open={deleteHabitId !== null}
            habitTitle={habitToDelete?.title || ''}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />

          <PaywallModal
            open={showHabitLimitModal}
            onOpenChange={setShowHabitLimitModal}
            emphasize="habits"
            trigger="habit_limit_reached"
          />
        </div>
      </AnimatedPage>
    </AppLayout>
  );
}
