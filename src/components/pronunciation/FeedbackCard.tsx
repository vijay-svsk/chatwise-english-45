
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, AlertCircle, Volume2 } from 'lucide-react';
import { audioService } from '@/services/audioService';

interface PronunciationFeedback {
  score: number;
  correctSounds: string[];
  incorrectSounds: string[];
  tips: string[];
  feedback: string;
  commonErrors: {
    description: string;
    correction: string;
  }[];
}

interface FeedbackCardProps {
  feedback: PronunciationFeedback;
  word: string;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, word }) => {
  const scoreColor = 
    feedback.score >= 90 ? 'text-green-500' :
    feedback.score >= 75 ? 'text-blue-500' :
    feedback.score >= 60 ? 'text-amber-500' : 'text-red-500';
  
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Your Pronunciation Results</h3>
        <span className={`text-xl font-bold ${scoreColor}`}>{feedback.score}/100</span>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="mb-2">{feedback.feedback}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {feedback.correctSounds.length > 0 && (
            <div className="bg-green-500/10 p-3 rounded-md border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Check className="h-4 w-4 text-green-500" />
                <h4 className="font-medium">Correct Sounds</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.correctSounds.map((sound, i) => (
                  <li key={i} className="text-sm">{sound}</li>
                ))}
              </ul>
            </div>
          )}
          
          {feedback.incorrectSounds.length > 0 && (
            <div className="bg-red-500/10 p-3 rounded-md border border-red-500/20">
              <div className="flex items-center gap-2 mb-2">
                <X className="h-4 w-4 text-red-500" />
                <h4 className="font-medium">Sounds to Improve</h4>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.incorrectSounds.map((sound, i) => (
                  <li key={i} className="text-sm">{sound}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium">Tips for Improvement</h4>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {feedback.tips.map((tip, i) => (
              <li key={i} className="text-sm">{tip}</li>
            ))}
          </ul>
        </div>
        
        {feedback.commonErrors.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="font-medium mb-2">Common Errors to Watch For</h4>
            <div className="space-y-3">
              {feedback.commonErrors.map((error, i) => (
                <div key={i} className="bg-background p-3 rounded-md">
                  <p className="text-sm font-medium text-muted-foreground">{error.description}</p>
                  <p className="text-sm mt-1">{error.correction}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-center">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => {
              audioService.speak(word, { rate: 0.8, pitch: 1.0, volume: 1.0 });
            }}
          >
            <Volume2 className="h-4 w-4" />
            Hear Correct Pronunciation
          </Button>
        </div>
      </div>
    </div>
  );
};
