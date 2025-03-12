
import { useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

/**
 * Main hook combining all speech functionalities
 */
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
