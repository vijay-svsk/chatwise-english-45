
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import { Lesson } from '@/types/database';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Clock, BookOpen, Bookmark, GraduationCap } from 'lucide-react';

const LessonCard: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const { toast } = useToast();
  
  const handleStartLesson = () => {
    toast({
      title: "Lesson Started",
      description: `You've started the "${lesson.title}" lesson`,
    });
  };
  
  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div 
        className="w-full h-36 bg-cover bg-center" 
        style={{ backgroundImage: `url(${lesson.imageUrl})` }}
      />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{lesson.title}</CardTitle>
            <CardDescription>{lesson.description}</CardDescription>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {lesson.level}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="mr-1 h-4 w-4" />
          <span>{lesson.duration} minutes</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <GraduationCap className="mr-1 h-4 w-4" />
          <span>{lesson.category}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{lesson.progress}%</span>
          </div>
          <Progress value={lesson.progress} className="h-2" />
          <Button 
            className="w-full mt-2" 
            onClick={handleStartLesson}
          >
            {lesson.progress > 0 ? 'Continue' : 'Start'} Lesson
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

const Lessons = () => {
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => db.getLessons(),
  });

  const filterLessonsByCategory = (category: string) => {
    if (category === 'all') {
      return lessons;
    }
    return lessons.filter(lesson => lesson.category === category);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">English Lessons</h1>
              <Button variant="outline">
                <Bookmark className="mr-2 h-4 w-4" />
                Saved Lessons
              </Button>
            </div>
            
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Lessons</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {isLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <Card key={i} className="h-[300px] animate-pulse">
                        <div className="h-full bg-muted"></div>
                      </Card>
                    ))
                  ) : (
                    lessons.map(lesson => (
                      <LessonCard key={lesson.id} lesson={lesson} />
                    ))
                  )}
                </div>
              </TabsContent>
              
              {['grammar', 'vocabulary', 'pronunciation', 'conversation'].map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filterLessonsByCategory(category).map(lesson => (
                      <LessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Lessons;
