
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FeedbackCorrection } from '@/types/database';
import { geminiService } from '@/services/geminiService';
import { ScoreDisplay, OverallScoreDisplay } from './feedback/FeedbackScoreDisplay';
import { CorrectionHighlight } from './feedback/CorrectionHighlight';
import { SuggestionsList } from './feedback/SuggestionsList';
import { FeedbackLoadingState } from './feedback/LoadingState';

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
      // Improved prompt for Gemini API
      const analysisPrompt = `You are a professional English language teacher analyzing a student's spoken English. 

Analyze the following English speech transcript and provide detailed feedback:
"${text}"

Return your analysis in JSON format with the following structure:
{
  "pronunciation": [score from 0-100],
  "grammar": [score from 0-100],
  "vocabulary": [score from 0-100],
  "fluency": [score from 0-100],
  "overall": [score from 0-100],
  "suggestions": [array of 3-5 specific improvement suggestions],
  "corrections": [
    {
      "original": [the original problematic phrase or sentence with errors],
      "corrected": [the corrected version],
      "explanation": [brief explanation of the grammar rule or reason for correction],
      "rule": [name of the grammar rule that was violated, if applicable]
    }
  ]
}

Be detailed in your analysis and make sure to identify specific grammar errors in the text. For each error, provide the original text, the corrected version, and an explanation of the grammar rule that was violated.`;

      let feedbackResult: AIFeedbackResult;
      
      const response = await geminiService.generateText({
        prompt: analysisPrompt,
        temperature: 0.2,
        maxTokens: 800
      });
      
      // Try to parse JSON response from Gemini
      try {
        // Find JSON in the response
        const jsonMatch = response.text.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const parsedResponse = JSON.parse(jsonMatch[0]);
          feedbackResult = {
            pronunciation: parsedResponse.pronunciation || 0,
            grammar: parsedResponse.grammar || 0,
            vocabulary: parsedResponse.vocabulary || 0,
            fluency: parsedResponse.fluency || 0,
            overall: parsedResponse.overall || 0,
            suggestions: parsedResponse.suggestions || [],
            corrections: (parsedResponse.corrections || []).map((correction: any) => ({
              original: correction.original || "",
              corrected: correction.corrected || "",
              explanation: correction.explanation || "",
              rule: correction.rule || "Grammar Rule"
            }))
          };
        } else {
          throw new Error("No valid JSON found in response");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", parseError);
        throw new Error("Failed to parse AI feedback");
      }
      
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
  
  // Create a simple mock feedback when API fails
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
  
  return (
    <Card className="glass-panel">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {!feedback ? (
          <FeedbackLoadingState 
            loading={loading} 
            error={error} 
            hasText={!!text.trim()} 
            onGenerate={generateFeedback} 
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <ScoreDisplay label="Pronunciation" score={feedback.pronunciation} />
                <ScoreDisplay label="Grammar" score={feedback.grammar} />
              </div>
              
              <div className="space-y-4">
                <ScoreDisplay label="Vocabulary" score={feedback.vocabulary} />
                <ScoreDisplay label="Fluency" score={feedback.fluency} />
              </div>
            </div>
            
            <OverallScoreDisplay score={feedback.overall} />
            
            <SuggestionsList suggestions={feedback.suggestions} />
            
            {feedback.corrections.some(c => c.original || c.corrected) && (
              <div>
                <h4 className="font-semibold mb-2">Corrections & Analysis</h4>
                <div className="space-y-3 p-3 bg-muted/30 rounded-md">
                  {feedback.corrections.map((correction, i) => (
                    <CorrectionHighlight 
                      key={i}
                      original={correction.original}
                      corrected={correction.corrected}
                      explanation={correction.explanation}
                      rule={correction.rule}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {!customFeedback && !feedback && (
          <div className="w-full">
            {/* Footer content is handled in FeedbackLoadingState */}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default AIFeedback;
