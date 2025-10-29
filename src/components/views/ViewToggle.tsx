import React from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  currentView: 'list' | 'kanban';
  onViewChange: (view: 'list' | 'kanban') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
  currentView, 
  onViewChange 
}) => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/70 shadow-lg backdrop-blur-sm">
      {/* Botão Lista */}
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200",
          currentView === 'list'
            ? "bg-violet-500/20 text-violet-400"
            : "text-muted-foreground hover:text-foreground hover:bg-slate-700/30"
        )}
        aria-label="Visualização em lista"
      >
        <List className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="text-[11px] font-medium">Lista</span>
      </button>

      {/* Separador */}
      <div className="w-px h-4 bg-slate-700/50" />

      {/* Botão Kanban */}
      <button
        onClick={() => onViewChange('kanban')}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded transition-all duration-200",
          currentView === 'kanban'
            ? "bg-violet-500/20 text-violet-400"
            : "text-muted-foreground hover:text-foreground hover:bg-slate-700/30"
        )}
        aria-label="Visualização kanban"
      >
        <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
        <span className="text-[11px] font-medium">Kanban</span>
      </button>
    </div>
  );
};

