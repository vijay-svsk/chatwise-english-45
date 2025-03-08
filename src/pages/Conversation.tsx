import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Mic, Send, Volume2, User, Bot, RefreshCw, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ConversationTopic {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const Conversation = () => {
  const mockUser = {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    avatar: 'https://i.pravatar.cc/300?img=47'
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi there! I'm your AI language partner. How can I help you practice your English today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  const conversationTopics: ConversationTopic[] = [
    {
      id: 'daily-life',
      name: 'Daily Life',
      description: 'Talk about routines, hobbies, and everyday activities',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'travel',
      name: 'Travel',
      description: 'Discuss travel experiences, destinations, and plans',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'work',
      name: 'Work & Career',
      description: 'Practice professional conversations and interview skills',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'food',
      name: 'Food & Dining',
      description: 'Talk about favorite foods, restaurants, and cooking',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'culture',
      name: 'Culture & Entertainment',
      description: 'Discuss movies, music, books, and cultural topics',
      icon: <User className="h-5 w-5" />
    },
    {
      id: 'education',
      name: 'Education',
      description: 'Talk about learning, schools, and academic subjects',
      icon: <User className="h-5 w-5" />
    }
  ];
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - SpeechRecognition API doesn't have TypeScript typings by default
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setInputValue(prevInput => prevInput + ' ' + finalTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsSending(true);
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: generateMockResponse(inputValue),
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, responseMessage]);
      setIsSending(false);
    }, 1500);
  };
  
  const generateMockResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! It's great to chat with you. How are you feeling today?";
    } else if (lowerCaseMessage.includes('how are you')) {
      return "I'm doing well, thank you for asking! I'm here to help you practice your English. What would you like to talk about?";
    } else if (lowerCaseMessage.includes('weather')) {
      return "The weather is an interesting topic for conversation! Can you tell me what the weather is like where you are? And do you have a favorite season?";
    } else if (lowerCaseMessage.includes('hobby') || lowerCaseMessage.includes('hobbies')) {
      return "Hobbies are great to talk about in English conversation! Some common hobbies include reading, cooking, gardening, and playing sports. What are some of your favorite activities in your free time?";
    } else {
      return "That's an interesting point! Could you tell me more about that? Remember, the more you practice speaking English, the more fluent you'll become.";
    }
  };
  
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
      setIsRecording(true);
    }
  };
  
  const startNewConversation = () => {
    setMessages([
      {
        id: Date.now().toString(),
        content: "Hi there! I'm your AI language partner. How can I help you practice your English today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setSelectedTopic(null);
  };
  
  const selectTopic = (topicId: string) => {
    setSelectedTopic(topicId);
    const topic = conversationTopics.find(t => t.id === topicId);
    
    if (topic) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Let's talk about ${topic.name}! ${topic.description}. What would you like to discuss first?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  };
  
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      console.log('Text-to-speech not supported in this browser');
    }
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header user={mockUser} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">AI Conversation</h1>
            <p className="text-muted-foreground mb-6">Practice your English by chatting with our AI language partner.</p>
            
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="chat">Chat</TabsTrigger>
                <TabsTrigger value="topics">Conversation Topics</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="space-y-6">
                <Card className="glass-panel">
                  <CardHeader className="border-b">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl font-display">
                        {selectedTopic 
                          ? `Topic: ${conversationTopics.find(t => t.id === selectedTopic)?.name}` 
                          : 'Open Conversation'}
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={startNewConversation}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          New Chat
                        </Button>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[500px] overflow-y-auto p-6 space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id}
                          className={cn(
                            "flex items-start space-x-2",
                            message.sender === 'user' && "justify-end"
                          )}
                        >
                          {message.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                              <Bot className="h-4 w-4" />
                            </div>
                          )}
                          
                          <div className="flex flex-col space-y-1 max-w-[80%]">
                            <div
                              className={cn(
                                "rounded-lg px-4 py-2 inline-block",
                                message.sender === 'user' 
                                  ? "bg-primary text-primary-foreground ml-auto" 
                                  : "bg-secondary text-secondary-foreground"
                              )}
                            >
                              {message.content}
                            </div>
                            <div
                              className={cn(
                                "text-xs text-muted-foreground flex items-center space-x-2",
                                message.sender === 'user' && "ml-auto"
                              )}
                            >
                              <span>{formatTimestamp(message.timestamp)}</span>
                              {message.sender === 'ai' && (
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={() => speakMessage(message.content)}
                                >
                                  <Volume2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {message.sender === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      ))}
                      {isSending && (
                        <div className="flex items-start space-x-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                            <Bot className="h-4 w-4" />
                          </div>
                          <div className="flex items-center space-x-1 px-4 py-2 bg-secondary rounded-lg text-secondary-foreground">
                            <div className="h-2 w-2 rounded-full bg-current animate-bounce" />
                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                            <div className="h-2 w-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <div className="flex items-center w-full space-x-2">
                      <Button
                        variant={isRecording ? 'destructive' : 'outline'}
                        size="icon"
                        className={cn(isRecording && "animate-pulse")}
                        onClick={toggleRecording}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Type your message..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isSending}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="topics">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {conversationTopics.map((topic) => (
                    <Card key={topic.id} className="glass-panel hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        selectTopic(topic.id);
                        const chatTab = document.querySelector('[data-value="chat"]');
                        if (chatTab instanceof HTMLElement) {
                          chatTab.click();
                        }
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg font-display">{topic.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{topic.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full">Select Topic</Button>
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

export default Conversation;
