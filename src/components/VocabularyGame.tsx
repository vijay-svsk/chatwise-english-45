
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shuffle, Volume2, ArrowRight, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WordPair {
  id: string;
  word: string;
  definition: string;
}

interface VocabularyGameProps {
  words: WordPair[];
  gameType: 'matching' | 'spelling' | 'choice';
  timeLimit?: number; // in seconds
  onComplete?: (score: number) => void;
}

const VocabularyGame: React.FC<VocabularyGameProps> = ({
  words,
  gameType,
  timeLimit = 120,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<WordPair[]>([]);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [gameActive, setGameActive] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const { toast } = useToast();
  
  // Shuffle words on component mount and when starting new game
  useEffect(() => {
    shuffleWords();
  }, [words]);
  
  // Handle timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && gameActive) {
      handleGameEnd();
    }
    
    return () => clearInterval(interval);
  }, [gameActive, timeRemaining]);
  
  const shuffleWords = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10);
    setShuffledWords(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setTimeRemaining(timeLimit);
    setFeedback(null);
  };
  
  const handleStartGame = () => {
    setGameActive(true);
    shuffleWords();
    toast({
      title: "Game Started",
      description: `You have ${timeLimit} seconds to complete the vocabulary exercise.`,
    });
  };
  
  const handleSubmit = () => {
    const currentWord = shuffledWords[currentIndex];
    const isCorrect = userInput.toLowerCase().trim() === currentWord.definition.toLowerCase().trim();
    
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Clear feedback after a short delay
    setTimeout(() => {
      setFeedback(null);
      setUserInput('');
      
      if (currentIndex < shuffledWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        handleGameEnd();
      }
    }, 1500);
  };
  
  const handleSkip = () => {
    setUserInput('');
    
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      handleGameEnd();
    }
  };
  
  const handleGameEnd = () => {
    setGameActive(false);
    
    if (onComplete) {
      onComplete(score);
    }
    
    const percentage = Math.round((score / shuffledWords.length) * 100);
    
    toast({
      title: "Game Completed",
      description: `Your score: ${score}/${shuffledWords.length} (${percentage}%)`,
    });
  };
  
  // Text to speech for word pronunciation
  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const progress = ((currentIndex + 1) / shuffledWords.length) * 100;
  
  return (
    <Card className="glass-panel">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-display text-xl">Vocabulary Challenge</CardTitle>
            <CardDescription>
              {gameType === 'matching' ? 'Match words with definitions' : 
               gameType === 'spelling' ? 'Spell the word correctly' : 
               'Choose the correct meaning'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-blue-500">
            {formatTime(timeRemaining)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!gameActive ? (
          <div className="p-6 bg-muted/30 rounded-lg text-center space-y-4">
            <Shuffle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Ready to start?</p>
              <p className="text-muted-foreground mt-1">
                Test your vocabulary knowledge with {shuffledWords.length} words
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-muted/40 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Word {currentIndex + 1} of {shuffledWords.length}</span>
                <Button variant="ghost" size="icon" onClick={() => speakWord(shuffledWords[currentIndex].word)}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xl font-semibold text-center">{shuffledWords[currentIndex].word}</p>
            </div>
            
            <div className="relative">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter the definition..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  className={feedback === 'correct' ? "border-green-500 focus-visible:ring-green-500" : 
                           feedback === 'incorrect' ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                <Button onClick={handleSubmit}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {feedback && (
                <div className={`absolute -right-2 -top-2 rounded-full p-1 ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {feedback === 'correct' ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <X className="h-4 w-4 text-white" />
                  )}
                </div>
              )}
              
              {feedback === 'incorrect' && (
                <p className="text-sm text-red-500 mt-2">
                  Correct answer: {shuffledWords[currentIndex].definition}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{currentIndex + 1}/{shuffledWords.length}</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!gameActive ? (
          <Button className="w-full" onClick={handleStartGame}>
            Start Game
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={handleSkip}>
              Skip Word
            </Button>
            <Button variant="destructive" onClick={handleGameEnd}>
              End Game
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default VocabularyGame;
