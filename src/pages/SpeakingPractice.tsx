
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TranscriptionBox from '@/components/TranscriptionBox';
import AIFeedback, { AIFeedbackResult } from '@/components/AIFeedback';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SpeakingPractice = () => {
  const [transcribedText, setTranscribedText] = useState('');
  const [feedback, setFeedback] = useState<AIFeedbackResult | null>(null);
  
  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://i.pravatar.cc/300?img=47'
  };
  
  const handleTranscriptionComplete = (text: string) => {
    setTranscribedText(text);
  };
  
  const handleFeedbackComplete = (feedbackResult: AIFeedbackResult) => {
    setFeedback(feedbackResult);
  };
  
  const topics = [
    {
      id: 'introduction',
      title: 'Self Introduction',
      prompt: 'Introduce yourself. Talk about your name, where you're from, your job or studies, and your hobbies.'
    },
    {
      id: 'describe-home',
      title: 'Describe Your Home',
      prompt: 'Describe your home or apartment. Talk about its location, rooms, and what you like about it.'
    },
    {
      id: 'favorite-food',
      title: 'Favorite Food',
      prompt: 'Talk about your favorite food. Describe what it is, why you like it, and how it's prepared.'
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
  
  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Speaking Practice</h1>
            <p className="text-muted-foreground mb-6">Improve your pronunciation and fluency through guided practice.</p>
            
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="topics">Suggested Topics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TranscriptionBox onTranscriptionComplete={handleTranscriptionComplete} />
                  <AIFeedback text={transcribedText} onFeedbackComplete={handleFeedbackComplete} />
                </div>
                
                {feedback && (
                  <Card className="glass-panel">
                    <CardHeader>
                      <CardTitle className="text-xl font-display">Your Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 rounded-xl border border-border bg-background/50">
                        {transcribedText || <span className="text-muted-foreground">No transcript available</span>}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="topics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topics.map((topic) => (
                    <Card key={topic.id} className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">{topic.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{topic.prompt}</p>
                      </CardContent>
                    </Card>
                  ))}
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
