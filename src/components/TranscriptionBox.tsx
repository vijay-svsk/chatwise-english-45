
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Play, StopCircle, Loader2, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface TranscriptionBoxProps {
  onTranscriptionComplete?: (text: string) => void;
  onAnalysisComplete?: (analysis: any) => void;
  title?: string;
  description?: string;
  isProcessing?: boolean;
  enableAIAnalysis?: boolean;
}

const TranscriptionBox: React.FC<TranscriptionBoxProps> = ({ 
  onTranscriptionComplete,
  onAnalysisComplete,
  title = "Record your voice",
  description = "Speak clearly into your microphone",
  isProcessing = false,
  enableAIAnalysis = true
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [interimTranscription, setInterimTranscription] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioBlob = useRef<Blob | null>(null);
  const { toast } = useToast();
  
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
      
      // Clean up audio stream on unmount
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setHasPermission(true);
      setupMediaRecorder(stream);
      return true;
    } catch (err) {
      console.error('Error accessing microphone', err);
      setHasPermission(false);
      toast({
        title: "Microphone Access Failed",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive"
      });
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
      audioBlob.current = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      
      // Make the audio available for AI analysis
      if (enableAIAnalysis && transcription && onAnalysisComplete) {
        analyzeAudio();
      }
      
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
    audioChunksRef.current = [];
    
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
    
    if (mediaRecorderRef.current) {
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
      const finalTranscription = transcription + interimTranscription;
      onTranscriptionComplete(finalTranscription);
      setTranscription(finalTranscription);
      setInterimTranscription("");
    }
  };
  
  const analyzeAudio = async () => {
    if (!audioBlob.current || !transcription) {
      toast({
        title: "Analysis Failed",
        description: "No audio recording or transcription to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      // Send the audio and transcription to Gemini API for analysis
      const analysis = await geminiService.analyzeAudio(audioBlob.current, transcription);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysis);
      }
      
      toast({
        title: "Analysis Complete",
        description: "Your speech has been analyzed successfully."
      });
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze your recording. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const handleManualAnalysis = () => {
    if (audioBlob.current && transcription) {
      analyzeAudio();
    } else {
      toast({
        title: "Nothing to Analyze",
        description: "Please record your speech first.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Card className={cn(
      "glass-panel", 
      isRecording && "ring-2 ring-primary",
      isProcessing && "ring-2 ring-yellow-500"
    )}>
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-display">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div 
          className={cn(
            "min-h-40 p-4 rounded-xl border border-border bg-background/50",
            isRecording && "animate-pulse-subtle ring-1 ring-primary",
            isProcessing && "ring-1 ring-yellow-500"
          )}
        >
          {transcription || interimTranscription ? (
            <div>
              <p className="mb-2 text-foreground">{transcription}</p>
              <p className="text-muted-foreground italic">{interimTranscription}</p>
              
              {(isProcessing || isAnalyzing) && (
                <div className="mt-4 flex items-center justify-center text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isAnalyzing ? "Analyzing your speech..." : "Processing..."}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {isRecording ? "Listening..." : "Begin speaking to see transcription"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2 justify-between">
        <div className="flex gap-2">
          <Button 
            variant={isRecording ? "destructive" : "default"}
            className={cn("gap-2", isRecording && "animate-pulse")}
            onClick={toggleRecording}
            disabled={isProcessing || isAnalyzing}
          >
            {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isRecording ? "Stop Recording" : "Start Recording"}
          </Button>
          
          {enableAIAnalysis && transcription && !isRecording && (
            <Button
              variant="secondary"
              className="gap-2"
              onClick={handleManualAnalysis}
              disabled={isProcessing || isAnalyzing || !transcription}
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="h-4 w-4" />
              )}
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          )}
        </div>
        
        <Button 
          variant="outline" 
          disabled={(!transcription && !interimTranscription) || isProcessing || isAnalyzing}
          onClick={() => {
            setTranscription("");
            setInterimTranscription("");
            audioBlob.current = null;
          }}
        >
          Clear
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TranscriptionBox;
