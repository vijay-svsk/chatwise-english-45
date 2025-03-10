
// Add missing methods from the databaseService.ts
// Add after line ~280 in the SQLiteService class

  async updateSession(session: PracticeSession): Promise<PracticeSession> {
    await (await this.db).put('sessions', session);
    return session;
  }

  async updateLesson(lesson: Lesson): Promise<Lesson> {
    await (await this.db).put('lessons', lesson);
    return lesson;
  }

  async getLessonById(id: string): Promise<Lesson | null> {
    return (await this.db).get('lessons', id);
  }
  
  async updateAchievement(achievement: Achievement): Promise<Achievement> {
    await (await this.db).put('achievements', achievement);
    return achievement;
  }
