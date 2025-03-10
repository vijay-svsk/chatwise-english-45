
import { User, PracticeSession, GrammarCorrection, Reward, LeaderboardEntry, Lesson, Achievement, CommunityPost, CommunityComment, UserSettings } from '@/types/database';

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

  async updateSession(session: PracticeSession): Promise<PracticeSession> {
    const sessions = await this.getSessions();
    const updatedSessions = sessions.map(s => s.id === session.id ? session : s);
    this.setItem('sessions', updatedSessions);
    return session;
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

  // Lessons
  async getLessons(): Promise<Lesson[]> {
    return this.getItem<Lesson[]>('lessons', this.getDefaultLessons());
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    const lessons = await this.getLessons();
    return lessons.find(lesson => lesson.id === id) || null;
  }

  async updateLesson(lesson: Lesson): Promise<Lesson> {
    const lessons = await this.getLessons();
    const updatedLessons = lessons.map(l => l.id === lesson.id ? lesson : l);
    this.setItem('lessons', updatedLessons);
    return lesson;
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return this.getItem<Achievement[]>('achievements', this.getDefaultAchievements());
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
    return this.getItem<CommunityPost[]>('posts', []);
  }

  async createCommunityPost(post: Omit<CommunityPost, 'id' | 'date'>): Promise<CommunityPost> {
    const posts = await this.getCommunityPosts();
    const newPost: CommunityPost = {
      ...post,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    this.setItem('posts', [...posts, newPost]);
    return newPost;
  }

  async getCommunityComments(postId: string): Promise<CommunityComment[]> {
    const comments = this.getItem<CommunityComment[]>('comments', []);
    return comments.filter(comment => comment.postId === postId);
  }

  async createCommunityComment(comment: Omit<CommunityComment, 'id' | 'date'>): Promise<CommunityComment> {
    const comments = this.getItem<CommunityComment[]>('comments', []);
    const newComment: CommunityComment = {
      ...comment,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    
    this.setItem('comments', [...comments, newComment]);
    return newComment;
  }

  // User settings
  async updateUserSettings(userId: string, settings: UserSettings): Promise<UserSettings> {
    const user = await this.getUserById(userId);
    if (user) {
      user.settings = settings;
      await this.updateUser(user);
      return settings;
    }
    throw new Error('User not found');
  }

  async getUserSettings(userId: string): Promise<UserSettings> {
    const user = await this.getUserById(userId);
    return user?.settings || {
      dailyGoal: 15,
      notificationsEnabled: true,
      theme: 'light',
      difficulty: 'beginner'
    };
  }

  // Helper methods for default data
  private getDefaultLessons(): Lesson[] {
    return [
      {
        id: '1',
        title: 'Basic English Grammar',
        description: 'Learn the fundamentals of English grammar including articles, tenses, and prepositions.',
        level: 'beginner',
        duration: 30,
        category: 'grammar',
        completed: false,
        progress: 0,
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1373&q=80',
      },
      {
        id: '2',
        title: 'Everyday Vocabulary',
        description: 'Essential words for daily conversations. Learn vocabulary for shopping, travel, and more.',
        level: 'beginner',
        duration: 20,
        category: 'vocabulary',
        completed: false,
        progress: 0,
        imageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      },
      {
        id: '3',
        title: 'Perfect Pronunciation',
        description: 'Master the sounds of English with practical pronunciation exercises and tips.',
        level: 'intermediate',
        duration: 25,
        category: 'pronunciation',
        completed: false,
        progress: 0,
        imageUrl: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80',
      },
      {
        id: '4',
        title: 'Business English',
        description: 'Professional vocabulary and phrases for business meetings, emails, and presentations.',
        level: 'advanced',
        duration: 40,
        category: 'vocabulary',
        completed: false,
        progress: 0,
        imageUrl: 'https://images.unsplash.com/photo-1590402494587-44b71d7772f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      },
      {
        id: '5',
        title: 'Advanced Conversation',
        description: 'Practice high-level conversation skills with complex topics and natural expressions.',
        level: 'advanced',
        duration: 35,
        category: 'conversation',
        completed: false,
        progress: 0,
        imageUrl: 'https://images.unsplash.com/photo-1573497019418-b400bb3ab074?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
      },
    ];
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: '1',
        title: 'First Steps',
        description: 'Complete your first practice session',
        icon: 'footprints',
        isUnlocked: false,
        requiredPoints: 10,
      },
      {
        id: '2',
        title: 'Grammar Guru',
        description: 'Achieve a perfect score in a grammar practice',
        icon: 'book',
        isUnlocked: false,
        requiredPoints: 50,
      },
      {
        id: '3',
        title: 'Vocabulary Master',
        description: 'Learn 100 new words',
        icon: 'library',
        isUnlocked: false,
        requiredPoints: 100,
      },
      {
        id: '4',
        title: 'Pronunciation Pro',
        description: 'Achieve 90% pronunciation accuracy',
        icon: 'mic',
        isUnlocked: false,
        requiredPoints: 150,
      },
      {
        id: '5',
        title: 'Conversation Champion',
        description: 'Complete 10 conversation practices',
        icon: 'message-square',
        isUnlocked: false,
        requiredPoints: 200,
      },
      {
        id: '6',
        title: 'Dedicated Learner',
        description: 'Practice for 7 consecutive days',
        icon: 'calendar',
        isUnlocked: false,
        requiredPoints: 250,
      },
      {
        id: '7',
        title: 'English Expert',
        description: 'Reach level 10',
        icon: 'award',
        isUnlocked: false,
        requiredPoints: 1000,
      },
      {
        id: '8',
        title: 'Community Contributor',
        description: 'Make 5 posts in the community forum',
        icon: 'users',
        isUnlocked: false,
        requiredPoints: 300,
      },
    ];
  }
}

export const db = new DatabaseService();
