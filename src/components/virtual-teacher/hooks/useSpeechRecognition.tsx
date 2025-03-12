
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Hook to manage speech recognition functionality
 */
export const useSpeechRecognition = (onSpeechResult: (text: string) => void, toast: any) => {
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);

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
  }, [toast, setupRecognitionEventHandlers, cleanupSpeechRecognition]);

  return {
    isListening,
    currentTranscript,
    startListening,
    stopListening,
    toggleListening
  };
};
