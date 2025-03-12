
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { audioService } from '@/services/audioService';

interface WordBreakdownProps {
  word: string;
  syllables: string[];
  phonetic: string;
}

const WordBreakdown: React.FC<WordBreakdownProps> = ({ 
  word,
  syllables,
  phonetic
}) => {
  const pronounceWord = () => {
    audioService.speak(word, {
      rate: 0.8, // Slower rate for clarity
      pitch: 1.0,
      volume: 1.0
    });
  };

  const pronounceSyllable = (syllable: string) => {
    audioService.speak(syllable, {
      rate: 0.7, // Even slower for syllables
      pitch: 1.0,
      volume: 1.0
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Word Breakdown</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={pronounceWord}
            className="flex items-center gap-2"
          >
            <Volume2 className="h-4 w-4" />
            Hear Pronunciation
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{word}</h3>
          <p className="text-muted-foreground">{phonetic}</p>
        </div>
        
        <div>
          <h4 className="text-sm uppercase text-muted-foreground mb-3">Syllable Breakdown</h4>
          <div className="flex flex-wrap gap-2">
            {syllables.map((syllable, index) => (
              <Button 
                key={index}
                variant="outline" 
                size="sm"
                onClick={() => pronounceSyllable(syllable)}
                className="flex items-center gap-1"
              >
                {syllable}
                <Volume2 className="h-3 w-3 ml-1" />
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordBreakdown;
