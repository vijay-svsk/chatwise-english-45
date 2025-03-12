
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

  // Initialize speech recognition with pre-declared functions to avoid circular references
  const {
    isListening,
    currentTranscript,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    toggleListening
  } = useSpeechRecognition(handleSpeechResult, toast);

  // Initialize speech synthesis with extracted functions
  const {
    isTeacherSpeaking,
    currentMessageId,
    speakMessage,
    stopSpeaking
  } = useSpeechSynthesis(
    isListening, 
    startSpeechRecognition, 
    stopSpeechRecognition, 
    toast
  );

  // Stop everything - both listening and speaking
  const stopAll = useCallback(() => {
    if (isListening) {
      stopSpeechRecognition();
    }
    if (isTeacherSpeaking) {
      stopSpeaking();
    }
  }, [isListening, isTeacherSpeaking, stopSpeechRecognition, stopSpeaking]);

  return {
    isListening,
    isTeacherSpeaking,
    currentTranscript,
    currentMessageId,
    startListening: startSpeechRecognition,
    stopListening: stopSpeechRecognition,
    toggleListening,
    speakMessage,
    stopSpeaking,
    stopAll,
    registerSpeechCallback
  };
}
