
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import VirtualTeacher from '@/components/VirtualTeacher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';

const VirtualTeacherPage = () => {
  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://i.pravatar.cc/300?img=47'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-6xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Virtual AI Teacher</h1>
            <p className="text-muted-foreground mb-6">
              Ask questions and get real-time assistance from your AI English teacher. Speak naturally or type your questions.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <VirtualTeacher initialGreeting="Hello! I'm your interactive AI English teacher. I can help you learn English through conversation. What would you like to know today?" />
              </div>
              
              <div className="space-y-6">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">How To Use</CardTitle>
                    <CardDescription>Talk to me like a real English teacher</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex gap-3">
                      <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</div>
                      <p className="text-sm">Click the "Start Listening" button and speak naturally</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</div>
                      <p className="text-sm">I'll listen, analyze your question and provide a helpful response</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</div>
                      <p className="text-sm">I'll speak my responses aloud. You can stop me anytime with the "Stop Speaking" button</p>
                    </div>
                    
                    <div className="flex gap-3">
                      <div className="bg-primary/20 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">4</div>
                      <p className="text-sm">Each response can be replayed by clicking the speaker icon</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">Suggested Topics</CardTitle>
                    <CardDescription>Try asking questions about these topics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-secondary/30 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                      <h3 className="font-medium">Grammar Rules</h3>
                      <p className="text-sm text-muted-foreground">"What's the difference between 'a' and 'the'?"</p>
                    </div>
                    
                    <div className="bg-secondary/30 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                      <h3 className="font-medium">Pronunciation Practice</h3>
                      <p className="text-sm text-muted-foreground">"How do I pronounce 'thorough' correctly?"</p>
                    </div>
                    
                    <div className="bg-secondary/30 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                      <h3 className="font-medium">Vocabulary Building</h3>
                      <p className="text-sm text-muted-foreground">"Can you suggest synonyms for 'good'?"</p>
                    </div>
                    
                    <div className="bg-secondary/30 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                      <h3 className="font-medium">Conversation Practice</h3>
                      <p className="text-sm text-muted-foreground">"How do I politely disagree with someone?"</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      <Toaster />
    </div>
  );
};

export default VirtualTeacherPage;
