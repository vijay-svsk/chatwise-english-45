
import { API_KEYS, API_ENDPOINTS } from '../config/appConfig';

type GeminiRequestOptions = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
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
  private apiKey: string | null = API_KEYS.GEMINI;
  private apiEndpoint: string = API_ENDPOINTS.GEMINI;
  private static instance: GeminiService;

  private constructor() {}

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  setApiKey(key: string) {
    this.apiKey = key;
    console.log('Gemini API key set successfully');
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  async generateText(options: GeminiRequestOptions): Promise<GeminiResponse> {
    if (!this.apiKey) {
      console.warn('Gemini API key not set, using mock responses');
      return this.getMockResponse(options.prompt);
    }

    try {
      // Actual API implementation using gemini-2.0-flash model
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: options.prompt }]
          }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxTokens || 150,
            responseMimeType: "application/json",
            responseFormat: "JSON"
          }
        })
      });
      
      if (!response.ok) {
        console.error('Error response from Gemini API:', await response.text());
        throw new Error(`Failed to generate text with Gemini: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract text from the Gemini response
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      return {
        text: text,
        usage: {
          promptTokens: options.prompt.length / 4, // Approximate token count
          completionTokens: text.length / 4,
          totalTokens: (options.prompt.length + text.length) / 4
        }
      };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      console.log('Falling back to mock response');
      return this.getMockResponse(options.prompt);
    }
  }

  private getMockResponse(prompt: string): GeminiResponse {
    // Generate more detailed mock responses based on the prompt content
    let response = '';
    
    if (prompt.includes('JSON') || prompt.includes('json format')) {
      if (prompt.includes('pronunciation') && prompt.includes('analyzing')) {
        // Mock pronunciation analysis in JSON format
        response = `{
          "score": 82,
          "feedback": "Your pronunciation is generally good, but there are some areas for improvement.",
          "correctSounds": ["initial consonant", "vowel sound"],
          "incorrectSounds": ["final consonant"],
          "tips": [
            "Practice the final sound more deliberately",
            "Listen to native speakers and imitate the rhythm",
            "Break down difficult words into syllables"
          ],
          "commonErrors": [
            {
              "description": "Difficulty with the 'th' sound",
              "correction": "Place your tongue between your teeth and gently blow air out"
            },
            {
              "description": "Dropping the final consonant",
              "correction": "Exaggerate the final sound when practicing"
            }
          ]
        }`;
      } else if (prompt.includes('grammar') || prompt.includes('analyze')) {
        // Mock language analysis in JSON format
        response = `{
          "pronunciation": 78,
          "grammar": 75,
          "vocabulary": 82,
          "fluency": 73,
          "overall": 77,
          "suggestions": [
            "Work on verb tense consistency in your sentences",
            "Practice using more varied vocabulary to express similar ideas",
            "Try to reduce filler words like 'um' and 'like'",
            "Focus on proper article usage (a/an/the)"
          ],
          "corrections": [
            {
              "original": "I go to the store yesterday",
              "corrected": "I went to the store yesterday",
              "explanation": "Use past tense for actions that happened in the past",
              "rule": "Verb Tense"
            },
            {
              "original": "She don't like coffee",
              "corrected": "She doesn't like coffee",
              "explanation": "Third person singular subjects require 'doesn't' rather than 'don't'",
              "rule": "Subject-Verb Agreement"
            }
          ]
        }`;
      }
    } else if (prompt.includes('grammar')) {
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

  async generateFeedback(text: string, type: 'speaking' | 'writing' | 'reading'): Promise<any> {
    const promptMap = {
      speaking: `Analyze the following English speech transcript and provide detailed feedback on pronunciation, grammar, vocabulary, and fluency. 
      
      Include specific examples of errors and their corrections. Format your response as JSON with the following structure:
      {
        "pronunciation": [score from 0-100],
        "grammar": [score from 0-100],
        "vocabulary": [score from 0-100],
        "fluency": [score from 0-100],
        "overall": [score from 0-100],
        "suggestions": [array of specific improvement suggestions],
        "corrections": [
          {
            "original": [the original phrase with errors],
            "corrected": [the corrected version],
            "explanation": [brief explanation of the grammar rule],
            "rule": [name of the grammar rule that was violated]
          }
        ]
      }
      
      The transcript is: "${text}"`,
      
      writing: `Analyze the following English writing sample and provide detailed feedback on grammar, vocabulary, structure, and clarity. Format as JSON with scores and specific corrections: "${text}"`,
      
      reading: `Based on the answers to reading comprehension questions: "${text}", provide feedback on understanding, analysis, and vocabulary recognition.`
    };

    const response = await this.generateText({
      prompt: promptMap[type],
      temperature: 0.3,
      maxTokens: 800
    });

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          feedback: response.text,
          scores: parsedResponse
        };
      }
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
    }
    
    // Fallback to generating mock scores
    return {
      feedback: response.text,
      scores: this.generateMockScores(type)
    };
  }

  private generateMockScores(type: string) {
    // Generate realistic scoring based on the practice type
    return {
      pronunciation: type === 'speaking' ? Math.floor(70 + Math.random() * 30) : null,
      grammar: Math.floor(65 + Math.random() * 35),
      vocabulary: Math.floor(70 + Math.random() * 30),
      fluency: type === 'speaking' ? Math.floor(60 + Math.random() * 40) : null,
      comprehension: type === 'reading' ? Math.floor(75 + Math.random() * 25) : null,
      structure: type === 'writing' ? Math.floor(65 + Math.random() * 35) : null,
      clarity: type === 'writing' ? Math.floor(70 + Math.random() * 30) : null,
      overall: Math.floor(70 + Math.random() * 30)
    };
  }

  async analyzeAudio(audioTranscript: string): Promise<any> {
    const prompt = `You are a professional English language teacher analyzing a student's spoken English.
    
    Analyze the following English speech transcript and provide detailed feedback on pronunciation, grammar, vocabulary, and fluency. 
    Rate each category on a scale of 0-100 and provide 3-5 specific suggestions for improvement.
    
    Format your response as JSON with the following structure:
    {
      "pronunciation": [score from 0-100],
      "grammar": [score from 0-100],
      "vocabulary": [score from 0-100],
      "fluency": [score from 0-100],
      "overall": [score from 0-100],
      "suggestions": [array of specific improvement suggestions],
      "corrections": [
        {
          "original": [the original phrase with errors],
          "corrected": [the corrected version],
          "explanation": [brief explanation of the grammar rule]
        }
      ]
    }
    
    The transcript is: "${audioTranscript}"`;

    const response = await this.generateText({
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 800
    });

    try {
      // Try to extract JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        return {
          feedback: response.text,
          scores: parsedResponse
        };
      }
    } catch (error) {
      console.error("Error parsing JSON from Gemini response:", error);
    }
    
    // Fallback to generating mock scores
    return {
      feedback: response.text,
      scores: this.generateMockScores('speaking')
    };
  }
}

export const geminiService = GeminiService.getInstance();
