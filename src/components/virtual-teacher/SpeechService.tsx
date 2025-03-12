
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSpeechServices() {
  const [isRecording, setIsRecording] = useState(false);
  const [isTeacherSpeaking, setIsTeacherSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
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
        toast({
          title: "Speech Recognition Error",
          description: "There was an error with speech recognition. Please try typing your question.",
          variant: "destructive"
        });
        setIsRecording(false);
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
    };
  }, [toast]);

  const toggleMicrophone = (setInputText: (text: string) => void) => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        // Set onresult handler right before starting
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              transcript += event.results[i][0].transcript;
            }
          }
          
          if (transcript) {
            // Fixed: Now properly setting the text instead of trying to modify it functionally
            setInputText(transcript.trim());
          }
        };
        
        recognitionRef.current.start();
        setIsRecording(true);
      }
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isTeacherSpeaking) {
        window.speechSynthesis.cancel();
        setIsTeacherSpeaking(false);
        return;
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9; // Slightly slower than default
      
      // Find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Google')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      utterance.onstart = () => setIsTeacherSpeaking(true);
      utterance.onend = () => setIsTeacherSpeaking(false);
      utterance.onerror = () => {
        setIsTeacherSpeaking(false);
        toast({
          title: "Speech Error",
          description: "There was an error with text-to-speech. Please try again.",
          variant: "destructive"
        });
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser doesn't support text-to-speech. Please use a modern browser.",
        variant: "destructive"
      });
    }
  };

  return {
    isRecording,
    isTeacherSpeaking,
    toggleMicrophone,
    speakMessage,
    recognitionRef
  };
}
