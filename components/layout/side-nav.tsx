'use client';

import { useState } from 'react';
import {
  Code2,
  LogOut,
  Home,
  Trophy,
  Users,
  Eye,
  Video,
  Award,
  Settings,
  Menu,
  X,
  ChevronRight,
  InfoIcon,
  Flame,
  BookOpen,
  Zap,
  Crown,
  UserPlus,
  BarChart,
  Bot,
  Gift,
  FolderGit2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
// Lingo compiler handles static strings in JSX

interface SideNavProps {
  username: string;
  role: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  adminOnly?: boolean;
}

export const SideNav: React.FC<SideNavProps> = ({ username, role, activeTab, onTabChange }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: '/' });
    toast.success('Logged out successfully');
  };

  const navItems: NavItem[] = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'workspace', icon: FolderGit2, label: 'Workspaces' },
    { id: 'daily', icon: Flame, label: 'Daily Challenges' },
    { id: 'practice', icon: BookOpen, label: 'Practice Mode' },
    { id: 'achievements', icon: Award, label: 'Achievements' },
    // { id: 'level', icon: Zap, label: 'Level & XP' },
    // { id: 'battlepass', icon: Crown, label: 'Battle Pass' },
    { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
    // { id: 'friends', icon: UserPlus, label: 'Friends' },
    { id: 'tournaments', icon: Users, label: 'Tournaments' },
    { id: 'analytics', icon: BarChart, label: 'Analytics' },
    // { id: 'ai-mentor', icon: Bot, label: 'AI Mentor' },
    // { id: 'referrals', icon: Gift, label: 'Referrals' },
    { id: 'spectate', icon: Eye, label: 'Spectate' },
    { id: 'replays', icon: Video, label: 'Replays' },
    { id: 'profile', icon: Users, label: 'Profile' },
    { id: 'admin', icon: Settings, label: 'Admin', adminOnly: true },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || role === 'Admin'
  );

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 shadow-2xl z-50 transition-all duration-300 ease-in-out',
          isExpanded ? 'w-64' : 'w-20'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('flex items-center gap-3', !isExpanded && 'justify-center w-full')}>
                <div className="relative">
                  <Code2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="absolute -inset-1 bg-purple-500/20 blur-xl rounded-full -z-10"></div>
                </div>
                {isExpanded && (
                  <div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                      Optimize Coder
                    </h1>
                    <p className="text-xs text-muted-foreground">Compete • Code • Conquer</p>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
              title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* User Info */}
          {isExpanded && (
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {(username || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{username || 'User'}</p>
                  <Badge
                    variant={role === 'Admin' ? 'default' : 'secondary'}
                    className="text-xs mt-1"
                  >
                    {role || 'User'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-muted-foreground hover:text-foreground',
                      !isExpanded && 'justify-center'
                    )}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className={cn('h-5 w-5', isActive && 'animate-pulse')} />
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left font-medium">
                          {item.id === 'dashboard' ? 'Dashboard' :
                            item.id === 'workspace' ? 'Workspaces' :
                              item.id === 'daily' ? 'Daily Challenges' :
                                item.id === 'practice' ? 'Practice Mode' :
                                  item.id === 'achievements' ? 'Achievements' :
                                    item.id === 'leaderboard' ? 'Leaderboard' :
                                      item.id === 'spectate' ? 'Spectator Mode' :
                                        item.id === 'tournaments' ? 'Tournaments' :
                                          item.id === 'analytics' ? 'Performance' :
                                            item.id === 'replays' ? 'Video Replays' : item.label}
                        </span>
                        {isActive && <ChevronRight className="h-4 w-4" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          <div className="p-4 border-t border-white/20 space-y-2">
            <LanguageSwitcher isExpanded={isExpanded} />
            {isExpanded ? (
              <>
                <ThemeToggle />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-300"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <div className="flex justify-center">
                  <ThemeToggle />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-300"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};
