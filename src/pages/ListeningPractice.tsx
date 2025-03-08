
import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, SkipBack, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import AIFeedback, { AIFeedbackResult } from '@/components/AIFeedback';

interface ListeningExercise {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  transcript: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  questions: {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

const mockExercises: ListeningExercise[] = [
  {
    id: 'conversation-1',
    title: 'Coffee Shop Conversation',
    description: 'A conversation between a customer and barista at a coffee shop.',
    audioUrl: 'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3', // Placeholder audio
    transcript: "Customer: Hi, could I get a medium latte please?\nBarista: Sure, would you like that hot or iced?\nCustomer: Hot, please. And could I also get a blueberry muffin?\nBarista: Of course. That'll be $7.50. Will that be all for today?\nCustomer: Yes, that's it. Thank you.\nBarista: Your order will be ready in just a moment.",
    difficulty: 'beginner',
    questions: [
      {
        id: 'q1',
        question: 'What did the customer order?',
        options: ['A small coffee', 'A medium latte', 'A large cappuccino', 'An iced tea'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'What food item did the customer request?',
        options: ['A chocolate cookie', 'A croissant', 'A blueberry muffin', 'A sandwich'],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'How much did the order cost?',
        options: ['$5.50', '$6.75', '$7.50', '$8.25'],
        correctAnswer: 2,
      }
    ]
  },
  {
    id: 'news-report',
    title: 'Weather Report',
    description: 'A brief weather forecast for the upcoming week.',
    audioUrl: 'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3', // Placeholder audio
    transcript: "Good evening! Here's your weather forecast for the week ahead. Tomorrow will be sunny with temperatures reaching 75 degrees. Tuesday brings a slight chance of rain in the afternoon, with temperatures cooling to around 68. By midweek, we're expecting cloudy conditions and possible thunderstorms. The weekend is looking clear and warm, perfect for outdoor activities. Back to you, Jim.",
    difficulty: 'intermediate',
    questions: [
      {
        id: 'q1',
        question: 'What will the weather be like tomorrow?',
        options: ['Rainy', 'Cloudy', 'Sunny', 'Snowy'],
        correctAnswer: 2,
      },
      {
        id: 'q2',
        question: 'When is there a chance of rain?',
        options: ['Monday', 'Tuesday', 'Wednesday', 'Saturday'],
        correctAnswer: 1,
      },
      {
        id: 'q3',
        question: 'What kind of weather is expected for the weekend?',
        options: ['Stormy', 'Clear and warm', 'Windy', 'Cold and cloudy'],
        correctAnswer: 1,
      }
    ]
  },
  {
    id: 'ted-talk',
    title: 'The Importance of Learning',
    description: 'An excerpt from an educational talk about lifelong learning.',
    audioUrl: 'https://storage.googleapis.com/media-session/elephants-dream/the-wires.mp3', // Placeholder audio
    transcript: "Learning isn't just something we do in school—it's a lifelong journey. The brain is constantly changing, forming new connections when we learn new things. This neuroplasticity means that regardless of age, we can always enhance our cognitive abilities. Studies show that people who continuously learn throughout their lives have better mental health, more social connections, and even live longer. So I encourage you to never stop being curious, never stop questioning, and never stop learning.",
    difficulty: 'advanced',
    questions: [
      {
        id: 'q1',
        question: 'According to the speaker, what is neuroplasticity related to?',
        options: ['Physical exercise', 'Brain forming new connections', 'Aging process', 'School curriculum'],
        correctAnswer: 1,
      },
      {
        id: 'q2',
        question: 'What benefit of lifelong learning is NOT mentioned?',
        options: ['Better mental health', 'More social connections', 'Increased wealth', 'Longer lifespan'],
        correctAnswer: 2,
      },
      {
        id: 'q3',
        question: 'What does the speaker encourage the audience to maintain?',
        options: ['Financial stability', 'Curiosity', 'Physical health', 'Political awareness'],
        correctAnswer: 1,
      }
    ]
  }
];

const ListeningPractice = () => {
  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://i.pravatar.cc/300?img=47'
  };

  const [selectedExercise, setSelectedExercise] = useState<ListeningExercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedbackResult | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredExercises = selectedFilter === 'all' 
    ? mockExercises 
    : mockExercises.filter(ex => ex.difficulty === selectedFilter);

  const handleExerciseSelect = (exercise: ListeningExercise) => {
    setSelectedExercise(exercise);
    setIsPlaying(false);
    setCurrentProgress(0);
    setSelectedAnswers({});
    setHasSubmitted(false);
    setShowTranscript(false);
    setFeedback(null);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setCurrentProgress(progress);
    }
  };

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    if (!hasSubmitted) {
      setSelectedAnswers({
        ...selectedAnswers,
        [questionId]: answerIndex
      });
    }
  };

  const handleSubmit = () => {
    setHasSubmitted(true);
    
    // Calculate score
    if (selectedExercise) {
      const totalQuestions = selectedExercise.questions.length;
      const correctAnswers = selectedExercise.questions.filter(
        q => selectedAnswers[q.id] === q.correctAnswer
      ).length;
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Generate mock AI feedback
      const mockFeedback: AIFeedbackResult = {
        pronunciation: 0, // Not applicable for listening
        grammar: 0, // Not applicable for listening
        vocabulary: 75 + Math.floor(Math.random() * 15),
        fluency: 0, // Not applicable for listening
        overall: score,
        suggestions: [
          "Try to listen for context clues when you're unsure about specific details.",
          "Focus on understanding the main ideas first, then the details.",
          "Practice with different accents to improve your comprehension."
        ],
        corrections: [
          {
            original: "",
            corrected: "",
            explanation: `You answered ${correctAnswers} out of ${totalQuestions} questions correctly.`
          }
        ]
      };
      
      setFeedback(mockFeedback);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Listening Practice</h1>
            <p className="text-muted-foreground mb-6">Improve your comprehension with audio exercises.</p>
            
            <Tabs defaultValue="exercises" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="exercises">Exercises</TabsTrigger>
                <TabsTrigger value="history">Your History</TabsTrigger>
              </TabsList>
              
              <TabsContent value="exercises" className="space-y-6">
                {!selectedExercise ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-display font-medium">Available Exercises</h2>
                      <div className="flex space-x-2">
                        <Button 
                          variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSelectedFilter('all')}
                        >
                          All
                        </Button>
                        <Button 
                          variant={selectedFilter === 'beginner' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSelectedFilter('beginner')}
                        >
                          Beginner
                        </Button>
                        <Button 
                          variant={selectedFilter === 'intermediate' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSelectedFilter('intermediate')}
                        >
                          Intermediate
                        </Button>
                        <Button 
                          variant={selectedFilter === 'advanced' ? 'default' : 'outline'} 
                          size="sm"
                          onClick={() => setSelectedFilter('advanced')}
                        >
                          Advanced
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredExercises.map((exercise) => (
                        <Card key={exercise.id} className="glass-panel hover:shadow-lg transition-all">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg font-display">{exercise.title}</CardTitle>
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                exercise.difficulty === 'beginner' && "bg-green-100 text-green-800",
                                exercise.difficulty === 'intermediate' && "bg-blue-100 text-blue-800",
                                exercise.difficulty === 'advanced' && "bg-purple-100 text-purple-800",
                              )}>
                                {exercise.difficulty.charAt(0).toUpperCase() + exercise.difficulty.slice(1)}
                              </span>
                            </div>
                            <CardDescription>{exercise.description}</CardDescription>
                          </CardHeader>
                          <CardFooter>
                            <Button 
                              className="w-full" 
                              onClick={() => handleExerciseSelect(exercise)}
                            >
                              Start Exercise
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <Card className="glass-panel">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl font-display">{selectedExercise.title}</CardTitle>
                            <CardDescription>{selectedExercise.description}</CardDescription>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setSelectedExercise(null)}>
                            Back to List
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className="absolute h-full bg-primary" 
                              style={{ width: `${currentProgress}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-center space-x-4">
                            <Button size="icon" variant="outline" onClick={restart}>
                              <SkipBack className="h-4 w-4" />
                            </Button>
                            <Button size="icon" onClick={togglePlayPause}>
                              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button size="icon" variant="outline" onClick={toggleMute}>
                              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <Button 
                              size="icon" 
                              variant="outline" 
                              onClick={() => setShowTranscript(!showTranscript)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <audio 
                            ref={audioRef}
                            src={selectedExercise.audioUrl}
                            onTimeUpdate={handleTimeUpdate}
                            onEnded={() => setIsPlaying(false)}
                            className="hidden"
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    {showTranscript && (
                      <Card className="glass-panel">
                        <CardHeader>
                          <CardTitle className="text-lg font-display">Transcript</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="p-4 rounded-xl border border-border bg-background/50 whitespace-pre-line">
                            {selectedExercise.transcript}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    <Card className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">Comprehension Questions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {selectedExercise.questions.map((q, qIndex) => (
                            <div key={q.id} className="space-y-3">
                              <h4 className="font-medium">{qIndex + 1}. {q.question}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {q.options.map((option, oIndex) => (
                                  <div 
                                    key={oIndex}
                                    className={cn(
                                      "p-3 rounded-lg border cursor-pointer transition-all",
                                      selectedAnswers[q.id] === oIndex && !hasSubmitted && "border-primary bg-primary/10",
                                      hasSubmitted && oIndex === q.correctAnswer && "border-green-500 bg-green-100 text-green-800",
                                      hasSubmitted && selectedAnswers[q.id] === oIndex && oIndex !== q.correctAnswer && "border-red-500 bg-red-100 text-red-800"
                                    )}
                                    onClick={() => handleAnswerSelect(q.id, oIndex)}
                                  >
                                    {option}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={handleSubmit}
                          disabled={
                            hasSubmitted || 
                            Object.keys(selectedAnswers).length < selectedExercise.questions.length
                          }
                          className="w-full"
                        >
                          {hasSubmitted ? "Submitted" : "Check Answers"}
                        </Button>
                      </CardFooter>
                    </Card>
                    
                    {feedback && (
                      <div className="mt-6">
                        <h3 className="text-xl font-display font-medium mb-4">Performance Analysis</h3>
                        <AIFeedback text="" onFeedbackComplete={() => {}} customFeedback={feedback} />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history">
                <Card className="glass-panel">
                  <CardHeader>
                    <CardTitle className="text-lg font-display">Your Listening History</CardTitle>
                    <CardDescription>Track your progress over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-6 text-muted-foreground">
                      <p>Complete listening exercises to see your history and progress here.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ListeningPractice;
