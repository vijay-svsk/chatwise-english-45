
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/services/databaseService';
import { grantReward } from '@/services/rewardsService';
import { Lesson } from '@/types/database';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Clock, BookOpen, Bookmark, GraduationCap, CheckCircle2, Lock, Filter, Search, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

const LessonCard: React.FC<{ lesson: Lesson }> = ({ lesson }) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const handleStartLesson = async () => {
    setIsStarting(true);
    
    // Simulate loading
    setTimeout(async () => {
      try {
        // Grant reward if this is a new lesson (progress = 0)
        if (lesson.progress === 0) {
          await grantReward({
            type: 'practice_complete',
            userId: "1" // In a real app, get from context
          });
        }
        
        toast({
          title: "Lesson Started",
          description: `You've started the "${lesson.title}" lesson`,
        });
        
        setIsStarting(false);
        setOpen(false);
      } catch (error) {
        console.error("Error starting lesson:", error);
        toast({
          title: "Error",
          description: "Failed to start lesson. Please try again.",
          variant: "destructive"
        });
        setIsStarting(false);
      }
    }, 1500);
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
          <Badge className="capitalize" variant={
            lesson.level === 'beginner' ? 'default' :
            lesson.level === 'intermediate' ? 'secondary' : 'outline'
          }>
            {lesson.level}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock className="mr-1 h-4 w-4" />
          <span>{lesson.duration} minutes</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <GraduationCap className="mr-1 h-4 w-4" />
          <span className="capitalize">{lesson.category}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Progress</span>
            <span className="text-sm font-medium">{lesson.progress}%</span>
          </div>
          <Progress value={lesson.progress} className="h-2" />
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-2">
                {lesson.progress > 0 ? 'Continue' : 'Start'} Lesson
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{lesson.title}</DialogTitle>
                <DialogDescription>
                  {lesson.description}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center mb-4">
                  <Badge className="capitalize mr-2" variant={
                    lesson.level === 'beginner' ? 'default' :
                    lesson.level === 'intermediate' ? 'secondary' : 'outline'
                  }>
                    {lesson.level}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{lesson.duration} minutes</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">What you'll learn:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Key {lesson.category} principles for {lesson.level} level
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Practice exercises with feedback
                    </li>
                    <li className="flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      Interactive quizzes to test your knowledge
                    </li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleStartLesson} disabled={isStarting}>
                  {isStarting ? (
                    <>
                      <span className="mr-2">Loading...</span>
                      <span className="animate-spin">⟳</span>
                    </>
                  ) : (
                    <>
                      <span>{lesson.progress > 0 ? 'Continue' : 'Start'} Lesson</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
  
  const [searchTerm, setSearchTerm] = useState('');

  const filterLessonsByCategory = (category: string) => {
    let filtered = lessons;
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lesson => 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply category filter
    if (category === 'all') {
      return filtered;
    }
    return filtered.filter(lesson => lesson.category === category);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 pt-16 px-6 pb-8 ml-64">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold">English Lessons</h1>
                <p className="text-muted-foreground">Find the perfect lesson for your learning journey</p>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search lessons..."
                    className="pl-8 w-full md:w-[200px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Bookmark className="mr-2 h-4 w-4" />
                  Saved
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Lessons</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
                <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
                <TabsTrigger value="conversation">Conversation</TabsTrigger>
                <TabsTrigger value="reading">Reading</TabsTrigger>
                <TabsTrigger value="writing">Writing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {isLoading ? (
                    Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="h-[320px] animate-pulse">
                        <div className="h-36 bg-muted"></div>
                        <CardHeader>
                          <div className="h-6 w-2/3 bg-muted rounded mb-2"></div>
                          <div className="h-4 w-full bg-muted rounded"></div>
                        </CardHeader>
                        <CardContent>
                          <div className="h-4 w-full bg-muted rounded mb-4"></div>
                          <div className="h-4 w-2/3 bg-muted rounded"></div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    filterLessonsByCategory('all').map(lesson => (
                      <LessonCard key={lesson.id} lesson={lesson} />
                    ))
                  )}
                </div>
                
                {filterLessonsByCategory('all').length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No lessons found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
                    <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
                  </div>
                )}
              </TabsContent>
              
              {['grammar', 'vocabulary', 'pronunciation', 'conversation', 'reading', 'writing'].map(category => (
                <TabsContent key={category} value={category} className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filterLessonsByCategory(category).length > 0 ? (
                      filterLessonsByCategory(category).map(lesson => (
                        <LessonCard key={lesson.id} lesson={lesson} />
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                        <h3 className="text-lg font-medium mb-2">No {category} lessons found</h3>
                        <p className="text-muted-foreground mb-4">Try adjusting your search criteria</p>
                        <Button onClick={() => setSearchTerm('')}>Clear Search</Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <section>
              <h2 className="text-xl font-bold mb-4">Recommended Learning Path</h2>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5 text-primary" />
                    Your Learning Journey
                  </CardTitle>
                  <CardDescription>
                    Follow this path to achieve structured progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted"></div>
                    
                    <div className="space-y-8">
                      <div className="relative pl-10">
                        <div className="absolute left-0 p-2 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Start with the Basics</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Begin with beginner grammar and vocabulary lessons
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Grammar</Badge>
                          <Badge variant="outline">Vocabulary</Badge>
                        </div>
                      </div>
                      
                      <div className="relative pl-10">
                        <div className="absolute left-0 p-2 rounded-full bg-secondary flex items-center justify-center">
                          <div className="h-4 w-4 text-secondary-foreground">2</div>
                        </div>
                        <h3 className="text-lg font-medium mb-1">Build Pronunciation Skills</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Focus on pronouncing words and phrases correctly
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Pronunciation</Badge>
                          <Badge variant="outline">Speaking</Badge>
                        </div>
                      </div>
                      
                      <div className="relative pl-10">
                        <div className="absolute left-0 p-2 rounded-full bg-muted flex items-center justify-center">
                          <div className="h-4 w-4">3</div>
                        </div>
                        <h3 className="text-lg font-medium mb-1">Practice Conversations</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Apply your skills in real-world conversation scenarios
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Conversation</Badge>
                          <Badge variant="outline">Listening</Badge>
                        </div>
                      </div>
                      
                      <div className="relative pl-10">
                        <div className="absolute left-0 p-2 rounded-full bg-muted flex items-center justify-center">
                          <Lock className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Master Advanced Topics</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Deepen your understanding with advanced lessons
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="outline">Advanced Grammar</Badge>
                          <Badge variant="outline">Writing</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Lessons;
