
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Bot, Loader2, Volume2 } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface VirtualTeacherProps {
  initialGreeting?: string;
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
}

const VirtualTeacher: React.FC<VirtualTeacherProps> = ({ 
  initialGreeting = "Hello! I'm your AI English teacher. What English topic would you like help with today?"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Initialize messages with greeting
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: initialGreeting,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  }, [initialGreeting]);
  
  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript;
          }
        }
        
        if (transcript) {
          setInputText(prev => prev + ' ' + transcript);
        }
      };
      
      recognitionRef.current.onerror = (error: any) => {
        console.error('Speech recognition error', error);
        toast({
          title: "Speech Recognition Error",
          description: "There was an error with speech recognition. Please try typing your question.",
          variant: "destructive"
        });
        setIsRecording(false);
      };
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use a modern browser like Chrome.",
        variant: "destructive"
      });
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);
  
  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const toggleMicrophone = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };
  
  const sendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    // Add a placeholder for the AI response with loading state
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMessageId,
      content: "",
      sender: 'ai',
      timestamp: new Date(),
      isProcessing: true
    }]);
    
    try {
      // Get response from Gemini API
      const response = await geminiService.generateText({
        prompt: `As a helpful and encouraging English teacher, please respond to this student question or statement in a clear and helpful way: "${userMessage.content}"`,
        temperature: 0.7,
        maxTokens: 500
      });
      
      // Update the AI message with the actual response
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return {
            ...msg,
            content: response.text,
            isProcessing: false
          };
        }
        return msg;
      }));
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Update the AI message with an error response
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return {
            ...msg,
            content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
            isProcessing: false
          };
        }
        return msg;
      }));
      
      toast({
        title: "Error",
        description: "Failed to get a response from the AI teacher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isTeacherSpeaking) {
        window.speechSynthesis.cancel();
        setIsTeacherSpeaking(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower than default
      
      // Find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsTeacherSpeaking(true);
      utterance.onend = () => setIsTeacherSpeaking(false);
      utterance.onerror = () => {
        setIsTeacherSpeaking(false);
        toast({
          title: "Speech Error",
          description: "There was an error with text-to-speech. Please try again.",
          variant: "destructive"
        });
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech. Please use a modern browser.",
        variant: "destructive"
      });
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col glass-panel">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-display">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            AI English Teacher
            {isTeacherSpeaking && (
              <Badge variant="outline" className="animate-pulse">Speaking</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <div 
          ref={messageContainerRef}
          className="h-full overflow-y-auto p-4 space-y-4"
        >
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
            >
              {message.sender === 'ai' && (
                <div className="w-8 h-8 mt-1 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              
              <div className={`max-w-[80%] flex flex-col`}>
                <div className={`rounded-lg p-3 ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground self-end' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {message.isProcessing ? (
                    <div className="flex gap-1 items-center h-6 px-2">
                      <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
                
                <div className={`text-xs text-muted-foreground mt-1 flex items-center gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}>
                  <span>{formatTime(message.timestamp)}</span>
                  
                  {message.sender === 'ai' && !message.isProcessing && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 rounded-full"
                      onClick={() => speakMessage(message.content)}
                    >
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {message.sender === 'user' && (
                <div className="w-8 h-8 mt-1 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
                  <span className="text-xs font-semibold">You</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t mt-auto">
        <div className="flex items-center w-full gap-2">
          <Button 
            variant={isRecording ? "destructive" : "outline"} 
            size="icon" 
            onClick={toggleMicrophone}
            className={`${isRecording ? "animate-pulse" : ""}`}
          >
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          
          <Input
            placeholder="Ask your question here..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            className="flex-grow"
          />
          
          <Button 
            onClick={sendMessage} 
            disabled={!inputText.trim() || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VirtualTeacher;
