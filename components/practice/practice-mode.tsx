'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Code2, GraduationCap, Lightbulb, Target, Calendar, Zap, GitCompare } from 'lucide-react';
import { getLearningPaths, getPracticeQuestions, getRandomQuestion } from '@/app/actions/practice';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PracticeModeProps {
  onStartPractice: (questionId: bigint) => void;
  onStartPath: (path: any) => void;
}

export function PracticeMode({ onStartPractice, onStartPath }: PracticeModeProps) {
  const { data: session } = useSession();
  const [learningPaths, setLearningPaths] = useState<any[]>([]);
  const [practiceQuestions, setPracticeQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pathsRes, practiceRes] = await Promise.all([
          getLearningPaths(session?.user?.id),
          getPracticeQuestions()
        ]);

        if (pathsRes.success && pathsRes.learningPaths) {
          setLearningPaths(pathsRes.learningPaths);
        }

        if (practiceRes.success && practiceRes.questions) {
          setPracticeQuestions(practiceRes.questions);
        }
      } catch (error) {
        console.error('Failed to fetch practice data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
        <Tabs defaultValue="individual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="individual">Individual Challenges</TabsTrigger>
            <TabsTrigger value="paths">Learning Paths</TabsTrigger>
            <TabsTrigger value="random">Random Practice</TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {practiceQuestions.length > 0 ? practiceQuestions.map((q) => (
                <Card key={q.id} className="border-purple-200/50 dark:border-purple-800/50 hover:border-purple-400 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-md font-bold">{q.title}</CardTitle>
                      <Badge variant="outline" className="text-[10px]">
                        {q.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">
                      {q.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {q.tags?.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[8px] px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">#{t}</span>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" className="text-purple-600 hover:text-purple-700" onClick={() => onStartPractice(BigInt(q.id))}>
                        Practice Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-2 text-center py-12 text-muted-foreground bg-gray-50 dark:bg-gray-900/50 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-800">
                  No individual practice challenges available at the moment.
                </div>
              )}
            </div>
          </TabsContent>

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
                      onClick={() => onStartPath(path)}
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
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <Button
                      key={diff}
                      onClick={async () => {
                        const res = await getRandomQuestion(diff);
                        if (res.success && res.question) {
                          onStartPractice(BigInt(res.question.id));
                        } else {
                          toast.error(res.error || 'Failed to find a question');
                        }
                      }}
                      variant="outline"
                      className={cn(
                        "border-2",
                        diff === 'Easy' && "border-green-500 text-green-600 hover:bg-green-50",
                        diff === 'Medium' && "border-yellow-500 text-yellow-600 hover:bg-yellow-50",
                        diff === 'Hard' && "border-red-500 text-red-600 hover:bg-red-50"
                      )}
                    >
                      {diff}
                    </Button>
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
