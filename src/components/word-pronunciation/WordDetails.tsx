
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WordDetailsProps {
  meaning: string;
  grammar: string;
  opposite?: string;
  rootWord?: string;
  examples: string[];
}

const WordDetails: React.FC<WordDetailsProps> = ({
  meaning,
  grammar,
  opposite,
  rootWord,
  examples
}) => {
  // Function to highlight the word in example sentences
  const highlightWord = (sentence: string, word: string) => {
    // Create a regex that matches the word case-insensitively
    const regex = new RegExp(`(\\b${word}\\w*\\b)`, 'gi');
    
    // Split the sentence by the regex and map to add highlighting
    const parts = sentence.split(regex);
    
    return (
      <>
        {parts.map((part, i) => {
          if (part.toLowerCase().includes(word.toLowerCase())) {
            return <span key={i} className="font-medium text-primary">{part}</span>;
          }
          return part;
        })}
      </>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          Word Details
          <Badge variant="outline" className="ml-2 font-normal">
            {grammar}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-muted/50 rounded-md">
          <h4 className="text-sm uppercase text-muted-foreground mb-1">Meaning</h4>
          <p>{meaning}</p>
        </div>
        
        {rootWord && (
          <div className="flex gap-4 items-center">
            <div className="min-w-24">
              <h4 className="text-sm uppercase text-muted-foreground mb-1">Root Word</h4>
              <Badge variant="secondary" className="text-sm font-normal">{rootWord}</Badge>
            </div>
            
            <div className="flex-1 border-l-2 border-muted pl-4">
              <p className="text-sm text-muted-foreground">
                Understanding the root word can help with recognizing related words and their meanings.
              </p>
            </div>
          </div>
        )}
        
        {opposite && (
          <div className="flex gap-4 items-center">
            <div className="min-w-24">
              <h4 className="text-sm uppercase text-muted-foreground mb-1">Opposite</h4>
              <Badge variant="outline" className="text-sm font-normal">{opposite}</Badge>
            </div>
            
            <div className="flex-1 border-l-2 border-muted pl-4">
              <p className="text-sm text-muted-foreground">
                Learning opposites helps to better understand word meanings and expand vocabulary.
              </p>
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm uppercase text-muted-foreground mb-2">Examples</h4>
          <ul className="list-none space-y-2">
            {examples.map((example, index) => (
              <li key={index} className="p-2 border-l-4 border-primary/30 pl-3 bg-background rounded">
                {highlightWord(example, rootWord || '')}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordDetails;
