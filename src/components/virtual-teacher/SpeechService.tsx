
import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSpeechServices() {
  const [isListening, setIsListening] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const recognitionRef = useRef<any>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      // @ts-ignore
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onerror = (error: any) => {
        console.error('Speech recognition error', error);
        if (error.error === 'no-speech') {
          // This is a common error when no speech is detected, we don't need to show a toast for this
          return;
        }
        
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
          recognitionRef.current.start();
        }
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
      
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, [toast, isListening]);

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
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
          return transcript.trim();
        }
      };
      
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

  // Speak a message
  const speakMessage = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      // If already speaking, cancel it
      if (isTeacherSpeaking) {
        window.speechSynthesis.cancel();
        setIsTeacherSpeaking(false);
        return;
      }
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95; // Slightly slower than default
      utterance.pitch = 1.0;
      
      // Find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google UK')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      // Set up event handlers
      utterance.onstart = () => {
        setIsTeacherSpeaking(true);
        // Pause listening while speaking to avoid feedback loops
        if (isListening) {
          stopListening();
        }
      };
      
      utterance.onend = () => {
        setIsTeacherSpeaking(false);
        // Resume listening after a short delay
        setTimeout(() => {
          if (!isListening) {
            startListening();
          }
        }, 300);
      };
      
      utterance.onerror = () => {
        setIsTeacherSpeaking(false);
        toast({
          title: "Speech Error",
          description: "There was an error with text-to-speech. Please try again.",
          variant: "destructive"
        });
        
        // Resume listening
        if (!isListening) {
          startListening();
        }
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech. Please use a modern browser.",
        variant: "destructive"
      });
    }
  }, [isTeacherSpeaking, isListening, stopListening, startListening, toast]);

  return {
    isListening,
    isTeacherSpeaking,
    currentTranscript,
    startListening,
    stopListening,
    toggleListening,
    speakMessage,
  };
}
