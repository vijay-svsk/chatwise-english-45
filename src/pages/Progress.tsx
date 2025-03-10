
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PerformanceChart from '@/components/PerformanceChart';
import SkillRadar from '@/components/SkillRadar';
import ActivityCalendar from '@/components/ActivityCalendar';
import { grantReward } from '@/services/rewardsService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Award, Mic, MessageSquare, BarChart, LineChart, BookMarked, Calendar } from 'lucide-react';
import { PracticeSession } from '@/types/database';

// Define proper TypeScript interfaces for our data
interface PerformanceDataPoint {
  date: string;
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  count: number;
}

interface SkillDataPoint {
  skill: string;
  value: number;
  fullMark: number;
}

interface ActivityDataPoint {
  date: string;
  count: number;
}

interface StatsData {
  totalSessions: number;
  totalMinutes: number;
  avgScore: number;
  strongestSkill: string;
  weakestSkill: string;
}

const ProgressPage = () => {
  const { toast } = useToast();
  const userId = "1"; // In a real app, get this from auth context
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => db.getUserById(userId),
  });
  
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', userId],
    queryFn: () => db.getSessionsByUserId(userId),
  });
  
  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards', userId],
    queryFn: () => db.getRewardsByUserId(userId),
  });
  
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([]);
  const [skillData, setSkillData] = useState<SkillDataPoint[]>([]);
  const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({
    totalSessions: 0,
    totalMinutes: 0,
    avgScore: 0,
    strongestSkill: '',
    weakestSkill: '',
  });
  
  useEffect(() => {
    if (sessions.length > 0) {
      // Process session data for charts
      processSessionData(sessions as PracticeSession[]);
    } else {
      // Use mock data if no sessions exist
      generateMockData();
    }
  }, [sessions]);
  
  const processSessionData = (sessions: PracticeSession[]) => {
    // Process for performance chart (last 14 days)
    const last14Days: string[] = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      last14Days.push(date.toISOString().split('T')[0]);
    }
    
    const performanceByDay: Record<string, PerformanceDataPoint> = {};
    last14Days.forEach(day => {
      performanceByDay[day] = {
        date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pronunciation: 0,
        fluency: 0,
        vocabulary: 0,
        grammar: 0,
        count: 0
      };
    });
    
    sessions.forEach(session => {
      const sessionDay = session.date.split('T')[0];
      if (performanceByDay[sessionDay]) {
        performanceByDay[sessionDay].count++;
        
        // Map session score to different metrics based on type
        const score = session.score || 70; // Default score if none
        switch (session.type) {
          case 'speaking':
            performanceByDay[sessionDay].pronunciation += score;
            performanceByDay[sessionDay].fluency += score;
            break;
          case 'vocabulary':
            performanceByDay[sessionDay].vocabulary += score;
            break;
          case 'grammar':
            performanceByDay[sessionDay].grammar += score;
            break;
          case 'pronunciation':
            performanceByDay[sessionDay].pronunciation += score;
            break;
          default:
            // For all other session types, add to all metrics
            performanceByDay[sessionDay].pronunciation += score;
            performanceByDay[sessionDay].fluency += score;
            performanceByDay[sessionDay].vocabulary += score;
            performanceByDay[sessionDay].grammar += score;
        }
      }
    });
    
    // Average the scores for days with multiple sessions
    const processedPerformanceData = Object.values(performanceByDay).map(day => {
      if (day.count > 0) {
        return {
          date: day.date,
          pronunciation: Math.round(day.pronunciation / day.count),
          fluency: Math.round(day.fluency / day.count),
          vocabulary: Math.round(day.vocabulary / day.count),
          grammar: Math.round(day.grammar / day.count),
          count: day.count
        };
      }
      return {
        date: day.date,
        pronunciation: 0,
        fluency: 0,
        vocabulary: 0,
        grammar: 0,
        count: 0
      };
    });
    
    // Process for skill radar
    interface SkillCategory {
      sum: number;
      count: number;
    }
    
    const skillCategories: Record<string, SkillCategory> = {
      speaking: { sum: 0, count: 0 },
      listening: { sum: 0, count: 0 },
      reading: { sum: 0, count: 0 },
      writing: { sum: 0, count: 0 },
      vocabulary: { sum: 0, count: 0 },
      grammar: { sum: 0, count: 0 },
    };
    
    sessions.forEach(session => {
      if (session.type in skillCategories) {
        skillCategories[session.type].sum += session.score || 70;
        skillCategories[session.type].count++;
      }
    });
    
    const processedSkillData = Object.entries(skillCategories).map(([skill, data]) => {
      return {
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        value: data.count > 0 ? Math.round(data.sum / data.count) : 50,
        fullMark: 100,
      };
    });
    
    // Process for activity calendar (3 months)
    const activityByDay: Record<string, number> = {};
    const today = new Date();
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setDate(today.getDate() - 90);
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.date);
      if (sessionDate >= threeMonthsAgo && sessionDate <= today) {
        const dateStr = session.date.split('T')[0];
        if (!activityByDay[dateStr]) {
          activityByDay[dateStr] = 0;
        }
        activityByDay[dateStr] += session.duration || 10;
      }
    });
    
    const processedActivityData = Object.entries(activityByDay).map(([date, count]) => ({
      date,
      count,
    }));
    
    // Calculate statistics
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((total, session) => total + (session.duration || 0), 0);
    
    interface ScoresByType {
      [key: string]: number[];
    }
    
    const scoresByType: ScoresByType = {};
    sessions.forEach(session => {
      if (!scoresByType[session.type]) {
        scoresByType[session.type] = [];
      }
      scoresByType[session.type].push(session.score || 0);
    });
    
    const avgScores: Record<string, number> = {};
    let strongestSkill = '';
    let weakestSkill = '';
    let highestAvg = 0;
    let lowestAvg = 100;
    
    Object.entries(scoresByType).forEach(([type, scores]) => {
      const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      avgScores[type] = avg;
      
      if (avg > highestAvg) {
        highestAvg = avg;
        strongestSkill = type;
      }
      
      if (avg < lowestAvg) {
        lowestAvg = avg;
        weakestSkill = type;
      }
    });
    
    const allScores = Object.values(scoresByType).flat();
    const avgScore = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : 0;
    
    setPerformanceData(processedPerformanceData);
    setSkillData(processedSkillData);
    setActivityData(processedActivityData);
    setStatsData({
      totalSessions,
      totalMinutes,
      avgScore: Math.round(avgScore),
      strongestSkill: strongestSkill.charAt(0).toUpperCase() + strongestSkill.slice(1),
      weakestSkill: weakestSkill.charAt(0).toUpperCase() + weakestSkill.slice(1),
    });
  };
  
  const generateMockData = () => {
    // Generate mock performance data (last 14 days)
    const mockPerformanceData = Array.from({ length: 14 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pronunciation: 60 + Math.floor(Math.random() * 30),
        fluency: 60 + Math.floor(Math.random() * 30),
        vocabulary: 60 + Math.floor(Math.random() * 30),
        grammar: 60 + Math.floor(Math.random() * 30),
        count: 1
      };
    });
    
    // Generate mock skill data
    const mockSkillData = [
      { skill: 'Speaking', value: 75, fullMark: 100 },
      { skill: 'Listening', value: 82, fullMark: 100 },
      { skill: 'Reading', value: 88, fullMark: 100 },
      { skill: 'Writing', value: 70, fullMark: 100 },
      { skill: 'Vocabulary', value: 65, fullMark: 100 },
      { skill: 'Grammar', value: 78, fullMark: 100 },
    ];
    
    // Generate mock activity data (90 days)
    const mockActivityData = Array.from({ length: 90 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (89 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      // Create some patterns - more activity on weekdays, less on weekends
      const dayOfWeek = date.getDay();
      let count = 0;
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Weekend - less likely to have activity
        count = Math.random() > 0.6 ? Math.floor(Math.random() * 40) : 0;
      } else {
        // Weekday - more likely to have activity
        count = Math.random() > 0.3 ? 20 + Math.floor(Math.random() * 60) : 0;
      }
      
      return { date: dateStr, count };
    });
    
    setPerformanceData(mockPerformanceData);
    setSkillData(mockSkillData);
    setActivityData(mockActivityData);
    setStatsData({
      totalSessions: 47,
      totalMinutes: 820,
      avgScore: 78,
      strongestSkill: 'Reading',
      weakestSkill: 'Vocabulary',
    });
  };
  
  const handleShareProgress = () => {
    toast({
      title: "Progress Shared",
      description: "Your progress has been shared to the community feed"
    });
  };
  
  const handleReward = async () => {
    if (user) {
      try {
        await grantReward({
          type: 'practice_complete',
          userId: user.id
        });
      } catch (error) {
        console.error("Error granting reward:", error);
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto">
          <section className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-display font-semibold">My Progress</h1>
                <p className="text-muted-foreground">Track your English learning journey</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleShareProgress}>
                  Share Progress
                </Button>
                <Button onClick={handleReward}>
                  <Award className="mr-2 h-4 w-4" />
                  Earn Points
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    Total Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{statsData.totalSessions}</div>
                  <p className="text-sm text-muted-foreground">practice sessions completed</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    Practice Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{statsData.totalMinutes}</div>
                  <p className="text-sm text-muted-foreground">total minutes practiced</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-purple-500" />
                    Average Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{statsData.avgScore}<span className="text-lg">/100</span></div>
                  <p className="text-sm text-muted-foreground">across all exercises</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-display flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    Rewards Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{rewards.length}</div>
                  <p className="text-sm text-muted-foreground">rewards and achievements</p>
                </CardContent>
              </Card>
            </div>
          </section>
          
          <section className="mb-8">
            <Tabs defaultValue="performance">
              <TabsList className="mb-6">
                <TabsTrigger value="performance">
                  <BarChart className="mr-2 h-4 w-4" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="skills">
                  <LineChart className="mr-2 h-4 w-4" />
                  Skills
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Calendar className="mr-2 h-4 w-4" />
                  Activity
                </TabsTrigger>
                <TabsTrigger value="rewards">
                  <Award className="mr-2 h-4 w-4" />
                  Rewards
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Your scores across different skills over the past 14 days</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <PerformanceChart data={performanceData} />
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Strongest Skills</CardTitle>
                      <CardDescription>Your best performing areas</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statsData.strongestSkill && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium">{statsData.strongestSkill}</div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Strongest
                              </Badge>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                        )}
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Grammar</div>
                            <div className="text-sm text-muted-foreground">78%</div>
                          </div>
                          <Progress value={78} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Listening</div>
                            <div className="text-sm text-muted-foreground">82%</div>
                          </div>
                          <Progress value={82} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Areas to Improve</CardTitle>
                      <CardDescription>Skills that need more attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {statsData.weakestSkill && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <div className="font-medium">{statsData.weakestSkill}</div>
                              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                Focus Area
                              </Badge>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                        )}
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Pronunciation</div>
                            <div className="text-sm text-muted-foreground">70%</div>
                          </div>
                          <Progress value={70} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <div className="font-medium">Speaking Fluency</div>
                            <div className="text-sm text-muted-foreground">68%</div>
                          </div>
                          <Progress value={68} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Skill Radar</CardTitle>
                    <CardDescription>Visual representation of your skill levels</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[500px]">
                    <SkillRadar data={skillData} />
                  </CardContent>
                  <CardFooter>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                      {skillData.map((skill) => (
                        <div key={skill.skill} className="text-center">
                          <div className="text-xl font-bold">{skill.value}<span className="text-sm">/100</span></div>
                          <div className="text-sm text-muted-foreground">{skill.skill}</div>
                        </div>
                      ))}
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Learning Activity</CardTitle>
                    <CardDescription>Your practice patterns over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ActivityCalendar data={activityData} />
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <strong>Tip:</strong> Consistency is key to language learning success
                    </div>
                    <Button variant="outline" size="sm">
                      Download Activity Report
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="rewards">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Rewards</CardTitle>
                    <CardDescription>Points earned from your learning activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {rewards.length > 0 ? (
                      <div className="space-y-4">
                        {rewards.slice(0, 10).map((reward) => (
                          <div key={reward.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10 text-primary">
                                <Award className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="font-medium">{reward.description}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(reward.date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Badge className="bg-primary">+{reward.points} pts</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Award className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No rewards yet</h3>
                        <p className="text-muted-foreground mb-4">Complete lessons and practice sessions to earn rewards</p>
                        <Button onClick={handleReward}>Earn Your First Reward</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
          
          <section>
            <h2 className="text-2xl font-display font-semibold mb-6">Recommended Next Steps</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-blue-500" />
                    Practice Speaking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Work on your pronunciation and fluency with guided exercises</p>
                  <Button className="w-full" variant="outline">Start Speaking Practice</Button>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookMarked className="h-5 w-5 text-green-500" />
                    Review Grammar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Review grammar rules that you've been struggling with recently</p>
                  <Button className="w-full" variant="outline">Start Grammar Review</Button>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Conversation Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Practice natural English conversations with our AI language partner</p>
                  <Button className="w-full" variant="outline">Start Conversation</Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProgressPage;
