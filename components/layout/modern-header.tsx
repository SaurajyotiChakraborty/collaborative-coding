'use client';

import { Code2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';

interface ModernHeaderProps {
  username: string;
  role: string;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({ username, role }) => {
  const handleLogout = async (): Promise<void> => {
    await signOut({ callbackUrl: '/' });
    toast.success('Logged out successfully');
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Code2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="absolute -inset-1 bg-purple-500/20 blur-xl rounded-full -z-10"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Optimize Coder
            </h1>
            <p className="text-xs text-muted-foreground">Compete • Code • Conquer</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2">
            <p className="text-sm font-semibold">{username}</p>
            <Badge
              variant={role === 'Admin' ? 'default' : 'secondary'}
              className="text-xs"
            >
              {role}
            </Badge>
          </div>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 transition-all duration-300"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};
