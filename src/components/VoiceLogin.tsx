
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { authenticateWithVoice, registerVoicePrint } from '@/services/voiceAuthService';
import { useToast } from '@/hooks/use-toast';

interface VoiceLoginProps {
  onLoginSuccess: (userId: string) => void;
  userId?: string; // For registration mode
  registrationMode?: boolean;
}

const VoiceLogin: React.FC<VoiceLoginProps> = ({ 
  onLoginSuccess, 
  userId,
  registrationMode = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authResult, setAuthResult] = useState<{ success: boolean; message: string } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setAuthResult(null);
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use voice login.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  };
  
  const processAudio = async (audioBlob: Blob) => {
    try {
      if (registrationMode && userId) {
        // Register voice print
        const success = await registerVoicePrint(userId, audioBlob);
        
        if (success) {
          setAuthResult({
            success: true,
            message: "Voice print registered successfully!"
          });
          
          toast({
            title: "Voice Registration Complete",
            description: "Your voice print has been saved for future logins."
          });
        } else {
          setAuthResult({
            success: false,
            message: "Failed to register voice print. Please try again."
          });
        }
      } else {
        // Authenticate with voice
        const result = await authenticateWithVoice(audioBlob);
        
        if (result.authenticated && result.userId) {
          setAuthResult({
            success: true,
            message: `Welcome back! Confidence: ${Math.round((result.confidence || 0) * 100)}%`
          });
          
          // Notify parent component
          onLoginSuccess(result.userId);
          
          toast({
            title: "Voice Login Successful",
            description: "You have been logged in with your voice."
          });
        } else {
          setAuthResult({
            success: false,
            message: "Voice not recognized. Please try again or use email login."
          });
        }
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      setAuthResult({
        success: false,
        message: "An error occurred during voice processing."
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <Card className={cn(
      "glass-panel", 
      isRecording && "ring-2 ring-primary",
      isProcessing && "ring-2 ring-yellow-500"
    )}>
      <CardHeader>
        <CardTitle className="text-xl font-display">
          {registrationMode ? "Register Your Voice" : "Login with Your Voice"}
        </CardTitle>
        <CardDescription>
          {registrationMode 
            ? "Record your voice to set up voice authentication" 
            : "Speak naturally to identify yourself"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div 
          className={cn(
            "min-h-32 p-4 rounded-xl border border-border bg-background/50 flex flex-col items-center justify-center",
            isRecording && "animate-pulse-subtle ring-1 ring-primary",
            isProcessing && "ring-1 ring-yellow-500"
          )}
        >
          {isProcessing ? (
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Analyzing your voice...</p>
            </div>
          ) : authResult ? (
            <div className="text-center">
              {authResult.success ? (
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
              ) : (
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-4" />
              )}
              <p className={authResult.success ? "text-green-600" : "text-red-600"}>
                {authResult.message}
              </p>
            </div>
          ) : (
            <div className="text-center">
              <Mic className={cn(
                "h-12 w-12 mx-auto mb-4",
                isRecording ? "text-primary animate-pulse" : "text-primary/60"
              )} />
              <p className="text-muted-foreground">
                {isRecording ? "Listening..." : "Click the button below to start recording"}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant={isRecording ? "destructive" : "default"}
          className={cn("w-full gap-2", isRecording && "animate-pulse")}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing || (authResult?.success || false)}
        >
          {isRecording ? "Stop Recording" : "Start Voice Login"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VoiceLogin;
