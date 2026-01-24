// Extended types for all new features

// Ranking & ELO System
export interface RankTier {
  name: string;
  minRating: number;
  maxRating: number;
  color: string;
  icon: string;
  division: number;
}

export interface EloHistory {
  timestamp: Date;
  rating: number;
  change: number;
  reason: string;
}

// Daily Challenges & Streaks
export interface DailyChallenge {
  id: string;
  questionId: bigint;
  date: Date;
  bonusMultiplier: number;
  completed: boolean;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
  streakMultiplier: number;
}

// Achievement System
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'wins' | 'speed' | 'streak' | 'practice' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
  nftMinted?: boolean;
  nftTokenId?: string;
}

// XP & Leveling
export interface UserLevel {
  level: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  unlockedFeatures: string[];
  skillPoints: number;
  skillTree: SkillTree;
}

export interface SkillTree {
  javascript: number;
  python: number;
  java: number;
  cpp: number;
  algorithms: number;
  dataStructures: number;
  optimization: number;
}

// Battle Pass
export interface BattlePass {
  season: number;
  tier: 'free' | 'premium';
  level: number;
  xp: number;
  rewards: BattlePassReward[];
  seasonEndDate: Date;
}

export interface BattlePassReward {
  level: number;
  tier: 'free' | 'premium';
  type: 'theme' | 'avatar' | 'badge' | 'xp-boost' | 'title';
  item: string;
  claimed: boolean;
}

// Teams & Clans
export interface Team {
  id: string;
  name: string;
  tag: string;
  description: string;
  members: TeamMember[];
  maxMembers: number;
  rating: number;
  wins: number;
  losses: number;
  createdAt: Date;
  emblem: string;
  chat: ChatMessage[];
}

export interface TeamMember {
  userId: string;
  username: string;
  role: 'leader' | 'officer' | 'member';
  joinedAt: Date;
  contribution: number;
}

export interface ClanWar {
  id: string;
  team1: string;
  team2: string;
  status: 'pending' | 'active' | 'completed';
  startDate: Date;
  endDate: Date;
  team1Score: number;
  team2Score: number;
  winner?: string;
}

// Friends System
export interface Friend {
  userId: string;
  username: string;
  status: 'online' | 'offline' | 'in-game';
  rating: number;
  lastSeen: Date;
  friendshipDate: Date;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: Date;
}

export interface Gift {
  id: string;
  type: 'xp-boost' | 'hint' | 'streak-saver';
  fromUserId: string;
  fromUsername: string;
  toUserId: string;
  message: string;
  claimed: boolean;
  sentAt: Date;
}

// Practice Mode
export interface PracticeSession {
  id: string;
  questionId: bigint;
  startedAt: Date;
  completedAt?: Date;
  attempts: PracticeAttempt[];
  hintsUsed: number;
  solutionViewed: boolean;
}

export interface PracticeAttempt {
  code: string;
  language: string;
  passed: boolean;
  timestamp: Date;
  feedback: string;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  category: string;
  questions: bigint[];
  progress: number;
  completed: boolean;
  certificate?: string;
}

// Discussion Forums
export interface ForumPost {
  id: string;
  questionId?: bigint;
  authorId: string;
  authorUsername: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies: ForumReply[];
  createdAt: Date;
  updatedAt: Date;
  solved: boolean;
}

export interface ForumReply {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string;
  upvotes: number;
  downvotes: number;
  createdAt: Date;
  bestAnswer: boolean;
}

// Analytics
export interface UserAnalytics {
  userId: string;
  totalCompetitions: number;
  winRate: number;
  averageTimePerQuestion: number;
  favoriteLanguage: string;
  languageBreakdown: Record<string, number>;
  strengthsWeaknesses: {
    strengths: string[];
    weaknesses: string[];
  };
  performanceTrend: PerformanceDataPoint[];
  heatmap: HeatmapData;
}

export interface PerformanceDataPoint {
  date: Date;
  rating: number;
  wins: number;
  accuracy: number;
}

export interface HeatmapData {
  [category: string]: {
    attempts: number;
    successRate: number;
  };
}

// Competition Analytics
export interface CompetitionAnalytics {
  competitionId: bigint;
  questionBreakdown: QuestionPerformance[];
  timeSpent: number;
  codeQualityScore: number;
  comparisonToAverage: number;
  rank: number;
  totalParticipants: number;
}

export interface QuestionPerformance {
  questionId: bigint;
  timeSpent: number;
  attempts: number;
  passed: boolean;
  complexity: {
    time: string;
    space: string;
  };
  testCasesPassed: number;
  totalTestCases: number;
}

// Profile Customization
export interface UserProfile {
  userId: string;
  avatar: string;
  banner: string;
  bio: string;
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  showcaseAchievements: string[];
  customTheme: EditorTheme;
  preferences: UserPreferences;
}

export interface EditorTheme {
  name: string;
  background: string;
  foreground: string;
  accent: string;
  syntax: {
    keyword: string;
    string: string;
    number: string;
    comment: string;
    function: string;
  };
}

export interface UserPreferences {
  language: string;
  fontSize: number;
  tabSize: number;
  keyBindings: 'default' | 'vim' | 'emacs';
  autoComplete: boolean;
  linting: boolean;
  minimap: boolean;
}

// AI Features
export interface AIMentor {
  hints: Hint[];
  explanations: Explanation[];
  suggestions: Suggestion[];
}

export interface Hint {
  id: string;
  level: 'small' | 'medium' | 'large';
  content: string;
  cost: number;
}

export interface Explanation {
  topic: string;
  content: string;
  examples: string[];
  difficulty: string;
}

export interface Suggestion {
  type: 'similar-problem' | 'weak-area' | 'learning-path';
  content: string;
  actionable: boolean;
}

// Multi-Language Support
export interface LanguageSupport {
  id: number;
  name: string;
  displayName: string;
  version: string;
  enabled: boolean;
  icon: string;
  extensions: string[];
}

// Chat System
export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'system';
}

export interface ChatRoom {
  id: string;
  type: 'team' | 'global' | 'competition' | 'dm';
  participants: string[];
  messages: ChatMessage[];
  createdAt: Date;
}

// Streaming
export interface Stream {
  id: string;
  streamerId: string;
  streamerUsername: string;
  competitionId?: bigint;
  platform: 'twitch' | 'youtube';
  url: string;
  viewerCount: number;
  startedAt: Date;
  title: string;
  thumbnail: string;
}

// Monetization
export interface Tournament {
  id: string;
  name: string;
  description: string;
  prizePool: number;
  currency: 'USD' | 'ETH';
  entryFee: number;
  maxParticipants: number;
  currentParticipants: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'registration' | 'active' | 'completed';
  sponsor?: string;
  brackets: TournamentBracket[];
}

export interface TournamentBracket {
  round: number;
  matches: TournamentMatch[];
}

export interface TournamentMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  winner?: string;
  score1: number;
  score2: number;
  scheduledTime: Date;
}

export interface Subscription {
  userId: string;
  tier: 'free' | 'premium';
  features: string[];
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
}

// NFT Achievements
export interface NFTAchievement {
  tokenId: string;
  achievementId: string;
  owner: string;
  mintedAt: Date;
  blockchain: 'Base';
  contractAddress: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  };
}

// Referral System
export interface ReferralData {
  userId: string;
  referralCode: string;
  referredUsers: string[];
  rewards: ReferralReward[];
  totalEarned: number;
}

export interface ReferralReward {
  type: 'xp' | 'badge' | 'premium-days';
  amount: number;
  earnedAt: Date;
  fromUserId: string;
}

// Anti-Cheat Enhanced
export interface AntiCheatLog {
  userId: string;
  competitionId: bigint;
  events: CheatEvent[];
  suspicionScore: number;
  flagged: boolean;
  reviewed: boolean;
}

export interface CheatEvent {
  type: 'tab-switch' | 'paste' | 'similarity' | 'timing-anomaly' | 'webcam-violation';
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  details: string;
}

// Code Review
export interface CodeReview {
  id: string;
  submissionId: bigint;
  reviewerId: string;
  rating: number;
  comments: CodeComment[];
  suggestions: string[];
  createdAt: Date;
}

export interface CodeComment {
  id: string;
  lineNumber: number;
  content: string;
  type: 'improvement' | 'bug' | 'style' | 'praise';
  upvotes: number;
}

// Admin Tools
export interface AdminAction {
  id: string;
  adminId: string;
  actionType: 'ban' | 'warn' | 'promote' | 'approve-question' | 'feature-user';
  targetId: string;
  reason: string;
  timestamp: Date;
  reversible: boolean;
}

export interface ModeratorQueue {
  userSubmittedQuestions: Array<{
    questionId: bigint;
    status: 'pending' | 'approved' | 'rejected';
    submittedBy: string;
    submittedAt: Date;
    votes: number;
  }>;
  reportedContent: Array<{
    contentId: string;
    contentType: 'post' | 'comment' | 'solution';
    reportedBy: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
  }>;
}
