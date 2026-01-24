'use client'
import { useEffect, useState } from 'react';
import { LoginForm } from '@/components/auth/login-form';
import { SideNav } from '@/components/layout/side-nav';
import { TopHeader } from '@/components/layout/top-header';
import { BottomFooter } from '@/components/layout/bottom-footer';
import { CompetitionCreator } from '@/components/dashboard/competition-creator';
import { CodeArena } from '@/components/competition/code-arena';
import { QuestionManager } from '@/components/admin/question-manager';
import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { TournamentBracket } from '@/components/tournament/tournament-bracket';
import { SpectatorView } from '@/components/spectator/spectator-view';
import { VideoReplay } from '@/components/replay/video-replay';
import { GitHubIntegration } from '@/components/profile/github-integration';
import { RankDisplay } from '@/components/ranking/rank-display';
import { DailyChallenges } from '@/components/daily/daily-challenges';
import { PracticeMode } from '@/components/practice/practice-mode';
import { AchievementShowcase } from '@/components/achievements/achievement-showcase';
import { LevelProgress } from '@/components/leveling/level-progress';
import { BattlePassComponent } from '@/components/battlepass/battle-pass';
import { TeamManager } from '@/components/teams/team-manager';
import { FriendsList } from '@/components/social/friends-list';
import { PerformanceAnalytics } from '@/components/analytics/performance-analytics';
import { DiscussionForum } from '@/components/forum/discussion-forum';
import { AIMentorComponent } from '@/components/ai/ai-mentor';
import { LanguageSelector } from '@/components/languages/language-selector';
import { ProfileCustomization } from '@/components/profile/profile-customization';
import { ReferralSystem } from '@/components/referral/referral-system';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { WorkspaceContainer } from '@/components/workspace/workspace-container';
import * as DemoDataGenerator from '@/lib/demo-data-generator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSpacetime } from '@/hooks/use-spacetime';
import { Sparkles } from 'lucide-react';
import { sdk } from "@farcaster/miniapp-sdk";
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";
import { cn } from '@/lib/utils';

export default function Page(): JSX.Element {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
    useEffect(() => {
      const initializeFarcaster = async () => {
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          if (document.readyState !== 'complete') {
            await new Promise<void>(resolve => {
              if (document.readyState === 'complete') {
                resolve()
              } else {
                window.addEventListener('load', () => resolve(), { once: true })
              }

            })
          }

    

          await sdk.actions.ready()
          console.log('Farcaster SDK initialized successfully - app fully loaded')
        } catch (error) {
          console.error('Failed to initialize Farcaster SDK:', error)
          
          setTimeout(async () => {
            try {
              await sdk.actions.ready()
              console.log('Farcaster SDK initialized on retry')
            } catch (retryError) {
              console.error('Farcaster SDK retry failed:', retryError)
            }

          }, 1000)
        }

      }

    

      initializeFarcaster()
    }, [])
  const { db, identity, isConnected } = useSpacetime();
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string; isRegistered: boolean; rating: number; wins: number; achievements: string[] } | null>(null);
  const [activeCompetition, setActiveCompetition] = useState<{ competitionId: bigint; questions: Array<{ questionId: bigint; title: string; description: string; difficulty: string }> } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');

  // Generate demo data for all new features
  const mockAchievements = DemoDataGenerator.generateMockAchievements('user1');
  const dailyChallenge = DemoDataGenerator.generateDailyChallenge();
  const userStreak = DemoDataGenerator.generateUserStreak();
  const userLevel = DemoDataGenerator.generateUserLevel();
  const battlePass = DemoDataGenerator.generateBattlePass();
  const mockTeams = DemoDataGenerator.generateMockTeams();
  const mockFriends = DemoDataGenerator.generateMockFriends();
  const learningPaths = DemoDataGenerator.generateLearningPaths();
  const forumPosts = DemoDataGenerator.generateMockForumPosts();
  const userAnalytics = DemoDataGenerator.generateUserAnalytics('user1');
  const userProfile = DemoDataGenerator.generateUserProfile('user1');
  const aiMentor = DemoDataGenerator.generateAIMentor();
  const referralData = DemoDataGenerator.generateReferralData('user1');
  const moderatorQueue = DemoDataGenerator.generateModeratorQueue();
  const adminActions = DemoDataGenerator.generateAdminActions();

  useEffect(() => {
    if (!db || !identity) return;

    const unsubscribe = db.subscriptionBuilder()
      .onApplied(() => {
        const user = Array.from(db.tables.users.values()).find(
          (u) => u.identity.toHexString() === identity.toHexString()
        );

        if (user) {
          setCurrentUser({
            username: user.username,
            role: user.role.tag,
            isRegistered: true,
            rating: user.rating,
            wins: 0,
            achievements: user.achievements,
          });
        } else {
          setCurrentUser({ username: '', role: '', isRegistered: false, rating: 0, wins: 0, achievements: [] });
        }

        const competitions = Array.from(db.tables.competitions.values()).filter(
          (c) => c.status.tag === 'InProgress' && c.currentParticipants.some((p) => p.toHexString() === identity.toHexString())
        );

        if (competitions.length > 0) {
          const competition = competitions[0];
          const questions = competition.questions.map((qId) => {
            const q = db.tables.questions.getByQuestionId(qId);
            return {
              questionId: qId,
              title: q?.title || 'Unknown',
              description: q?.description || '',
              difficulty: q?.difficulty.tag || 'Medium',
            };
          });

          setActiveCompetition({
            competitionId: competition.competitionId,
            questions,
          });
        } else {
          setActiveCompetition(null);
        }
      })
      .subscribe(['SELECT * FROM users', 'SELECT * FROM competitions', 'SELECT * FROM questions']);

    return () => {
      unsubscribe.cancel();
    };
  }, [db, identity]);

  // Show connecting screen briefly
  const [showConnecting, setShowConnecting] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowConnecting(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!isConnected && showConnecting) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 fade-in-up">
        <Card className="w-full max-w-md glass-strong shadow-2xl border-purple-200 dark:border-purple-800">
          <CardHeader>
            <CardTitle className="gradient-text text-2xl">Connecting...</CardTitle>
            <CardDescription>Establishing connection to Optimize Coder</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border-b-4 border-purple-400 opacity-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentUser?.isRegistered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 pt-16 fade-in-up">
        <div className="text-center space-y-8 w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <Sparkles className="h-20 w-20 mx-auto mb-4 relative text-purple-600 dark:text-purple-400" />
            <h1 className="text-5xl font-bold mb-2 gradient-text">
              Optimize Coder
            </h1>
            <p className="text-lg text-muted-foreground">Compete • Code • Conquer</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  if (activeCompetition) {
    return (
      <div className="min-h-screen fade-in-up">
        <SideNav 
          username={currentUser.username} 
          role={currentUser.role}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <TopHeader username={currentUser.username} rating={currentUser.rating} />
        <div className="pt-20 pb-20 p-4 ml-20 lg:ml-64 transition-all duration-300">
          <div className="max-w-7xl mx-auto space-y-4">
            <Card className="glass-strong border-purple-200 dark:border-purple-800 glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="gradient-text">Competition Arena</CardTitle>
                    <CardDescription>Solve all 3 questions to complete the challenge</CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    In Progress
                  </Badge>
                </div>
              </CardHeader>
            </Card>
            <CodeArena
              competitionId={activeCompetition.competitionId}
              questions={activeCompetition.questions}
            />
          </div>
        </div>
        <BottomFooter />
      </div>
    );
  }

  // Check if in demo mode
  const isDemoMode = db && 'registerUser' in db && typeof db.registerUser === 'function';

  return (
    <div className="min-h-screen fade-in-up">
      <SideNav 
        username={currentUser.username} 
        role={currentUser.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <TopHeader username={currentUser.username} rating={currentUser.rating} />
      
      <div className={cn(
        'transition-all duration-300 p-6 pt-20 pb-20',
        'ml-20 lg:ml-64'
      )}>
        <div className="max-w-7xl mx-auto space-y-6">
          {isDemoMode && (
            <div className="glass border-amber-300 dark:border-amber-700 rounded-xl p-4 text-center card-hover">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>🎭 Demo Mode Active</strong> - All data is stored locally and will persist across sessions. No server connection required!
              </p>
            </div>
          )}

          {/* Workspace Tab */}
          {activeTab === 'workspace' && (
            <div className="fade-in-up">
              <WorkspaceContainer />
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4 fade-in-up">
              <div className="grid gap-4 md:grid-cols-2">
                <CompetitionCreator />
                <Card className="glass-strong card-hover border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="gradient-text">Quick Stats</CardTitle>
                    <CardDescription>Your performance overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                      <span className="text-muted-foreground">Competitions:</span>
                      <span className="font-bold text-xl text-purple-600 dark:text-purple-400">0</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30">
                      <span className="text-muted-foreground">Win Rate:</span>
                      <span className="font-bold text-xl text-pink-600 dark:text-pink-400">0%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-950/30 dark:to-purple-950/30">
                      <span className="text-muted-foreground">Current Streak:</span>
                      <span className="font-bold text-xl text-orange-600 dark:text-orange-400">0🔥</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div className="fade-in-up">
              <LeaderboardTable />
            </div>
          )}

          {/* Tournaments Tab */}
          {activeTab === 'tournaments' && (
            <div className="fade-in-up">
              <TournamentBracket />
            </div>
          )}

          {/* Spectate Tab */}
          {activeTab === 'spectate' && (
            <div className="fade-in-up">
              <SpectatorView />
            </div>
          )}

          {/* Replays Tab */}
          {activeTab === 'replays' && (
            <div className="fade-in-up">
              <VideoReplay />
            </div>
          )}

          {/* Daily Challenges Tab */}
          {activeTab === 'daily' && (
            <div className="fade-in-up">
              <DailyChallenges 
                streak={userStreak}
                todayChallenge={dailyChallenge}
                onStartChallenge={(challengeId) => console.log('Starting challenge:', challengeId)}
              />
            </div>
          )}

          {/* Practice Mode Tab */}
          {activeTab === 'practice' && (
            <div className="fade-in-up">
              <PracticeMode
                learningPaths={learningPaths}
                onStartPractice={(questionId) => console.log('Starting practice:', questionId)}
                onStartPath={(pathId) => console.log('Starting path:', pathId)}
              />
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="fade-in-up">
              <AchievementShowcase
                userAchievements={mockAchievements}
                onMintNFT={(achievementId) => console.log('Minting NFT:', achievementId)}
              />
            </div>
          )}

          {/* Level & XP Tab */}
          {activeTab === 'level' && (
            <div className="fade-in-up">
              <LevelProgress
                userLevel={userLevel}
                onSpendSkillPoint={(skill) => console.log('Spending skill point:', skill)}
              />
            </div>
          )}

          {/* Battle Pass Tab */}
          {activeTab === 'battlepass' && (
            <div className="fade-in-up">
              <BattlePassComponent
                battlePass={battlePass}
                onClaimReward={(level, tier) => console.log('Claiming reward:', level, tier)}
                onUpgradePremium={() => console.log('Upgrading to premium')}
              />
            </div>
          )}

          {/* Teams Tab */}
          {activeTab === 'teams' && (
            <div className="fade-in-up">
              <TeamManager
                userTeam={null}
                availableTeams={mockTeams}
                activeWars={[]}
                onCreateTeam={(name, tag, desc) => console.log('Creating team:', name, tag, desc)}
                onJoinTeam={(teamId) => console.log('Joining team:', teamId)}
                onLeaveTeam={() => console.log('Leaving team')}
                onStartWar={(opponentId) => console.log('Starting war:', opponentId)}
                onSendMessage={(msg) => console.log('Sending message:', msg)}
              />
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            <div className="fade-in-up">
              <FriendsList
                friends={mockFriends}
                friendRequests={[]}
                receivedGifts={[]}
                onSendRequest={(username) => console.log('Sending request to:', username)}
                onAcceptRequest={(requestId) => console.log('Accepting request:', requestId)}
                onDeclineRequest={(requestId) => console.log('Declining request:', requestId)}
                onSendGift={(friendId, giftType, msg) => console.log('Sending gift:', friendId, giftType, msg)}
                onChallengeToMatch={(friendId) => console.log('Challenging friend:', friendId)}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="fade-in-up">
              <PerformanceAnalytics analytics={userAnalytics} />
            </div>
          )}

          {/* Forum Tab */}
          {activeTab === 'forum' && (
            <div className="fade-in-up">
              <DiscussionForum
                posts={forumPosts}
                onCreatePost={(title, content, tags) => console.log('Creating post:', title, content, tags)}
                onReply={(postId, content) => console.log('Replying to post:', postId, content)}
                onUpvote={(postId, replyId) => console.log('Upvoting:', postId, replyId)}
                onDownvote={(postId, replyId) => console.log('Downvoting:', postId, replyId)}
                onMarkSolved={(postId, replyId) => console.log('Marking solved:', postId, replyId)}
              />
            </div>
          )}

          {/* AI Mentor Tab */}
          {activeTab === 'ai-mentor' && (
            <div className="fade-in-up">
              <AIMentorComponent
                mentor={aiMentor}
                onRequestHint={(level) => console.log('Requesting hint:', level)}
                onRequestExplanation={(topic) => console.log('Requesting explanation:', topic)}
              />
            </div>
          )}

          {/* Referrals Tab */}
          {activeTab === 'referrals' && (
            <div className="fade-in-up">
              <ReferralSystem referralData={referralData} />
            </div>
          )}

          {/* Languages Tab */}
          {activeTab === 'languages' && (
            <div className="fade-in-up">
              <LanguageSelector
                selectedLanguage={selectedLanguage}
                onSelectLanguage={(id, name) => setSelectedLanguage(name)}
              />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4 fade-in-up">
              <RankDisplay rating={currentUser.rating} eloHistory={[]} />
              <Card className="glass-strong card-hover border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="gradient-text">Profile Stats</CardTitle>
                  <CardDescription>Your coding journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-950/50 dark:to-purple-900/30 card-hover">
                      <p className="text-4xl font-bold gradient-text">{currentUser.rating}</p>
                      <p className="text-sm text-muted-foreground mt-2">Rating</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-950/50 dark:to-pink-900/30 card-hover">
                      <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">{currentUser.wins}</p>
                      <p className="text-sm text-muted-foreground mt-2">Wins</p>
                    </div>
                    <div className="text-center p-6 rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 dark:from-orange-950/50 dark:to-orange-900/30 card-hover">
                      <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{currentUser.achievements.length}</p>
                      <p className="text-sm text-muted-foreground mt-2">Achievements</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <ProfileCustomization
                profile={userProfile}
                onUpdateProfile={(updates) => console.log('Updating profile:', updates)}
              />
              <GitHubIntegration
                username={currentUser.username}
                achievements={currentUser.achievements}
                rating={currentUser.rating}
                wins={currentUser.wins}
              />
            </div>
          )}

          {/* Admin Tab */}
          {currentUser.role === 'Admin' && activeTab === 'admin' && (
            <div className="space-y-4 fade-in-up">
              <QuestionManager />
              <AdminDashboard
                moderatorQueue={moderatorQueue}
                recentActions={adminActions}
                onBanUser={(userId, reason) => console.log('Banning user:', userId, reason)}
                onWarnUser={(userId, reason) => console.log('Warning user:', userId, reason)}
                onApproveQuestion={(qId) => console.log('Approving question:', qId)}
                onRejectQuestion={(qId, reason) => console.log('Rejecting question:', qId, reason)}
                onResolveReport={(contentId, action) => console.log('Resolving report:', contentId, action)}
              />
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <Card className="glass-strong border-purple-200 dark:border-purple-800 fade-in-up">
              <CardHeader>
                <CardTitle className="gradient-text">About Optimize Coder</CardTitle>
                <CardDescription>The ultimate competitive coding platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                  <h3 className="font-bold mb-3 text-lg gradient-text">✨ Features</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Compete against AI or real humans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Real-time matchmaking and notifications</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Real code execution with Judge0 API</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>AI-powered complexity analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>AI-powered question generation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Anti-cheating detection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Global leaderboard and achievements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Tournament brackets with elimination rounds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Spectator mode for watching live competitions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Video replays of past competitions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>GitHub badge integration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Admin panel for question management</span>
                    </li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30">
                  <h3 className="font-bold mb-3 text-lg bg-gradient-to-r from-pink-600 to-orange-500 bg-clip-text text-transparent">🚀 How It Works</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-pink-600 dark:text-pink-400">1.</span>
                      <span>Choose competition mode and settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-pink-600 dark:text-pink-400">2.</span>
                      <span>Wait for matchmaking or start AI match</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-pink-600 dark:text-pink-400">3.</span>
                      <span>Solve 3 coding questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-pink-600 dark:text-pink-400">4.</span>
                      <span>AI evaluates complexity and performance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-pink-600 dark:text-pink-400">5.</span>
                      <span>Earn points, titles, and climb the leaderboard</span>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <BottomFooter />
    </div>
  );
}
