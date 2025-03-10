
export interface User {
  id: string;
  name: string;
  email: string;
  voicePrint?: string; // Voice signature for voice authentication
  points: number;
  level: number;
  streak?: number; // Current login streak
  lastStreak?: string; // Date of last streak check
  createdAt: string;
  lastLogin: string;
  settings?: UserSettings;
}

export interface UserSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audioEnabled?: boolean;
  aiEnabled?: boolean;
  analyticsEnabled?: boolean;
  privacySettings?: {
    showProfilePublic?: boolean;
    allowDataCollection?: boolean;
    emailMarketing?: boolean;
  };
}

export interface PracticeSession {
  id: string;
  userId: string;
  type: 'speaking' | 'listening' | 'pronunciation' | 'vocabulary' | 'reading' | 'writing' | 'grammar';
  score: number;
  duration: number;
  date: string;
  feedback?: string;
  aiGeneratedFeedback?: boolean;
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
  category: 'grammar' | 'vocabulary' | 'pronunciation' | 'conversation' | 'reading' | 'writing';
  completed: boolean;
  progress: number; // 0-100
  imageUrl?: string;
  content?: LessonContent;
}

export interface LessonContent {
  sections: LessonSection[];
  exercises: LessonExercise[];
  quizzes: LessonQuiz[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  order: number;
  mediaUrl?: string;
}

export interface LessonExercise {
  id: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'matching' | 'speech' | 'writing';
  question: string;
  answers?: string[];
  correctAnswer?: string | string[];
  hint?: string;
}

export interface LessonQuiz {
  id: string;
  questions: LessonExercise[];
  passingScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  isUnlocked: boolean;
  requiredPoints: number;
  criteria?: {
    type: 'points' | 'sessions' | 'streak' | 'mastery';
    value: number;
    category?: string;
  };
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
  tags?: string[];
  media?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  likes?: number;
}

export interface VocabularyItem {
  id: string;
  word: string;
  definition: string;
  example: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  pronunciation?: string;
  imageUrl?: string;
}

export interface UserWordList {
  id: string;
  userId: string;
  name: string;
  words: string[]; // VocabularyItem IDs
  created: string;
  lastModified: string;
}

export interface ProgressSnapshot {
  userId: string;
  date: string;
  metrics: {
    speaking?: number;
    listening?: number;
    reading?: number;
    writing?: number;
    vocabulary?: number;
    grammar?: number;
    overall?: number;
  };
}
