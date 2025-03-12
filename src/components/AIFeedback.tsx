
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
        
        // Extract whatever useful information we can from the text response
        const responseText = response.text;
        
        // Fallback to manually extracting information from the text
        feedbackResult = {
          pronunciation: extractScore(responseText, "pronunciation") || 75,
          grammar: extractScore(responseText, "grammar") || 70,
          vocabulary: extractScore(responseText, "vocabulary") || 80,
          fluency: extractScore(responseText, "fluency") || 75,
          overall: extractScore(responseText, "overall") || 75,
          suggestions: extractSuggestions(responseText),
          corrections: extractCorrections(responseText, text)
        };
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
  
  // Helper functions to extract information from text responses
  const extractScore = (text: string, category: string): number | null => {
    const regex = new RegExp(`${category}[^0-9]*([0-9]+)`, 'i');
    const match = text.match(regex);
    if (match && match[1]) {
      const score = parseInt(match[1], 10);
      return score >= 0 && score <= 100 ? score : null;
    }
    return null;
  };
  
  const extractSuggestions = (text: string): string[] => {
    const suggestions: string[] = [];
    
    // Try to find a suggestions/improvements section
    const suggestionsSection = text.match(/suggestions?:?\s*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i);
    
    if (suggestionsSection && suggestionsSection[1]) {
      // Split by numbered points or bullet points
      const items = suggestionsSection[1].split(/\n\s*[\d\.\-\*]\s*/);
      
      for (const item of items) {
        const cleaned = item.trim();
        if (cleaned && cleaned.length > 10) {
          suggestions.push(cleaned);
        }
      }
    }
    
    // If we couldn't find structured suggestions, look for sentences with suggestion keywords
    if (suggestions.length < 2) {
      const sentences = text.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (
          /should|try to|improve|practice|consider|recommend/i.test(sentence) && 
          sentence.length > 15 && 
          !suggestions.includes(sentence.trim())
        ) {
          suggestions.push(sentence.trim());
        }
      }
    }
    
    // Still need more suggestions?
    if (suggestions.length < 3) {
      suggestions.push("Practice speaking more clearly and at a moderate pace.");
      suggestions.push("Work on your grammar by reading English texts aloud.");
      suggestions.push("Expand your vocabulary by learning new words and using them in sentences.");
    }
    
    return suggestions.slice(0, 5); // Return up to 5 suggestions
  };
  
  const extractCorrections = (text: string, originalText: string): FeedbackCorrection[] => {
    const corrections: FeedbackCorrection[] = [];
    
    // Split original text into sentences for analysis
    const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    // Look for correction patterns in the text
    const correctionMatches = text.match(/(?:incorrect|error|mistake|should be)[^.!?]*?["']([^"']+)["'][^.!?]*?["']([^"']+)["']/gi);
    
    if (correctionMatches) {
      for (const match of correctionMatches) {
        // Extract original and corrected text
        const parts = match.match(/["']([^"']+)["'][^.!?]*?["']([^"']+)["']/i);
        
        if (parts && parts.length >= 3) {
          corrections.push({
            original: parts[1],
            corrected: parts[2],
            explanation: match.replace(parts[0], "").trim(),
            rule: determineGrammarRule(match)
          });
        }
      }
    }
    
    // If no corrections found, try another approach with original sentences
    if (corrections.length === 0 && sentences.length > 0) {
      // Identify some potential grammar issues in the original text
      for (const sentence of sentences) {
        if (sentence.trim().length < 10) continue;
        
        // Check for common errors
        if (/ i /.test(sentence)) {
          corrections.push({
            original: sentence,
            corrected: sentence.replace(/ i /g, " I "),
            explanation: "Always capitalize the pronoun 'I'.",
            rule: "Capitalization"
          });
        } else if (/\b(is|are|was|were|has|have|do|does|did)\b/i.test(sentence)) {
          // Check for potential subject-verb agreement issues
          corrections.push({
            original: sentence,
            corrected: sentence,
            explanation: "Check for subject-verb agreement in this sentence.",
            rule: "Subject-Verb Agreement"
          });
        }
      }
    }
    
    // Still no corrections? Add at least one general feedback
    if (corrections.length === 0 && sentences.length > 0) {
      corrections.push({
        original: sentences[0],
        corrected: sentences[0],
        explanation: "Your grammar is generally correct in this phrase, but try to speak more clearly.",
        rule: "Pronunciation"
      });
    }
    
    return corrections;
  };
  
  const determineGrammarRule = (text: string): string => {
    const rules = [
      { pattern: /tense/i, name: "Verb Tense" },
      { pattern: /plural|singular/i, name: "Plural/Singular" },
      { pattern: /article|a|an|the/i, name: "Articles" },
      { pattern: /preposition|in|on|at/i, name: "Prepositions" },
      { pattern: /subject.+verb|verb.+subject/i, name: "Subject-Verb Agreement" },
      { pattern: /pronoun/i, name: "Pronouns" },
      { pattern: /capital/i, name: "Capitalization" },
      { pattern: /word order/i, name: "Word Order" },
      { pattern: /conditional/i, name: "Conditionals" },
      { pattern: /passive|active/i, name: "Active/Passive Voice" }
    ];
    
    for (const rule of rules) {
      if (rule.pattern.test(text)) {
        return rule.name;
      }
    }
    
    return "Grammar Rule";
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
