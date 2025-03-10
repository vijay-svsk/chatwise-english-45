
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PerformanceChart from '@/components/PerformanceChart';
import ActivityCalendar from '@/components/ActivityCalendar';
import SkillRadar from '@/components/SkillRadar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, TrendingUp, Clock, CalendarDays, BarChart2, Award, Download, Share2, Trophy, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ProgressPage = () => {
  const userId = "1"; // In a real app, get this from auth context
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  
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
    { 
      name: 'Reading', 
      progress: sessions.filter(s => s.type === 'reading').length / Math.max(totalSessions, 1) * 100
    },
    { 
      name: 'Writing', 
      progress: sessions.filter(s => s.type === 'writing').length / Math.max(totalSessions, 1) * 100
    },
  ];

  // Sample performance data for the chart
  const performanceData = [
    { date: 'Mon', pronunciation: 70, fluency: 65, vocabulary: 80, grammar: 75 },
    { date: 'Tue', pronunciation: 75, fluency: 70, vocabulary: 75, grammar: 80 },
    { date: 'Wed', pronunciation: 80, fluency: 75, vocabulary: 85, grammar: 78 },
    { date: 'Thu', pronunciation: 85, fluency: 80, vocabulary: 82, grammar: 84 },
    { date: 'Fri', pronunciation: 82, fluency: 85, vocabulary: 88, grammar: 86 },
    { date: 'Sat', pronunciation: 88, fluency: 82, vocabulary: 90, grammar: 89 },
    { date: 'Sun', pronunciation: 90, fluency: 88, vocabulary: 92, grammar: 90 },
  ];

  // Sample skill radar data
  const skillRadarData = [
    { skill: 'Pronunciation', value: 80, fullMark: 100 },
    { skill: 'Vocabulary', value: 85, fullMark: 100 },
    { skill: 'Grammar', value: 75, fullMark: 100 },
    { skill: 'Listening', value: 90, fullMark: 100 },
    { skill: 'Reading', value: 85, fullMark: 100 },
    { skill: 'Writing', value: 70, fullMark: 100 },
  ];

  // Sample activity calendar data
  const activityCalendarData = last7Days.map((date, index) => ({
    date,
    count: sessionsPerDay[index] * 15, // Assuming each session is 15 minutes
  }));

  // Generate full activity calendar data for the last 84 days
  const generateActivityData = () => {
    const result = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 84; i++) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Random activity between 0 and 90 minutes
      const count = Math.floor(Math.random() * 90);
      result.push({ date: dateStr, count });
    }
    
    return result;
  };
  
  // Handle report download
  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Your progress report has been downloaded successfully.",
    });
  };
  
  // Handle sharing progress
  const handleShareProgress = () => {
    toast({
      title: "Progress Shared",
      description: "Your progress has been shared with your instructor.",
    });
  };
  
  // Handle setting goals
  const handleSetGoal = () => {
    toast({
      title: "Goal Set",
      description: "Your new learning goal has been set.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold">Your Progress</h1>
                <p className="text-muted-foreground">Track your language learning journey</p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" size="sm" onClick={handleShareProgress}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Progress
                </Button>
                <Button variant="outline" size="sm" onClick={handleSetGoal}>
                  <Target className="h-4 w-4 mr-2" />
                  Set Goals
                </Button>
              </div>
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
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="awards">Awards</TabsTrigger>
                </TabsList>
                
                <div className="flex items-center gap-4">
                  <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Time Range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Select Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      <SelectItem value="speaking">Speaking</SelectItem>
                      <SelectItem value="listening">Listening</SelectItem>
                      <SelectItem value="pronunciation">Pronunciation</SelectItem>
                      <SelectItem value="vocabulary">Vocabulary</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="writing">Writing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[350px]">
                    <PerformanceChart data={performanceData} />
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Skills Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex justify-center items-center">
                      <SkillRadar data={skillRadarData} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Focus Areas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {skillBreakdown
                          .sort((a, b) => a.progress - b.progress)
                          .slice(0, 3)
                          .map(skill => (
                            <div key={skill.name} className="p-3 border rounded-lg">
                              <div className="flex justify-between items-center mb-2">
                                <h3 className="font-medium">{skill.name}</h3>
                                <span className="text-sm text-muted-foreground">{skill.progress.toFixed(0)}%</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                This skill needs more practice to improve your overall proficiency.
                              </p>
                              <Button size="sm" className="w-full">Practice Now</Button>
                            </div>
                          ))
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Activity Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ActivityCalendar data={generateActivityData()} />
                  </CardContent>
                  <CardFooter className="flex justify-between text-sm text-muted-foreground">
                    <div>
                      <span className="inline-block w-3 h-3 bg-green-200 rounded-sm mr-1"></span>
                      Less
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 bg-green-300 rounded-sm"></span>
                      <span className="inline-block w-3 h-3 bg-green-400 rounded-sm"></span>
                      <span className="inline-block w-3 h-3 bg-green-500 rounded-sm"></span>
                      <span className="inline-block w-3 h-3 bg-green-600 rounded-sm"></span>
                    </div>
                    <div>
                      <span className="inline-block w-3 h-3 bg-green-700 rounded-sm mr-1"></span>
                      More
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="awards">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        Recent Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Award className="h-10 w-10 text-amber-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">5-Day Streak</h3>
                            <p className="text-sm text-muted-foreground">You've practiced for 5 consecutive days!</p>
                            <p className="text-xs text-amber-600 mt-1">Earned 2 days ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Award className="h-10 w-10 text-blue-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Vocabulary Master</h3>
                            <p className="text-sm text-muted-foreground">You've mastered 100 vocabulary words!</p>
                            <p className="text-xs text-blue-600 mt-1">Earned 1 week ago</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <Award className="h-10 w-10 text-purple-500 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">Perfect Score</h3>
                            <p className="text-sm text-muted-foreground">You got a perfect score on a practice session!</p>
                            <p className="text-xs text-purple-600 mt-1">Earned 2 weeks ago</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">View All Achievements</Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Badges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full ${i < 5 ? 'bg-gradient-to-br from-purple-400 to-indigo-600' : 'bg-muted'} flex items-center justify-center mb-2`}>
                              {i < 5 ? (
                                <Award className={`h-8 w-8 text-white`} />
                              ) : (
                                <Award className="h-8 w-8 text-muted-foreground opacity-30" />
                              )}
                            </div>
                            <span className="text-xs text-center line-clamp-2">
                              {i < 5 ? `Badge ${i+1}` : 'Locked'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Challenges</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div>
                          <div className="flex justify-between mb-1">
                            <h3 className="text-sm font-medium">10-Day Streak</h3>
                            <span className="text-sm">7/10</span>
                          </div>
                          <Progress value={70} className="h-2 mb-1" />
                          <p className="text-xs text-muted-foreground">Practice for 10 consecutive days</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <h3 className="text-sm font-medium">Master 5 Lessons</h3>
                            <span className="text-sm">3/5</span>
                          </div>
                          <Progress value={60} className="h-2 mb-1" />
                          <p className="text-xs text-muted-foreground">Complete 5 lessons with 90%+ score</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <h3 className="text-sm font-medium">Reading Marathon</h3>
                            <span className="text-sm">2/5</span>
                          </div>
                          <Progress value={40} className="h-2 mb-1" />
                          <p className="text-xs text-muted-foreground">Complete 5 reading exercises</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Join More Challenges</Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProgressPage;
