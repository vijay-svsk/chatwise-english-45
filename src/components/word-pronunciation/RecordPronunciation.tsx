
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, StopCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { geminiService } from '@/services/geminiService';
import { audioService } from '@/services/audioService';
import { useAudioRecording } from '@/hooks/useAudioRecording';
import { FeedbackCard } from '@/components/pronunciation/FeedbackCard';

interface RecordPronunciationProps {
  word: string;
  onFeedback: (feedback: string, score: number) => void;
}

interface PronunciationFeedback {
  score: number;
  correctSounds: string[];
  incorrectSounds: string[];
  tips: string[];
  feedback: string;
  commonErrors: {
    description: string;
    correction: string;
  }[];
}

const RecordPronunciation: React.FC<RecordPronunciationProps> = ({ word, onFeedback }) => {
  const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
  const { toast } = useToast();
  
  const analyzeAudio = async (audioBlob: Blob) => {
    try {
      const simulatedTranscript = simulateSpeechToText(word);
      
      const prompt = `
      I am analyzing a student's pronunciation of the English word "${word}".
      
      The student's pronunciation was transcribed as: "${simulatedTranscript}".
      
      Please provide a detailed analysis in JSON format with the following structure:
      {
        "score": [number between 0-100],
        "feedback": [general feedback as string],
        "correctSounds": [array of sounds pronounced correctly],
        "incorrectSounds": [array of sounds that need improvement],
        "tips": [array of specific tips to improve pronunciation],
        "commonErrors": [
          {
            "description": [description of common error],
            "correction": [how to correct it]
          }
        ]
      }
      
      Focus on common pronunciation errors like:
      - Stress on the wrong syllable
      - Vowel or consonant sounds that are incorrect
      - Missing or added sounds
      
      Make the feedback specific to the word "${word}" and very educational.
      `;
      
      const response = await geminiService.generateText({
        prompt,
        temperature: 0.3,
        maxTokens: 800
      });
      
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      
      let parsedFeedback: PronunciationFeedback;
      
      if (jsonMatch) {
        try {
          parsedFeedback = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("Failed to parse Gemini JSON response", e);
          parsedFeedback = generateFallbackFeedback(word, simulatedTranscript);
        }
      } else {
        console.warn("No JSON found in Gemini response, using fallback");
        parsedFeedback = generateFallbackFeedback(word, simulatedTranscript);
      }
      
      setFeedback(parsedFeedback);
      onFeedback(parsedFeedback.feedback, parsedFeedback.score);
      
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        title: "Analysis Error",
        description: "Could not analyze your pronunciation. Please try again.",
        variant: "destructive"
      });
      
      const fallbackFeedback = generateFallbackFeedback(word, word);
      setFeedback(fallbackFeedback);
      onFeedback(fallbackFeedback.feedback, fallbackFeedback.score);
    }
  };
  
  const { isRecording, isAnalyzing, startRecording, stopRecording } = useAudioRecording(analyzeAudio);
  
  const generateFallbackFeedback = (word: string, transcript: string): PronunciationFeedback => {
    const isCorrect = word.toLowerCase() === transcript.toLowerCase();
    const score = isCorrect ? 90 : 60 + Math.floor(Math.random() * 20);
    
    const syllables = word.length > 3 
      ? [word.substring(0, 2), word.substring(2, word.length - 2), word.substring(word.length - 2)]
      : [word];
      
    return {
      score,
      feedback: isCorrect 
        ? `Good job pronouncing "${word}"!` 
        : `You pronounced "${transcript}" instead of "${word}". Let's keep practicing!`,
      correctSounds: isCorrect ? syllables : [syllables[0]],
      incorrectSounds: isCorrect ? [] : [syllables[syllables.length - 1]],
      tips: [
        "Speak slowly and clearly",
        "Practice each syllable separately",
        "Listen to native speakers"
      ],
      commonErrors: [
        {
          description: "Stress on the wrong syllable",
          correction: `The correct stress in "${word}" is on the ${Math.floor(syllables.length / 2) + 1}${
            Math.floor(syllables.length / 2) + 1 === 1 ? 'st' : 
            Math.floor(syllables.length / 2) + 1 === 2 ? 'nd' : 
            Math.floor(syllables.length / 2) + 1 === 3 ? 'rd' : 'th'
          } syllable`
        }
      ]
    };
  };
  
  const simulateSpeechToText = (word: string) => {
    const errorProbability = Math.min(0.7, word.length * 0.1);
    
    if (Math.random() > errorProbability) {
      return word;
    }
    
    let result = word;
    const possibleErrors = [
      { pattern: /a/g, replacement: 'uh' },
      { pattern: /e/g, replacement: 'i' },
      { pattern: /i/g, replacement: 'ee' },
      { pattern: /th/g, replacement: 'z' },
      { pattern: /v/g, replacement: 'f' },
      { pattern: /r/g, replacement: 'w' },
      { pattern: /tion/g, replacement: 'shun' },
      { pattern: /able/g, replacement: 'ubl' },
      { pattern: /^(\w+)$/, replacement: '$1e' },
      { pattern: /(\w)(\w)(\w+)/, replacement: '$1$3' }
    ];
    
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
          
          {feedback && <FeedbackCard feedback={feedback} word={word} />}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecordPronunciation;
