
import { useState, useCallback, useEffect, useRef } from 'react';
import { useSpeechServices } from './SpeechService';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/geminiService';
import { audioService } from '@/services/audioService';
import { Message } from './types';

// Knowledge base to enhance teacher's responses
const KNOWLEDGE_BASE = {
  greetings: [
    "Hello! I'm your AI English teacher. How can I help you today?",
    "Hi there! Ready to practice English?",
    "Welcome back! What would you like to learn today?",
    "Greetings! I'm here to help with your English learning journey."
  ],
  grammar: {
    presentSimple: "The present simple tense is used for habits, facts, and regular actions. Example: 'She works in London.'",
    presentContinuous: "The present continuous tense is used for actions happening now or temporary situations. Example: 'She is working from home this week.'",
    pastSimple: "The past simple tense is used for completed actions in the past. Example: 'She worked in Paris last year.'",
    pastContinuous: "The past continuous tense is used for actions that were in progress at a specific time in the past. Example: 'She was working when I called.'",
    futureSimple: "The future simple tense with 'will' is used for predictions or spontaneous decisions. Example: 'I think it will rain tomorrow.'",
    articles: "English has three articles: 'a', 'an', and 'the'. 'A' and 'an' are indefinite articles used before non-specific nouns. 'The' is the definite article used for specific nouns."
  },
  vocabulary: {
    levels: "English vocabulary is often categorized as basic, intermediate, advanced, and academic.",
    learning: "Effective vocabulary learning involves using new words in context, regular revision, and creating associations."
  },
  pronunciation: {
    vowelSounds: "English has around 20 vowel sounds including short vowels, long vowels, and diphthongs.",
    consonantSounds: "English has about 24 consonant sounds. Some, like 'th', can be difficult for non-native speakers.",
    word_stress: "In English, word stress is important. Incorrect stress can make words difficult to understand."
  },
  conversation: {
    formalGreetings: "Formal greetings include 'Good morning/afternoon/evening', 'Hello', and 'How do you do?'",
    informalGreetings: "Informal greetings include 'Hi', 'Hey', and 'What's up?'",
    smallTalk: "Common small talk topics include the weather, recent events, work, and hobbies."
  },
  idioms: {
    common: [
      "Break a leg - Good luck",
      "It's raining cats and dogs - It's raining heavily",
      "Speak of the devil - When the person you just talked about appears",
      "Cost an arm and a leg - Very expensive"
    ]
  }
};

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
      
      // Enhanced prompt with knowledge base context
      const knowledgePrompt = `As a helpful and encouraging English teacher with the following knowledge base:
      
Grammar: Basic tenses, articles, prepositions, conditionals
Vocabulary: Common words, idioms, phrasal verbs, collocations
Pronunciation: Vowels, consonants, word stress, intonation
Conversation: Greetings, small talk, discussions, debates

Please respond to this student in a clear, conversational and helpful way. 
If they ask about grammar, provide simple explanations with examples.
If they ask about vocabulary, explain the meaning and provide example sentences.
If they ask about pronunciation, describe how to position the mouth and tongue.
Focus on helping them learn English naturally: "${speech.trim()}"`;
      
      const response = await geminiService.generateText({
        prompt: knowledgePrompt,
        temperature: 0.7,
        maxTokens: 500
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

  useEffect(() => {
    if (isInitialized) return;
    
    const initialMessage: Message = {
      id: '1',
      content: initialGreeting || KNOWLEDGE_BASE.greetings[0],
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
