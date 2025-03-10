
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, PenLine, Clock3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WritingExerciseProps {
  prompt: string;
  type: 'essay' | 'response' | 'creative';
  timeLimit?: number; // in minutes
  minWords?: number;
  onComplete?: (text: string) => void;
}

const WritingExercise: React.FC<WritingExerciseProps> = ({
  prompt,
  type,
  timeLimit = 15,
  minWords = 100,
  onComplete
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // in seconds
  const [timerActive, setTimerActive] = useState(false);
  const { toast } = useToast();
  
  // Calculate word count
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const progress = Math.min(100, (wordCount / minWords) * 100);
  
  // Handle timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      setTimerActive(false);
      toast({
        title: "Time's up!",
        description: "Your writing time has ended.",
      });
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining, toast]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const handleStart = () => {
    setIsStarted(true);
    setTimerActive(true);
    toast({
      title: "Exercise started",
      description: `You have ${timeLimit} minutes to complete this writing task.`,
    });
  };
  
  const handleSubmit = () => {
    if (wordCount < minWords) {
      toast({
        title: "More words needed",
        description: `Please write at least ${minWords} words. You currently have ${wordCount}.`,
        variant: "destructive"
      });
      return;
    }
    
    setIsCompleted(true);
    setTimerActive(false);
    
    if (onComplete) {
      onComplete(text);
    }
    
    toast({
      title: "Writing submitted",
      description: "Your writing has been submitted successfully!",
    });
  };
  
  const typeLabel = {
    essay: "Essay Writing",
    response: "Response Writing",
    creative: "Creative Writing"
  }[type];
  
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-display text-xl">{isStarted ? (title || "Untitled") : typeLabel}</CardTitle>
            <CardDescription>
              {isStarted ? `${wordCount} words (minimum: ${minWords})` : prompt}
            </CardDescription>
          </div>
          <Badge variant={isStarted ? "secondary" : "outline"}>
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(timeRemaining)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isStarted ? (
          <>
            {type === 'essay' && !isCompleted && (
              <Input 
                placeholder="Enter a title for your essay" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mb-4"
              />
            )}
            
            <div className="relative">
              <Textarea 
                placeholder="Start writing here..." 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-y"
                disabled={isCompleted}
              />
              
              {isCompleted && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center rounded-md backdrop-blur-sm">
                  <div className="bg-background p-4 rounded-lg shadow-lg text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="font-medium">Submitted successfully!</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{wordCount}/{minWords} words</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </>
        ) : (
          <div className="p-6 bg-muted/30 rounded-lg text-center space-y-4">
            <PenLine className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">{typeLabel}</p>
              <p className="text-muted-foreground mt-1">
                Write at least {minWords} words in {timeLimit} minutes
              </p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        {!isStarted ? (
          <Button className="w-full" onClick={handleStart}>
            Start Writing
          </Button>
        ) : !isCompleted ? (
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={wordCount < minWords}
          >
            Submit Writing
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setIsStarted(false);
              setIsCompleted(false);
              setText('');
              setTitle('');
              setTimeRemaining(timeLimit * 60);
            }}
          >
            Start New Exercise
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WritingExercise;
