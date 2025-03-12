
import React from 'react';
import { Mic, MicOff, Pause, Square, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TeacherFooterProps {
  isListening: boolean;
  isTeacherSpeaking: boolean;
  isProcessing: boolean;
  toggleListening: () => void;
  stopSpeaking: () => void;
  stopAll: () => void;
  replayLastResponse: () => void;
  currentTranscript: string;
  messages: any[];
}

const TeacherFooter: React.FC<TeacherFooterProps> = ({
  isListening,
  isTeacherSpeaking,
  isProcessing,
  toggleListening,
  stopSpeaking,
  stopAll,
  replayLastResponse,
  currentTranscript,
  messages
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex gap-2 mb-2">
        <Button
          variant={isListening ? "destructive" : "default"}
          size="sm"
          className="flex items-center gap-1"
          onClick={toggleListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <>
              <MicOff className="h-4 w-4" /> 
              Turn Off Microphone
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" /> 
              Turn On Microphone
            </>
          )}
        </Button>
        
        <Button
          variant={isTeacherSpeaking ? "destructive" : "default"}
          size="sm"
          className="flex items-center gap-1"
          onClick={isTeacherSpeaking ? stopSpeaking : replayLastResponse}
          disabled={isProcessing || (messages.length <= 1 && !isTeacherSpeaking)}
        >
          {isTeacherSpeaking ? (
            <>
              <Pause className="h-4 w-4" /> 
              Stop AI Speaking
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4" /> 
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
          Stop All Activity
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        {isListening ? (
          <>
            I'm listening to you. Just speak naturally and I'll respond.
            {currentTranscript && (
              <span className="block mt-1 font-medium">"...{currentTranscript.slice(-30)}"</span>
            )}
          </>
        ) : isTeacherSpeaking ? (
          "I'm speaking. Please wait..."
        ) : (
          "Click the microphone button to start speaking with me."
        )}
      </p>
    </div>
  );
};

export default TeacherFooter;
