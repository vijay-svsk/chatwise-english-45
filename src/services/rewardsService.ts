
import { db } from './databaseService';
import { User, Reward } from '@/types/database';

export interface RewardEvent {
  type: 'practice_complete' | 'streak' | 'grammar_mastery' | 'pronunciation_mastery' | 'vocabulary_mastery' | 'level_up';
  userId: string;
  metadata?: Record<string, any>;
}

const REWARD_POINTS = {
  practice_complete: 10,
  streak: 15,
  grammar_mastery: 20,
  pronunciation_mastery: 20,
  vocabulary_mastery: 20,
  level_up: 50
};

const REWARD_DESCRIPTIONS = {
  practice_complete: "Completed a practice session",
  streak: "Maintained a practice streak",
  grammar_mastery: "Achieved high grammar score",
  pronunciation_mastery: "Achieved high pronunciation score",
  vocabulary_mastery: "Achieved high vocabulary score",
  level_up: "Leveled up your English proficiency"
};

export const grantReward = async (event: RewardEvent): Promise<Reward> => {
  // Get points for this reward type
  const points = REWARD_POINTS[event.type] || 5;
  const description = REWARD_DESCRIPTIONS[event.type] || "Reward earned";
  
  // Create reward record
  const reward = await db.createReward({
    userId: event.userId,
    type: event.type,
    description,
    points
  });
  
  // Update user points
  const user = await db.getUserById(event.userId);
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
      }
    }
    
    await db.updateUser(user);
  }
  
  return reward;
};

export const getUserRewards = async (userId: string): Promise<Reward[]> => {
  return db.getRewardsByUserId(userId);
};

export const getLeaderboard = async (limit: number = 10): Promise<User[]> => {
  const leaderboard = await db.getLeaderboard();
  return leaderboard.slice(0, limit);
};
