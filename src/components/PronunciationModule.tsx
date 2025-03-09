
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Mic, PlayCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface PronunciationModuleProps {
  phrase: string;
  phonetics?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  onScoreUpdate?: (score: number) => void;
}

const PronunciationModule: React.FC<PronunciationModuleProps> = ({
  phrase,
  phonetics,
  difficulty = 'medium',
  onScoreUpdate
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  
  // Color based on difficulty
  const difficultyColor = {
    easy: 'text-green-500',
    medium: 'text-amber-500',
    hard: 'text-red-500'
  }[difficulty];
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        analyzeAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setScore(null);
      setFeedback(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
    }
  };
  
  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      // In a real implementation, this would call a pronunciation assessment API
      // For demo purposes, we'll simulate analysis with random scores
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate score between 60-95, with bias based on difficulty
      const difficultyFactor = { easy: 15, medium: 0, hard: -15 }[difficulty] || 0;
      const generatedScore = Math.min(95, Math.max(60, 75 + difficultyFactor + (Math.random() * 20)));
      
      // Round to nearest whole number
      const finalScore = Math.round(generatedScore);
      
      setScore(finalScore);
      
      // Generate feedback based on score
      if (finalScore >= 90) {
        setFeedback("Excellent pronunciation! You sound very natural.");
      } else if (finalScore >= 80) {
        setFeedback("Very good pronunciation. Minor improvements could make it perfect.");
      } else if (finalScore >= 70) {
        setFeedback("Good pronunciation. Focus on the stressed syllables more.");
      } else {
        setFeedback("Keep practicing. Try to slow down and focus on each sound.");
      }
      
      // Notify parent component
      if (onScoreUpdate) {
        onScoreUpdate(finalScore);
      }
      
    } catch (err) {
      console.error('Error analyzing audio:', err);
      toast({
        title: "Analysis Error",
        description: "Could not analyze your pronunciation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const playAudio = () => {
    // In a real implementation, this would use a TTS service to play the phrase
    // For demo, we'll use browser's built-in speech synthesis
    const speech = new SpeechSynthesisUtterance(phrase);
    speech.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(speech);
    
    toast({
      title: "Playing Reference Audio",
      description: "Listen carefully to the pronunciation.",
    });
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-xl font-display">Pronunciation Practice</CardTitle>
        <CardDescription>
          <span className={cn("text-xs uppercase font-semibold", difficultyColor)}>
            {difficulty}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/40 text-center">
          <p className="text-lg font-medium mb-1">{phrase}</p>
          {phonetics && <p className="text-sm text-muted-foreground">{phonetics}</p>}
        </div>
        
        <Button 
          variant="outline" 
          className="w-full flex items-center gap-2" 
          onClick={playAudio}
        >
          <Volume2 className="h-4 w-4" />
          Listen to Pronunciation
        </Button>
        
        {score !== null && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Your Score</span>
              <span className={cn("font-semibold", getScoreColor(score))}>
                {score}/100
              </span>
            </div>
            <Progress value={score} className="h-2" />
            {feedback && (
              <p className="text-sm text-muted-foreground mt-2">{feedback}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          variant={isRecording ? "destructive" : "default"}
          className={cn("w-full gap-2", isRecording && "animate-pulse")}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : isRecording ? (
            <>
              <Mic className="h-4 w-4" />
              Stop Recording
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4" />
              Start Practice
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PronunciationModule;
