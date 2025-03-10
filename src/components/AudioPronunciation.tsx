
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, Check, X } from 'lucide-react';
import { audioService } from '@/services/audioService';
import { toast } from '@/hooks/use-toast';

interface AudioPronunciationProps {
  word: string;
  definition?: string;
  onCorrectPronunciation?: () => void;
}

const AudioPronunciation: React.FC<AudioPronunciationProps> = ({ 
  word, 
  definition,
  onCorrectPronunciation 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handlePlayAudio = async () => {
    try {
      await audioService.speak(word);
    } catch (error) {
      console.error('Failed to play audio:', error);
      toast({
        title: "Audio Error",
        description: "Unable to play audio. Please check your browser settings.",
        variant: "destructive"
      });
    }
  };

  const handleStartListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive"
      });
      return;
    }

    setIsListening(true);
    setTranscript('');
    setIsCorrect(null);

    // @ts-ignore - SpeechRecognition API is not fully typed
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.toLowerCase();
      setTranscript(speechResult);
      
      // Compare with the target word (simple comparison for now)
      const wordLower = word.toLowerCase();
      const isMatch = speechResult.includes(wordLower) || 
                     wordLower.includes(speechResult) ||
                     levenshteinDistance(speechResult, wordLower) <= 2;
      
      setIsCorrect(isMatch);
      
      if (isMatch) {
        audioService.playSuccessSound();
        if (onCorrectPronunciation) {
          onCorrectPronunciation();
        }
      } else {
        audioService.playErrorSound();
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
      toast({
        title: "Recognition Error",
        description: `Error: ${event.error}. Please try again.`,
        variant: "destructive"
      });
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  // Helper function to compare words with typos
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) {
      matrix[i][0] = i;
    }

    for (let j = 0; j <= b.length; j++) {
      matrix[0][j] = j;
    }

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + substitutionCost // substitution
        );
      }
    }

    return matrix[a.length][b.length];
  };

  return (
    <div className="p-4 rounded-md border border-border">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-medium">{word}</h3>
          {definition && <p className="text-sm text-muted-foreground">{definition}</p>}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlayAudio}
            aria-label="Listen to pronunciation"
          >
            <Volume2 className="h-4 w-4 mr-1" />
            Listen
          </Button>
          <Button
            variant={isListening ? "destructive" : "default"}
            size="sm"
            onClick={handleStartListening}
            disabled={isListening}
            aria-label="Practice pronunciation"
          >
            <Mic className="h-4 w-4 mr-1" />
            {isListening ? "Listening..." : "Speak"}
          </Button>
        </div>
      </div>
      
      {transcript && (
        <div className="mt-3">
          <p className="text-sm font-medium">Your pronunciation:</p>
          <div className="flex items-center gap-2 mt-1">
            <div className={`p-2 rounded-md flex-1 text-sm ${
              isCorrect === true ? 'bg-green-100 dark:bg-green-900/20' : 
              isCorrect === false ? 'bg-red-100 dark:bg-red-900/20' : 
              'bg-muted'
            }`}>
              {transcript}
            </div>
            {isCorrect === true && <Check className="text-green-500 h-5 w-5" />}
            {isCorrect === false && <X className="text-red-500 h-5 w-5" />}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPronunciation;
