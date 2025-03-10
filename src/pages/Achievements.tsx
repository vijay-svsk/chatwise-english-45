
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Award, Calendar, Trophy, Star, Zap, Book, Mic, MessageSquare, Users, Lock } from 'lucide-react';

const AchievementCard = ({ achievement, userPoints }: { achievement: any, userPoints: number }) => {
  const progress = Math.min(100, (userPoints / achievement.requiredPoints) * 100);
  const isUnlocked = userPoints >= achievement.requiredPoints;
  const iconMap: Record<string, React.ReactNode> = {
    'award': <Award />,
    'trophy': <Trophy />,
    'star': <Star />,
    'zap': <Zap />,
    'book': <Book />,
    'mic': <Mic />,
    'message-square': <MessageSquare />,
    'users': <Users />,
    'calendar': <Calendar />,
    'footprints': <Zap />,
    'library': <Book />,
  };
  
  return (
    <Card className={cn(
      "border relative overflow-hidden transition-all", 
      isUnlocked 
        ? "border-primary/50 shadow-md shadow-primary/10" 
        : "opacity-80 hover:opacity-100"
    )}>
      {isUnlocked && (
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-primary rotate-12" />
      )}
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full", 
            isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}>
            {iconMap[achievement.icon] || <Award />}
          </div>
          <span>{achievement.title}</span>
          {!isUnlocked && <Lock className="h-4 w-4 ml-auto text-muted-foreground" />}
        </CardTitle>
        <CardDescription>{achievement.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress</span>
          <span className="font-medium">{userPoints}/{achievement.requiredPoints} points</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
      <CardFooter className="pt-2 text-sm text-muted-foreground">
        {isUnlocked 
          ? `Unlocked ${achievement.unlockedAt ? new Date(achievement.unlockedAt).toLocaleDateString() : ''}`
          : `Need ${achievement.requiredPoints - userPoints} more points to unlock`
        }
      </CardFooter>
    </Card>
  );
};

const Achievements = () => {
  const userId = "1"; // In a real app, get this from auth context
  
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: () => db.getAchievementsByUserId(userId),
  });
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => db.getUserById(userId),
  });
  
  const userPoints = user?.points || 0;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;
  const unlockedPercentage = (unlockedCount / totalCount) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Achievements</h1>
              <p className="text-muted-foreground">Track your milestones and badges</p>
            </div>
            
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-8 border-primary-foreground bg-primary flex items-center justify-center">
                      <Trophy className="text-primary-foreground h-12 w-12" />
                    </div>
                    <div className="absolute top-0 right-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                      {user?.level || 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold mb-2">{user?.name || 'User'}'s Trophy Room</h2>
                    <p className="text-muted-foreground mb-4">
                      You've unlocked {unlockedCount} of {totalCount} achievements
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Achievement Progress</span>
                        <span>{unlockedPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={unlockedPercentage} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-2/3 bg-muted rounded mb-2" />
                      <div className="h-4 w-full bg-muted rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {unlockedCount > 0 && (
                  <>
                    <h2 className="text-xl font-bold mb-4">Unlocked Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {achievements.filter(a => a.isUnlocked).map((achievement) => (
                        <AchievementCard 
                          key={achievement.id} 
                          achievement={achievement}
                          userPoints={userPoints}
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {achievements.filter(a => !a.isUnlocked).length > 0 && (
                  <>
                    <h2 className="text-xl font-bold mb-4">Achievements to Unlock</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {achievements.filter(a => !a.isUnlocked).map((achievement) => (
                        <AchievementCard 
                          key={achievement.id} 
                          achievement={achievement}
                          userPoints={userPoints}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Achievements;
