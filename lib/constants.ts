import type { RankTier, LanguageSupport } from '@/types/extended-types';

// Rank Tiers (ELO System)
export const RANK_TIERS: RankTier[] = [
  { name: 'Bronze', minRating: 0, maxRating: 1199, color: '#CD7F32', icon: '🥉', division: 1 },
  { name: 'Silver', minRating: 1200, maxRating: 1499, color: '#C0C0C0', icon: '🥈', division: 2 },
  { name: 'Gold', minRating: 1500, maxRating: 1799, color: '#FFD700', icon: '🥇', division: 3 },
  { name: 'Platinum', minRating: 1800, maxRating: 2099, color: '#E5E4E2', icon: '💎', division: 4 },
  { name: 'Diamond', minRating: 2100, maxRating: 2399, color: '#B9F2FF', icon: '💠', division: 5 },
  { name: 'Master', minRating: 2400, maxRating: 2699, color: '#9B59B6', icon: '👑', division: 6 },
  { name: 'Grandmaster', minRating: 2700, maxRating: Infinity, color: '#E74C3C', icon: '⚡', division: 7 },
];

// XP Calculation
export const XP_PER_LEVEL = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Battle Pass Seasons
export const BATTLE_PASS_SEASON = 1;
export const BATTLE_PASS_END_DATE = new Date('2025-06-01');

// Supported Languages
export const SUPPORTED_LANGUAGES: LanguageSupport[] = [
  { id: 63, name: 'javascript', displayName: 'JavaScript', version: 'Node.js 18', enabled: true, icon: '🟨', extensions: ['.js'] },
  { id: 71, name: 'python', displayName: 'Python', version: '3.11', enabled: true, icon: '🐍', extensions: ['.py'] },
  { id: 62, name: 'java', displayName: 'Java', version: '17', enabled: true, icon: '☕', extensions: ['.java'] },
  { id: 54, name: 'cpp', displayName: 'C++', version: '17', enabled: true, icon: '⚙️', extensions: ['.cpp'] },
  { id: 51, name: 'csharp', displayName: 'C#', version: '.NET 7', enabled: true, icon: '🔷', extensions: ['.cs'] },
  { id: 60, name: 'go', displayName: 'Go', version: '1.20', enabled: true, icon: '🐹', extensions: ['.go'] },
  { id: 72, name: 'ruby', displayName: 'Ruby', version: '3.2', enabled: true, icon: '💎', extensions: ['.rb'] },
  { id: 73, name: 'rust', displayName: 'Rust', version: '1.70', enabled: true, icon: '🦀', extensions: ['.rs'] },
  { id: 78, name: 'kotlin', displayName: 'Kotlin', version: '1.8', enabled: true, icon: '🅺', extensions: ['.kt'] },
  { id: 83, name: 'swift', displayName: 'Swift', version: '5.8', enabled: true, icon: '🍎', extensions: ['.swift'] },
  { id: 68, name: 'php', displayName: 'PHP', version: '8.2', enabled: true, icon: '🐘', extensions: ['.php'] },
  { id: 82, name: 'sql', displayName: 'SQL', version: 'SQLite 3', enabled: true, icon: '🗄️', extensions: ['.sql'] },
];

// Achievement Definitions
export const ACHIEVEMENTS = [
  // Wins
  { id: 'first-win', name: 'First Victory', description: 'Win your first competition', icon: '🎉', category: 'wins', rarity: 'common', requirement: 1 },
  { id: 'win-10', name: 'Rising Star', description: 'Win 10 competitions', icon: '⭐', category: 'wins', rarity: 'common', requirement: 10 },
  { id: 'win-50', name: 'Veteran', description: 'Win 50 competitions', icon: '🏆', category: 'wins', rarity: 'rare', requirement: 50 },
  { id: 'win-100', name: 'Champion', description: 'Win 100 competitions', icon: '👑', category: 'wins', rarity: 'epic', requirement: 100 },
  { id: 'win-500', name: 'Legend', description: 'Win 500 competitions', icon: '⚡', category: 'wins', rarity: 'legendary', requirement: 500 },
  
  // Speed
  { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a competition in under 5 minutes', icon: '⚡', category: 'speed', rarity: 'rare', requirement: 1 },
  { id: 'lightning-fast', name: 'Lightning Fast', description: 'Complete 10 competitions in under 10 minutes each', icon: '⚡⚡', category: 'speed', rarity: 'epic', requirement: 10 },
  
  // Streaks
  { id: 'streak-7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥', category: 'streak', rarity: 'common', requirement: 7 },
  { id: 'streak-30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '🔥🔥', category: 'streak', rarity: 'rare', requirement: 30 },
  { id: 'streak-100', name: 'Unstoppable', description: 'Maintain a 100-day streak', icon: '🔥🔥🔥', category: 'streak', rarity: 'legendary', requirement: 100 },
  
  // Practice
  { id: 'practice-10', name: 'Dedicated Learner', description: 'Complete 10 practice sessions', icon: '📚', category: 'practice', rarity: 'common', requirement: 10 },
  { id: 'practice-100', name: 'Knowledge Seeker', description: 'Complete 100 practice sessions', icon: '🎓', category: 'practice', rarity: 'rare', requirement: 100 },
  
  // Social
  { id: 'team-player', name: 'Team Player', description: 'Join a team', icon: '🤝', category: 'social', rarity: 'common', requirement: 1 },
  { id: 'friend-10', name: 'Popular', description: 'Add 10 friends', icon: '👥', category: 'social', rarity: 'common', requirement: 10 },
  { id: 'helpful', name: 'Helpful Hand', description: 'Receive 50 upvotes on forum posts', icon: '👍', category: 'social', rarity: 'rare', requirement: 50 },
  
  // Special
  { id: 'perfect-score', name: 'Perfectionist', description: 'Complete a competition with 100% accuracy', icon: '💯', category: 'special', rarity: 'epic', requirement: 1 },
  { id: 'polyglot', name: 'Polyglot', description: 'Win competitions in 5 different languages', icon: '🌐', category: 'special', rarity: 'epic', requirement: 5 },
  { id: 'ai-slayer', name: 'AI Slayer', description: 'Defeat the AI 50 times', icon: '🤖', category: 'special', rarity: 'rare', requirement: 50 },
];

// Battle Pass Rewards
export const BATTLE_PASS_REWARDS = [
  // Free Tier
  { level: 1, tier: 'free', type: 'xp-boost', item: '10% XP Boost (1 hour)' },
  { level: 2, tier: 'free', type: 'title', item: 'Novice Coder' },
  { level: 5, tier: 'free', type: 'badge', item: 'Bronze Badge' },
  { level: 10, tier: 'free', type: 'theme', item: 'Dark Ocean Theme' },
  { level: 15, tier: 'free', type: 'xp-boost', item: '25% XP Boost (2 hours)' },
  { level: 20, tier: 'free', type: 'title', item: 'Code Warrior' },
  { level: 25, tier: 'free', type: 'badge', item: 'Silver Badge' },
  { level: 30, tier: 'free', type: 'theme', item: 'Midnight Purple Theme' },
  
  // Premium Tier
  { level: 1, tier: 'premium', type: 'xp-boost', item: '25% XP Boost (2 hours)' },
  { level: 2, tier: 'premium', type: 'avatar', item: 'Golden Avatar Frame' },
  { level: 3, tier: 'premium', type: 'theme', item: 'Cyber Neon Theme' },
  { level: 5, tier: 'premium', type: 'title', item: 'Elite Coder' },
  { level: 7, tier: 'premium', type: 'badge', item: 'Premium Badge' },
  { level: 10, tier: 'premium', type: 'theme', item: 'Synthwave Theme' },
  { level: 15, tier: 'premium', type: 'xp-boost', item: '50% XP Boost (4 hours)' },
  { level: 20, tier: 'premium', type: 'avatar', item: 'Diamond Avatar Frame' },
  { level: 25, tier: 'premium', type: 'title', item: 'Legendary Programmer' },
  { level: 30, tier: 'premium', type: 'theme', item: 'Exclusive Galaxy Theme' },
];

// Editor Themes
export const EDITOR_THEMES = [
  {
    name: 'Default Dark',
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    accent: '#007acc',
    syntax: { keyword: '#569cd6', string: '#ce9178', number: '#b5cea8', comment: '#6a9955', function: '#dcdcaa' },
  },
  {
    name: 'Monokai',
    background: '#272822',
    foreground: '#f8f8f2',
    accent: '#f92672',
    syntax: { keyword: '#f92672', string: '#e6db74', number: '#ae81ff', comment: '#75715e', function: '#a6e22e' },
  },
  {
    name: 'Dracula',
    background: '#282a36',
    foreground: '#f8f8f2',
    accent: '#ff79c6',
    syntax: { keyword: '#ff79c6', string: '#f1fa8c', number: '#bd93f9', comment: '#6272a4', function: '#50fa7b' },
  },
  {
    name: 'Synthwave',
    background: '#2b213a',
    foreground: '#fede5d',
    accent: '#ff7edb',
    syntax: { keyword: '#ff7edb', string: '#72f1b8', number: '#f97e72', comment: '#848bbd', function: '#fede5d' },
  },
];

// Daily Challenge Multipliers
export const DAILY_CHALLENGE_MULTIPLIER = 1.5;
export const WEEKLY_SERIES_MULTIPLIER = 2.0;

// Skill Tree Costs
export const SKILL_POINT_COST = 1;
export const MAX_SKILL_LEVEL = 10;

// Gift Items
export const GIFT_ITEMS = [
  { type: 'xp-boost', name: '2x XP Boost (1 hour)', cost: 50 },
  { type: 'hint', name: 'Premium Hint', cost: 30 },
  { type: 'streak-saver', name: 'Streak Saver', cost: 100 },
];

// Anti-Cheat Thresholds
export const CHEAT_DETECTION = {
  TAB_SWITCH_LIMIT: 3,
  PASTE_WARNING_THRESHOLD: 2,
  SIMILARITY_THRESHOLD: 0.85,
  TIMING_ANOMALY_THRESHOLD: 0.3,
};

// Referral Rewards
export const REFERRAL_REWARDS = {
  NEW_USER_XP: 500,
  REFERRER_XP: 1000,
  MILESTONE_5_BADGE: 'Recruiter',
  MILESTONE_10_PREMIUM: 7, // days
};
