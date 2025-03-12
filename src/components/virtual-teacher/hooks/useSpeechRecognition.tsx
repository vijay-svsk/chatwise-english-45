
import { useState, useRef, useEffect, useCallback } from 'react';

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
      // First ensure any existing recognition is stopped
      if (recognitionRef.current.state === 'running') {
        recognitionRef.current.stop();
      }
      
      // Small delay to ensure previous instance is fully stopped
      setTimeout(() => {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (error) {
          console.error('Failed to start speech recognition:', error);
          setIsListening(false);
          toast({
            title: "Speech Recognition Error",
            description: "Please try again in a moment.",
            variant: "destructive"
          });
        }
      }, 100);
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      setIsListening(false);
      toast({
        title: "Speech Recognition Error",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
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
      
      // Only show error for non-no-speech errors
      if (error.error === 'no-speech') {
        // Just restart recognition if no speech was detected
        if (isListening) {
          try {
            recognitionRef.current.stop();
            setTimeout(() => {
              if (isListening) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (err) {
            console.error('Error restarting recognition:', err);
          }
        }
        return;
      }
      
      // For other errors, notify user and try to recover
      toast({
        title: "Speech Recognition Error",
        description: "There was an error. Please try again.",
        variant: "destructive"
      });
      
      setIsListening(false);
      
      // Try to recover after a brief pause
      setTimeout(() => {
        if (isListening) {
          startListening();
        }
      }, 1000);
    };

    recognitionRef.current.onend = () => {
      // Only restart if we're supposed to be listening
      if (isListening) {
        try {
          // Small delay before restarting
          setTimeout(() => {
            if (isListening && recognitionRef.current) {
              recognitionRef.current.start();
            }
          }, 100);
        } catch (error) {
          console.error('Failed to restart speech recognition:', error);
          setIsListening(false);
        }
      }
    };

    // Handle recognition results
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
      if (isFinal && transcript.trim().length > 2) {
        // Reset the transcript
        setCurrentTranscript('');
        
        // Clear any pending timeout
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
          speechTimeoutRef.current = null;
        }
        
        // Process the complete utterance
        if (!processingRef.current) {
          processingRef.current = true;
          
          // Send to callback after small delay to debounce
          setTimeout(() => {
            onSpeechResult(transcript.trim());
            processingRef.current = false;
          }, 300);
        }
      }
    };
  }, [isListening, startListening, toast, onSpeechResult]);

  // Initialize speech recognition
  useEffect(() => {
    // Clean up any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error cleaning up recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      setupRecognitionEventHandlers();
    } else {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome.",
        variant: "destructive"
      });
    }
    
    return () => {
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
    };
  }, [toast, setupRecognitionEventHandlers]);

  return {
    isListening,
    currentTranscript,
    startListening,
    stopListening,
    toggleListening
  };
};
