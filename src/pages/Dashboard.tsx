
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import PerformanceChart from '@/components/PerformanceChart';
import SkillRadar from '@/components/SkillRadar';
import ActivityCalendar from '@/components/ActivityCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, Headphones, BookOpen, MessageSquare } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [performanceData, setPerformanceData] = useState([]);
  const [skillData, setSkillData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  
  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://i.pravatar.cc/300?img=47'
  };
  
  useEffect(() => {
    // Mock data for the charts
    const mockPerformanceData = Array.from({ length: 14 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pronunciation: 60 + Math.floor(Math.random() * 30),
        fluency: 60 + Math.floor(Math.random() * 30),
        vocabulary: 60 + Math.floor(Math.random() * 30),
        grammar: 60 + Math.floor(Math.random() * 30),
      };
    });
    
    const mockSkillData = [
      { skill: 'Speaking', value: 75, fullMark: 100 },
      { skill: 'Listening', value: 82, fullMark: 100 },
      { skill: 'Reading', value: 88, fullMark: 100 },
      { skill: 'Writing', value: 70, fullMark: 100 },
      { skill: 'Vocabulary', value: 65, fullMark: 100 },
      { skill: 'Grammar', value: 78, fullMark: 100 },
    ];
    
    const mockActivityData = Array.from({ length: 84 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (83 - i));
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
  }, []);
  
  const practiceActivities = [
    { 
      id: 'speaking', 
      title: 'Speaking Practice', 
      description: 'Improve your pronunciation and fluency',
      icon: Mic,
      path: '/practice/speaking',
      color: 'bg-blue-500'
    },
    { 
      id: 'listening', 
      title: 'Listening Practice', 
      description: 'Enhance your comprehension skills',
      icon: Headphones,
      path: '/practice/listening',
      color: 'bg-purple-500'
    },
    { 
      id: 'vocabulary', 
      title: 'Vocabulary Building', 
      description: 'Expand your English vocabulary',
      icon: BookOpen,
      path: '/lessons',
      color: 'bg-green-500'
    },
    { 
      id: 'conversation', 
      title: 'AI Conversation', 
      description: 'Chat with our AI language partner',
      icon: MessageSquare,
      path: '/practice/conversation',
      color: 'bg-amber-500'
    },
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Welcome back, {mockUser.name.split(' ')[0]}</h1>
            <p className="text-muted-foreground mb-6">Continue your English learning journey today.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {practiceActivities.map((activity) => (
                <Card key={activity.id} className="glass-panel overflow-hidden">
                  <div className={`h-2 w-full ${activity.color}`} />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-display">{activity.title}</CardTitle>
                      <activity.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">{activity.description}</p>
                    <Button 
                      onClick={() => navigate(activity.path)}
                      className="w-full button-shine"
                    >
                      Start Practice
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-display font-semibold mb-6">Your Progress</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceChart data={performanceData} />
              <SkillRadar data={skillData} />
            </div>
          </section>
          
          <section>
            <h2 className="text-2xl font-display font-semibold mb-6">Learning Streak</h2>
            <ActivityCalendar data={activityData} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
