'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Code2, GraduationCap, Lightbulb, Target } from 'lucide-react';
import { getLearningPaths } from '@/app/actions/practice';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

interface PracticeModeProps {
  onStartPractice: (questionId: bigint) => void;
  onStartPath: (pathId: string) => void;
}

export function PracticeMode({ onStartPractice, onStartPath }: PracticeModeProps) {
  const { data: session } = useSession();
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchPaths = async () => {
      setLoading(true);
      try {
        const result = await getLearningPaths(session?.user?.id);
        if (result.success && result.learningPaths) {
          setLearningPaths(result.learningPaths);
        }
      } catch (error) {
        console.error('Failed to fetch learning paths:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPaths();
  }, [session?.user?.id]);

  const categories = [
    { id: 'all', name: 'All Paths', icon: BookOpen },
    { id: 'arrays', name: 'Arrays', icon: Code2 },
    { id: 'dp', name: 'Dynamic Programming', icon: Lightbulb },
    { id: 'graphs', name: 'Graphs', icon: Target },
    { id: 'trees', name: 'Trees', icon: GraduationCap },
  ];

  const filteredPaths = selectedCategory === 'all'
    ? learningPaths
    : learningPaths.filter(path => path.category === selectedCategory);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl"></div>
        ))}
      </div>
    );
  }

  return (
    <Card className="glass-strong border-purple-200 dark:border-purple-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-purple-500" />
            <CardTitle className="gradient-text text-2xl">Practice Mode</CardTitle>
          </div>
          <Badge variant="outline" className="text-lg">
            {learningPaths.filter(p => p.completed).length}/{learningPaths.length} Completed
          </Badge>
        </div>
        <CardDescription>Master algorithms with structured learning paths</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="paths" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="random">Random Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="paths" className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={selectedCategory === cat.id ? 'bg-gradient-to-r from-purple-600 to-pink-600' : ''}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {cat.name}
                  </Button>
                );
              })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredPaths.map(path => (
                <Card key={path.id} className="card-hover border-purple-200/50 dark:border-purple-800/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{path.name}</CardTitle>
                        <CardDescription className="text-xs mt-1">{path.description}</CardDescription>
                      </div>
                      {path.completed && (
                        <Badge variant="secondary" className="bg-green-500 text-white">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{path.questions.length} Questions</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {Math.floor(path.progress)}% Complete
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                        style={{ width: `${path.progress}%` }}
                      />
                    </div>
                    <Button
                      onClick={() => onStartPath(path.id)}
                      variant={path.completed ? 'outline' : 'default'}
                      className={!path.completed ? 'w-full bg-gradient-to-r from-purple-600 to-pink-600' : 'w-full'}
                      size="sm"
                    >
                      {path.completed ? 'Review Path' : 'Continue Learning'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="random" className="space-y-4">
            <Card className="border-purple-200/50 dark:border-purple-800/50">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="text-6xl mb-4">🎲</div>
                <h3 className="text-xl font-bold gradient-text">Random Practice</h3>
                <p className="text-sm text-muted-foreground">
                  Get a random question to sharpen your skills without pressure
                </p>
                <div className="grid grid-cols-3 gap-2 pt-4">
                  <Button
                    onClick={() => onStartPractice(BigInt(Math.floor(Math.random() * 100)))}
                    variant="outline"
                    className="border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    Easy
                  </Button>
                  <Button
                    onClick={() => onStartPractice(BigInt(Math.floor(Math.random() * 100)))}
                    variant="outline"
                    className="border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  >
                    Medium
                  </Button>
                  <Button
                    onClick={() => onStartPractice(BigInt(Math.floor(Math.random() * 100)))}
                    variant="outline"
                    className="border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Hard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
