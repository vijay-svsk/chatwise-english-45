
// Dictionary API types
export interface DictionaryEntry {
  word: string;
  phonetic: string;
  phonetics: {
    text: string;
    audio?: string;
  }[];
  origin?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
}

const BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

export const dictionaryService = {
  async getWordDefinition(word: string): Promise<DictionaryEntry[]> {
    try {
      const response = await fetch(`${BASE_URL}/${word.toLowerCase()}`);
      if (!response.ok) {
        throw new Error('Word not found');
      }
      return response.json();
    } catch (error) {
      console.error('Dictionary API error:', error);
      throw error;
    }
  }
};
