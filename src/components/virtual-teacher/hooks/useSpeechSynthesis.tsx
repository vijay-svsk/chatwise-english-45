
import { useState, useCallback, useEffect } from 'react';
import { audioService } from '@/services/audioService';

/**
 * Hook to manage speech synthesis functionality
 */
export const useSpeechSynthesis = (
  isListening: boolean, 
  startListening: () => void, 
  stopListening: () => void, 
  toast: any
) => {
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
