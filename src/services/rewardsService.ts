
import { sqliteDB } from './sqliteService';
import { User, Reward, LeaderboardEntry } from '@/types/database';
import { toast } from '@/hooks/use-toast';

export interface RewardEvent {
  type: 'practice_complete' | 'streak' | 'grammar_mastery' | 'pronunciation_mastery' | 'vocabulary_mastery' | 'level_up' | 'reading_mastery' | 'writing_mastery' | 'login_bonus';
  userId: string;
  metadata?: Record<string, any>;
}

const REWARD_POINTS = {
  practice_complete: 10,
  streak: 15,
  grammar_mastery: 20,
  pronunciation_mastery: 20,
  vocabulary_mastery: 20,
  reading_mastery: 20,
  writing_mastery: 20,
  level_up: 50,
  login_bonus: 5
};

const REWARD_DESCRIPTIONS = {
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

export const grantReward = async (event: RewardEvent): Promise<Reward> => {
  // Get points for this reward type
  const points = REWARD_POINTS[event.type] || 5;
  const description = REWARD_DESCRIPTIONS[event.type] || "Reward earned";
  
  // Create reward record
  const reward = await sqliteDB.createReward({
    userId: event.userId,
    type: event.type,
    description,
    points
  });
  
  // Update user points
  const user = await sqliteDB.getUserById(event.userId);
  if (user) {
    user.points += points;
    
    // Calculate level (1 level per 100 points)
    const newLevel = Math.floor(user.points / 100) + 1;
    if (newLevel > user.level) {
      user.level = newLevel;
      
      // Grant level up reward if this wasn't already a level_up event
      if (event.type !== 'level_up') {
        await grantReward({
          type: 'level_up',
          userId: user.id
        });
        
        // Show level up toast
        toast({
          title: "Level Up!",
          description: `Congratulations! You've reached level ${newLevel}!`,
          variant: "success"
        });
      }
    }
    
    await sqliteDB.updateUser(user);
    
    // Show reward toast
    if (event.type !== 'level_up' || event.metadata?.showToast !== false) {
      toast({
        title: "Reward Earned!",
        description: `+${points} points: ${description}`,
        variant: "success"
      });
    }
  }
  
  // Check for new achievements
  checkAndUnlockAchievements(event.userId);
  
  return reward;
};

const checkAndUnlockAchievements = async (userId: string) => {
  const user = await sqliteDB.getUserById(userId);
  const achievements = await sqliteDB.getAchievements();
  const rewards = await sqliteDB.getRewardsByUserId(userId);
  const sessions = await sqliteDB.getSessionsByUserId(userId);
  
  if (!user) return;
  
  let achievementsUnlocked = false;
  
  for (const achievement of achievements) {
    // Skip already unlocked achievements
    if (achievement.isUnlocked) continue;
    
    let unlocked = false;
    
    // Check points-based achievements
    if (user.points >= achievement.requiredPoints) {
      unlocked = true;
    }
    
    // Check specific achievement criteria
    if (achievement.title === "First Steps" && sessions.length >= 1) {
      unlocked = true;
    }
    
    if (achievement.title === "Grammar Guru" && 
        rewards.filter(r => r.type === 'grammar_mastery').length >= 5) {
      unlocked = true;
    }
    
    if (achievement.title === "Vocabulary Master" && 
        rewards.filter(r => r.type === 'vocabulary_mastery').length >= 5) {
      unlocked = true;
    }
    
    if (achievement.title === "Pronunciation Pro" && 
        rewards.filter(r => r.type === 'pronunciation_mastery').length >= 5) {
      unlocked = true;
    }
    
    if (achievement.title === "Conversation Champion" && 
        sessions.filter(s => s.type === 'speaking').length >= 10) {
      unlocked = true;
    }
    
    if (achievement.title === "Dedicated Learner") {
      // Check for 7 consecutive days of practice
      const dates = new Set();
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        dates.add(dateString);
      }
      
      const practiceDeays = new Set(
        sessions.map(s => s.date.split('T')[0])
      );
      
      // Check if user practiced on all 7 days
      if ([...dates].every(date => practiceDeays.has(date))) {
        unlocked = true;
      }
    }
    
    if (unlocked) {
      achievement.isUnlocked = true;
      achievement.unlockedAt = new Date().toISOString();
      await sqliteDB.updateAchievement(achievement);
      achievementsUnlocked = true;
      
      toast({
        title: "Achievement Unlocked!",
        description: `${achievement.title}: ${achievement.description}`,
        variant: "success"
      });
    }
  }
  
  return achievementsUnlocked;
};

export const getUserRewards = async (userId: string): Promise<Reward[]> => {
  return sqliteDB.getRewardsByUserId(userId);
};

export const getLeaderboard = async (limit: number = 10): Promise<LeaderboardEntry[]> => {
  const users = await sqliteDB.getLeaderboard();
  return users.slice(0, limit).map(user => ({
    userId: user.id,
    userName: user.name,
    points: user.points,
    level: user.level,
  }));
};

export const grantLoginBonus = async (userId: string): Promise<Reward> => {
  // Check if user has already received a login bonus today
  const today = new Date().toISOString().split('T')[0];
  const rewards = await sqliteDB.getRewardsByUserId(userId);
  
  const alreadyReceivedToday = rewards.some(reward => 
    reward.type === 'login_bonus' && 
    reward.date.startsWith(today)
  );
  
  if (alreadyReceivedToday) {
    throw new Error('Login bonus already claimed today');
  }
  
  return grantReward({
    type: 'login_bonus',
    userId
  });
};
