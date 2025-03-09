
import { User, PracticeSession, GrammarCorrection, Reward, LeaderboardEntry } from '@/types/database';

// In a real app, this would connect to a backend database
// For now, we'll use localStorage to persist data

class DatabaseService {
  private getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // User methods
  async getUsers(): Promise<User[]> {
    return this.getItem<User[]>('users', []);
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const users = await this.getUsers();
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    this.setItem('users', [...users, newUser]);
    return newUser;
  }

  async updateUser(user: User): Promise<User> {
    const users = await this.getUsers();
    const updatedUsers = users.map(u => u.id === user.id ? user : u);
    this.setItem('users', updatedUsers);
    return user;
  }

  async getUserByVoicePrint(voicePrint: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.voicePrint === voicePrint) || null;
  }

  // Practice sessions
  async getSessions(): Promise<PracticeSession[]> {
    return this.getItem<PracticeSession[]>('sessions', []);
  }

  async getSessionsByUserId(userId: string): Promise<PracticeSession[]> {
    const sessions = await this.getSessions();
    return sessions.filter(session => session.userId === userId);
  }

  async createSession(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
    const sessions = await this.getSessions();
    const newSession: PracticeSession = {
      ...session,
      id: crypto.randomUUID(),
    };
    
    this.setItem('sessions', [...sessions, newSession]);
    return newSession;
  }

  // Grammar corrections
  async getCorrections(): Promise<GrammarCorrection[]> {
    return this.getItem<GrammarCorrection[]>('corrections', []);
  }

  async getCorrectionsBySessionId(sessionId: string): Promise<GrammarCorrection[]> {
    const corrections = await this.getCorrections();
    return corrections.filter(correction => correction.sessionId === sessionId);
  }

  async createCorrection(correction: Omit<GrammarCorrection, 'id'>): Promise<GrammarCorrection> {
    const corrections = await this.getCorrections();
    const newCorrection: GrammarCorrection = {
      ...correction,
      id: crypto.randomUUID(),
    };
    
    this.setItem('corrections', [...corrections, newCorrection]);
    return newCorrection;
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    return this.getItem<Reward[]>('rewards', []);
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    const rewards = await this.getRewards();
    return rewards.filter(reward => reward.userId === userId);
  }

  async createReward(reward: Omit<Reward, 'id' | 'date'>): Promise<Reward> {
    const rewards = await this.getRewards();
    const newReward: Reward = {
      ...reward,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    this.setItem('rewards', [...rewards, newReward]);
    return newReward;
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = await this.getUsers();
    return users.map(user => ({
      userId: user.id,
      userName: user.name,
      points: user.points,
      level: user.level,
    })).sort((a, b) => b.points - a.points);
  }
}

export const db = new DatabaseService();
