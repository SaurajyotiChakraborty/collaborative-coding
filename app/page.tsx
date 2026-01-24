'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, Code2, Users, Trophy, Zap, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect authenticated users to dashboard
    if (status === 'authenticated' && session?.user) {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center -z-10">
          <div className="w-[800px] h-[800px] bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-200 dark:border-purple-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm mb-8 animate-bounce">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium">New: Collaborative Workspaces</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
              Optimize Your Code
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">With Other Coders</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            The ultimate platform for real-time collaboration, competitive programming,
            and AI-powered code optimization. Join thousands of developers today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              onClick={() => router.push('/auth/register')}
              size="lg"
              className="h-14 px-8 text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl shadow-purple-500/20 transition-all hover:scale-105"
            >
              Get Started for Free
            </Button>
            <Button
              onClick={() => router.push('/auth/signin')}
              variant="outline"
              size="lg"
              className="h-14 px-8 text-lg font-bold border-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Welcome Back
            </Button>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Simple placeholders for "Trusted By" or "Features" logos style */}
            <div className="flex items-center justify-center gap-2 font-bold text-2xl"><Code2 className="h-6 w-6" /> VS Code</div>
            <div className="flex items-center justify-center gap-2 font-bold text-2xl"><Sparkles className="h-6 w-6" /> AI Mentor</div>
            <div className="flex items-center justify-center gap-2 font-bold text-2xl"><User className="h-6 w-6" /> Community</div>
            <div className="flex items-center justify-center gap-2 font-bold text-2xl"><Trophy className="h-6 w-6" /> Compete</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4 text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold">Real-time Collaboration</h3>
              <p className="text-muted-foreground">Work with your team in high-performance workspaces with Monaco editor and Yjs syncing.</p>
            </div>
            <div className="space-y-4 text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:-rotate-3">
                <Trophy className="h-8 w-8 text-pink-600" />
              </div>
              <h3 className="text-2xl font-bold">Competitive Practice</h3>
              <p className="text-muted-foreground">Challenge yourself or others in timed competitions with real-time leaderboards and AI benchmarking.</p>
            </div>
            <div className="space-y-4 text-center p-6 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto transition-transform group-hover:scale-110 group-hover:rotate-3">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold">AI Performance Audit</h3>
              <p className="text-muted-foreground">Get instant feedback on your code's time and space complexity using our advanced AI analysis tools.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl">Optimize Coder</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Optimize Coder. Built for developers, by developers.</p>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-purple-600 transition-colors">Twitter</a>
            <a href="#" className="text-muted-foreground hover:text-purple-600 transition-colors">GitHub</a>
            <a href="#" className="text-muted-foreground hover:text-purple-600 transition-colors">Discord</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
