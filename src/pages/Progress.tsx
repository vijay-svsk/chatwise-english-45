
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PerformanceChart from '@/components/PerformanceChart';
import ActivityCalendar from '@/components/ActivityCalendar';
import SkillRadar from '@/components/SkillRadar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart, TrendingUp, Clock, CalendarDays, BarChart2 } from 'lucide-react';

const ProgressPage = () => {
  const userId = "1"; // In a real app, get this from auth context
  
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', userId],
    queryFn: () => db.getSessionsByUserId(userId),
  });
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => db.getUserById(userId),
  });

  // Calculate statistics
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((acc, session) => acc + session.duration, 0);
  const averageScore = sessions.length 
    ? sessions.reduce((acc, session) => acc + session.score, 0) / sessions.length
    : 0;
  
  // Get data for last 7 days
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const sessionsPerDay = last7Days.map(date => {
    return sessions.filter(s => s.date.startsWith(date)).length;
  });
  
  // Skill breakdown
  const skillBreakdown = [
    { 
      name: 'Speaking', 
      progress: sessions.filter(s => s.type === 'speaking').length / Math.max(totalSessions, 1) * 100
    },
    { 
      name: 'Listening', 
      progress: sessions.filter(s => s.type === 'listening').length / Math.max(totalSessions, 1) * 100
    },
    { 
      name: 'Pronunciation', 
      progress: sessions.filter(s => s.type === 'pronunciation').length / Math.max(totalSessions, 1) * 100
    },
    { 
      name: 'Vocabulary', 
      progress: sessions.filter(s => s.type === 'vocabulary').length / Math.max(totalSessions, 1) * 100
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Your Progress</h1>
              <p className="text-muted-foreground">Track your language learning journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSessions}</div>
                  <p className="text-xs text-muted-foreground">
                    Practice sessions completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Across all practice sessions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Practice Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(totalTime / 60)} hrs</div>
                  <p className="text-xs text-muted-foreground">
                    Total practice time
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Level</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Level {user?.level || 1}</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Progress to next level</span>
                      <span>{user?.points % 100}/100</span>
                    </div>
                    <Progress value={user?.points ? user.points % 100 : 0} />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <PerformanceChart />
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex justify-center items-center">
                      <SkillRadar />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Last 7 Days Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {last7Days.map((date, index) => (
                          <div key={date} className="flex items-center">
                            <div className="w-10 text-sm text-muted-foreground">
                              {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${Math.min(sessionsPerDay[index] * 20, 100)}%` }}
                              />
                            </div>
                            <div className="w-8 text-sm text-right ml-2">
                              {sessionsPerDay[index]}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Skills Progress</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    {skillBreakdown.map(skill => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">{skill.name}</h4>
                          <span className="text-sm">{skill.progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-2.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Activity Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityCalendar />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProgressPage;
