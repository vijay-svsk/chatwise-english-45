
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { audioService } from '@/services/audioService';

export const useAudioRecording = (onAnalyzeAudio: (blob: Blob) => Promise<void>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
        setIsAnalyzing(true);
        await onAnalyzeAudio(audioBlob);
        setIsAnalyzing(false);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      audioService.playAttentionSound();
      
      toast({
        title: "Recording Started",
        description: "Please speak clearly.",
      });
    } catch (err) {
      console.error('Error starting recording:', err);
      toast({
        title: "Microphone Access Error",
        description: "Please allow microphone access to use this feature.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      audioService.playSuccessSound();
      
      // Close the audio tracks to release the microphone
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  return {
    isRecording,
    isAnalyzing,
    startRecording,
    stopRecording
  };
};
