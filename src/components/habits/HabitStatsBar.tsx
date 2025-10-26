import React from 'react';
import { Search, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface HabitStatsBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterStatus: 'all' | 'active' | 'archived';
  onFilterChange: (value: 'all' | 'active' | 'archived') => void;
  sortBy: 'recent' | 'streak' | 'name' | 'completion';
  onSortChange: (value: 'recent' | 'streak' | 'name' | 'completion') => void;
  completedToday: number;
  totalHabits: number;
  xpEarned: number;
}

export const HabitStatsBar = ({
  searchQuery,
  onSearchChange,
  filterStatus,
  onFilterChange,
  sortBy,
  onSortChange,
  completedToday,
  totalHabits,
  xpEarned,
}: HabitStatsBarProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 bg-card border border-border rounded-lg">
      {/* Search (icon removed as requested) */}
      <div className="flex-1 relative">
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9"
        />
      </div>

      {/* Filters */}
      <Select value={filterStatus} onValueChange={onFilterChange}>
        <SelectTrigger className="w-full sm:w-32 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativos</SelectItem>
          <SelectItem value="archived">Arquivados</SelectItem>
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-40 h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">Recentes</SelectItem>
          <SelectItem value="streak">Streak</SelectItem>
          <SelectItem value="name">Nome</SelectItem>
          <SelectItem value="completion">Taxa</SelectItem>
        </SelectContent>
      </Select>

      {/* Stats */}
      <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-border text-sm">
        <div className="text-muted-foreground">
          <span className="font-semibold text-foreground">{completedToday}</span>/{totalHabits}
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Zap size={14} className="text-amber-500" />
          <span className="font-semibold text-foreground">{xpEarned}</span>
        </div>
      </div>
    </div>
  );
};
