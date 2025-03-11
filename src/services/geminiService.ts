import { API_KEYS, API_ENDPOINTS } from '../config/appConfig';

// This is a mock implementation since we don't have actual API keys
// In a real implementation, you would use the actual Gemini API

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
      // In a real implementation, this would be an actual API call
      // const response = await fetch(this.apiEndpoint, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`
      //   },
      //   body: JSON.stringify({
      //     prompt: options.prompt,
      //     temperature: options.temperature || 0.7,
      //     max_tokens: options.maxTokens || 150
      //   })
      // });
      
      // const data = await response.json();
      // return {
      //   text: data.choices[0].text,
      //   usage: data.usage
      // };

      // For now, return mock data
      return this.getMockResponse(options.prompt);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to generate text with Gemini');
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

  async generateFeedback(text: string, type: 'speaking' | 'writing' | 'reading'): Promise<any> {
    const promptMap = {
      speaking: `Analyze the following English speech transcript and provide detailed feedback on pronunciation, grammar, vocabulary, and fluency: "${text}"`,
      writing: `Analyze the following English writing sample and provide detailed feedback on grammar, vocabulary, structure, and clarity: "${text}"`,
      reading: `Based on the answers to reading comprehension questions: "${text}", provide feedback on understanding, analysis, and vocabulary recognition.`
    };

    const response = await this.generateText({
      prompt: promptMap[type],
      temperature: 0.3,
      maxTokens: 300
    });

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
    const prompt = `Analyze the following English speech transcript and provide detailed feedback on pronunciation, grammar, vocabulary, and fluency. 
    Rate each category on a scale of 0-100. Also provide 3-5 specific suggestions for improvement: "${audioTranscript}"`;

    const response = await this.generateText({
      prompt: prompt,
      temperature: 0.3,
      maxTokens: 500
    });

    return {
      feedback: response.text,
      scores: this.generateMockScores('speaking')
    };
  }
}

export const geminiService = GeminiService.getInstance();
