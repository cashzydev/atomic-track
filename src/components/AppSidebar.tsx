import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLevel } from '@/hooks/useLevel';
import { useRole } from '@/hooks/useRole';
import { Target, Home, Award, User, Settings, Calendar, BarChart, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { triggerHaptic } from '@/utils/haptics';
import LevelBadge from '@/components/LevelBadge';

export function AppSidebar() {
  const location = useLocation();
  const { t } = useTranslation();
  const { levelInfo, progress, xp, currentLevelXP, nextLevelXP } = useLevel();
  const { open } = useSidebar();
  const { isAdmin } = useRole();

  const mainItems = [
    { title: t('nav.dashboard'), url: '/dashboard', icon: Home },
    { title: t('nav.habits'), url: '/habits', icon: Target },
    { title: t('nav.calendar'), url: '/calendar', icon: Calendar },
    { title: t('nav.stats'), url: '/stats', icon: BarChart },
  ];

  const secondaryItems = [
    { title: t('nav.badges'), url: '/badges', icon: Award },
    { title: t('nav.profile'), url: '/profile', icon: User },
    { title: t('nav.settings'), url: '/settings', icon: Settings },
  ];

  const adminItems = isAdmin ? [
    { title: 'Admin', url: '/admin', icon: Shield },
  ] : [];

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar 
      collapsible="offcanvas"
      className="sidebar-dark border-none"
    >
      <SidebarHeader className="p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
            <img 
              src="/atom-logo.png" 
              alt="Logo" 
              className="relative w-8 h-8"
            />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-slate-200">atomicTracker</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="scrollbar-neuro">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider">
            Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className={cn(
                        "relative transition-all duration-200 touch-target-comfortable",
                        active && [
                          "bg-slate-800/70 text-slate-100",
                          "before:absolute before:left-0 before:top-0 before:bottom-0",
                          "before:w-1 before:bg-primary before:rounded-r"
                        ],
                        !active && "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      <Link 
                        to={item.url} 
                        className="flex items-center gap-3"
                        onClick={() => triggerHaptic('light')}
                      >
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider">
            Extras
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={active}
                      className={cn(
                        "relative transition-all duration-200 touch-target-comfortable",
                        active && [
                          "bg-slate-800/70 text-slate-100",
                          "before:absolute before:left-0 before:top-0 before:bottom-0",
                          "before:w-1 before:bg-primary before:rounded-r"
                        ],
                        !active && "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                      )}
                    >
                      <Link 
                        to={item.url} 
                        className="flex items-center gap-3"
                        onClick={() => triggerHaptic('light')}
                      >
                        <item.icon size={18} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const active = isActive(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={active}
                        className={cn(
                          "relative transition-all duration-200 touch-target-comfortable",
                          active && [
                            "bg-violet-800/70 text-violet-100",
                            "before:absolute before:left-0 before:top-0 before:bottom-0",
                            "before:w-1 before:bg-violet-500 before:rounded-r"
                          ],
                          !active && "text-violet-400 hover:bg-violet-800/50 hover:text-violet-200"
                        )}
                      >
                        <Link 
                          to={item.url} 
                          className="flex items-center gap-3"
                          onClick={() => triggerHaptic('light')}
                        >
                          <item.icon size={18} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800/50">
        {open ? (
          <div className="flex items-center gap-3">
            <LevelBadge 
              level={levelInfo?.level || 1}
              size="sm"
              showProgress={true}
              showTooltip={false}
              xp={currentLevelXP}
              nextLevelXP={nextLevelXP}
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-200">
                Nível {levelInfo?.level || 1}
              </span>
              <span className="text-xs text-slate-400">
                {currentLevelXP !== undefined && nextLevelXP !== undefined && nextLevelXP > 0
                  ? `${Math.round((currentLevelXP / nextLevelXP) * 100)}% completo`
                  : '0% completo'}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <LevelBadge 
              level={levelInfo?.level || 1}
              size="sm"
              showProgress={true}
              showTooltip={true}
              xp={currentLevelXP}
              nextLevelXP={nextLevelXP}
            />
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
