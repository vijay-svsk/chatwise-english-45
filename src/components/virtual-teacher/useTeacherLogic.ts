import { useState, useCallback, useEffect, useRef } from 'react';
import { useSpeechServices } from './SpeechService';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/geminiService';
import { audioService } from '@/services/audioService';
import { Message } from './types';

export const useTeacherLogic = (initialGreeting: string = '') => {
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
    stopAll,
    registerSpeechCallback
  } = useSpeechServices();

  const speakMessage = useCallback((text: string, messageId?: string) => {
    if (messageId) {
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isSpeaking: msg.id === messageId
      })));
    }
    
    speakWithService(text, messageId);
  }, [speakWithService]);

  const replayLastResponse = useCallback(() => {
    const lastAiMessage = [...messages].reverse().find(m => m.sender === 'ai' && !m.isProcessing);
    if (lastAiMessage) {
      speakMessage(lastAiMessage.content, lastAiMessage.id);
    }
  }, [messages, speakMessage]);

  const processUserSpeech = useCallback(async (speech: string) => {
    if (!speech || speech.trim().length < 2 || processingRef.current) return;
    
    processingRef.current = true;
    setIsProcessing(true);
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: speech.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMessageId,
      content: "",
      sender: 'ai',
      timestamp: new Date(),
      isProcessing: true
    }]);
    
    try {
      audioService.playSuccessSound();
      
      // Simplified prompt for Gemini API
      const teacherPrompt = `You are a friendly and patient AI English teacher. Your role is to:
1. Provide clear, simple explanations for English concepts
2. Use everyday examples that students can relate to
3. Be encouraging and supportive
4. Keep responses concise and easy to understand
5. If asked about grammar or vocabulary, include 1-2 simple examples

Respond to this student's question or statement: "${speech.trim()}"`;
      
      const response = await geminiService.generateText({
        prompt: teacherPrompt,
        temperature: 0.7,
        maxTokens: 300 // Reduced for more concise responses
      });
      
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
      
      setTimeout(() => {
        speakMessage(aiResponse, aiMessageId);
      }, 300);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
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
  }, [toast, speakMessage]);

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
    registerSpeechCallback(processUserSpeech);
    
    const timer = setTimeout(() => {
      speakMessage(initialMessage.content, '1');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [initialGreeting, speakMessage, registerSpeechCallback, processUserSpeech, isInitialized]);

  useEffect(() => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      isSpeaking: msg.id === currentMessageId
    })));
  }, [currentMessageId]);

  return {
    messages,
    isProcessing,
    isListening,
    isTeacherSpeaking,
    currentTranscript,
    toggleListening,
    stopSpeaking,
    stopAll,
    speakMessage,
    replayLastResponse
  };
};
