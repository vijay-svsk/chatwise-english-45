
import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import WritingExercise from '@/components/WritingExercise';
import ReadingComprehension from '@/components/ReadingComprehension';
import VocabularyGame from '@/components/VocabularyGame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import { PenLine, BookOpen, Brain, ScrollText, ListChecks } from 'lucide-react';

const WritingPractice = () => {
  const userId = "1"; // In a real app, get this from auth context
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => db.getUserById(userId),
  });
  
  const handleWritingComplete = (text: string) => {
    toast({
      title: "Writing Completed",
      description: `You completed a writing exercise with ${text.split(/\s+/).length} words.`,
    });
  };
  
  const handleReadingComplete = (score: number) => {
    toast({
      title: "Reading Comprehension Complete",
      description: `You scored ${score}% on the reading exercise.`,
    });
  };
  
  const handleVocabularyComplete = (score: number) => {
    toast({
      title: "Vocabulary Game Complete",
      description: `You scored ${score} points in the vocabulary game.`,
    });
  };
  
  // Sample essay prompts
  const essayPrompts = [
    {
      prompt: "Describe your ideal vacation destination. Include details about location, activities, and why you would enjoy it.",
      type: "essay",
      minWords: 150
    },
    {
      prompt: "Write about a time when you had to overcome a challenge. What happened, and what did you learn from it?",
      type: "essay",
      minWords: 200
    },
    {
      prompt: "Discuss the advantages and disadvantages of remote work compared to working in an office.",
      type: "essay",
      minWords: 180
    }
  ];
  
  // Sample reading passage
  const readingPassage = `Language learning is a fascinating journey that transforms not just how we communicate, but how we think and perceive the world around us. When we learn a new language, we aren't simply memorizing vocabulary and grammar rules; we're adopting new cultural frameworks and perspectives.

Research has shown that bilingual and multilingual individuals often demonstrate enhanced cognitive abilities. They typically exhibit better problem-solving skills, improved memory, and greater mental flexibility. This "cognitive reserve" even appears to delay the onset of dementia symptoms in older adults.

Beyond the cognitive benefits, language learning opens doors to new cultures, literature, and human connections that would otherwise remain inaccessible. It allows us to engage with people from different backgrounds on a deeper level, fostering empathy and cross-cultural understanding.

In today's interconnected global society, language skills are increasingly valuable in the job market. Employers often seek candidates who can communicate with international clients, partners, and colleagues. This skill can lead to better job opportunities and higher earning potential.

The journey of language acquisition is not without challenges. It requires persistence, patience, and a willingness to make mistakes. Many learners experience plateaus or periods of frustration. However, these challenges are part of the process, and overcoming them leads to greater fluency and confidence.

Modern technology has revolutionized how we learn languages. Mobile apps, online courses, and language exchange platforms make it easier than ever to practice consistently and connect with native speakers from anywhere in the world.

Ultimately, language learning is more than an academic pursuit—it's a lifelong adventure that enriches our experiences and broadens our horizons in countless ways.`;
  
  // Sample reading comprehension questions
  const readingQuestions = [
    {
      id: "q1",
      text: "According to the passage, what do bilingual individuals often demonstrate?",
      options: [
        { id: "q1a", text: "Lower stress levels" },
        { id: "q1b", text: "Enhanced cognitive abilities" },
        { id: "q1c", text: "Improved physical health" },
        { id: "q1d", text: "Better musical talents" }
      ],
      correctOption: "q1b"
    },
    {
      id: "q2",
      text: "What challenge of language learning does the passage mention?",
      options: [
        { id: "q2a", text: "High financial cost" },
        { id: "q2b", text: "Physical exhaustion" },
        { id: "q2c", text: "Need for special equipment" },
        { id: "q2d", text: "Periods of frustration" }
      ],
      correctOption: "q2d"
    },
    {
      id: "q3",
      text: "How has modern technology affected language learning?",
      options: [
        { id: "q3a", text: "It has made it more expensive" },
        { id: "q3b", text: "It has made it easier to practice consistently" },
        { id: "q3c", text: "It has made languages obsolete" },
        { id: "q3d", text: "It has reduced the quality of learning" }
      ],
      correctOption: "q3b"
    },
    {
      id: "q4",
      text: "What benefit of language learning related to aging is mentioned?",
      options: [
        { id: "q4a", text: "Improved vision" },
        { id: "q4b", text: "Faster reflexes" },
        { id: "q4c", text: "Delayed onset of dementia symptoms" },
        { id: "q4d", text: "Increased height" }
      ],
      correctOption: "q4c"
    },
    {
      id: "q5",
      text: "According to the passage, what makes language learning valuable in today's job market?",
      options: [
        { id: "q5a", text: "The ability to write code" },
        { id: "q5b", text: "The ability to communicate with international contacts" },
        { id: "q5c", text: "Knowledge of ancient history" },
        { id: "q5d", text: "Skills in graphic design" }
      ],
      correctOption: "q5b"
    }
  ];
  
  // Sample vocabulary word pairs
  const vocabularyWords = [
    { id: "v1", word: "Eloquent", definition: "Fluent or persuasive in speaking or writing" },
    { id: "v2", word: "Diligent", definition: "Having or showing care and conscientiousness in one's work or duties" },
    { id: "v3", word: "Ambiguous", definition: "Open to more than one interpretation; not having one obvious meaning" },
    { id: "v4", word: "Pragmatic", definition: "Dealing with things sensibly and realistically" },
    { id: "v5", word: "Resilient", definition: "Able to withstand or recover quickly from difficult conditions" },
    { id: "v6", word: "Collaborate", definition: "Work jointly on an activity or project" },
    { id: "v7", word: "Innovative", definition: "Featuring new methods; advanced and original" },
    { id: "v8", word: "Meticulous", definition: "Showing great attention to detail; very careful and precise" },
    { id: "v9", word: "Versatile", definition: "Able to adapt or be adapted to many different functions or activities" },
    { id: "v10", word: "Tenacious", definition: "Tending to keep a firm hold of something; clinging or adhering closely" },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header user={{ name: user?.name || 'User', email: 'user@example.com', avatar: 'https://i.pravatar.cc/300?img=47' }} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Communication Skills Practice</h1>
            <p className="text-muted-foreground mb-6">Improve your reading, writing, and vocabulary skills through interactive exercises.</p>
            
            <Tabs defaultValue="writing" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="writing">
                  <PenLine className="h-4 w-4 mr-2" />
                  Writing
                </TabsTrigger>
                <TabsTrigger value="reading">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Reading
                </TabsTrigger>
                <TabsTrigger value="vocabulary">
                  <Brain className="h-4 w-4 mr-2" />
                  Vocabulary
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="writing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ScrollText className="h-5 w-5" />
                      Writing Exercises
                    </CardTitle>
                    <CardDescription>
                      Practice your writing skills with these prompts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {essayPrompts.map((prompt, index) => (
                        <WritingExercise
                          key={index}
                          prompt={prompt.prompt}
                          type={prompt.type as any}
                          minWords={prompt.minWords}
                          onComplete={handleWritingComplete}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/10">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ListChecks className="h-5 w-5" />
                      Writing Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-3 p-4 bg-background rounded-lg shadow-sm">
                        <Badge className="bg-blue-500">Structure</Badge>
                        <h3 className="font-medium">Organize Your Thoughts</h3>
                        <p className="text-sm text-muted-foreground">
                          Start with an outline: introduction, main points, and conclusion. 
                          This framework will help you maintain a logical flow.
                        </p>
                      </div>
                      
                      <div className="space-y-3 p-4 bg-background rounded-lg shadow-sm">
                        <Badge className="bg-green-500">Clarity</Badge>
                        <h3 className="font-medium">Be Clear and Concise</h3>
                        <p className="text-sm text-muted-foreground">
                          Use simple, direct language. Avoid unnecessary words 
                          and jargon that might confuse your reader.
                        </p>
                      </div>
                      
                      <div className="space-y-3 p-4 bg-background rounded-lg shadow-sm">
                        <Badge className="bg-purple-500">Revision</Badge>
                        <h3 className="font-medium">Review and Edit</h3>
                        <p className="text-sm text-muted-foreground">
                          Always take time to review your writing. Look for grammar errors, 
                          clarity issues, and opportunities to improve.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reading" className="space-y-6">
                <ReadingComprehension
                  title="Understanding Language Learning"
                  level="intermediate"
                  content={readingPassage}
                  questions={readingQuestions}
                  onComplete={handleReadingComplete}
                />
              </TabsContent>
              
              <TabsContent value="vocabulary" className="space-y-6">
                <VocabularyGame
                  words={vocabularyWords}
                  gameType="matching"
                  onComplete={handleVocabularyComplete}
                />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default WritingPractice;
