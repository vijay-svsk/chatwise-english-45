
import React from 'react';
import { Mic, MicOff, Pause, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TeacherControlsProps {
  isListening: boolean;
  isTeacherSpeaking: boolean;
  isProcessing: boolean;
  toggleListening: () => void;
  stopSpeaking: () => void;
  stopAll: () => void;
  replayLastResponse: () => void;
  messages: any[];
}

const TeacherControls: React.FC<TeacherControlsProps> = ({
  isListening,
  isTeacherSpeaking,
  isProcessing,
  toggleListening,
  stopSpeaking,
  stopAll,
  replayLastResponse,
  messages
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="h-5 w-5 text-primary-foreground">🎓</span>
        </div>
        Interactive AI English Teacher
        {isTeacherSpeaking && (
          <Badge variant="outline" className="animate-pulse bg-primary/10">Speaking</Badge>
        )}
        {isListening && !isTeacherSpeaking && (
          <Badge variant="outline" className="animate-pulse bg-green-500/10 text-green-500">Listening</Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-1 ${isListening ? 'border-green-500' : ''}`}
          onClick={toggleListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4 text-destructive" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 text-green-500" />
              Start Listening
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-1 ${isTeacherSpeaking ? 'border-destructive' : 'border-primary'}`}
          onClick={isTeacherSpeaking ? stopSpeaking : replayLastResponse}
          disabled={isProcessing || (messages.length <= 1 && !isTeacherSpeaking)}
        >
          {isTeacherSpeaking ? (
            <>
              <Pause className="h-4 w-4 text-destructive" />
              Stop Speaking
            </>
          ) : (
            <>
              <Play className="h-4 w-4 text-primary" />
              Speak Last Response
            </>
          )}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-1"
          onClick={stopAll}
          disabled={!isListening && !isTeacherSpeaking}
        >
          <Square className="h-4 w-4" />
          Stop All
        </Button>
      </div>
    </div>
  );
};

export default TeacherControls;
