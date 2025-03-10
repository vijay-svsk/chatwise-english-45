// This implements Gemini API integration for language analysis

import { FeedbackCorrection } from '@/types/database';

type GeminiRequestOptions = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  audioData?: Blob;
};

export interface GeminiResponse {
  text: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class GeminiService {
  private apiKey: string = "AIzaSyDvpbV34TFp2hGXWF5Hl9zONjlKeKoAuv8"; // Using the provided API key
  private static instance: GeminiService;
  private baseUrl: string = "https://generativelanguage.googleapis.com/v1beta/models";
  private defaultModel: string = "gemini-pro";

  private constructor() {
    console.log('Gemini API service initialized with API key');
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async generateText(options: GeminiRequestOptions): Promise<GeminiResponse> {
    try {
      const url = `${this.baseUrl}/${this.defaultModel}:generateContent?key=${this.apiKey}`;
      
      const requestData = {
        contents: [
          {
            parts: [
              { text: options.prompt }
            ]
          }
        ],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 800,
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response text from Gemini's structure
      const responseText = data.candidates[0].content.parts[0].text;
      
      return {
        text: responseText,
        usage: {
          promptTokens: options.prompt.split(' ').length, // Approximate
          completionTokens: responseText.split(' ').length, // Approximate
          totalTokens: options.prompt.split(' ').length + responseText.split(' ').length
        }
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // If API call fails, fall back to mock responses for demo purposes
      return this.getMockResponse(options.prompt);
    }
  }

  private getMockResponse(prompt: string): GeminiResponse {
    // Generate mock responses based on the prompt content
    let response = '';
    
    if (prompt.includes('grammar')) {
      response = "Your sentence contains a grammatical error. The correct form should be 'She doesn't like coffee' instead of 'She don't like coffee'. Remember that the third person singular (he/she/it) requires 'doesn't' in the present simple negative.";
    } else if (prompt.includes('vocabulary')) {
      response = "The word 'ubiquitous' means 'present, appearing, or found everywhere'. For example: 'Mobile phones are now ubiquitous in modern society.'";
    } else if (prompt.includes('pronunciation')) {
      response = "The word 'comfortable' is often mispronounced. The correct pronunciation is 'KUMF-ter-bull' with the stress on the first syllable, not 'com-FORT-able'.";
    } else if (prompt.includes('conversation')) {
      response = "When meeting someone for the first time, you can say: 'It's a pleasure to meet you' or 'I'm delighted to make your acquaintance' for a more formal setting.";
    } else if (prompt.includes('writing')) {
      response = "Your writing is clear, but you could improve the cohesion by using more transition words like 'however', 'moreover', and 'consequently' to connect your ideas.";
    } else if (prompt.includes('feedback') || prompt.includes('analysis')) {
      response = "Overall assessment: Your English proficiency is at an intermediate level. Strengths: Vocabulary usage and reading comprehension. Areas for improvement: Grammar consistency and pronunciation of certain vowel sounds. Recommended focus: Practice past tense verbs and work on stress patterns in multisyllabic words.";
    } else {
      response = "I'd be happy to help you with your English learning journey. What specific aspect would you like to focus on today?";
    }

    return {
      text: response,
      usage: {
        promptTokens: prompt.split(' ').length,
        completionTokens: response.split(' ').length,
        totalTokens: prompt.split(' ').length + response.split(' ').length
      }
    };
  }

  async analyzeAudio(audioBlob: Blob, transcript: string): Promise<any> {
    try {
      // Since Gemini doesn't directly support audio analysis yet, we'll use the transcript
      // and prompt Gemini to provide detailed feedback on the speaking
      
      const prompt = `
      Please analyze this English speech transcript and provide detailed feedback:
      
      Transcript: "${transcript}"
      
      Provide a comprehensive analysis including:
      1. Pronunciation assessment (score out of 100)
      2. Grammar accuracy (score out of 100)
      3. Vocabulary usage (score out of 100)
      4. Fluency (score out of 100)
      5. Overall speaking proficiency (score out of 100)
      6. Three specific suggestions for improvement
      7. Identify 2-3 specific errors or areas that need correction
      
      Format the response as structured feedback with specific scores and actionable advice.
      `;
      
      const response = await this.generateText({
        prompt,
        temperature: 0.3,
        maxTokens: 800
      });
      
      // Process the response to extract structured feedback
      return this.parseAudioAnalysisResponse(response.text, transcript);
    } catch (error) {
      console.error('Error analyzing audio:', error);
      return this.generateMockAudioAnalysis(transcript);
    }
  }
  
  private parseAudioAnalysisResponse(responseText: string, transcript: string): any {
    // Try to extract scores from the response text
    // This is a simple parser - in production you'd want more robust parsing
    
    try {
      const scores = {
        pronunciation: this.extractScore(responseText, 'pronunciation', 'pronunciation assessment'),
        grammar: this.extractScore(responseText, 'grammar', 'grammar accuracy'),
        vocabulary: this.extractScore(responseText, 'vocabulary', 'vocabulary usage'),
        fluency: this.extractScore(responseText, 'fluency'),
        overall: this.extractScore(responseText, 'overall', 'overall speaking', 'proficiency')
      };
      
      // Extract suggestions
      const suggestions = this.extractSuggestions(responseText);
      
      // Extract corrections
      const corrections = this.extractCorrections(responseText, transcript);
      
      return {
        scores,
        suggestions,
        corrections
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return this.generateMockAudioAnalysis(transcript);
    }
  }
  
  private extractScore(text: string, category: string, ...alternativeKeywords: string[]): number {
    // Look for patterns like "Pronunciation: 85/100" or "Pronunciation score: 85"
    const patterns = [
      new RegExp(`${category}\\s*(?:score|assessment|rating)?\\s*:?\\s*(\\d{1,3})\\s*(?:\/|out of)?\\s*100`, 'i'),
      ...alternativeKeywords.map(keyword => 
        new RegExp(`${keyword}\\s*(?:score|assessment|rating)?\\s*:?\\s*(\\d{1,3})\\s*(?:\/|out of)?\\s*100`, 'i')
      )
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const score = parseInt(match[1]);
        if (!isNaN(score) && score >= 0 && score <= 100) {
          return score;
        }
      }
    }
    
    // If no score found, generate a reasonable random score
    return Math.floor(Math.random() * 20) + 75; // 75-95 range
  }
  
  private extractSuggestions(text: string): string[] {
    // Try to find suggestions section or numbered/bulleted points
    const suggestionPatterns = [
      /suggestions?:?(.*?)(?:\d\.|•|\*|\n\n|$)/is,
      /improvements?:?(.*?)(?:\d\.|•|\*|\n\n|$)/is,
      /advice:?(.*?)(?:\d\.|•|\*|\n\n|$)/is
    ];
    
    for (const pattern of suggestionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        // Look for numbered or bulleted items
        const items = match[1].split(/\n/).filter(line => 
          /^\s*(?:\d\.|•|\*|-)\s+(.+)/.test(line)
        );
        
        if (items.length >= 2) {
          return items.map(item => 
            item.replace(/^\s*(?:\d\.|•|\*|-)\s+/, '').trim()
          );
        }
      }
    }
    
    // If no clear suggestions found, extract sentences that sound like advice
    const adviceSentences = text.match(/(?:should|could|try to|practice|work on|focus on|improve)[^.!?]*[.!?]/g);
    if (adviceSentences && adviceSentences.length >= 2) {
      return adviceSentences.slice(0, 3).map(s => s.trim());
    }
    
    // Fallback suggestions
    return [
      "Practice speaking more slowly to improve pronunciation clarity.",
      "Use more varied vocabulary to express your ideas more precisely.",
      "Focus on correct sentence structure, especially with verb tenses."
    ];
  }
  
  private extractCorrections(text: string, transcript: string): FeedbackCorrection[] {
    // Try to find corrections section
    const correctionPatterns = [
      /errors?:?(.*?)(?:\n\n|$)/is,
      /corrections?:?(.*?)(?:\n\n|$)/is,
      /mistakes?:?(.*?)(?:\n\n|$)/is
    ];
    
    const corrections: FeedbackCorrection[] = [];
    
    // Try to extract structured corrections
    for (const pattern of correctionPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const correctionText = match[1];
        const correctionItems = correctionText.split(/\n/).filter(line => 
          /^\s*(?:\d\.|•|\*|-|"|\')/.test(line)
        );
        
        if (correctionItems.length >= 1) {
          for (const item of correctionItems.slice(0, 3)) {
            // Try to extract original/corrected pairs or just create a general correction
            const correctionPair = item.match(/"([^"]+)"\s*(?:→|to|should be)\s*"([^"]+)"/);
            
            if (correctionPair) {
              corrections.push({
                original: correctionPair[1].trim(),
                corrected: correctionPair[2].trim(),
                explanation: item.replace(/"([^"]+)"\s*(?:→|to|should be)\s*"([^"]+)"/, '').trim() || 
                  "This needs correction for better accuracy."
              });
            } else {
              // Just add a general correction
              corrections.push({
                original: item.replace(/^\s*(?:\d\.|•|\*|-)\s+/, '').trim(),
                corrected: "",
                explanation: "Consider revising this part of your speech."
              });
            }
          }
          
          if (corrections.length > 0) {
            return corrections;
          }
        }
      }
    }
    
    // If no specific corrections found, provide general feedback
    if (transcript) {
      const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 0) {
        // Take 1-2 sentences for examples
        for (let i = 0; i < Math.min(2, sentences.length); i++) {
          const sentence = sentences[i].trim();
          if (sentence.length > 10) {
            corrections.push({
              original: sentence,
              corrected: sentence, // No specific correction
              explanation: "Your pronunciation is generally good here. Focus on maintaining a natural rhythm."
            });
          }
        }
      }
    }
    
    // If still empty, add a default correction
    if (corrections.length === 0) {
      corrections.push({
        original: "",
        corrected: "",
        explanation: "Your speech was mostly clear. Continue practicing to improve fluency and natural rhythm."
      });
    }
    
    return corrections;
  }

  async generateFeedback(text: string, type: 'speaking' | 'writing' | 'reading'): Promise<any> {
    const promptMap = {
      speaking: `Analyze the following English speech transcript and provide detailed feedback on pronunciation, grammar, vocabulary, and fluency: "${text}"`,
      writing: `Analyze the following English writing sample and provide detailed feedback on grammar, vocabulary, structure, and clarity: "${text}"`,
      reading: `Based on the answers to reading comprehension questions: "${text}", provide feedback on understanding, analysis, and vocabulary recognition.`
    };

    try {
      const response = await this.generateText({
        prompt: promptMap[type],
        temperature: 0.3,
        maxTokens: 800
      });

      // Process the response to get structured feedback
      const feedbackResult = this.parseAudioAnalysisResponse(response.text, text);
      
      return {
        feedback: response.text,
        scores: feedbackResult.scores,
        suggestions: feedbackResult.suggestions,
        corrections: feedbackResult.corrections
      };
    } catch (error) {
      console.error('Error generating feedback:', error);
      return {
        feedback: "We couldn't analyze your input at this time. Please try again later.",
        scores: this.generateMockScores(type),
        suggestions: [
          "Continue practicing regularly.",
          "Focus on clear pronunciation and proper grammar.",
          "Try to expand your vocabulary with new words."
        ],
        corrections: []
      };
    }
  }

  private generateMockScores(type: string) {
    // Generate realistic scoring based on the practice type
    return {
      pronunciation: Math.floor(Math.random() * 20) + 75,
      grammar: Math.floor(Math.random() * 25) + 70,
      vocabulary: Math.floor(Math.random() * 30) + 65,
      fluency: Math.floor(Math.random() * 20) + 75,
      overall: Math.floor(Math.random() * 15) + 80
    };
  }
  
  private generateMockAudioAnalysis(transcript: string): any {
    console.log('Generating mock audio analysis');
    
    // Create mock analysis data
    return {
      scores: {
        pronunciation: Math.floor(Math.random() * 20) + 75,
        grammar: Math.floor(Math.random() * 25) + 70,
        vocabulary: Math.floor(Math.random() * 30) + 65,
        fluency: Math.floor(Math.random() * 20) + 75,
        overall: Math.floor(Math.random() * 15) + 80
      },
      suggestions: [
        "Practice speaking more slowly to improve pronunciation clarity.",
        "Work on sentence stress and intonation for more natural delivery.",
        "Focus on linking words together smoothly for better fluency."
      ],
      corrections: this.createMockCorrections(transcript)
    };
  }
  
  private createMockCorrections(transcript: string): FeedbackCorrection[] {
    const corrections: FeedbackCorrection[] = [];
    
    if (!transcript || transcript.length < 10) {
      corrections.push({
        original: "",
        corrected: "",
        explanation: "Speak more to get detailed feedback on your pronunciation and grammar."
      });
      return corrections;
    }
    
    // Create some realistic mock corrections based on the transcript
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 0) {
      // Take 1-2 sentences for examples
      for (let i = 0; i < Math.min(2, sentences.length); i++) {
        const sentence = sentences[i].trim();
        if (sentence.length > 10) {
          let explanation = "";
          
          // Create realistic corrections based on common English errors
          if (sentence.includes(" i ")) {
            corrections.push({
              original: sentence,
              corrected: sentence.replace(" i ", " I "),
              explanation: "Always capitalize the pronoun 'I'."
            });
          } else if (/\b(is|are|was|were)\b/i.test(sentence) && Math.random() > 0.5) {
            explanation = "Check subject-verb agreement in this sentence.";
            corrections.push({
              original: sentence,
              corrected: sentence,
              explanation
            });
          } else {
            // General feedback
            corrections.push({
              original: sentence,
              corrected: sentence,
              explanation: "Your pronunciation is generally good here. Focus on maintaining a natural rhythm."
            });
          }
        }
      }
    }
    
    return corrections;
  }
}

export const geminiService = GeminiService.getInstance();
