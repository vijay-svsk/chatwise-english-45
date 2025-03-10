
import { sqliteDB } from './sqliteService';
import { v4 as uuidv4 } from 'uuid';

export const initDatabase = async () => {
  console.log("Initializing database with default data...");
  
  // Check if we've already initialized
  const users = await sqliteDB.getUsers();
  if (users.length > 0) {
    console.log("Database already initialized");
    return;
  }
  
  // Create default user
  const defaultUser = await sqliteDB.createUser({
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    points: 125,
    level: 2,
    streak: 5,
    lastStreak: new Date().toISOString()
  });
  
  console.log("Created default user:", defaultUser.id);
  
  // Create default achievements
  const achievements = [
    {
      title: "First Steps",
      description: "Complete your first practice session",
      icon: "footprints",
      isUnlocked: true,
      requiredPoints: 10,
      unlockedAt: new Date().toISOString()
    },
    {
      title: "Grammar Guru",
      description: "Master 5 grammar rules",
      icon: "book",
      isUnlocked: false,
      requiredPoints: 100
    },
    {
      title: "Vocabulary Master",
      description: "Learn 50 new words",
      icon: "library",
      isUnlocked: false,
      requiredPoints: 200
    },
    {
      title: "Pronunciation Pro",
      description: "Achieve excellent pronunciation in 5 sessions",
      icon: "mic",
      isUnlocked: false,
      requiredPoints: 150
    },
    {
      title: "Conversation Champion",
      description: "Complete 10 speaking practice sessions",
      icon: "message-square",
      isUnlocked: false,
      requiredPoints: 300
    },
    {
      title: "Dedicated Learner",
      description: "Practice for 7 consecutive days",
      icon: "calendar",
      isUnlocked: false,
      requiredPoints: 250
    },
    {
      title: "Level 5 Achiever",
      description: "Reach level 5 in your English learning journey",
      icon: "award",
      isUnlocked: false,
      requiredPoints: 500
    },
    {
      title: "Perfect Score",
      description: "Get a perfect score in any practice session",
      icon: "trophy",
      isUnlocked: false,
      requiredPoints: 350
    },
    {
      title: "Community Helper",
      description: "Help 5 other learners in the community",
      icon: "users",
      isUnlocked: false,
      requiredPoints: 400
    }
  ];
  
  for (const achievement of achievements) {
    await sqliteDB.createAchievement(achievement);
  }
  
  console.log("Created default achievements");
  
  // Create default lessons
  const lessonCategories = ["grammar", "vocabulary", "pronunciation", "conversation", "reading", "writing"];
  const lessonLevels = ["beginner", "intermediate", "advanced"];
  const lessonImages = [
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
  ];
  
  const lessons = [];
  let lessonId = 0;
  
  for (const category of lessonCategories) {
    for (let i = 0; i < 3; i++) {
      const level = lessonLevels[i % lessonLevels.length];
      const progress = i === 0 ? Math.floor(Math.random() * 100) : 0;
      const completed = progress === 100;
      const imageIndex = (lessonId % lessonImages.length);
      
      lessons.push({
        title: `${level.charAt(0).toUpperCase() + level.slice(1)} ${category.charAt(0).toUpperCase() + category.slice(1)} ${i + 1}`,
        description: `Learn essential ${category} skills for ${level} English speakers`,
        level: level as any,
        duration: 15 + (i * 5),
        category: category as any,
        completed,
        progress,
        imageUrl: lessonImages[imageIndex]
      });
      
      lessonId++;
    }
  }
  
  for (const lesson of lessons) {
    await sqliteDB.createLesson(lesson);
  }
  
  console.log("Created default lessons");
  
  // Create practice sessions for the user
  const sessionTypes = ["speaking", "listening", "pronunciation", "vocabulary", "reading", "writing"];
  const sessions = [];
  
  // Create sessions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Only create sessions for some days to make it realistic
    if (Math.random() > 0.3) {
      const sessionsPerDay = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < sessionsPerDay; j++) {
        const sessionType = sessionTypes[Math.floor(Math.random() * sessionTypes.length)];
        const score = Math.floor(Math.random() * 40) + 60; // Score between 60-100
        
        sessions.push({
          userId: defaultUser.id,
          type: sessionType as any,
          score,
          duration: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
          date: date.toISOString(),
          feedback: `You did well! Your ${sessionType} skills are improving.`
        });
      }
    }
  }
  
  for (const session of sessions) {
    await sqliteDB.createSession(session);
  }
  
  console.log("Created practice sessions");
  
  // Create rewards for the user
  const rewardTypes = Object.keys(sqliteDB.getRewardTypes());
  
  for (let i = 0; i < 20; i++) {
    const rewardType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    await sqliteDB.createReward({
      userId: defaultUser.id,
      type: rewardType,
      description: `Reward for ${rewardType.replace('_', ' ')}`,
      points: Math.floor(Math.random() * 20) + 5
    });
  }
  
  console.log("Created rewards");
  
  // Create additional users for the leaderboard
  const additionalUsers = [
    { name: "John Smith", email: "john.s@example.com", points: 320, level: 4 },
    { name: "Emma Wilson", email: "emma.w@example.com", points: 450, level: 5 },
    { name: "Michael Chen", email: "michael.c@example.com", points: 270, level: 3 },
    { name: "Sophia Garcia", email: "sophia.g@example.com", points: 190, level: 2 },
    { name: "David Kim", email: "david.k@example.com", points: 510, level: 6 },
    { name: "Olivia Brown", email: "olivia.b@example.com", points: 380, level: 4 },
    { name: "James Lee", email: "james.l@example.com", points: 150, level: 2 },
    { name: "Emily Taylor", email: "emily.t@example.com", points: 420, level: 5 },
    { name: "Robert Wang", email: "robert.w@example.com", points: 290, level: 3 }
  ];
  
  for (const user of additionalUsers) {
    await sqliteDB.createUser(user);
  }
  
  console.log("Created additional users for leaderboard");
  
  console.log("Database initialization complete!");
};

export default initDatabase;
