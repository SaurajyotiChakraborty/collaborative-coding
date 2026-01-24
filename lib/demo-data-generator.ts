// Demo data generator for all new features
import type {
  Achievement,
  DailyChallenge,
  UserStreak,
  UserLevel,
  BattlePass,
  Team,
  Friend,
  FriendRequest,
  Gift,
  LearningPath,
  ForumPost,
  UserAnalytics,
  UserProfile,
  AIMentor,
  ReferralData,
  ModeratorQueue,
  AdminAction,
} from '@/types/extended-types';
import { ACHIEVEMENTS, EDITOR_THEMES } from './constants';

export function generateMockAchievements(userId: string): Achievement[] {
  return ACHIEVEMENTS.map(ach => ({
    ...ach,
    progress: Math.floor(Math.random() * ach.requirement),
    unlocked: Math.random() > 0.7,
    unlockedAt: Math.random() > 0.7 ? new Date() : undefined,
    nftMinted: Math.random() > 0.8,
  }));
}

export function generateDailyChallenge(): DailyChallenge {
  return {
    id: 'daily-' + Date.now(),
    questionId: BigInt(Math.floor(Math.random() * 100)),
    date: new Date(),
    bonusMultiplier: 1.5,
    completed: false,
  };
}

export function generateUserStreak(): UserStreak {
  return {
    currentStreak: Math.floor(Math.random() * 30),
    longestStreak: Math.floor(Math.random() * 100),
    lastCompletedDate: new Date(),
    streakMultiplier: 1 + Math.floor(Math.random() * 30) * 0.1,
  };
}

export function generateUserLevel(): UserLevel {
  const level = Math.floor(Math.random() * 50) + 1;
  return {
    level,
    currentXP: Math.floor(Math.random() * 1000),
    xpToNextLevel: Math.floor(100 * Math.pow(1.5, level - 1)),
    totalXP: Math.floor(Math.random() * 50000),
    unlockedFeatures: ['Custom Themes', 'Priority Matchmaking', 'Advanced Analytics'],
    skillPoints: Math.floor(Math.random() * 10),
    skillTree: {
      javascript: Math.floor(Math.random() * 10),
      python: Math.floor(Math.random() * 10),
      java: Math.floor(Math.random() * 10),
      cpp: Math.floor(Math.random() * 10),
      algorithms: Math.floor(Math.random() * 10),
      dataStructures: Math.floor(Math.random() * 10),
      optimization: Math.floor(Math.random() * 10),
    },
  };
}

export function generateBattlePass(): BattlePass {
  return {
    season: 1,
    tier: Math.random() > 0.5 ? 'premium' : 'free',
    level: Math.floor(Math.random() * 30) + 1,
    xp: Math.floor(Math.random() * 1000),
    rewards: [],
    seasonEndDate: new Date('2025-06-01'),
  };
}

export function generateMockTeams(): Team[] {
  const teams: Team[] = [];
  const teamNames = ['Code Warriors', 'Algorithm Masters', 'Binary Beasts', 'Syntax Samurai', 'Dev Dragons'];
  
  for (let i = 0; i < teamNames.length; i++) {
    teams.push({
      id: `team-${i}`,
      name: teamNames[i],
      tag: teamNames[i].substring(0, 3).toUpperCase(),
      description: `A competitive team focused on ${teamNames[i].toLowerCase()}`,
      members: [],
      maxMembers: 10,
      rating: 1200 + Math.floor(Math.random() * 800),
      wins: Math.floor(Math.random() * 50),
      losses: Math.floor(Math.random() * 30),
      createdAt: new Date(),
      emblem: ['🛡️', '⚔️', '🏆', '👑', '🔥'][i],
      chat: [],
    });
  }
  
  return teams;
}

export function generateMockFriends(): Friend[] {
  const friends: Friend[] = [];
  const usernames = ['AlgoMaster', 'CodeNinja', 'DevGuru', 'SyntaxKing', 'BugHunter'];
  
  for (let i = 0; i < usernames.length; i++) {
    friends.push({
      userId: `user-${i}`,
      username: usernames[i],
      status: ['online', 'offline', 'in-game'][Math.floor(Math.random() * 3)] as 'online' | 'offline' | 'in-game',
      rating: 1200 + Math.floor(Math.random() * 800),
      lastSeen: new Date(),
      friendshipDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    });
  }
  
  return friends;
}

export function generateLearningPaths(): LearningPath[] {
  return [
    {
      id: 'path-arrays',
      name: 'Arrays Mastery',
      description: 'Master array manipulation and traversal techniques',
      category: 'arrays',
      questions: [BigInt(1), BigInt(2), BigInt(3)],
      progress: Math.random() * 100,
      completed: false,
    },
    {
      id: 'path-dp',
      name: 'Dynamic Programming Fundamentals',
      description: 'Learn the art of breaking down complex problems',
      category: 'dp',
      questions: [BigInt(4), BigInt(5), BigInt(6)],
      progress: Math.random() * 100,
      completed: false,
    },
    {
      id: 'path-graphs',
      name: 'Graph Algorithms',
      description: 'Explore BFS, DFS, and shortest path algorithms',
      category: 'graphs',
      questions: [BigInt(7), BigInt(8), BigInt(9)],
      progress: Math.random() * 100,
      completed: false,
    },
  ];
}

export function generateMockForumPosts(): ForumPost[] {
  return [
    {
      id: 'post-1',
      authorId: 'user-1',
      authorUsername: 'TechGuru',
      title: 'How to optimize time complexity in recursive solutions?',
      content: 'I am struggling with optimizing my recursive solutions. Any tips on memoization?',
      tags: ['recursion', 'optimization', 'dynamic-programming'],
      upvotes: 15,
      downvotes: 2,
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      solved: false,
    },
    {
      id: 'post-2',
      authorId: 'user-2',
      authorUsername: 'CodeMaster',
      title: 'Best practices for graph traversal',
      content: 'What are the differences between BFS and DFS? When should I use each?',
      tags: ['graphs', 'algorithms'],
      upvotes: 23,
      downvotes: 1,
      replies: [],
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      solved: true,
    },
  ];
}

export function generateUserAnalytics(userId: string): UserAnalytics {
  return {
    userId,
    totalCompetitions: Math.floor(Math.random() * 100),
    winRate: Math.random(),
    averageTimePerQuestion: Math.floor(Math.random() * 600) + 300,
    favoriteLanguage: 'JavaScript',
    languageBreakdown: {
      javascript: 45,
      python: 30,
      java: 15,
      cpp: 10,
    },
    strengthsWeaknesses: {
      strengths: ['Arrays', 'Strings', 'Hash Tables', 'Sorting', 'Binary Search'],
      weaknesses: ['Dynamic Programming', 'Graphs', 'Trees', 'Backtracking'],
    },
    performanceTrend: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
      rating: 1200 + Math.floor(Math.random() * 400),
      wins: Math.floor(Math.random() * 5),
      accuracy: 0.5 + Math.random() * 0.5,
    })),
    heatmap: {
      'Arrays': { attempts: 45, successRate: 0.85 },
      'Strings': { attempts: 38, successRate: 0.78 },
      'Dynamic Programming': { attempts: 25, successRate: 0.52 },
      'Graphs': { attempts: 20, successRate: 0.60 },
      'Trees': { attempts: 30, successRate: 0.70 },
      'Sorting': { attempts: 35, successRate: 0.88 },
    },
  };
}

export function generateUserProfile(userId: string): UserProfile {
  return {
    userId,
    avatar: '',
    banner: '',
    bio: 'Passionate coder who loves solving algorithmic challenges',
    socialLinks: {
      github: 'username',
      twitter: 'handle',
      linkedin: 'profile',
      website: 'https://example.com',
    },
    showcaseAchievements: [],
    customTheme: EDITOR_THEMES[0],
    preferences: {
      language: 'javascript',
      fontSize: 14,
      tabSize: 2,
      keyBindings: 'default',
      autoComplete: true,
      linting: true,
      minimap: false,
    },
  };
}

export function generateAIMentor(): AIMentor {
  return {
    hints: [],
    explanations: [],
    suggestions: [
      {
        type: 'weak-area',
        content: 'Focus on practicing Dynamic Programming problems to improve your weak areas',
        actionable: true,
      },
      {
        type: 'similar-problem',
        content: 'Try solving "House Robber II" - it\'s similar to problems you\'ve solved before',
        actionable: true,
      },
    ],
  };
}

export function generateReferralData(userId: string): ReferralData {
  return {
    userId,
    referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
    referredUsers: [],
    rewards: [],
    totalEarned: 0,
  };
}

export function generateModeratorQueue(): ModeratorQueue {
  return {
    userSubmittedQuestions: [],
    reportedContent: [],
  };
}

export function generateAdminActions(): AdminAction[] {
  return [];
}
