
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TranscriptionBox from '@/components/TranscriptionBox';
import AIFeedback, { AIFeedbackResult } from '@/components/AIFeedback';
import PronunciationModule from '@/components/PronunciationModule';
import Leaderboard from '@/components/Leaderboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mockAnalyzeLanguageAPI } from '@/mock-api/analyzeLanguage';
import { processAnalysisToFeedback, processAnalysisToCorrections } from '@/services/languageAnalysisService';
import { grantReward } from '@/services/rewardsService';
import { db } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, BookOpen, Check, Trophy, Mic } from 'lucide-react';

const SpeakingPractice = () => {
  const [transcribedText, setTranscribedText] = useState('');
  const [feedback, setFeedback] = useState<AIFeedbackResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Set mock user for demo purposes
  useEffect(() => {
    const setupUser = async () => {
      // Get users from database
      const users = await db.getUsers();
      
      // Use first user, or create one if none exist
      if (users.length > 0) {
        setUserId(users[0].id);
        setUserName(users[0].name);
      } else {
        const newUser = await db.createUser({
          name: 'Demo User',
          email: 'demo@example.com',
          points: 0,
          level: 1,
          lastLogin: new Date().toISOString()
        });
        setUserId(newUser.id);
        setUserName(newUser.name);
      }
    };
    
    setupUser();
  }, []);
  
  // Create a new practice session when the component mounts
  useEffect(() => {
    const createSession = async () => {
      if (userId) {
        const session = await db.createSession({
          userId,
          type: 'speaking',
          score: 0,
          duration: 0,
          date: new Date().toISOString()
        });
        setSessionId(session.id);
      }
    };
    
    if (userId) {
      createSession();
    }
  }, [userId]);
  
  const handleTranscriptionComplete = async (text: string) => {
    setTranscribedText(text);
    
    // Automatically analyze longer transcriptions
    if (text.split(' ').length > 10) {
      try {
        setIsAnalyzing(true);
        toast({
          title: "Auto-analyzing",
          description: "Analyzing your speech with AI...",
        });
        
        const analysis = await mockAnalyzeLanguageAPI({ text });
        const feedbackResult = processAnalysisToFeedback(analysis);
        
        setFeedback(feedbackResult);
        
        // Save corrections to database
        if (sessionId) {
          const corrections = processAnalysisToCorrections(analysis, sessionId);
          for (const correction of corrections) {
            await db.createCorrection(correction);
          }
          
          // Update session score
          const sessions = await db.getSessions();
          const currentSession = sessions.find(s => s.id === sessionId);
          if (currentSession) {
            currentSession.score = feedbackResult.overall;
            await db.updateSession(currentSession);
            
            // Grant reward if score is good
            if (userId && feedbackResult.overall >= 80 && !completedTasks.includes('practice_complete')) {
              await grantReward({
                type: 'practice_complete',
                userId
              });
              
              setCompletedTasks(prev => [...prev, 'practice_complete']);
              
              toast({
                title: "Achievement Unlocked!",
                description: "You earned points for completing a practice session.",
              });
            }
            
            // Check for grammar mastery
            if (userId && feedbackResult.grammar >= 85 && !completedTasks.includes('grammar_mastery')) {
              await grantReward({
                type: 'grammar_mastery',
                userId
              });
              
              setCompletedTasks(prev => [...prev, 'grammar_mastery']);
              
              toast({
                title: "Grammar Mastery!",
                description: "You earned points for excellent grammar skills.",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error analyzing speech:", error);
        toast({
          title: "Analysis Error",
          description: "Could not analyze your speech. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };
  
  const handleFeedbackComplete = (feedbackResult: AIFeedbackResult) => {
    setFeedback(feedbackResult);
  };
  
  const handlePronunciationScoreUpdate = async (score: number) => {
    if (userId && score >= 85 && !completedTasks.includes('pronunciation_mastery')) {
      await grantReward({
        type: 'pronunciation_mastery',
        userId
      });
      
      setCompletedTasks(prev => [...prev, 'pronunciation_mastery']);
      
      toast({
        title: "Pronunciation Mastery!",
        description: "You earned points for excellent pronunciation.",
      });
    }
  };
  
  const topics = [
    {
      id: 'introduction',
      title: 'Self Introduction',
      prompt: 'Introduce yourself. Talk about your name, where you\'re from, your job or studies, and your hobbies.'
    },
    {
      id: 'describe-home',
      title: 'Describe Your Home',
      prompt: 'Describe your home or apartment. Talk about its location, rooms, and what you like about it.'
    },
    {
      id: 'favorite-food',
      title: 'Favorite Food',
      prompt: 'Talk about your favorite food. Describe what it is, why you like it, and how it\'s prepared.'
    },
    {
      id: 'travel',
      title: 'Travel Experience',
      prompt: 'Describe a memorable trip or vacation. Where did you go? What did you do? Why was it special?'
    },
    {
      id: 'future-plans',
      title: 'Future Plans',
      prompt: 'Discuss your plans for the future. What do you want to achieve in the next 5 years?'
    },
  ];
  
  const pronunciationExercises = [
    {
      phrase: "The quick brown fox jumps over the lazy dog",
      phonetics: "/ðə kwɪk braʊn fɒks dʒʌmps ˈəʊvə ðə ˈleɪzi dɒɡ/",
      difficulty: "medium"
    },
    {
      phrase: "She sells seashells by the seashore",
      phonetics: "/ʃi sɛlz ˈsiːʃɛlz baɪ ðə ˈsiːʃɔː/",
      difficulty: "hard"
    },
    {
      phrase: "How much wood would a woodchuck chuck",
      phonetics: "/haʊ mʌtʃ wʊd wʊd ə ˈwʊdtʃʌk tʃʌk/",
      difficulty: "hard"
    },
    {
      phrase: "I would like to improve my English pronunciation",
      phonetics: "/aɪ wʊd laɪk tuː ɪmˈpruːv maɪ ˈɪŋɡlɪʃ prəˌnʌnsiˈeɪʃən/",
      difficulty: "easy"
    },
    {
      phrase: "Thank you for your help",
      phonetics: "/θæŋk juː fɔː jɔː hɛlp/",
      difficulty: "easy"
    }
  ];
  
  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: userName || 'User', email: 'user@example.com', avatar: 'https://i.pravatar.cc/300?img=47' }} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Speaking Practice</h1>
            <p className="text-muted-foreground mb-6">Improve your pronunciation and fluency through guided practice.</p>
            
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <TranscriptionBox 
                        onTranscriptionComplete={handleTranscriptionComplete} 
                        isProcessing={isAnalyzing}
                      />
                      <AIFeedback 
                        text={transcribedText} 
                        onFeedbackComplete={handleFeedbackComplete} 
                      />
                    </div>
                    
                    {feedback && (
                      <Card className="glass-panel mt-6">
                        <CardHeader>
                          <CardTitle className="text-xl font-display">Grammar Rule Highlights</CardTitle>
                          <CardDescription>Learn from the corrections in your speech</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="max-h-64">
                            <div className="space-y-4">
                              {feedback.corrections.map((correction, index) => (
                                <div key={index} className="p-3 rounded-lg border border-border">
                                  <div className="flex items-start gap-3 mb-2">
                                    <Badge variant="outline" className="mt-1 whitespace-nowrap">
                                      {correction.rule || "Grammar Rule"}
                                    </Badge>
                                    <div>
                                      <p className="line-through text-muted-foreground">{correction.original}</p>
                                      <p className="font-medium text-green-600">{correction.corrected}</p>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{correction.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  <div className="space-y-6">
                    <Leaderboard currentUserId={userId || undefined} limit={5} />
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl font-display">Achievements</CardTitle>
                        <CardDescription>Complete tasks to earn points</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Check className={`h-5 w-5 ${completedTasks.includes('practice_complete') ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span>Complete a practice</span>
                            </div>
                            <Badge variant={completedTasks.includes('practice_complete') ? "default" : "outline"}>10 pts</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Check className={`h-5 w-5 ${completedTasks.includes('grammar_mastery') ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span>Grammar mastery</span>
                            </div>
                            <Badge variant={completedTasks.includes('grammar_mastery') ? "default" : "outline"}>20 pts</Badge>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <Check className={`h-5 w-5 ${completedTasks.includes('pronunciation_mastery') ? 'text-green-500' : 'text-muted-foreground'}`} />
                              <span>Pronunciation mastery</span>
                            </div>
                            <Badge variant={completedTasks.includes('pronunciation_mastery') ? "default" : "outline"}>20 pts</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
                
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-xl font-display flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Suggested Topics
                    </CardTitle>
                    <CardDescription>Practice with these prompts to improve your speaking skills</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topics.map((topic) => (
                        <Card key={topic.id} className="glass-panel">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-display">{topic.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{topic.prompt}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="pronunciation" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pronunciationExercises.map((exercise, index) => (
                    <PronunciationModule 
                      key={index}
                      phrase={exercise.phrase}
                      phonetics={exercise.phonetics}
                      difficulty={exercise.difficulty as any}
                      onScoreUpdate={handlePronunciationScoreUpdate}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-xl font-display flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Your Progress
                        </CardTitle>
                        <CardDescription>Track your improvement over time</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Grammar</span>
                              <span className="text-sm font-medium">85%</span>
                            </div>
                            <Progress value={85} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Vocabulary</span>
                              <span className="text-sm font-medium">72%</span>
                            </div>
                            <Progress value={72} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Pronunciation</span>
                              <span className="text-sm font-medium">78%</span>
                            </div>
                            <Progress value={78} className="h-2" />
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">Fluency</span>
                              <span className="text-sm font-medium">68%</span>
                            </div>
                            <Progress value={68} className="h-2" />
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-border">
                          <h3 className="font-semibold mb-3">Recent Sessions</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between p-2 bg-muted/40 rounded">
                              <span>Speaking Practice</span>
                              <span className="font-medium">Today</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/40 rounded">
                              <span>Pronunciation Exercise</span>
                              <span className="font-medium">Yesterday</span>
                            </div>
                            <div className="flex justify-between p-2 bg-muted/40 rounded">
                              <span>Grammar Practice</span>
                              <span className="font-medium">3 days ago</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <Leaderboard currentUserId={userId || undefined} />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SpeakingPractice;
