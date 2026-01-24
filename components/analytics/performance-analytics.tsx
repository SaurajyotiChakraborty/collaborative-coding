'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, TrendingUp, Target, Zap, Award, Trophy } from 'lucide-react';
import type { UserAnalytics } from '@/types/extended-types';

interface PerformanceAnalyticsProps {
  analytics: UserAnalytics;
}

export function PerformanceAnalytics({ analytics }: PerformanceAnalyticsProps): JSX.Element {
  const topStrengths = analytics.strengthsWeaknesses.strengths.slice(0, 5);
  const topWeaknesses = analytics.strengthsWeaknesses.weaknesses.slice(0, 5);

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-purple-500" />
          <CardTitle className="gradient-text text-2xl">Performance Analytics</CardTitle>
        </div>
        <CardDescription>Detailed insights into your coding performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-purple-200/50 dark:border-purple-800/50">
                <CardContent className="p-4 text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold gradient-text">{analytics.totalCompetitions}</p>
                  <p className="text-xs text-muted-foreground">Total Competitions</p>
                </CardContent>
              </Card>
              <Card className="border-green-200/50 dark:border-green-800/50">
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {(analytics.winRate * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                </CardContent>
              </Card>
              <Card className="border-blue-200/50 dark:border-blue-800/50">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(analytics.averageTimePerQuestion / 60)}m
                  </p>
                  <p className="text-xs text-muted-foreground">Avg. Time / Question</p>
                </CardContent>
              </Card>
              <Card className="border-orange-200/50 dark:border-orange-800/50">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analytics.favoriteLanguage}
                  </p>
                  <p className="text-xs text-muted-foreground">Favorite Language</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border-green-200/50 dark:border-green-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-green-600 dark:text-green-400">💪 Strengths</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topStrengths.map((strength, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <span className="text-sm font-medium">{strength}</span>
                      <Badge variant="secondary" className="bg-green-500 text-white">Strong</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-red-200/50 dark:border-red-800/50">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600 dark:text-red-400">📚 Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {topWeaknesses.map((weakness, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                      <span className="text-sm font-medium">{weakness}</span>
                      <Badge variant="secondary" className="bg-red-500 text-white">Practice</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="border-purple-200/50 dark:border-purple-800/50">
              <CardHeader>
                <CardTitle className="text-lg">Language Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(analytics.languageBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([lang, count]) => {
                      const total = Object.values(analytics.languageBreakdown).reduce((a, b) => a + b, 0);
                      const percent = (count / total) * 100;
                      return (
                        <div key={lang} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{lang}</span>
                            <span className="text-muted-foreground">{count} ({percent.toFixed(1)}%)</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card className="border-purple-200/50 dark:border-purple-800/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  Performance Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.performanceTrend.slice(-10).map((point, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                      <span className="text-sm text-muted-foreground">
                        {new Date(point.date).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{point.rating} ELO</Badge>
                        <Badge variant="secondary" className="bg-green-500 text-white">{point.wins}W</Badge>
                        <Badge variant="outline">{(point.accuracy * 100).toFixed(0)}% Acc</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-4">
            <Card className="border-purple-200/50 dark:border-purple-800/50">
              <CardHeader>
                <CardTitle className="text-lg">Topic Heatmap</CardTitle>
                <CardDescription>Your success rate across different categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {Object.entries(analytics.heatmap).map(([category, data]) => (
                    <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900/30">
                      <div className="flex-1">
                        <p className="font-medium capitalize">{category}</p>
                        <p className="text-xs text-muted-foreground">{data.attempts} attempts</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              data.successRate >= 0.8 ? 'bg-green-500' :
                              data.successRate >= 0.6 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${data.successRate * 100}%` }}
                          />
                        </div>
                        <span className="font-bold w-12 text-right">
                          {(data.successRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
