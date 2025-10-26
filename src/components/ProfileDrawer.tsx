import React, { useState } from 'react';
import { Settings, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { AvatarPicker } from './AvatarPicker';
import { toast } from 'sonner';
import LevelBadge from './LevelBadge';
import { getLevelTitle } from '@/systems/levelSystem';

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    id: string;
    name: string;
    avatar_type: 'initials' | 'upload' | 'icon';
    avatar_icon?: string;
    avatar_color: string;
    avatar_url?: string;
    xp: number;
    level: number;
  };
  xpForNextLevel: number;
  xpInCurrentLevel: number;
  xpNeededForNext: number;
  onAvatarUpdate: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  open,
  onOpenChange,
  user,
  xpForNextLevel,
  xpInCurrentLevel,
  xpNeededForNext,
  onAvatarUpdate,
}) => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleAvatarUpdate = async (
    type: 'initials' | 'upload' | 'icon',
    icon?: string,
    color?: string,
    url?: string
  ) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_type: type,
          avatar_icon: icon,
          avatar_color: color || user.avatar_color,
          avatar_url: url,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Avatar atualizado!');
      onAvatarUpdate();
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      toast.error('Erro ao atualizar avatar');
    } finally {
      setIsSaving(false);
    }
  };

  const progressPercentage = (xpInCurrentLevel / xpNeededForNext) * 100;
  const levelTitle = getLevelTitle(user.level);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Perfil</SheetTitle>
          <SheetDescription>
            Personalize seu avatar e veja seu progresso
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Seção de Progresso */}
          <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{levelTitle}</p>
              </div>
              <LevelBadge level={user.level} size="lg" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">XP</span>
                <span className="font-semibold">
                  {xpInCurrentLevel} / {xpNeededForNext}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {xpNeededForNext - xpInCurrentLevel} XP para completar
              </p>
            </div>
          </div>

          {/* Seletor de Avatar */}
          <div className="space-y-3">
            <h4 className="font-semibold">Personalizar Avatar</h4>
            <AvatarPicker
              currentType={user.avatar_type}
              currentIcon={user.avatar_icon}
              currentColor={user.avatar_color}
              currentUrl={user.avatar_url}
              onUpdate={handleAvatarUpdate}
            />
          </div>

          {/* Ações */}
          <div className="space-y-2 pt-4 border-t">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                onOpenChange(false);
                navigate('/settings');
              }}
            >
              <Settings size={18} />
              Configurações
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Sair
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
