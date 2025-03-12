
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AIFeedbackResult } from '@/components/AIFeedback';

interface GrammarRuleHighlightsProps {
  feedback: AIFeedbackResult | null;
}

export const GrammarRuleHighlights: React.FC<GrammarRuleHighlightsProps> = ({ feedback }) => {
  if (!feedback) return null;
  
  return (
    <Card className="glass-panel mt-6">
      <CardHeader>
        <CardTitle className="text-xl font-display">Grammar Rule Highlights</CardTitle>
        <CardDescription>Learn from the corrections in your speech</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <div className="space-y-4">
            {feedback.corrections.map((correction, index) => (
              <div key={index} className="p-3 rounded-lg border border-border">
                <div className="flex items-start gap-3 mb-2">
                  <Badge variant="outline" className="mt-1 whitespace-nowrap">
                    {correction.rule || "Grammar Rule"}
                  </Badge>
                  <div>
                    <p className="line-through text-muted-foreground">{correction.original}</p>
                    <p className="font-medium text-green-600">{correction.corrected}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{correction.explanation}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
