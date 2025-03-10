
import { openDB, IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';
import { User, PracticeSession, GrammarCorrection, Reward, Lesson, Achievement, CommunityPost, CommunityComment, UserSettings } from '@/types/database';

// Define the database schema
interface LinguaLearnerDB {
  users: 'readwrite';
  sessions: 'readwrite';
  corrections: 'readwrite';
  rewards: 'readwrite';
  lessons: 'readwrite';
  achievements: 'readwrite';
  posts: 'readwrite';
  comments: 'readwrite';
}

class SQLiteService {
  private db: Promise<IDBPDatabase<LinguaLearnerDB>>;

  constructor() {
    this.db = this.initDatabase();
  }

  private async initDatabase(): Promise<IDBPDatabase<LinguaLearnerDB>> {
    return openDB<LinguaLearnerDB>('lingua-learner-db', 1, {
      upgrade(db) {
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessions')) {
          db.createObjectStore('sessions', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('corrections')) {
          db.createObjectStore('corrections', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('rewards')) {
          db.createObjectStore('rewards', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('achievements')) {
          db.createObjectStore('achievements', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('posts')) {
          db.createObjectStore('posts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('comments')) {
          db.createObjectStore('comments', { keyPath: 'id' });
        }
      }
    });
  }

  // User-related methods
  async getUsers(): Promise<User[]> {
    return (await this.db).getAll('users');
  }

  async getUserById(id: string): Promise<User | null> {
    return (await this.db).get('users', id);
  }

  async createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...user,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      points: user.points || 0,
      level: user.level || 1,
    };
    await (await this.db).put('users', newUser);
    return newUser;
  }

  async updateUser(user: User): Promise<User> {
    await (await this.db).put('users', user);
    return user;
  }

  // Practice session methods
  async getSessions(): Promise<PracticeSession[]> {
    return (await this.db).getAll('sessions');
  }

  async getSessionsByUserId(userId: string): Promise<PracticeSession[]> {
    const sessions = await this.getSessions();
    return sessions.filter(session => session.userId === userId);
  }

  async createSession(session: Omit<PracticeSession, 'id'>): Promise<PracticeSession> {
    const newSession: PracticeSession = {
      id: uuidv4(),
      ...session,
    };
    await (await this.db).put('sessions', newSession);
    return newSession;
  }

  async updateSession(session: PracticeSession): Promise<PracticeSession> {
    await (await this.db).put('sessions', session);
    return session;
  }

  // Grammar correction methods
  async getCorrections(): Promise<GrammarCorrection[]> {
    return (await this.db).getAll('corrections');
  }

  async getCorrectionsBySessionId(sessionId: string): Promise<GrammarCorrection[]> {
    const corrections = await this.getCorrections();
    return corrections.filter(correction => correction.sessionId === sessionId);
  }

  async createCorrection(correction: Omit<GrammarCorrection, 'id'>): Promise<GrammarCorrection> {
    const newCorrection: GrammarCorrection = {
      id: uuidv4(),
      ...correction,
    };
    await (await this.db).put('corrections', newCorrection);
    return newCorrection;
  }

  // Reward methods
  async getRewards(): Promise<Reward[]> {
    return (await this.db).getAll('rewards');
  }

  async getRewardsByUserId(userId: string): Promise<Reward[]> {
    const rewards = await this.getRewards();
    return rewards.filter(reward => reward.userId === userId);
  }

  async createReward(reward: Omit<Reward, 'id' | 'date'>): Promise<Reward> {
    const newReward: Reward = {
      id: uuidv4(),
      ...reward,
      date: new Date().toISOString(),
    };
    await (await this.db).put('rewards', newReward);
    return newReward;
  }

  // Get reward types for reference
  getRewardTypes() {
    return {
      practice_complete: "Completed a practice session",
      streak: "Maintained a practice streak",
      grammar_mastery: "Achieved high grammar score",
      pronunciation_mastery: "Achieved high pronunciation score",
      vocabulary_mastery: "Achieved high vocabulary score",
      reading_mastery: "Achieved high reading score",
      writing_mastery: "Achieved high writing score",
      level_up: "Leveled up your English proficiency",
      login_bonus: "Daily login bonus"
    };
  }

  // Leaderboard method
  async getLeaderboard(): Promise<User[]> {
    const users = await this.getUsers();
    return users.sort((a, b) => b.points - a.points);
  }

  // Lesson methods
  async getLessons(): Promise<Lesson[]> {
    return (await this.db).getAll('lessons');
  }

  async createLesson(lesson: Omit<Lesson, 'id'>): Promise<Lesson> {
    const newLesson: Lesson = {
      id: uuidv4(),
      ...lesson,
    };
    await (await this.db).put('lessons', newLesson);
    return newLesson;
  }

  async updateLesson(lesson: Lesson): Promise<Lesson> {
    await (await this.db).put('lessons', lesson);
    return lesson;
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return (await this.db).get('lessons', id);
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    return (await this.db).getAll('achievements');
  }

  async createAchievement(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
    const newAchievement: Achievement = {
      id: uuidv4(),
      ...achievement,
    };
    await (await this.db).put('achievements', newAchievement);
    return newAchievement;
  }

  async updateAchievement(achievement: Achievement): Promise<Achievement> {
    await (await this.db).put('achievements', achievement);
    return achievement;
  }

  // Community post methods
  async getPosts(): Promise<CommunityPost[]> {
    return (await this.db).getAll('posts');
  }

  async createPost(post: Omit<CommunityPost, 'id' | 'date'>): Promise<CommunityPost> {
    const newPost: CommunityPost = {
      id: uuidv4(),
      ...post,
      date: new Date().toISOString(),
    };
    await (await this.db).put('posts', newPost);
    return newPost;
  }

  // Community comment methods
  async getComments(): Promise<CommunityComment[]> {
    return (await this.db).getAll('comments');
  }

  async getCommentsByPostId(postId: string): Promise<CommunityComment[]> {
    const comments = await this.getComments();
    return comments.filter(comment => comment.postId === postId);
  }

  async createComment(comment: Omit<CommunityComment, 'id' | 'date'>): Promise<CommunityComment> {
    const newComment: CommunityComment = {
      id: uuidv4(),
      ...comment,
      date: new Date().toISOString(),
    };
    await (await this.db).put('comments', newComment);
    return newComment;
  }

  // User settings
  async getUserSettings(userId: string): Promise<UserSettings> {
    const user = await this.getUserById(userId);
    return user?.settings || {
      dailyGoal: 15,
      notificationsEnabled: true,
      theme: 'system',
      difficulty: 'beginner',
      audioEnabled: true,
      aiEnabled: true,
      analyticsEnabled: true,
      privacySettings: {
        showProfilePublic: true,
        allowDataCollection: true,
        emailMarketing: false,
      },
    };
  }

  async updateUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
    const user = await this.getUserById(userId);
    if (user) {
      user.settings = settings;
      await this.updateUser(user);
      return settings;
    }
    throw new Error('User not found');
  }
}

export const sqliteDB = new SQLiteService();
