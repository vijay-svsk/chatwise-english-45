
import { AIFeedbackResult } from '@/components/AIFeedback';

export interface LanguageAnalysisRequest {
  text: string;
  model?: string;
  detailed?: boolean;
}

export interface LanguageAnalysisResponse {
  scores: {
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    fluency: number;
    overall: number;
  };
  suggestions: string[];
  corrections: {
    original: string;
    corrected: string;
    explanation: string;
  }[];
  errorPatterns: string[];
  strengths: string[];
}

/**
 * Analyze text using the Gemini API (to be implemented on the backend)
 * For now, this provides a structured mock implementation that simulates
 * what we expect from the API
 */
export const analyzeLanguage = async (request: LanguageAnalysisRequest): Promise<LanguageAnalysisResponse> => {
  // In a real implementation, we'd make an API call to our backend:
  // return fetch('/api/analyze-language', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(request)
  // }).then(res => {
  //   if (!res.ok) throw new Error('Failed to analyze language');
  //   return res.json();
  // });
  
  // For now, we'll simulate the API response
  const { text, detailed = false } = request;
  
  // Analyze text for common errors (simplified)
  const commonErrors = [
    { pattern: " i ", type: "grammar", fix: " I " },
    { pattern: "your welcome", type: "grammar", fix: "you're welcome" },
    { pattern: "there house", type: "grammar", fix: "their house" },
    { pattern: "alot", type: "spelling", fix: "a lot" },
    { pattern: "could of", type: "grammar", fix: "could have" },
    { pattern: "definately", type: "spelling", fix: "definitely" },
  ];
  
  // Check for error patterns in text
  const foundErrors = commonErrors.filter(error => 
    text.toLowerCase().includes(error.pattern.toLowerCase())
  );
  
  // Extract sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Generate corrections based on found errors
  const corrections = foundErrors.map(error => {
    // Find the sentence containing this error
    const relevantSentence = sentences.find(sentence => 
      sentence.toLowerCase().includes(error.pattern.toLowerCase())
    ) || error.pattern;
    
    return {
      original: relevantSentence.trim(),
      corrected: relevantSentence.replace(new RegExp(error.pattern, 'gi'), error.fix).trim(),
      explanation: `This contains a common ${error.type} error. "${error.pattern}" should be "${error.fix}".`
    };
  });
  
  // If we don't have any corrections but have text, add some general feedback
  if (corrections.length === 0 && sentences.length > 0) {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
    corrections.push({
      original: randomSentence,
      corrected: randomSentence,
      explanation: "This sentence seems well-formed grammatically."
    });
  }
  
  // Mock scores with some variance based on text
  const wordCount = text.split(/\s+/).filter(w => w.trim().length > 0).length;
  const complexWords = text.split(/\s+/).filter(w => w.length > 6).length;
  const complexityRatio = wordCount > 0 ? complexWords / wordCount : 0;
  
  // Simulate scores based on detected errors and text complexity
  const grammarPenalty = foundErrors.filter(e => e.type === "grammar").length * 5;
  const spellingPenalty = foundErrors.filter(e => e.type === "spelling").length * 3;
  
  const mockResponse: LanguageAnalysisResponse = {
    scores: {
      pronunciation: Math.min(95, Math.max(70, 85 - spellingPenalty + Math.random() * 10)),
      grammar: Math.min(95, Math.max(70, 88 - grammarPenalty + Math.random() * 7)),
      vocabulary: Math.min(95, Math.max(65, 75 + complexityRatio * 50 + Math.random() * 10)),
      fluency: Math.min(95, Math.max(70, 80 + (wordCount > 30 ? 10 : 0) + Math.random() * 5)),
      overall: 0, // To be calculated
    },
    suggestions: [],
    corrections,
    errorPatterns: foundErrors.map(e => e.pattern),
    strengths: [],
  };
  
  // Determine overall score as weighted average
  mockResponse.scores.overall = Math.round(
    (mockResponse.scores.pronunciation * 0.2) +
    (mockResponse.scores.grammar * 0.3) +
    (mockResponse.scores.vocabulary * 0.3) +
    (mockResponse.scores.fluency * 0.2)
  );
  
  // Generate personalized suggestions
  if (mockResponse.scores.grammar < 80) {
    mockResponse.suggestions.push("Focus on basic grammar rules such as subject-verb agreement and proper use of articles.");
  }
  
  if (mockResponse.scores.vocabulary < 80) {
    mockResponse.suggestions.push("Try to incorporate more varied vocabulary. Read more to expand your word choices.");
  }
  
  if (mockResponse.scores.pronunciation < 80) {
    mockResponse.suggestions.push("Practice speaking more slowly and clearly. Focus on difficult sounds in English.");
  }
  
  if (mockResponse.scores.fluency < 80) {
    mockResponse.suggestions.push("Practice speaking regularly to improve your fluency. Try to reduce pauses between words.");
  }
  
  // Add general suggestions if we don't have specific ones
  if (mockResponse.suggestions.length === 0) {
    mockResponse.suggestions = [
      "Continue practicing regularly to maintain your skills.",
      "Try more complex topics to challenge your vocabulary.",
      "Record yourself speaking to analyze your own pronunciation patterns."
    ];
  }
  
  // Identify strengths
  const strengths = [];
  if (mockResponse.scores.grammar > 85) strengths.push("grammar");
  if (mockResponse.scores.vocabulary > 85) strengths.push("vocabulary");
  if (mockResponse.scores.pronunciation > 85) strengths.push("pronunciation");
  if (mockResponse.scores.fluency > 85) strengths.push("fluency");
  
  if (strengths.length > 0) {
    mockResponse.strengths = strengths.map(s => 
      `Your ${s} is quite strong. Keep maintaining this skill.`
    );
  }
  
  return mockResponse;
};

/**
 * Process raw API response into a format compatible with our UI
 */
export const processAnalysisToFeedback = (analysisResponse: LanguageAnalysisResponse): AIFeedbackResult => {
  return {
    pronunciation: analysisResponse.scores.pronunciation,
    grammar: analysisResponse.scores.grammar,
    vocabulary: analysisResponse.scores.vocabulary,
    fluency: analysisResponse.scores.fluency,
    overall: analysisResponse.scores.overall,
    suggestions: [
      ...analysisResponse.suggestions,
      ...analysisResponse.strengths
    ].slice(0, 5), // Limit to 5 suggestions
    corrections: analysisResponse.corrections.slice(0, 3) // Limit to 3 corrections
  };
};
