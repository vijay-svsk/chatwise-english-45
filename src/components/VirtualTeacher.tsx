
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Volume2, VolumeX, Mic, MicOff, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import MessageList from './virtual-teacher/MessageList';
import TeacherAvatar from './virtual-teacher/TeacherAvatar';
import { Message, VirtualTeacherProps } from './virtual-teacher/types';
import { useSpeechServices } from './virtual-teacher/SpeechService';
import { audioService } from '@/services/audioService';

const VirtualTeacher: React.FC<VirtualTeacherProps> = ({ 
  initialGreeting = "Hello! I'm your AI English teacher. I'm here to help you learn English. What would you like to discuss today?",
  autoListen = false
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const processingRef = useRef(false);
  const { toast } = useToast();
  
  const {
    isListening,
    isTeacherSpeaking,
    currentTranscript,
    currentMessageId,
    startListening,
    stopListening,
    toggleListening,
    speakMessage: speakWithService,
    stopSpeaking,
    registerSpeechCallback
  } = useSpeechServices();
  
  // Process user speech and get AI response
  const processUserSpeech = useCallback(async (speech: string) => {
    if (!speech || speech.trim().length < 2 || processingRef.current) return;
    
    processingRef.current = true;
    setIsProcessing(true);
    
    // Add user message to the conversation
    const userMessage: Message = {
      id: Date.now().toString(),
      content: speech.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
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
      // Play a subtle sound to indicate processing
      audioService.playSuccessSound();
      
      // Get response from Gemini API
      const response = await geminiService.generateText({
        prompt: `As a helpful and encouraging English teacher, please respond to this student in a clear, conversational and helpful way. Focus on helping them learn English: "${speech.trim()}"`,
        temperature: 0.7,
        maxTokens: 500
      });
      
      // Update the AI message with the actual response
      const aiResponse = response.text;
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return {
            ...msg,
            content: aiResponse,
            isProcessing: false
          };
        }
        return msg;
      }));
      
      // Speak the response
      setTimeout(() => {
        speakMessage(aiResponse, aiMessageId);
      }, 300);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Update the AI message with an error response
      const errorMessage = "I'm sorry, I'm having trouble understanding. Could you repeat that?";
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return {
            ...msg,
            content: errorMessage,
            isProcessing: false
          };
        }
        return msg;
      }));
      
      // Speak the error message
      speakMessage(errorMessage, aiMessageId);
      
      toast({
        title: "Error",
        description: "Failed to get a response from the AI teacher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      processingRef.current = false;
    }
  }, [toast]);
  
  // Speak message and update UI
  const speakMessage = useCallback((text: string, messageId?: string) => {
    // Update the message that's currently being spoken
    if (messageId) {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isSpeaking: msg.id === messageId
      })));
    }
    
    // Use the speech service to speak
    speakWithService(text, messageId);
  }, [speakWithService]);
  
  // Initialize messages with greeting
  useEffect(() => {
    if (isInitialized) return;
    
    const initialMessage: Message = {
      id: '1',
      content: initialGreeting,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setIsInitialized(true);
    
    // Register the speech callback
    registerSpeechCallback(processUserSpeech);
    
    // Speak the greeting message after a brief delay
    const timer = setTimeout(() => {
      speakMessage(initialGreeting, '1');
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [initialGreeting, speakMessage, registerSpeechCallback, processUserSpeech, isInitialized]);
  
  // Handle auto-listen after greeting
  useEffect(() => {
    if (!isInitialized || !autoListen) return;
    
    let listenTimer: NodeJS.Timeout;
    
    // Only start listening if we're not already listening and not speaking
    if (!isListening && !isTeacherSpeaking) {
      listenTimer = setTimeout(() => {
        startListening();
      }, 3000);
    }
    
    return () => {
      clearTimeout(listenTimer);
    };
  }, [isInitialized, autoListen, isListening, isTeacherSpeaking, startListening]);
  
  // Update speaking state when currentMessageId changes
  useEffect(() => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      isSpeaking: msg.id === currentMessageId
    })));
  }, [currentMessageId]);

  return (
    <Card className="w-full h-[700px] flex flex-col glass-panel overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-display">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            Interactive AI English Teacher
            {isTeacherSpeaking && (
              <Badge variant="outline" className="animate-pulse bg-primary/10">Speaking</Badge>
            )}
            {isListening && !isTeacherSpeaking && (
              <Badge variant="outline" className="animate-pulse bg-green-500/10 text-green-500">Listening</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className={`flex items-center gap-1 ${isListening ? 'border-green-500' : ''}`}
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4 text-destructive" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 text-green-500" />
                  Start Listening
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className={`flex items-center gap-1 ${isTeacherSpeaking ? 'border-destructive' : 'border-primary'}`}
              onClick={isTeacherSpeaking ? stopSpeaking : () => {
                const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai' && !m.isProcessing);
                if (lastAiMessage) {
                  speakMessage(lastAiMessage.content, lastAiMessage.id);
                }
              }}
              disabled={isProcessing || (messages.length <= 1 && !isTeacherSpeaking)}
            >
              {isTeacherSpeaking ? (
                <>
                  <Pause className="h-4 w-4 text-destructive" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 text-primary" />
                  Speak Last Response
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto p-4 flex flex-col">
        <div className="flex flex-col items-center justify-center mb-4">
          <TeacherAvatar 
            isTeacherSpeaking={isTeacherSpeaking} 
            isListening={isListening && !isTeacherSpeaking}
          />
          
          {currentTranscript && isListening && !isTeacherSpeaking && (
            <div className="mt-2 px-4 py-2 bg-green-500/10 text-green-800 dark:text-green-300 rounded-full animate-pulse max-w-[80%] text-center">
              {currentTranscript}
            </div>
          )}
        </div>
        
        <div className="flex-grow overflow-hidden bg-card/50 rounded-lg border shadow-sm">
          <MessageList 
            messages={messages}
            speakMessage={(text) => {
              const message = messages.find(m => m.content === text);
              if (message) {
                speakMessage(text, message.id);
              } else {
                speakMessage(text);
              }
            }}
            stopSpeaking={stopSpeaking}
            isTeacherSpeaking={isTeacherSpeaking}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t mt-auto">
        <div className="w-full flex flex-col items-center">
          <div className="flex gap-2 mb-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-1"
              onClick={toggleListening}
              disabled={isProcessing}
            >
              {isListening ? (
                <>
                  <MicOff className="h-4 w-4" /> 
                  Turn Off Microphone
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" /> 
                  Turn On Microphone
                </>
              )}
            </Button>
            
            <Button
              variant={isTeacherSpeaking ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-1"
              onClick={isTeacherSpeaking ? stopSpeaking : () => {
                const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai' && !m.isProcessing);
                if (lastAiMessage) {
                  speakMessage(lastAiMessage.content, lastAiMessage.id);
                }
              }}
              disabled={isProcessing || (messages.length <= 1 && !isTeacherSpeaking)}
            >
              {isTeacherSpeaking ? (
                <>
                  <Pause className="h-4 w-4" /> 
                  Stop AI Speaking
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4" /> 
                  Speak Last Response
                </>
              )}
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            {isListening ? (
              <>
                I'm listening to you. Just speak naturally and I'll respond.
                {currentTranscript && (
                  <span className="block mt-1 font-medium">"...{currentTranscript.slice(-30)}"</span>
                )}
              </>
            ) : isTeacherSpeaking ? (
              "I'm speaking. Please wait..."
            ) : (
              "Click the microphone button to start speaking with me."
            )}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default VirtualTeacher;
