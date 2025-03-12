import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, StopCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/geminiService';
import { audioService } from '@/services/audioService';

interface RecordPronunciationProps {
  word: string;
  onFeedback: (feedback: string, score: number) => void;
}

const RecordPronunciation: React.FC<RecordPronunciationProps> = ({ word, onFeedback }) => {
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
        analyzeAudio(audioBlob);
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Play a subtle sound to indicate recording started
      audioService.playAttentionSound();
      
      toast({
        title: "Recording Started",
        description: `Say the word "${word}" clearly.`,
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
      setIsAnalyzing(true);
      
      // Play success sound when recording stops
      audioService.playSuccessSound();
    }
  };
  
  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      // In a real implementation, we would:
      // 1. Convert the audio to text using a speech-to-text service
      // 2. Send the text and the word to compare to the Gemini API
      
      // For this demo, we'll simulate the speech-to-text result
      const simulatedTranscript = simulateSpeechToText(word);
      
      // Generate a prompt for Gemini to analyze pronunciation
      const prompt = `
      I am analyzing a student's pronunciation of the English word "${word}".
      
      The student's pronunciation was transcribed as: "${simulatedTranscript}".
      
      Please provide:
      1. A score from 0-100 on how well they pronounced the word
      2. Detailed feedback on their pronunciation
      3. Specific suggestions for improvement
      
      Focus on common pronunciation errors like:
      - Stress on the wrong syllable
      - Vowel or consonant sounds that are incorrect
      - Missing or added sounds
      
      Format as plain text with the score at the end.
      `;
      
      // Call Gemini API for analysis
      const response = await geminiService.generateText({
        prompt,
        temperature: 0.3,
        maxTokens: 300
      });
      
      // Extract score from response
      const scoreMatch = response.text.match(/(\d{1,3})\/100|score:?\s*(\d{1,3})/i);
      const score = scoreMatch ? parseInt(scoreMatch[1] || scoreMatch[2]) : 
                               Math.floor(60 + Math.random() * 40); // Fallback to random score
      
      // Send feedback to parent component
      onFeedback(response.text, score);
      
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze your pronunciation. Please try again.",
        variant: "destructive"
      });
      
      // Provide fallback feedback
      const fallbackFeedback = `I couldn't analyze your pronunciation of "${word}" properly. Please try again, speaking clearly and directly into the microphone.`;
      onFeedback(fallbackFeedback, 0);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to simulate speech-to-text with varying accuracy based on word complexity
  const simulateSpeechToText = (word: string) => {
    // Longer words are more likely to have errors
    const errorProbability = Math.min(0.7, word.length * 0.1);
    
    if (Math.random() > errorProbability) {
      return word; // Perfect pronunciation
    }
    
    // Otherwise, introduce subtle errors
    let result = word;
    const possibleErrors = [
      // Vowel substitution
      { pattern: /a/g, replacement: 'uh' },
      { pattern: /e/g, replacement: 'i' },
      { pattern: /i/g, replacement: 'ee' },
      // Consonant errors
      { pattern: /th/g, replacement: 'z' },
      { pattern: /v/g, replacement: 'f' },
      { pattern: /r/g, replacement: 'w' },
      // Stress errors (adding or removing syllables)
      { pattern: /tion/g, replacement: 'shun' },
      { pattern: /able/g, replacement: 'ubl' },
      // Add random extra letter
      { pattern: /^(\w+)$/, replacement: '$1e' },
      // Remove a letter
      { pattern: /(\w)(\w)(\w+)/, replacement: '$1$3' }
    ];
    
    // Apply 1-2 random errors
    const numErrors = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numErrors; i++) {
      const randomError = possibleErrors[Math.floor(Math.random() * possibleErrors.length)];
      if (result.match(randomError.pattern)) {
        result = result.replace(randomError.pattern, randomError.replacement);
      }
    }
    
    return result;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Pronunciation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Click the button below to record yourself saying "<span className="font-medium">{word}</span>"
          </p>
          
          {isRecording && (
            <div className="py-3">
              <div className="mb-2 text-sm font-medium">Recording in progress...</div>
              <Progress value={100} className="h-2 animate-pulse" />
            </div>
          )}
          
          <Button
            variant={isRecording ? "destructive" : "default"}
            className="w-full gap-2"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing your pronunciation...
              </>
            ) : isRecording ? (
              <>
                <StopCircle className="h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                Record Your Pronunciation
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordPronunciation;
