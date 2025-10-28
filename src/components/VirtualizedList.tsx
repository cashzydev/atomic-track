import React, { memo, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { cn } from '@/lib/utils';

interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (props: { index: number; style: React.CSSProperties; data: T }) => React.ReactNode;
  className?: string;
  overscanCount?: number;
}

// Componente de lista virtualizada para performance com listas grandes
export const VirtualizedList = memo(<T,>({
  items,
  height,
  itemHeight,
  renderItem,
  className,
  overscanCount = 5
}: VirtualizedListProps<T>) => {
  const itemData = useMemo(() => items, [items]);

  const ItemRenderer = memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: T[] }) => {
    const item = data[index];
    return renderItem({ index, style, data: item });
  });

  ItemRenderer.displayName = 'ItemRenderer';

  if (items.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <p className="text-muted-foreground text-sm">Nenhum item para exibir</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <List
        height={height}
        itemCount={items.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={overscanCount}
        className="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800"
      >
        {ItemRenderer}
      </List>
    </div>
  );
});

VirtualizedList.displayName = 'VirtualizedList';

// Hook para determinar se deve usar virtualização
export const useVirtualizationThreshold = (itemCount: number, threshold: number = 50) => {
  return useMemo(() => itemCount > threshold, [itemCount, threshold]);
};

// Componente wrapper que decide automaticamente entre renderização normal e virtualizada
interface AdaptiveListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  virtualizedHeight?: number;
  virtualizedItemHeight?: number;
  virtualizationThreshold?: number;
  className?: string;
  itemClassName?: string;
}

export const AdaptiveList = memo(<T,>({
  items,
  renderItem,
  virtualizedHeight = 400,
  virtualizedItemHeight = 80,
  virtualizationThreshold = 50,
  className,
  itemClassName
}: AdaptiveListProps<T>) => {
  const shouldVirtualize = useVirtualizationThreshold(items.length, virtualizationThreshold);

  if (shouldVirtualize) {
    return (
      <VirtualizedList
        items={items}
        height={virtualizedHeight}
        itemHeight={virtualizedItemHeight}
        renderItem={({ index, style, data }) => (
          <div style={style} className={itemClassName}>
            {renderItem(data, index)}
          </div>
        )}
        className={className}
      />
    );
  }

  // Renderização normal para listas pequenas
  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <div key={index} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
});

AdaptiveList.displayName = 'AdaptiveList';

// Componente específico para listas de hábitos virtualizadas
interface VirtualizedHabitListProps {
  habits: Array<{
    id: number;
    title: string;
    icon: string;
    completed: boolean;
    completedAt?: string;
  }>;
  height?: number;
  onHabitClick?: (habitId: number) => void;
  className?: string;
}

export const VirtualizedHabitList = memo<VirtualizedHabitListProps>(({
  habits,
  height = 400,
  onHabitClick,
  className
}) => {
  const itemHeight = 60; // Altura fixa para cada item de hábito

  const renderHabitItem = ({ index, style, data }: { 
    index: number; 
    style: React.CSSProperties; 
    data: typeof habits[0] 
  }) => {
    const habit = data;
    
    return (
      <div
        style={style}
        className={cn(
          "flex items-center gap-3 p-3 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer",
          habit.completed && "bg-emerald-500/5 border-emerald-500/20"
        )}
        onClick={() => onHabitClick?.(habit.id)}
      >
        {/* Ícone do hábito */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm",
          habit.completed 
            ? "bg-emerald-500 text-white" 
            : "bg-muted text-muted-foreground"
        )}>
          {habit.icon}
        </div>
        
        {/* Informações do hábito */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-medium text-sm truncate",
            habit.completed ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
          )}>
            {habit.title}
          </p>
          {habit.completedAt && (
            <p className="text-xs text-muted-foreground">
              {new Date(habit.completedAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
        
        {/* Status */}
        <div className={cn(
          "w-2 h-2 rounded-full",
          habit.completed ? "bg-emerald-500" : "bg-muted"
        )} />
      </div>
    );
  };

  return (
    <VirtualizedList
      items={habits}
      height={height}
      itemHeight={itemHeight}
      renderItem={renderHabitItem}
      className={className}
    />
  );
});

VirtualizedHabitList.displayName = 'VirtualizedHabitList';

