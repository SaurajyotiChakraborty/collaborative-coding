'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Zap, TrendingUp, Star } from 'lucide-react';
import type { UserLevel } from '@/types/extended-types';
import { XP_PER_LEVEL } from '@/lib/constants';

interface LevelProgressProps {
  userLevel: UserLevel;
  onSpendSkillPoint: (skill: string) => void;
}

export function LevelProgress({ userLevel, onSpendSkillPoint }: LevelProgressProps): JSX.Element {
  const progressPercent = (userLevel.currentXP / userLevel.xpToNextLevel) * 100;

  const skills = [
    { name: 'JavaScript', key: 'javascript', color: 'text-yellow-500', level: userLevel.skillTree.javascript },
    { name: 'Python', key: 'python', color: 'text-blue-500', level: userLevel.skillTree.python },
    { name: 'Java', key: 'java', color: 'text-red-500', level: userLevel.skillTree.java },
    { name: 'C++', key: 'cpp', color: 'text-cyan-500', level: userLevel.skillTree.cpp },
    { name: 'Algorithms', key: 'algorithms', color: 'text-purple-500', level: userLevel.skillTree.algorithms },
    { name: 'Data Structures', key: 'dataStructures', color: 'text-green-500', level: userLevel.skillTree.dataStructures },
    { name: 'Optimization', key: 'optimization', color: 'text-orange-500', level: userLevel.skillTree.optimization },
  ];

  return (
    <div className="space-y-4">
      <Card className="glass-strong border-purple-200 dark:border-purple-800 card-hover">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {userLevel.level}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="gradient-text text-2xl">Level {userLevel.level}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Star className="h-3 w-3 text-purple-500" />
                  {userLevel.skillPoints} Skill Points Available
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-lg font-mono">
              {userLevel.totalXP.toLocaleString()} XP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress to Level {userLevel.level + 1}</span>
              <span className="font-semibold">
                {userLevel.currentXP.toLocaleString()} / {userLevel.xpToNextLevel.toLocaleString()} XP
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-center text-muted-foreground">
              {(userLevel.xpToNextLevel - userLevel.currentXP).toLocaleString()} XP to level up
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t">
            {userLevel.unlockedFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="glass-strong border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="gradient-text">Skill Tree</CardTitle>
          <CardDescription>Invest skill points to boost your abilities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {skills.map(skill => (
              <div key={skill.key} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${skill.color}`}>{skill.name}</span>
                    <Badge variant="outline">{skill.level}/10</Badge>
                  </div>
                  <Button
                    onClick={() => onSpendSkillPoint(skill.key)}
                    disabled={userLevel.skillPoints === 0 || skill.level >= 10}
                    size="sm"
                    variant="outline"
                    className="border-purple-500 text-purple-600 dark:text-purple-400"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Upgrade
                  </Button>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{ width: `${(skill.level / 10) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
