
export interface User {
  id: string;
  name: string;
  email: string;
  voicePrint?: string; // Voice signature for voice authentication
  points: number;
  level: number;
  createdAt: string;
  lastLogin: string;
  settings?: UserSettings;
}

export interface UserSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface PracticeSession {
  id: string;
  userId: string;
  type: 'speaking' | 'listening' | 'pronunciation' | 'vocabulary';
  score: number;
  duration: number;
  date: string;
}

export interface GrammarCorrection {
  id: string;
  sessionId: string;
  original: string;
  corrected: string;
  rule: string;
  explanation: string;
}

export interface Reward {
  id: string;
  userId: string;
  type: string;
  description: string;
  points: number;
  date: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  points: number;
  level: number;
}

// Define correction interface for AIFeedback component
export interface FeedbackCorrection {
  original: string;
  corrected: string;
  explanation: string;
  rule?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'conversation';
  completed: boolean;
  progress: number; // 0-100
  imageUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  requiredPoints: number;
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userLevel: number;
  content: string;
  likes: number;
  comments: number;
  date: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
}
