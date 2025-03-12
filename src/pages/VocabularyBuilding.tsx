import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, Plus, Check, X, Bookmark, Volume2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dictionaryService, DictionaryEntry } from '@/services/dictionaryService';
import { useToast } from '@/hooks/use-toast';

interface VocabularyWord {
  id: string;
  word: string;
  partOfSpeech: string;
  definition: string;
  example?: string;
  pronunciation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  audio?: string;
  isSaved?: boolean;
}

interface VocabularyList {
  id: string;
  name: string;
  description: string;
  words: VocabularyWord[];
}

const mockWordList: VocabularyWord[] = [
  {
    id: 'w1',
    word: 'Ubiquitous',
    partOfSpeech: 'adjective',
    definition: 'Present, appearing, or found everywhere.',
    example: 'Mobile phones are now ubiquitous in modern society.',
    pronunciation: '/juːˈbɪkwɪtəs/',
    difficulty: 'advanced'
  },
  {
    id: 'w2',
    word: 'Eloquent',
    partOfSpeech: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing.',
    example: 'She gave an eloquent speech that moved the audience.',
    pronunciation: '/ˈɛləkwənt/',
    difficulty: 'intermediate'
  },
  {
    id: 'w3',
    word: 'Pragmatic',
    partOfSpeech: 'adjective',
    definition: 'Dealing with things sensibly and realistically.',
    example: 'We need a pragmatic approach to solving this problem.',
    pronunciation: '/præɡˈmætɪk/',
    difficulty: 'intermediate'
  },
  {
    id: 'w4',
    word: 'Ambiguous',
    partOfSpeech: 'adjective',
    definition: 'Open to more than one interpretation; having a double meaning.',
    example: 'The message was ambiguous and could be interpreted in different ways.',
    pronunciation: '/æmˈbɪɡjuəs/',
    difficulty: 'intermediate'
  },
  {
    id: 'w5',
    word: 'Concise',
    partOfSpeech: 'adjective',
    definition: 'Giving a lot of information clearly and in a few words.',
    example: 'Her writing is always clear and concise.',
    pronunciation: '/kənˈsaɪs/',
    difficulty: 'intermediate'
  },
  {
    id: 'w6',
    word: 'Enhance',
    partOfSpeech: 'verb',
    definition: 'Intensify, increase, or further improve the quality, value, or extent of.',
    example: 'The new features will enhance the program\'s usefulness.',
    pronunciation: '/ɪnˈhɑːns/',
    difficulty: 'beginner'
  },
  {
    id: 'w7',
    word: 'Fundamental',
    partOfSpeech: 'adjective',
    definition: 'Forming a necessary base or core; of central importance.',
    example: 'The right to free speech is fundamental in a democracy.',
    pronunciation: '/ˌfʌndəˈmɛntl/',
    difficulty: 'beginner'
  },
  {
    id: 'w8',
    word: 'Notorious',
    partOfSpeech: 'adjective',
    definition: 'Famous or well known, typically for some bad quality or deed.',
    example: 'He was notorious for his bad temper.',
    pronunciation: '/noʊˈtɔːriəs/',
    difficulty: 'intermediate'
  },
  {
    id: 'w9',
    word: 'Perseverance',
    partOfSpeech: 'noun',
    definition: 'Persistence in doing something despite difficulty or delay in achieving success.',
    example: 'His perseverance was rewarded when he finally passed the exam.',
    pronunciation: '/ˌpɜːrsəˈvɪərəns/',
    difficulty: 'advanced'
  }
];

const mockVocabularyLists: VocabularyList[] = [
  {
    id: 'list1',
    name: 'Business English',
    description: 'Essential vocabulary for professional settings',
    words: mockWordList.slice(0, 3)
  },
  {
    id: 'list2',
    name: 'Academic Writing',
    description: 'Words commonly used in research papers and essays',
    words: mockWordList.slice(3, 6)
  },
  {
    id: 'list3',
    name: 'Daily Conversations',
    description: 'Useful vocabulary for everyday discussions',
    words: mockWordList.slice(6, 9)
  }
];

const VocabularyBuilding = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<VocabularyWord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [savedWords, setSavedWords] = useState<VocabularyWord[]>([]);
  const [wordLists] = useState(mockVocabularyLists);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [isFocused, setIsFocused] = useState(false);
  const { toast } = useToast();

  const getDifficulty = (word: string): 'beginner' | 'intermediate' | 'advanced' => {
    const length = word.length;
    if (length <= 5) return 'beginner';
    if (length <= 8) return 'intermediate';
    return 'advanced';
  };

  useEffect(() => {
    const searchWords = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const data = await dictionaryService.getWordDefinition(searchTerm.trim());
        const words: VocabularyWord[] = data.map((entry): VocabularyWord => ({
          id: entry.word,
          word: entry.word,
          partOfSpeech: entry.meanings[0]?.partOfSpeech || '',
          definition: entry.meanings[0]?.definitions[0]?.definition || '',
          example: entry.meanings[0]?.definitions[0]?.example,
          pronunciation: entry.phonetic || entry.phonetics[0]?.text || '',
          audio: entry.phonetics.find(p => p.audio)?.audio,
          difficulty: getDifficulty(entry.word)
        }));
        setSearchResults(words);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Could not find the word. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchWords, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, toast]);

  const playPronunciation = (word: VocabularyWord) => {
    if (word.audio) {
      const audioUrl = word.audio.startsWith('//') ? `https:${word.audio}` : word.audio;
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        // Fallback to browser TTS if audio URL fails
        audioService.speak(word.word, {
          rate: 0.9,
          pitch: 1.0,
          volume: 1.0
        });
      });
    } else {
      audioService.speak(word.word, {
        rate: 0.9,
        pitch: 1.0,
        volume: 1.0
      });
    }
  };

  const toggleSaveWord = (wordId: string) => {
    const word = mockWordList.find(w => w.id === wordId);
    if (!word) return;
    
    const isAlreadySaved = savedWords.some(w => w.id === wordId);
    
    if (isAlreadySaved) {
      setSavedWords(savedWords.filter(w => w.id !== wordId));
    } else {
      setSavedWords([...savedWords, { ...word, isSaved: true }]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Vocabulary Building</h1>
            <p className="text-muted-foreground mb-6">Expand your English vocabulary with our curated word lists.</p>
            
            <div className="relative mb-6">
              <div className={cn(
                "relative flex items-center transition-all",
                isFocused ? "ring-2 ring-primary ring-offset-2" : "ring-1 ring-input",
                "rounded-lg overflow-hidden"
              )}>
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for words..."
                  className="border-0 pl-10 h-12 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="explore" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="explore">Explore</TabsTrigger>
                <TabsTrigger value="saved">Saved Words</TabsTrigger>
                <TabsTrigger value="lists">Word Lists</TabsTrigger>
              </TabsList>
              
              <TabsContent value="explore" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-display font-medium">Browse Vocabulary</h2>
                  <div className="flex space-x-2">
                    <Button 
                      variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSelectedFilter('all')}
                    >
                      All
                    </Button>
                    <Button 
                      variant={selectedFilter === 'beginner' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSelectedFilter('beginner')}
                    >
                      Beginner
                    </Button>
                    <Button 
                      variant={selectedFilter === 'intermediate' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSelectedFilter('intermediate')}
                    >
                      Intermediate
                    </Button>
                    <Button 
                      variant={selectedFilter === 'advanced' ? 'default' : 'outline'} 
                      size="sm"
                      onClick={() => setSelectedFilter('advanced')}
                    >
                      Advanced
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((word) => (
                      <Card key={word.id} className="glass-panel">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-xl font-display">{word.word}</CardTitle>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => playPronunciation(word)}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "text-xs px-2 py-1 rounded-full",
                                word.difficulty === 'beginner' && "bg-green-100 text-green-800",
                                word.difficulty === 'intermediate' && "bg-blue-100 text-blue-800",
                                word.difficulty === 'advanced' && "bg-purple-100 text-purple-800",
                              )}>
                                {word.difficulty.charAt(0).toUpperCase() + word.difficulty.slice(1)}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => toggleSaveWord(word.id)}
                              >
                                <Bookmark 
                                  className={cn(
                                    "h-4 w-4",
                                    savedWords.some(w => w.id === word.id) ? "fill-primary" : "fill-none"
                                  )} 
                                />
                              </Button>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground italic">
                            {word.partOfSpeech} | {word.pronunciation}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <div className="space-y-2">
                            <div>
                              <div className="font-medium text-sm">Definition:</div>
                              <p>{word.definition}</p>
                            </div>
                            <div>
                              <div className="font-medium text-sm">Example:</div>
                              <p className="italic">{word.example}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter>
                          <div className="text-sm text-muted-foreground">
                            Pro tip: Click the bookmark icon to save this word for later review.
                          </div>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <Card className="glass-panel">
                      <CardContent className="flex flex-col items-center justify-center py-8">
                        <div className="text-muted-foreground mb-2">No words found matching your search criteria.</div>
                        <Button variant="outline" onClick={() => {
                          setSearchTerm('');
                          setSelectedFilter('all');
                        }}>
                          Clear filters
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="saved" className="space-y-6">
                <h2 className="text-xl font-display font-medium mb-4">Your Saved Words</h2>
                
                {savedWords.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {savedWords.map((word) => (
                      <Card key={word.id} className="glass-panel">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-xl font-display">{word.word}</CardTitle>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => playPronunciation(word)}
                              >
                                <Volume2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => toggleSaveWord(word.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground italic">
                            {word.partOfSpeech} | {word.pronunciation}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <div className="font-medium text-sm">Definition:</div>
                              <p>{word.definition}</p>
                            </div>
                            <div>
                              <div className="font-medium text-sm">Example:</div>
                              <p className="italic">{word.example}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="glass-panel">
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <div className="text-muted-foreground mb-2">You haven't saved any words yet.</div>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const exploreTab = document.querySelector('[data-value="explore"]');
                          if (exploreTab instanceof HTMLElement) {
                            exploreTab.click();
                          }
                        }}
                      >
                        Browse vocabulary
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="lists" className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-display font-medium">Vocabulary Lists</h2>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create New List
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {wordLists.map((list) => (
                    <Card key={list.id} className="glass-panel">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">{list.name}</CardTitle>
                        <CardDescription>{list.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm">
                          {list.words.length} words
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {list.words.slice(0, 3).map((word) => (
                            <div 
                              key={word.id}
                              className="text-xs px-2 py-1 bg-secondary rounded-full"
                            >
                              {word.word}
                            </div>
                          ))}
                          {list.words.length > 3 && (
                            <div className="text-xs px-2 py-1 bg-secondary rounded-full">
                              +{list.words.length - 3} more
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button className="w-full">View List</Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default VocabularyBuilding;
