
// This file now serves as a compatibility layer between the old localStorage approach
// and the new SQLite implementation.

import { sqliteDB } from './sqliteService';
import { User, PracticeSession, GrammarCorrection, Reward, LeaderboardEntry, Lesson, Achievement, CommunityPost, CommunityComment, UserSettings } from '@/types/database';

class DatabaseService {
  // User methods
  async getUsers(): Promise<User[]> {
    return sqliteDB.getUsers();
  }

  async getUserById(id: string): Promise<User | null> {
    return sqliteDB.getUserById(id);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return sqliteDB.createUser(user);
  }

  async updateUser(user: User): Promise<User> {
    return sqliteDB.updateUser(user);
  }

  async getUserByVoicePrint(voicePrint: string): Promise<User | null> {
    const users = await this.getUsers();
    return users.find(user => user.voicePrint === voicePrint) || null;
  }

  // Practice sessions
  async getSessions(): Promise<PracticeSession[]> {
    return sqliteDB.getSessions();
  }

  async getSessionsByUserId(userId: string): Promise<PracticeSession[]> {
    return sqliteDB.getSessionsByUserId(userId);
  }

  async createSession(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
    return sqliteDB.createSession(session);
  }

  async updateSession(session: PracticeSession): Promise<PracticeSession> {
    return sqliteDB.updateSession(session);
  }

  // Grammar corrections
  async getCorrections(): Promise<GrammarCorrection[]> {
    return sqliteDB.getCorrections();
  }

  async getCorrectionsBySessionId(sessionId: string): Promise<GrammarCorrection[]> {
    return sqliteDB.getCorrectionsBySessionId(sessionId);
  }

  async createCorrection(correction: Omit<GrammarCorrection, 'id'>): Promise<GrammarCorrection> {
    return sqliteDB.createCorrection(correction);
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    return sqliteDB.getRewards();
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    return sqliteDB.getRewardsByUserId(userId);
  }

  async createReward(reward: Omit<Reward, 'id' | 'date'>): Promise<Reward> {
    return sqliteDB.createReward(reward);
  }

  // Leaderboard
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const users = await sqliteDB.getLeaderboard();
    return users.map(user => ({
      userId: user.id,
      userName: user.name,
      points: user.points,
      level: user.level,
    })).sort((a, b) => b.points - a.points);
  }

  // Lessons
  async getLessons(): Promise<Lesson[]> {
    return sqliteDB.getLessons();
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const lessons = await this.getLessons();
    return lessons.find(lesson => lesson.id === id) || null;
  }

  async updateLesson(lesson: Lesson): Promise<Lesson> {
    return sqliteDB.updateLesson(lesson);
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return sqliteDB.getAchievements();
  }

  async getAchievementsByUserId(userId: string): Promise<Achievement[]> {
    const achievements = await this.getAchievements();
    const rewards = await this.getRewardsByUserId(userId);
    const user = await this.getUserById(userId);
    
    return achievements.map(achievement => ({
      ...achievement,
      isUnlocked: user && user.points >= achievement.requiredPoints,
      unlockedAt: user && user.points >= achievement.requiredPoints 
        ? new Date().toISOString() 
        : undefined,
    }));
  }

  // Community
  async getCommunityPosts(): Promise<CommunityPost[]> {
    return sqliteDB.getPosts();
  }

  async createCommunityPost(post: Omit<CommunityPost, 'id' | 'date'>): Promise<CommunityPost> {
    return sqliteDB.createPost(post);
  }

  async getCommunityComments(postId: string): Promise<CommunityComment[]> {
    return sqliteDB.getCommentsByPostId(postId);
  }

  async createCommunityComment(comment: Omit<CommunityComment, 'id' | 'date'>): Promise<CommunityComment> {
    return sqliteDB.createComment(comment);
  }

  // User settings
  async updateUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
    return sqliteDB.updateUserSettings(userId, settings);
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    return sqliteDB.getUserSettings(userId);
  }

  // Helper methods for backward compatibility
  private getDefaultLessons(): Lesson[] {
    return [];
  }

  private getDefaultAchievements(): Achievement[] {
    return [];
  }
}

export const db = new DatabaseService();
