
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
        <div>
          <h4 className="text-sm uppercase text-muted-foreground mb-1">Meaning</h4>
          <p>{meaning}</p>
        </div>
        
        {rootWord && (
          <div>
            <h4 className="text-sm uppercase text-muted-foreground mb-1">Root Word</h4>
            <p>{rootWord}</p>
          </div>
        )}
        
        {opposite && (
          <div>
            <h4 className="text-sm uppercase text-muted-foreground mb-1">Opposite</h4>
            <p>{opposite}</p>
          </div>
        )}
        
        <div>
          <h4 className="text-sm uppercase text-muted-foreground mb-1">Examples</h4>
          <ul className="list-disc pl-5 space-y-1">
            {examples.map((example, index) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default WordDetails;
