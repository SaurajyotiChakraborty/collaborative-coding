'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Crown, Gift, Calendar } from 'lucide-react';
import type { BattlePass, BattlePassReward } from '@/types/extended-types';
import { BATTLE_PASS_REWARDS } from '@/lib/constants';

interface BattlePassProps {
  battlePass: BattlePass;
  onClaimReward: (level: number, tier: 'free' | 'premium') => void;
  onUpgradePremium: () => void;
}

export function BattlePassComponent({ battlePass, onClaimReward, onUpgradePremium }: BattlePassProps): JSX.Element {
  const [selectedTier, setSelectedTier] = useState<'free' | 'premium'>(battlePass.tier);
  
  const maxLevel = 30;
  const progressPercent = (battlePass.level / maxLevel) * 100;
  
  const daysRemaining = Math.ceil((battlePass.seasonEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const rewards = BATTLE_PASS_REWARDS.filter(r => r.tier === selectedTier);

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-purple-500" />
            <CardTitle className="gradient-text text-2xl">Battle Pass - Season {battlePass.season}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {daysRemaining} days left
            </Badge>
            <Badge variant="outline" className="text-lg">
              Level {battlePass.level}
            </Badge>
          </div>
        </div>
        <CardDescription>Unlock exclusive rewards by leveling up your Battle Pass</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-center text-muted-foreground">
            Level {battlePass.level} / {maxLevel}
          </p>
        </div>

        {battlePass.tier === 'free' && (
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white border-0">
            <CardContent className="p-6 text-center space-y-4">
              <Crown className="h-12 w-12 mx-auto" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
                <p className="text-sm opacity-90">
                  Unlock exclusive themes, avatars, XP boosts, and more!
                </p>
              </div>
              <Button
                onClick={onUpgradePremium}
                className="w-full bg-white text-purple-600 hover:bg-gray-100 font-bold"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 justify-center">
          <Button
            variant={selectedTier === 'free' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('free')}
            className={selectedTier === 'free' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
          >
            Free Track
          </Button>
          <Button
            variant={selectedTier === 'premium' ? 'default' : 'outline'}
            onClick={() => setSelectedTier('premium')}
            className={selectedTier === 'premium' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
          >
            <Crown className="h-4 w-4 mr-2" />
            Premium Track
          </Button>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {rewards.map((reward) => {
            const isUnlocked = battlePass.level >= reward.level;
            const isClaimed = battlePass.rewards.find(
              r => r.level === reward.level && r.tier === reward.tier
            )?.claimed || false;
            const isLocked = !isUnlocked || (reward.tier === 'premium' && battlePass.tier === 'free');

            return (
              <Card
                key={`${reward.tier}-${reward.level}`}
                className={`transition-all ${
                  isLocked 
                    ? 'opacity-50 border-gray-300 dark:border-gray-700'
                    : 'card-hover border-purple-200 dark:border-purple-800'
                }`}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      isLocked 
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}>
                      {isLocked ? <Lock className="h-6 w-6 text-gray-400" /> : 
                       isClaimed ? '✓' : 
                       <Gift className="h-6 w-6 text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">Lv {reward.level}</Badge>
                        <Badge variant="secondary" className="capitalize">{reward.type}</Badge>
                      </div>
                      <p className="text-sm font-semibold mt-1">{reward.item}</p>
                    </div>
                  </div>
                  {isUnlocked && !isClaimed && !isLocked && (
                    <Button
                      onClick={() => onClaimReward(reward.level, reward.tier)}
                      variant="default"
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                      size="sm"
                    >
                      <Unlock className="h-4 w-4 mr-2" />
                      Claim
                    </Button>
                  )}
                  {isClaimed && (
                    <Badge variant="secondary" className="bg-green-500 text-white">
                      Claimed
                    </Badge>
                  )}
                  {isLocked && reward.tier === 'premium' && battlePass.tier === 'free' && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      Premium Only
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
