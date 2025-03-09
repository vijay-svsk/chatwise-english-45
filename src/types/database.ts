
export interface User {
  id: string;
  name: string;
  email: string;
  voicePrint?: string; // Voice signature for voice authentication
  points: number;
  level: number;
  createdAt: string;
  lastLogin: string;
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
