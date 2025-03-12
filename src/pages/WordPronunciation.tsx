import React, { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Volume2, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { audioService } from '@/services/audioService';
import WordBreakdown from '@/components/word-pronunciation/WordBreakdown';
import RecordPronunciation from '@/components/word-pronunciation/RecordPronunciation';
import WordDetails from '@/components/word-pronunciation/WordDetails';
import { dictionaryService, DictionaryEntry } from '@/services/dictionaryService';

// Mock user data - would come from auth in a real app
const mockUser = {
  name: 'Sarah Johnson',
  email: 'sarah.j@example.com',
  avatar: 'https://i.pravatar.cc/300?img=47'
};

interface WordData {
  word: string;
  phonetic: string;
  syllables: string[];
  meaning: string;
  grammar: string;
  opposite?: string;
  rootWord?: string;
  examples: string[];
}

const WordPronunciation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [feedbackData, setFeedbackData] = useState<{text: string, score: number} | null>(null);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    setWordData(null);
    setFeedbackData(null);
    
    try {
      const data = await dictionaryService.getWordDefinition(searchTerm.trim());
      const entry = data[0];
      
      if (!entry) {
        throw new Error('Word not found');
      }

      // Transform API data to our format
      const transformedData: WordData = {
        word: entry.word,
        phonetic: entry.phonetic || entry.phonetics[0]?.text || '',
        syllables: entry.word.split('').filter(char => /[aeiou]/i.test(char)), // Basic syllable detection
        meaning: entry.meanings[0]?.definitions[0]?.definition || '',
        grammar: entry.meanings[0]?.partOfSpeech || '',
        examples: entry.meanings.flatMap(m => 
          m.definitions
            .filter(d => d.example)
            .map(d => d.example!)
        ).slice(0, 4),
        opposite: entry.meanings[0]?.definitions[0]?.antonyms?.[0],
        rootWord: entry.origin?.split(':')[0] || undefined
      };

      setWordData(transformedData);
      
      // Play pronunciation if available
      const audioUrl = entry.phonetics.find(p => p.audio)?.audio;
      if (audioUrl) {
        const audio = new Audio(audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl);
        audio.play().catch(console.error);
      } else {
        // Fallback to browser TTS
        audioService.speak(entry.word, {
          rate: 0.8,
          pitch: 1.0,
          volume: 1.0
        });
      }

    } catch (error) {
      console.error("Error fetching word data:", error);
      toast({
        title: "Error",
        description: "Could not find information about this word. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePronunciationFeedback = (feedbackText: string, score: number) => {
    setFeedbackData({
      text: feedbackText,
      score: score
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-5xl mx-auto animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-display font-semibold">Word Pronunciation Practice</h1>
            
            {wordData && (
              <Button 
                variant="outline" 
                size="sm"
                className="gap-2"
                onClick={() => {
                  if (wordData) {
                    audioService.speak(wordData.word, {
                      rate: 0.8,
                      pitch: 1.0,
                      volume: 1.0
                    });
                  }
                }}
              >
                <Volume2 className="h-4 w-4" />
                Hear Pronunciation
              </Button>
            )}
          </div>
          
          <Card className="mb-6 overflow-hidden border-t-4 border-primary/70">
            <CardHeader className="pb-3 bg-muted/50">
              <CardTitle>Find a Word to Practice</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter a word (e.g. contribution, excellent, opportunity)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Looking up word details...</p>
              </div>
            </div>
          )}
          
          {!isLoading && !wordData && !searchTerm && (
            <div className="text-center py-12 px-4">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-semibold mb-2">Welcome to Word Pronunciation Practice</h3>
                <p className="text-muted-foreground mb-4">
                  Search for any English word to see its details, hear its pronunciation, and practice saying it correctly.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-6">
                  {['contribution', 'fascinating', 'opportunity', 'enthusiastic', 'development', 'sophisticated'].map((word) => (
                    <Button 
                      key={word}
                      variant="outline"
                      size="sm"
                      className="text-sm"
                      onClick={() => {
                        setSearchTerm(word);
                        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                        setTimeout(() => handleSearch(fakeEvent), 100);
                      }}
                    >
                      {word}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {wordData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WordBreakdown 
                  word={wordData.word}
                  syllables={wordData.syllables}
                  phonetic={wordData.phonetic}
                />
                
                <WordDetails 
                  meaning={wordData.meaning}
                  grammar={wordData.grammar}
                  opposite={wordData.opposite}
                  rootWord={wordData.rootWord}
                  examples={wordData.examples}
                />
              </div>
              
              <RecordPronunciation 
                word={wordData.word}
                onFeedback={handlePronunciationFeedback}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WordPronunciation;
