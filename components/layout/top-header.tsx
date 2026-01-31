'use client';

import { Bell, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TopHeaderProps {
  username: string;
  rating: number;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ username, rating, className }) => {
  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 h-16 z-40 backdrop-blur-xl bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-orange-50/80 dark:from-gray-900/80 dark:via-gray-900/80 dark:to-gray-900/80 border-b border-purple-200/50 dark:border-purple-800/50 shadow-lg transition-all duration-300',
        'ml-20 lg:ml-64',
        className
      )}
    >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left Section - Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions, users, tournaments..."
              className="pl-10 bg-white/60 dark:bg-gray-800/60 border-purple-200 dark:border-purple-800 focus:border-purple-400 dark:focus:border-purple-600 transition-all"
            />
          </div>
        </div>

        {/* Right Section - Stats & Notifications */}
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-white/60 dark:bg-gray-800/60 border border-purple-200 dark:border-purple-800">
            <Zap className="h-4 w-4 text-orange-500" />
            <div className="text-sm">
              <span className="font-bold gradient-text">{rating}</span>
              <span className="text-muted-foreground ml-1">Rating</span>
            </div>
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* User Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200">
            {(username || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
