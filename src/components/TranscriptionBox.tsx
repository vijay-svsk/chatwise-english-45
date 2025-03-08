
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Play, StopCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptionBoxProps {
  onTranscriptionComplete?: (text: string) => void;
  title?: string;
  description?: string;
}

const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({ 
  onTranscriptionComplete,
  title = "Record your voice",
  description = "Speak clearly into your microphone",
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore - SpeechRecognition API doesn't have TypeScript typings by default
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscription(prevTranscription => prevTranscription + finalTranscript);
          setInterimTranscription(interimTranscript);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsRecording(false);
        };
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setupMediaRecorder(stream);
      return true;
    } catch (err) {
      console.error('Error accessing microphone', err);
      setHasPermission(false);
      return false;
    }
  };
  
  const setupMediaRecorder = (stream: MediaStream) => {
    const mediaRecorder = new MediaRecorder(stream);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      audioChunksRef.current = [];
      
      // Here you could save the audio to send to an API, etc.
      console.log('Recording stopped, audio blob created');
    };
    
    mediaRecorderRef.current = mediaRecorder;
  };
  
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      if (hasPermission === null) {
        const hasAccess = await requestMicrophonePermission();
        if (!hasAccess) return;
      }
      
      startRecording();
    }
  };
  
  const startRecording = () => {
    setTranscription("");
    setInterimTranscription("");
    setIsRecording(true);
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    
    if (mediaRecorderRef.current) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    }
  };
  
  const stopRecording = () => {
    setIsRecording(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (onTranscriptionComplete) {
      onTranscriptionComplete(transcription + interimTranscription);
    }
  };
  
  return (
    <Card className={cn("glass-panel", isRecording && "ring-2 ring-primary")}>
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div 
          className={cn(
            "min-h-40 p-4 rounded-xl border border-border bg-background/50",
            isRecording && "animate-pulse-subtle ring-1 ring-primary"
          )}
        >
          {transcription || interimTranscription ? (
            <div>
              <p className="mb-2 text-foreground">{transcription}</p>
              <p className="text-muted-foreground italic">{interimTranscription}</p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {isRecording ? "Listening..." : "Begin speaking to see transcription"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant={isRecording ? "destructive" : "default"}
          className={cn("gap-2", isRecording && "animate-pulse")}
          onClick={toggleRecording}
        >
          {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        
        <Button 
          variant="outline" 
          disabled={!transcription && !interimTranscription}
          onClick={() => {
            setTranscription("");
            setInterimTranscription("");
          }}
        >
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TranscriptionBox;
