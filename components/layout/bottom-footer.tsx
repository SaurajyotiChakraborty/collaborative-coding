'use client';

import { Heart, Github, Twitter, Mail, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BottomFooterProps {
  className?: string;
}

export const BottomFooter: React.FC<BottomFooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        'fixed bottom-0 right-0 left-0 backdrop-blur-xl bg-gradient-to-r from-purple-50/80 via-pink-50/80 to-orange-50/80 dark:from-gray-900/80 dark:via-gray-900/80 dark:to-gray-900/80 border-t border-purple-200/50 dark:border-purple-800/50 shadow-lg transition-all duration-300 z-30',
        'ml-20 lg:ml-64',
        className
      )}
    >
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left Section - Copyright & Info */}
          <div className="flex flex-col md:flex-row items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>© {currentYear} Optimize Coder</span>
              <span className="hidden md:inline">•</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Built with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
              <span>on Base</span>
            </div>
            <span className="hidden md:inline">•</span>
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-mono">
              v1.0.0
            </span>
          </div>

          {/* Center Section - Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
            >
              About
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
            >
              Terms
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400"
            >
              Privacy
            </Button>
            <span className="text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1"
            >
              Contact
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>

          {/* Right Section - Social Links */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
              title="GitHub"
            >
              <Github className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
              title="Twitter"
            >
              <Twitter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300"
              title="Email"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
