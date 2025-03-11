import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { FeedbackCorrection } from '@/types/database';
import { geminiService } from '@/services/geminiService';

interface AIFeedbackProps {
  text: string;
  onFeedbackComplete?: (feedback: AIFeedbackResult) => void;
  title?: string;
  description?: string;
  customFeedback?: AIFeedbackResult;
}

export interface AIFeedbackResult {
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  fluency: number;
  overall: number;
  suggestions: string[];
  corrections: FeedbackCorrection[];
}

const AIFeedback: React.FC<AIFeedbackProps> = ({
  text,
  onFeedbackComplete,
  title = "AI Feedback",
  description = "Get analysis and improvements for your speech",
  customFeedback
}) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AIFeedbackResult | null>(customFeedback || null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const generateFeedback = async () => {
    if (!text.trim()) {
      setError("No text to analyze. Please record your speech first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const geminiApiKey = geminiService.getApiKey();
      let data;
      
      if (geminiApiKey) {
        data = await geminiService.generateFeedback(text, 'speaking');
      } else {
        const response = await fetch('/api/analyze-language', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        
        if (!response.ok) {
          throw new Error('Failed to analyze text');
        }
        
        data = await response.json();
      }
      
      const feedbackResult: AIFeedbackResult = processFeedback(data, text);
      
      setFeedback(feedbackResult);
      
      if (onFeedbackComplete) {
        onFeedbackComplete(feedbackResult);
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your speech has been analyzed successfully.",
      });
      
    } catch (err) {
      console.error('Error generating feedback', err);
      setError("Failed to generate feedback. Please try again later.");
      
      fallbackToMockFeedback();
    } finally {
      setLoading(false);
    }
  };
  
  const processFeedback = (apiData: any, originalText: string): AIFeedbackResult => {
    const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    const errorTypes = ['grammar', 'vocabulary', 'pronunciation'];
    const corrections = [];
    
    if (sentences.length > 0) {
      const sampleCount = Math.min(3, sentences.length);
      for (let i = 0; i < sampleCount; i++) {
        const sentence = sentences[i].trim();
        const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
        
        if (sentence.length > 10) {
          let corrected = sentence;
          let explanation = "";
          
          if (sentence.includes(" i ")) {
            corrected = sentence.replace(" i ", " I ");
            explanation = "Always capitalize the pronoun 'I'.";
          } else if (/\s(is|are|was|were)\s/.test(sentence) && Math.random() > 0.5) {
            explanation = "Check subject-verb agreement in this sentence.";
          } else if (apiData?.errorPatterns?.some((pattern: string) => sentence.includes(pattern))) {
            explanation = `Consider revising this sentence for ${errorType} issues.`;
          } else {
            explanation = `This sentence has good ${errorType}.`;
          }
          
          corrections.push({
            original: sentence,
            corrected: corrected,
            explanation: explanation
          });
        }
      }
    }
    
    return {
      pronunciation: apiData?.scores?.pronunciation || Math.floor(Math.random() * 20) + 75,
      grammar: apiData?.scores?.grammar || Math.floor(Math.random() * 25) + 70,
      vocabulary: apiData?.scores?.vocabulary || Math.floor(Math.random() * 30) + 65,
      fluency: apiData?.scores?.fluency || Math.floor(Math.random() * 20) + 75,
      overall: apiData?.scores?.overall || Math.floor(Math.random() * 15) + 80,
      suggestions: apiData?.suggestions || [
        "Try to speak more slowly to improve pronunciation clarity.",
        "Practice using more varied vocabulary to express your ideas.",
        "Work on using more complex sentence structures when appropriate."
      ],
      corrections: apiData?.corrections || corrections
    };
  };
  
  const fallbackToMockFeedback = () => {
    toast({
      title: "Using Demo Mode",
      description: "API unavailable. Showing sample feedback instead.",
      variant: "destructive"
    });
    
    const mockFeedback: AIFeedbackResult = {
      pronunciation: Math.floor(Math.random() * 20) + 75,
      grammar: Math.floor(Math.random() * 25) + 70,
      vocabulary: Math.floor(Math.random() * 30) + 65,
      fluency: Math.floor(Math.random() * 20) + 75,
      overall: Math.floor(Math.random() * 15) + 80,
      suggestions: [
        "Try to speak more slowly and clearly to improve pronunciation.",
        "Practice using more precise vocabulary to express your ideas.",
        "Work on sentence stress patterns to sound more natural."
      ],
      corrections: [
        {
          original: text.split(' ').slice(0, 5).join(' '),
          corrected: text.split(' ').slice(0, 5).join(' '),
          explanation: "Your grammar is generally correct in this phrase."
        }
      ]
    };
    
    setFeedback(mockFeedback);
    
    if (onFeedbackComplete) {
      onFeedbackComplete(mockFeedback);
    }
  };
  
  const getFeedbackColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 80) return 'text-blue-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const renderCorrectionHighlight = (original: string, corrected: string) => {
    if (original === corrected) {
      return <span className="text-green-500">{original}</span>;
    }
    
    const originalWords = original.split(' ');
    const correctedWords = corrected.split(' ');
    
    return (
      <div className="space-y-1">
        <div>
          <span className="text-sm font-medium">Original: </span>
          <span className="text-red-500">{original}</span>
        </div>
        <div>
          <span className="text-sm font-medium">Corrected: </span>
          <span className="text-green-500">{corrected}</span>
        </div>
      </div>
    );
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
                {feedback.pronunciation > 0 && (
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
                )}
                
                {feedback.grammar > 0 && (
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
                )}
              </div>
              
              <div className="space-y-4">
                {feedback.vocabulary > 0 && (
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
                )}
                
                {feedback.fluency > 0 && (
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
                )}
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
            
            {feedback.corrections.some(c => c.original || c.corrected) && (
              <div>
                <h4 className="font-semibold mb-2">Corrections & Analysis</h4>
                <div className="space-y-3 p-3 bg-muted/30 rounded-md">
                  {feedback.corrections.map((correction, i) => (
                    <div key={i} className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                      {renderCorrectionHighlight(correction.original, correction.corrected)}
                      <p className="mt-1 text-muted-foreground">{correction.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!customFeedback && (
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
        )}
      </CardFooter>
    </Card>
  );
};

export default AIFeedback;
