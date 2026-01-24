'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Lock, Sparkles, Trophy } from 'lucide-react';
import type { Achievement } from '@/types/extended-types';
import { ACHIEVEMENTS } from '@/lib/constants';

interface AchievementShowcaseProps {
  userAchievements: Achievement[];
  onMintNFT: (achievementId: string) => void;
}

export function AchievementShowcase({ userAchievements, onMintNFT }: AchievementShowcaseProps): JSX.Element {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'wins', 'speed', 'streak', 'practice', 'social', 'special'];
  
  const rarityColors: Record<string, string> = {
    common: 'border-gray-400 bg-gray-50 dark:bg-gray-900',
    rare: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20',
    epic: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20',
    legendary: 'border-orange-400 bg-orange-50 dark:bg-orange-900/20',
  };

  const filteredAchievements = selectedCategory === 'all'
    ? ACHIEVEMENTS
    : ACHIEVEMENTS.filter(a => a.category === selectedCategory);

  const unlockedCount = userAchievements.filter(a => a.unlocked).length;

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-500" />
            <CardTitle className="gradient-text text-2xl">Achievements</CardTitle>
          </div>
          <Badge variant="outline" className="text-lg">
            {unlockedCount}/{ACHIEVEMENTS.length}
          </Badge>
        </div>
        <CardDescription>Unlock achievements and mint them as NFTs on Base</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                onClick={() => setSelectedCategory(cat)}
                className="capitalize text-xs"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map(achievement => {
                const userAch = userAchievements.find(a => a.id === achievement.id);
                const isUnlocked = userAch?.unlocked || false;
                const progress = userAch?.progress || 0;
                const progressPercent = (progress / achievement.requirement) * 100;

                return (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden transition-all card-hover ${
                      isUnlocked 
                        ? rarityColors[achievement.rarity]
                        : 'border-gray-300 dark:border-gray-700 opacity-60'
                    }`}
                  >
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{isUnlocked ? achievement.icon : <Lock className="h-10 w-10 text-gray-400" />}</div>
                        {isUnlocked && (
                          <Badge 
                            variant="outline" 
                            className={`capitalize ${
                              achievement.rarity === 'legendary' ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' :
                              achievement.rarity === 'epic' ? 'bg-purple-500 text-white' :
                              achievement.rarity === 'rare' ? 'bg-blue-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}
                          >
                            {achievement.rarity}
                          </Badge>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-lg">{achievement.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      </div>

                      {!isUnlocked && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{progress}/{achievement.requirement}</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                              style={{ width: `${Math.min(progressPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {isUnlocked && !userAch?.nftMinted && (
                        <Button
                          onClick={() => onMintNFT(achievement.id)}
                          variant="outline"
                          size="sm"
                          className="w-full border-purple-500 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          <Sparkles className="h-3 w-3 mr-2" />
                          Mint as NFT on Base
                        </Button>
                      )}

                      {userAch?.nftMinted && (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <Award className="h-4 w-4" />
                          <span>Minted on Base</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
