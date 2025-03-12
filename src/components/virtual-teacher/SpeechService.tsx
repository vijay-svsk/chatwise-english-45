
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { audioService } from '@/services/audioService';

// Smaller function to manage speech recognition
const useSpeechRecognition = (onSpeechResult: (text: string) => void, toast: any) => {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

  // Initialize speech recognition
  useEffect(() => {
    if (recognitionRef.current) return;
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      // Set up event handlers
      setupRecognitionEventHandlers();
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use a modern browser like Chrome.",
        variant: "destructive"
      });
    }
    
    return () => cleanupSpeechRecognition();
  }, [toast]);

  // Set up event handlers for speech recognition
  const setupRecognitionEventHandlers = useCallback(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onerror = (error: any) => {
      console.error('Speech recognition error', error);
      if (error.error === 'no-speech') return;
      
      toast({
        title: "Speech Recognition Error",
        description: "There was an error with speech recognition. We'll restart it automatically.",
        variant: "destructive"
      });
      
      // Attempt to restart recognition after a brief pause
      setTimeout(() => {
        if (isListening) {
          stopListening();
          startListening();
        }
      }, 1000);
    };

    recognitionRef.current.onend = () => {
      // Automatically restart if we're still supposed to be listening
      if (isListening) {
        try {
          recognitionRef.current.start();
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          setIsListening(false);
        }
      }
    };

    // Set up the result handler
    recognitionRef.current.onresult = (event: any) => {
      let transcript = '';
      let isFinal = false;
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }
      
      setCurrentTranscript(transcript);
      
      // If we have a final result and it's not just a short utterance
      if (isFinal && transcript.trim().length > 3) {
        // Reset the transcript
        setCurrentTranscript('');
        
        // Clear any pending timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        
        // Process the complete utterance
        const finalTranscript = transcript.trim();
        if (!processingRef.current) {
          processingRef.current = true;
          
          // Small delay to debounce multiple recognitions
          setTimeout(() => {
            onSpeechResult(finalTranscript);
            processingRef.current = false;
          }, 300);
        }
      }
    };
  }, [isListening, startListening, stopListening, toast, onSpeechResult]);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech Recognition Not Available",
        description: "Your browser doesn't support speech recognition. Please use Chrome.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      toast({
        title: "Speech Recognition Error",
        description: "Failed to start speech recognition. Please try again.",
        variant: "destructive"
      });
      setIsListening(false);
    }
  }, [toast]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
      setIsListening(false);
      setCurrentTranscript('');
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  // Toggle speech recognition
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Cleanup speech recognition resources
  const cleanupSpeechRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping recognition on cleanup:', error);
      }
    }
    
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
  }, []);

  return {
    isListening,
    currentTranscript,
    startListening,
    stopListening,
    toggleListening
  };
};

// Smaller function to manage speech synthesis
const useSpeechSynthesis = (isListening: boolean, startListening: () => void, stopListening: () => void, toast: any) => {
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);

  // Stop AI speaking
  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsTeacherSpeaking(false);
      setCurrentMessageId(null);
    }
  }, []);

  // Speak a message
  const speakMessage = useCallback((text: string, messageId?: string) => {
    if ('speechSynthesis' in window) {
      // If already speaking, cancel it
      if (isTeacherSpeaking) {
        window.speechSynthesis.cancel();
        setIsTeacherSpeaking(false);
        setCurrentMessageId(null);
        
        // If we're trying to speak the same message that was just canceled, return
        if (messageId && messageId === currentMessageId) {
          return;
        }
      }
      
      // Set the current message ID
      if (messageId) {
        setCurrentMessageId(messageId);
      }
      
      // Use the improved audioService to speak
      try {
        setIsTeacherSpeaking(true);
        
        // If we're listening, temporarily stop
        if (isListening) {
          stopListening();
        }
        
        audioService.speak(text, {
          rate: 0.95,
          pitch: 1.0,
          volume: 1.0
        }).then(() => {
          // Speech completed successfully
          setIsTeacherSpeaking(false);
          setCurrentMessageId(null);
          
          // Resume listening after a short delay
          setTimeout(() => {
            if (!isListening) {
              startListening();
            }
          }, 500);
        }).catch((error) => {
          console.error("Speech synthesis error:", error);
          setIsTeacherSpeaking(false);
          setCurrentMessageId(null);
          
          toast({
            title: "Speech Error",
            description: "There was an error with text-to-speech. Please try again.",
            variant: "destructive"
          });
          
          // Resume listening
          if (!isListening) {
            startListening();
          }
        });
      } catch (error) {
        console.error("Speech synthesis setup error:", error);
        setIsTeacherSpeaking(false);
        setCurrentMessageId(null);
        
        toast({
          title: "Speech Error",
          description: "Failed to start text-to-speech. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech. Please use a modern browser.",
        variant: "destructive"
      });
    }
  }, [isTeacherSpeaking, isListening, currentMessageId, stopListening, startListening, toast]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    isTeacherSpeaking,
    currentMessageId,
    speakMessage,
    stopSpeaking
  };
};

// Main hook combining all speech functionalities
export function useSpeechServices() {
  const { toast } = useToast();
  const speechCallbackRef = useRef<((text: string) => void) | null>(null);
  
  // Handle speech recognition results
  const handleSpeechResult = useCallback((text: string) => {
    if (speechCallbackRef.current) {
      speechCallbackRef.current(text);
    }
  }, []);

  // Register callback for speech recognition results
  const registerSpeechCallback = useCallback((callback: (text: string) => void) => {
    speechCallbackRef.current = callback;
  }, []);

  // Initialize speech recognition 
  const {
    isListening,
    currentTranscript,
    startListening,
    stopListening,
    toggleListening
  } = useSpeechRecognition(handleSpeechResult, toast);

  // Initialize speech synthesis
  const {
    isTeacherSpeaking,
    currentMessageId,
    speakMessage,
    stopSpeaking
  } = useSpeechSynthesis(isListening, startListening, stopListening, toast);

  return {
    isListening,
    isTeacherSpeaking,
    currentTranscript,
    currentMessageId,
    startListening,
    stopListening,
    toggleListening,
    speakMessage,
    stopSpeaking,
    registerSpeechCallback
  };
}
