'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame, Gift, Trophy } from 'lucide-react';
import type { DailyChallenge, UserStreak } from '@/types/extended-types';

interface DailyChallengesProps {
  streak: UserStreak;
  todayChallenge: DailyChallenge;
  onStartChallenge: (challengeId: string) => void;
}

export function DailyChallenges({ streak, todayChallenge, onStartChallenge }: DailyChallengesProps): JSX.Element {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const daysUntilReset = (): string => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="glass-strong border-orange-200 dark:border-orange-800 card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-orange-600 dark:text-orange-400">Daily Streak</CardTitle>
            </div>
            <Badge variant="secondary" className="text-2xl font-bold">
              {streak.currentStreak}🔥
            </Badge>
          </div>
          <CardDescription>Keep the fire burning!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/50 dark:to-orange-900/30">
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{streak.longestStreak}</p>
              <p className="text-xs text-muted-foreground mt-1">Best Streak</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/50 dark:to-purple-900/30">
              <p className="text-3xl font-bold gradient-text">{streak.streakMultiplier}x</p>
              <p className="text-xs text-muted-foreground mt-1">XP Multiplier</p>
            </div>
          </div>
          <div className="flex gap-1 justify-center">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                  i < streak.currentStreak % 7
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white scale-110'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card 
        className="glass-strong border-purple-200 dark:border-purple-800 card-hover cursor-pointer transform transition-transform hover:scale-105"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <CardTitle className="gradient-text">Daily Challenge</CardTitle>
            </div>
            {!todayChallenge.completed ? (
              <Badge variant="outline" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Gift className="h-3 w-3 mr-1" />
                {todayChallenge.bonusMultiplier}x Bonus
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-green-500 text-white">
                <Trophy className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>
          <CardDescription>Complete for bonus XP and rewards</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!todayChallenge.completed ? (
            <>
              <p className="text-sm text-muted-foreground">
                Solve today&apos;s challenge to earn <span className="font-bold text-purple-600 dark:text-purple-400">{todayChallenge.bonusMultiplier}x XP</span> and maintain your streak!
              </p>
              <Button 
                onClick={() => onStartChallenge(todayChallenge.id)}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:shadow-lg transition-all"
                size="lg"
              >
                Start Challenge
              </Button>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-6xl mb-2">🎉</div>
              <p className="text-lg font-bold gradient-text">Challenge Completed!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Next challenge in: <span className="font-semibold text-purple-600 dark:text-purple-400">{daysUntilReset()}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
