'use client';

// Mock SpacetimeDB implementation for demo mode
import { EventEmitter } from 'events';

// Mock Identity class
export class MockIdentity {
  private hexString: string;

  constructor(hex?: string) {
    this.hexString = hex || this.generateRandomHex();
  }

  toHexString(): string {
    return this.hexString;
  }

  private generateRandomHex(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  static fromHexString(hex: string): MockIdentity {
    return new MockIdentity(hex);
  }
}

// Mock enum types
export const UserRole = {
  User: { tag: 'User' as const },
  Admin: { tag: 'Admin' as const },
};

export const QuestionDifficulty = {
  Easy: { tag: 'Easy' as const },
  Medium: { tag: 'Medium' as const },
  Hard: { tag: 'Hard' as const },
};

export const CompetitionMode = {
  AI: { tag: 'AI' as const },
  Human: { tag: 'Human' as const },
};

export const CompetitionStatus = {
  Waiting: { tag: 'Waiting' as const },
  InProgress: { tag: 'InProgress' as const },
  Completed: { tag: 'Completed' as const },
};

// Mock data types
export interface MockUser {
  identity: MockIdentity;
  username: string;
  email: string;
  role: typeof UserRole.User | typeof UserRole.Admin;
  rating: number;
  xp: bigint;
  titles: string[];
  achievements: string[];
  isCheater: boolean;
  cheaterRedemptionCount: number;
  createdAt: Date;
}

export interface MockQuestion {
  questionId: bigint;
  title: string;
  description: string;
  difficulty: typeof QuestionDifficulty.Easy | typeof QuestionDifficulty.Medium | typeof QuestionDifficulty.Hard;
  testCases: Array<{ input: string; expectedOutput: string }>;
  constraints: string;
  tags: string[];
  createdBy: MockIdentity;
  isAiGenerated: boolean;
  createdAt: Date;
}

export interface MockCompetition {
  competitionId: bigint;
  mode: typeof CompetitionMode.AI | typeof CompetitionMode.Human;
  maxParticipants: number;
  currentParticipants: MockIdentity[];
  questions: bigint[];
  startTime: Date | null;
  endTime: Date | null;
  status: typeof CompetitionStatus.Waiting | typeof CompetitionStatus.InProgress | typeof CompetitionStatus.Completed;
  hasTimeLimit: boolean;
  timeLimitMinutes: number;
  createdBy: MockIdentity;
  createdAt: Date;
}

export interface MockLeaderboardEntry {
  userId: MockIdentity;
  rank: number;
  totalPoints: bigint;
  totalWins: number;
  currentStreak: number;
  bestStreak: number;
  competitionsCompleted: number;
  updatedAt: Date;
}

export interface MockSubmission {
  submissionId: bigint;
  userId: MockIdentity;
  competitionId: bigint;
  questionId: bigint;
  code: string;
  language: string;
  timeComplexity: string;
  spaceComplexity: string;
  passed: boolean;
  submittedAt: Date;
}

export interface MockNotification {
  notificationId: bigint;
  userId: MockIdentity;
  type: { tag: string };
  message: string;
  read: boolean;
  createdAt: Date;
}

// Mock table with Map storage
class MockTable<T extends { [key: string]: unknown }> {
  private data: Map<string, T>;
  private keyField: keyof T;

  constructor(keyField: keyof T) {
    this.data = new Map();
    this.keyField = keyField;
  }

  insert(item: T): void {
    const key = String(item[this.keyField]);
    this.data.set(key, item);
  }

  values(): T[] {
    return Array.from(this.data.values());
  }

  getByKey(key: string | bigint): T | undefined {
    return this.data.get(String(key));
  }

  delete(key: string | bigint): void {
    this.data.delete(String(key));
  }

  clear(): void {
    this.data.clear();
  }

  size(): number {
    return this.data.size;
  }
}

// Mock DbConnection
export class MockDbConnection extends EventEmitter {
  public identity: MockIdentity;
  public tables: {
    users: MockTable<MockUser> & { getByIdentity: (id: MockIdentity) => MockUser | undefined };
    questions: MockTable<MockQuestion> & { getByQuestionId: (id: bigint) => MockQuestion | undefined };
    competitions: MockTable<MockCompetition>;
    leaderboard: MockTable<MockLeaderboardEntry>;
    submissions: MockTable<MockSubmission>;
    notifications: MockTable<MockNotification>;
  };

  private isConnected: boolean = false;
  private storageKey: string = 'optimize-coder-demo-data';

  constructor() {
    super();
    
    // Get or create identity
    const savedIdentity = typeof window !== 'undefined' ? localStorage.getItem('optimize-coder-identity') : null;
    this.identity = savedIdentity ? MockIdentity.fromHexString(savedIdentity) : new MockIdentity();
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('optimize-coder-identity', this.identity.toHexString());
    }

    // Initialize tables
    const usersTable = new MockTable<MockUser>('username') as MockTable<MockUser> & { getByIdentity: (id: MockIdentity) => MockUser | undefined };
    usersTable.getByIdentity = (id: MockIdentity) => {
      return usersTable.values().find(u => u.identity.toHexString() === id.toHexString());
    };

    const questionsTable = new MockTable<MockQuestion>('questionId') as MockTable<MockQuestion> & { getByQuestionId: (id: bigint) => MockQuestion | undefined };
    questionsTable.getByQuestionId = (id: bigint) => {
      return questionsTable.getByKey(String(id));
    };

    this.tables = {
      users: usersTable,
      questions: questionsTable,
      competitions: new MockTable<MockCompetition>('competitionId'),
      leaderboard: new MockTable<MockLeaderboardEntry>('userId'),
      submissions: new MockTable<MockSubmission>('submissionId'),
      notifications: new MockTable<MockNotification>('notificationId'),
    };

    this.loadFromStorage();
  }

  connect(): void {
    setTimeout(() => {
      this.isConnected = true;
      this.emit('connected');
      this.seedInitialData();
    }, 100);
  }

  disconnect(): void {
    this.isConnected = false;
    this.emit('disconnected');
  }

  subscriptionBuilder(): {
    onApplied: (callback: () => void) => { subscribe: (queries: string[]) => { cancel: () => void } };
  } {
    return {
      onApplied: (callback: () => void) => {
        // Call immediately with current data
        setTimeout(callback, 0);
        
        // Setup listener for changes
        const changeHandler = (): void => {
          callback();
        };
        this.on('dataChanged', changeHandler);

        return {
          subscribe: () => ({
            cancel: () => {
              this.off('dataChanged', changeHandler);
            },
          }),
        };
      },
    };
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const saved = localStorage.getItem(this.storageKey);
      if (!saved) return;

      const data = JSON.parse(saved);

      // Restore users
      if (data.users) {
        data.users.forEach((u: MockUser) => {
          this.tables.users.insert({
            ...u,
            identity: MockIdentity.fromHexString(u.identity.toHexString()),
            createdAt: new Date(u.createdAt),
            xp: BigInt(u.xp),
          });
        });
      }

      // Restore questions
      if (data.questions) {
        data.questions.forEach((q: MockQuestion) => {
          this.tables.questions.insert({
            ...q,
            questionId: BigInt(q.questionId),
            createdBy: MockIdentity.fromHexString(q.createdBy.toHexString()),
            createdAt: new Date(q.createdAt),
          });
        });
      }

      // Restore leaderboard
      if (data.leaderboard) {
        data.leaderboard.forEach((l: MockLeaderboardEntry) => {
          this.tables.leaderboard.insert({
            ...l,
            userId: MockIdentity.fromHexString(l.userId.toHexString()),
            totalPoints: BigInt(l.totalPoints),
            updatedAt: new Date(l.updatedAt),
          });
        });
      }
    } catch (error) {
      console.error('Failed to load demo data:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        users: this.tables.users.values().map(u => ({
          ...u,
          identity: { toHexString: () => u.identity.toHexString() },
          xp: u.xp.toString(),
        })),
        questions: this.tables.questions.values().map(q => ({
          ...q,
          questionId: q.questionId.toString(),
          createdBy: { toHexString: () => q.createdBy.toHexString() },
        })),
        leaderboard: this.tables.leaderboard.values().map(l => ({
          ...l,
          userId: { toHexString: () => l.userId.toHexString() },
          totalPoints: l.totalPoints.toString(),
        })),
      };

      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save demo data:', error);
    }
  }

  private seedInitialData(): void {
    // Only seed if tables are empty
    if (this.tables.questions.size() > 0) return;

    // Seed questions
    const sampleQuestions: MockQuestion[] = [
      {
        questionId: BigInt(1),
        title: 'Two Sum',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        difficulty: QuestionDifficulty.Easy,
        testCases: [
          { input: '[2,7,11,15], 9', expectedOutput: '[0,1]' },
          { input: '[3,2,4], 6', expectedOutput: '[1,2]' },
          { input: '[3,3], 6', expectedOutput: '[0,1]' },
        ],
        constraints: '2 <= nums.length <= 10^4',
        tags: ['array', 'hash-table'],
        createdBy: this.identity,
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        questionId: BigInt(2),
        title: 'Reverse Linked List',
        description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
        difficulty: QuestionDifficulty.Medium,
        testCases: [
          { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
          { input: '[1,2]', expectedOutput: '[2,1]' },
          { input: '[]', expectedOutput: '[]' },
        ],
        constraints: 'The number of nodes in the list is the range [0, 5000].',
        tags: ['linked-list', 'recursion'],
        createdBy: this.identity,
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        questionId: BigInt(3),
        title: 'Binary Tree Inorder Traversal',
        description: 'Given the root of a binary tree, return the inorder traversal of its nodes values.',
        difficulty: QuestionDifficulty.Easy,
        testCases: [
          { input: '[1,null,2,3]', expectedOutput: '[1,3,2]' },
          { input: '[]', expectedOutput: '[]' },
          { input: '[1]', expectedOutput: '[1]' },
        ],
        constraints: 'The number of nodes in the tree is in the range [0, 100].',
        tags: ['tree', 'depth-first-search'],
        createdBy: this.identity,
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        questionId: BigInt(4),
        title: 'Valid Parentheses',
        description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
        difficulty: QuestionDifficulty.Easy,
        testCases: [
          { input: '()', expectedOutput: 'true' },
          { input: '()[]{}', expectedOutput: 'true' },
          { input: '(]', expectedOutput: 'false' },
        ],
        constraints: '1 <= s.length <= 10^4',
        tags: ['stack', 'string'],
        createdBy: this.identity,
        isAiGenerated: false,
        createdAt: new Date(),
      },
      {
        questionId: BigInt(5),
        title: 'Maximum Subarray',
        description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
        difficulty: QuestionDifficulty.Medium,
        testCases: [
          { input: '[-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
          { input: '[1]', expectedOutput: '1' },
          { input: '[5,4,-1,7,8]', expectedOutput: '23' },
        ],
        constraints: '1 <= nums.length <= 10^5',
        tags: ['array', 'dynamic-programming'],
        createdBy: this.identity,
        isAiGenerated: false,
        createdAt: new Date(),
      },
    ];

    sampleQuestions.forEach(q => this.tables.questions.insert(q));

    // Seed demo leaderboard entries
    const demoUsers = [
      { username: 'CodeMaster', rating: 2400, wins: 89, streak: 12 },
      { username: 'AlgoNinja', rating: 2100, wins: 67, streak: 8 },
      { username: 'DevWizard', rating: 1850, wins: 45, streak: 5 },
      { username: 'ByteBeast', rating: 1620, wins: 34, streak: 3 },
      { username: 'LogicLion', rating: 1450, wins: 28, streak: 2 },
    ];

    demoUsers.forEach((user, index) => {
      const demoIdentity = new MockIdentity();
      this.tables.leaderboard.insert({
        userId: demoIdentity,
        rank: index + 1,
        totalPoints: BigInt(user.rating * 10),
        totalWins: user.wins,
        currentStreak: user.streak,
        bestStreak: user.streak + 5,
        competitionsCompleted: user.wins + 15,
        updatedAt: new Date(),
      });
    });

    this.saveToStorage();
    this.emit('dataChanged');
  }

  // Mock reducers
  registerUser(username: string, email: string): void {
    const existingUser = this.tables.users.values().find(
      u => u.identity.toHexString() === this.identity.toHexString()
    );

    if (!existingUser) {
      const newUser: MockUser = {
        identity: this.identity,
        username,
        email,
        role: UserRole.User,
        rating: 1200,
        xp: BigInt(0),
        titles: [],
        achievements: [],
        isCheater: false,
        cheaterRedemptionCount: 0,
        createdAt: new Date(),
      };

      this.tables.users.insert(newUser);

      // Add to leaderboard
      this.tables.leaderboard.insert({
        userId: this.identity,
        rank: this.tables.leaderboard.size() + 1,
        totalPoints: BigInt(0),
        totalWins: 0,
        currentStreak: 0,
        bestStreak: 0,
        competitionsCompleted: 0,
        updatedAt: new Date(),
      });

      this.saveToStorage();
      this.emit('dataChanged');
    }
  }

  createCompetition(mode: string, maxParticipants: number, questionIds: bigint[], hasTimeLimit: boolean, timeLimitMinutes: number): bigint {
    const competitionId = BigInt(Date.now());
    
    const competition: MockCompetition = {
      competitionId,
      mode: mode === 'AI' ? CompetitionMode.AI : CompetitionMode.Human,
      maxParticipants,
      currentParticipants: [this.identity],
      questions: questionIds,
      startTime: null,
      endTime: null,
      status: CompetitionStatus.Waiting,
      hasTimeLimit,
      timeLimitMinutes,
      createdBy: this.identity,
      createdAt: new Date(),
    };

    this.tables.competitions.insert(competition);
    this.saveToStorage();
    this.emit('dataChanged');

    return competitionId;
  }

  startCompetition(competitionId: bigint): void {
    const competition = this.tables.competitions.getByKey(competitionId);
    if (competition) {
      competition.status = CompetitionStatus.InProgress;
      competition.startTime = new Date();
      this.saveToStorage();
      this.emit('dataChanged');
    }
  }

  createQuestion(title: string, description: string, difficulty: string, testCases: Array<{ input: string; expectedOutput: string }>, tags: string[]): void {
    const questionId = BigInt(this.tables.questions.size() + 1);
    
    const difficultyMap: Record<string, typeof QuestionDifficulty.Easy | typeof QuestionDifficulty.Medium | typeof QuestionDifficulty.Hard> = {
      'Easy': QuestionDifficulty.Easy,
      'Medium': QuestionDifficulty.Medium,
      'Hard': QuestionDifficulty.Hard,
    };

    const question: MockQuestion = {
      questionId,
      title,
      description,
      difficulty: difficultyMap[difficulty] || QuestionDifficulty.Medium,
      testCases,
      constraints: 'Standard constraints apply',
      tags,
      createdBy: this.identity,
      isAiGenerated: false,
      createdAt: new Date(),
    };

    this.tables.questions.insert(question);
    this.saveToStorage();
    this.emit('dataChanged');
  }

  updateUserRole(username: string, role: string): void {
    const user = this.tables.users.values().find(u => u.username === username);
    if (user) {
      user.role = role === 'Admin' ? UserRole.Admin : UserRole.User;
      this.saveToStorage();
      this.emit('dataChanged');
    }
  }
}

// Mock connection builder
export const MockDbConnectionBuilder = {
  builder: () => ({
    withUri: () => ({
      withModuleName: () => ({
        build: () => {
          const conn = new MockDbConnection();
          conn.connect();
          return conn;
        },
      }),
    }),
  }),
};
