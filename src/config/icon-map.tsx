import React, { memo } from 'react';
import {
  BookOpen,
  Dumbbell,
  Droplet,
  Brain,
  Heart,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Flame,
  AlertTriangle,
  Utensils,
  Moon,
  Sun,
  Sparkles,
  Trophy,
  Atom,
  Coffee,
  type LucideIcon,
} from 'lucide-react';

// Mapeamento de nomes de ícones para componentes - otimizado para tree-shaking
const LUCIDE_ICONS: Record<string, LucideIcon> = {
  BookOpen,
  Dumbbell,
  Droplet,
  Brain,
  Heart,
  Target,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  TrendingUp,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Plus,
  Edit3,
  Trash2,
  BarChart3,
  PieChart,
  Activity,
  Award,
  Flame,
  AlertTriangle,
  Utensils,
  Moon,
  Sun,
  Sparkles,
  Trophy,
  Atom,
  Coffee,
};

export const ICON_MAP = {
  // Categories
  categories: {
    read: BookOpen,
    exercise: Dumbbell,
    hydration: Droplet,
    meditation: Brain,
    health: Heart,
    focus: Target,
    energy: Zap,
  },
  // States
  states: {
    completed: CheckCircle2,
    failed: XCircle,
    pending: Clock,
    warning: AlertTriangle,
  },
  // Actions
  actions: {
    add: Plus,
    edit: Edit3,
    delete: Trash2,
    close: XCircle,
    collapse: ChevronDown,
  },
  // Navigation
  navigation: {
    profile: User,
    settings: Settings,
    logout: LogOut,
  },
  // Charts & Stats
  stats: {
    bars: BarChart3,
    pie: PieChart,
    activity: Activity,
    badge: Award,
    streak: Flame,
    calendar: Calendar,
    trending: TrendingUp,
  },
} as const;

export type IconName = keyof typeof ICON_MAP.categories | 
  keyof typeof ICON_MAP.states |
  keyof typeof ICON_MAP.actions |
  keyof typeof ICON_MAP.navigation |
  keyof typeof ICON_MAP.stats;

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

// Componente Icon memoizado para evitar re-renders desnecessários
export const Icon = memo<IconProps>(({ name, size = 20, className = '', strokeWidth = 2 }) => {
  // Find icon in all categories
  let IconComponent: LucideIcon | undefined;

  // Procura o ícone em todas as categorias
  for (const category of Object.values(ICON_MAP)) {
    if (name in category) {
      IconComponent = category[name as keyof typeof category];
      break;
    }
  }

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in ICON_MAP`);
    return null;
  }

  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />;
});

Icon.displayName = 'Icon';

// Export helper to get icon component by name string
export function getIconComponent(iconName: string): LucideIcon {
  // Try to find in LUCIDE_ICONS mapping first
  if (LUCIDE_ICONS[iconName]) {
    return LUCIDE_ICONS[iconName];
  }
  
  // Try to find in all icon categories
  for (const category of Object.values(ICON_MAP)) {
    if (iconName in category) {
      return category[iconName as keyof typeof category];
    }
  }
  
  // Fallback to Target icon
  return Target;
}