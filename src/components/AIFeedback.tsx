
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIFeedbackProps {
  text: string;
  onFeedbackComplete?: (feedback: AIFeedbackResult) => void;
  title?: string;
  description?: string;
}

export interface AIFeedbackResult {
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  overall: number;
  suggestions: string[];
  corrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
}

const AIFeedback: React.FC<AIFeedbackProps> = ({
  text,
  onFeedbackComplete,
  title = "AI Feedback",
  description = "Get analysis and improvements for your speech"
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedbackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const generateFeedback = async () => {
    if (!text.trim()) {
      setError("No text to analyze. Please record your speech first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // This is a mock implementation since we don't have an actual API
      // In a real implementation, you would call your backend API:
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text })
      // });
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock response
      const mockFeedback: AIFeedbackResult = {
        pronunciation: Math.floor(Math.random() * 30) + 70, // 70-100
        grammar: Math.floor(Math.random() * 30) + 70,
        vocabulary: Math.floor(Math.random() * 30) + 70,
        fluency: Math.floor(Math.random() * 30) + 70,
        overall: Math.floor(Math.random() * 30) + 70,
        suggestions: [
          "Try to speak a bit more slowly to improve clarity.",
          "Practice using more varied vocabulary.",
          "Work on sentence stress patterns to sound more natural."
        ],
        corrections: [
          {
            original: text.split(' ').slice(0, 3).join(' '),
            corrected: text.split(' ').slice(0, 3).join(' '),
            explanation: "This part was well-formed."
          }
        ]
      };
      
      setFeedback(mockFeedback);
      
      if (onFeedbackComplete) {
        onFeedbackComplete(mockFeedback);
      }
    } catch (err) {
      console.error('Error generating feedback', err);
      setError("Failed to generate feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };
  
  const getFeedbackColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
            {error}
          </div>
        )}
        
        {!feedback ? (
          <div className="text-center p-6">
            <Lightbulb className="h-12 w-12 mx-auto text-primary/60 mb-4" />
            <p className="text-muted-foreground">
              {text.trim() 
                ? "Click 'Generate Feedback' to analyze your speech." 
                : "Record your speech first, then generate AI feedback."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Pronunciation</div>
                  <div className="flex items-center">
                    <div className="w-full bg-secondary rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${feedback.pronunciation}%` }}
                      />
                    </div>
                    <span className={cn("text-sm font-semibold", getFeedbackColor(feedback.pronunciation))}>
                      {feedback.pronunciation}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Grammar</div>
                  <div className="flex items-center">
                    <div className="w-full bg-secondary rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${feedback.grammar}%` }}
                      />
                    </div>
                    <span className={cn("text-sm font-semibold", getFeedbackColor(feedback.grammar))}>
                      {feedback.grammar}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-1">Vocabulary</div>
                  <div className="flex items-center">
                    <div className="w-full bg-secondary rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${feedback.vocabulary}%` }}
                      />
                    </div>
                    <span className={cn("text-sm font-semibold", getFeedbackColor(feedback.vocabulary))}>
                      {feedback.vocabulary}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Fluency</div>
                  <div className="flex items-center">
                    <div className="w-full bg-secondary rounded-full h-2 mr-2">
                      <div 
                        className="bg-primary rounded-full h-2" 
                        style={{ width: `${feedback.fluency}%` }}
                      />
                    </div>
                    <span className={cn("text-sm font-semibold", getFeedbackColor(feedback.fluency))}>
                      {feedback.fluency}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-1">Overall Score</div>
              <div className="flex items-center">
                <div className="w-full bg-secondary rounded-full h-3 mr-2">
                  <div 
                    className="bg-primary rounded-full h-3" 
                    style={{ width: `${feedback.overall}%` }}
                  />
                </div>
                <span className={cn("text-lg font-semibold", getFeedbackColor(feedback.overall))}>
                  {feedback.overall}
                </span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Suggestions for Improvement</h4>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-sm">{suggestion}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateFeedback} 
          disabled={loading || !text.trim()} 
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4" />
              Generate Feedback
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIFeedback;
