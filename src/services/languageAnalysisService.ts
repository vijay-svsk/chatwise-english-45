
import { AIFeedbackResult } from '@/components/AIFeedback';
import { GrammarCorrection } from '@/types/database';

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
    rule?: string;
  }[];
  errorPatterns: string[];
  strengths: string[];
}

// Common grammar rules for explanations
const grammarRules = [
  {
    name: "Subject-Verb Agreement",
    pattern: /\b(I|you|we|they)\s+(is|was)\b|\b(he|she|it)\s+(are|were)\b/i,
    explanation: "The verb must agree with the subject in number and person."
  },
  {
    name: "Article Usage",
    pattern: /\ba ([aeiou])/i,
    explanation: "Use 'an' before words that begin with vowel sounds."
  },
  {
    name: "Capitalization",
    pattern: /\bi\b/,
    explanation: "The pronoun 'I' should always be capitalized."
  },
  {
    name: "Verb Tense Consistency",
    pattern: /yesterday.+\b(go|come|eat|drink|do|make)\b/i,
    explanation: "Use past tense for actions that happened in the past."
  },
  {
    name: "Preposition Usage",
    pattern: /\b(arrive|get)\s+to\b/i,
    explanation: "Use 'arrive at' for specific locations and 'arrive in' for larger areas."
  },
  {
    name: "Double Negative",
    pattern: /\b(don't|do not|can't|cannot|won't|will not).*?no\b/i,
    explanation: "Avoid using double negatives as they create a positive meaning."
  },
  {
    name: "Comma Splice",
    pattern: /[a-z],\s+[a-z]/i,
    explanation: "Don't join two independent clauses with just a comma. Use a conjunction, semicolon, or period."
  },
  {
    name: "Possessive Apostrophe",
    pattern: /\b(its|their|your|our|his|her)\s+going\b/i,
    explanation: "Don't confuse possessive pronouns with contractions (e.g., 'its' vs 'it's')."
  }
];

/**
 * Analyze text using the Gemini API (to be implemented on the backend)
 * For now, this provides a structured mock implementation that simulates
 * what we expect from the API
 */
export const analyzeLanguage = async (request: LanguageAnalysisRequest): Promise<LanguageAnalysisResponse> => {
  // In a real implementation, we'd make an API call to our backend
  
  // For now, we'll simulate the API response
  const { text, detailed = false } = request;
  
  // Analyze text for common errors (simplified)
  const commonErrors = [
    { pattern: " i ", type: "grammar", fix: " I ", rule: "Capitalization" },
    { pattern: "your welcome", type: "grammar", fix: "you're welcome", rule: "Possessive vs. Contraction" },
    { pattern: "there house", type: "grammar", fix: "their house", rule: "Homophone Usage" },
    { pattern: "alot", type: "spelling", fix: "a lot", rule: "Compound Words" },
    { pattern: "could of", type: "grammar", fix: "could have", rule: "Verb Form" },
    { pattern: "definately", type: "spelling", fix: "definitely", rule: "Spelling" },
    { pattern: "everyday", type: "grammar", fix: "every day", rule: "Adjective vs. Adverb" },
    { pattern: "less people", type: "grammar", fix: "fewer people", rule: "Less vs. Fewer" },
    { pattern: "me and john", type: "grammar", fix: "John and I", rule: "Pronoun Order" },
    { pattern: "i seen", type: "grammar", fix: "I saw", rule: "Past Participle vs. Simple Past" },
  ];
  
  // Extract sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Generate corrections based on found errors
  const corrections = [];
  
  // Check each sentence for errors
  for (const sentence of sentences) {
    let foundError = false;
    
    // Check for common errors
    for (const error of commonErrors) {
      if (sentence.toLowerCase().includes(error.pattern.toLowerCase())) {
        const ruleName = error.rule;
        const ruleDetails = grammarRules.find(r => r.name === ruleName) || 
                           { name: ruleName, explanation: `This is a common ${error.type} error.` };
                           
        corrections.push({
          original: sentence.trim(),
          corrected: sentence.replace(new RegExp(error.pattern, 'gi'), error.fix).trim(),
          explanation: `This contains a common ${error.type} error. "${error.pattern}" should be "${error.fix}".`,
          rule: ruleName
        });
        
        foundError = true;
        break;
      }
    }
    
    // Check for grammar rule patterns if no common error was found
    if (!foundError && detailed) {
      for (const rule of grammarRules) {
        if (rule.pattern.test(sentence)) {
          corrections.push({
            original: sentence.trim(),
            corrected: sentence.trim(), // We don't have automatic correction for these patterns
            explanation: rule.explanation,
            rule: rule.name
          });
          
          foundError = true;
          break;
        }
      }
    }
  }
  
  // If we don't have any corrections but have text, add some general feedback
  if (corrections.length === 0 && sentences.length > 0) {
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)].trim();
    corrections.push({
      original: randomSentence,
      corrected: randomSentence,
      explanation: "This sentence seems well-formed grammatically.",
      rule: "Correct Usage"
    });
  }
  
  // Mock scores with some variance based on text
  const wordCount = text.split(/\s+/).filter(w => w.trim().length > 0).length;
  const complexWords = text.split(/\s+/).filter(w => w.length > 6).length;
  const complexityRatio = wordCount > 0 ? complexWords / wordCount : 0;
  
  // Simulate scores based on detected errors and text complexity
  const grammarPenalty = corrections.filter(c => c.rule !== "Correct Usage").length * 5;
  const spellingPenalty = corrections.filter(c => c.rule === "Spelling").length * 3;
  
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
    errorPatterns: corrections.map(c => c.rule).filter((v, i, a) => a.indexOf(v) === i),
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

/**
 * Convert API response to database GrammarCorrection format
 */
export const processAnalysisToCorrections = (
  analysisResponse: LanguageAnalysisResponse, 
  sessionId: string
): GrammarCorrection[] => {
  return analysisResponse.corrections.map(correction => ({
    id: '', // Will be set by the database
    sessionId,
    original: correction.original,
    corrected: correction.corrected,
    rule: correction.rule || 'General',
    explanation: correction.explanation
  }));
};
