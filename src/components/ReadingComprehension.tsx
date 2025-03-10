
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BookOpen, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOption: string;
}

interface ReadingComprehensionProps {
  title: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  questions: Question[];
  onComplete?: (score: number) => void;
}

const ReadingComprehension: React.FC<ReadingComprehensionProps> = ({
  title,
  level = 'intermediate',
  content,
  questions,
  onComplete
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showingPassage, setShowingPassage] = useState(true);
  const { toast } = useToast();
  
  const handleAnswerChange = (questionId: string, optionId: string) => {
    if (!submitted) {
      setAnswers(prev => ({
        ...prev,
        [questionId]: optionId
      }));
    }
  };
  
  const handleSubmit = () => {
    // Check if all questions answered
    if (Object.keys(answers).length < questions.length) {
      toast({
        title: "Incomplete",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitted(true);
    
    // Calculate score
    const correctAnswers = questions.filter(q => answers[q.id] === q.correctOption).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    
    if (onComplete) {
      onComplete(score);
    }
    
    toast({
      title: "Quiz Completed",
      description: `Your score: ${score}% (${correctAnswers}/${questions.length})`,
    });
  };
  
  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setShowingPassage(true);
  };
  
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;
  
  // Level color
  const levelColor = {
    beginner: 'text-green-500',
    intermediate: 'text-blue-500',
    advanced: 'text-purple-500'
  }[level];
  
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-display text-xl">{title}</CardTitle>
            <CardDescription>
              Reading Comprehension Exercise
            </CardDescription>
          </div>
          <Badge variant="outline" className={cn(levelColor)}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="flex justify-between mb-4">
          <Button 
            variant={showingPassage ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowingPassage(true)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Reading
          </Button>
          <Button 
            variant={!showingPassage ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowingPassage(false)}
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Questions
          </Button>
        </div>
        
        {showingPassage ? (
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="prose prose-sm max-w-none">
              {content.split('\n').map((paragraph, idx) => (
                <p key={idx} className="mb-4">{paragraph}</p>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-6">
              {questions.map((question, idx) => (
                <div key={question.id} className="space-y-3">
                  <h4 className="font-medium">
                    Question {idx + 1}: {question.text}
                  </h4>
                  <RadioGroup 
                    value={answers[question.id]} 
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  >
                    {question.options.map(option => (
                      <div key={option.id} className="flex items-start space-x-2 p-2 rounded-md hover:bg-muted/40">
                        <RadioGroupItem 
                          value={option.id} 
                          id={`${question.id}-${option.id}`} 
                          disabled={submitted}
                          className="mt-1"
                        />
                        <Label 
                          htmlFor={`${question.id}-${option.id}`}
                          className={cn(
                            "font-normal cursor-pointer",
                            submitted && option.id === question.correctOption && "text-green-600 font-medium",
                            submitted && answers[question.id] === option.id && option.id !== question.correctOption && "text-red-600 line-through"
                          )}
                        >
                          {option.text}
                          {submitted && option.id === question.correctOption && (
                            <CheckCircle className="inline-block ml-2 h-4 w-4 text-green-600" />
                          )}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{answeredCount}/{questions.length} questions</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
      
      <CardFooter className="pt-6">
        {!submitted ? (
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={answeredCount < questions.length}
          >
            Submit Answers
          </Button>
        ) : (
          <Button variant="outline" className="w-full" onClick={resetQuiz}>
            Try Again
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReadingComprehension;
