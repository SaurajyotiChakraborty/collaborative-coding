'use client';
import { RANK_TIERS } from '@/lib/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface RankDisplayProps {
  rating: number;
  eloHistory?: Array<{ rating: number; change: number; date: Date }>;
}

export function RankDisplay({ rating, eloHistory = [] }: RankDisplayProps): JSX.Element {
  const currentTier = RANK_TIERS.find(tier => rating >= tier.minRating && rating <= tier.maxRating) || RANK_TIERS[0];
  const nextTier = RANK_TIERS[currentTier.division] || null;
  
  const progressInTier = nextTier 
    ? ((rating - currentTier.minRating) / (nextTier.minRating - currentTier.minRating)) * 100
    : 100;

  const recentChange = eloHistory.length > 0 ? eloHistory[eloHistory.length - 1].change : 0;

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800 card-hover">
      <CardHeader>
        <CardTitle className="gradient-text">Your Rank</CardTitle>
        <CardDescription>Competitive Rating & Progression</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-6xl mb-2">{currentTier.icon}</div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: currentTier.color }}>
            {currentTier.name}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-lg font-mono">
              {rating} ELO
            </Badge>
            {recentChange !== 0 && (
              <Badge variant={recentChange > 0 ? 'default' : 'destructive'} className="flex items-center gap-1">
                {recentChange > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(recentChange)}
              </Badge>
            )}
          </div>
        </div>

        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to {nextTier.name}</span>
              <span className="font-semibold">{Math.floor(progressInTier)}%</span>
            </div>
            <Progress value={progressInTier} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {nextTier.minRating - rating} ELO to rank up
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 pt-4 border-t">
          {RANK_TIERS.slice(0, 7).map((tier) => (
            <div
              key={tier.name}
              className={`text-center p-2 rounded-lg transition-all ${
                tier.name === currentTier.name
                  ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-500'
                  : 'bg-gray-50 dark:bg-gray-900/30 opacity-50'
              }`}
            >
              <div className="text-2xl">{tier.icon}</div>
              <p className="text-xs font-medium mt-1">{tier.name}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
