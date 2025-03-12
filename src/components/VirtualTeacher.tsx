
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import TeacherAvatar from './virtual-teacher/TeacherAvatar';
import MessageList from './virtual-teacher/MessageList';
import TeacherControls from './virtual-teacher/TeacherControls';
import TeacherFooter from './virtual-teacher/TeacherFooter';
import { useTeacherLogic } from './virtual-teacher/useTeacherLogic';
import { VirtualTeacherProps } from './virtual-teacher/types';

const VirtualTeacher: React.FC<VirtualTeacherProps> = ({ 
  initialGreeting = "Hello! I'm your AI English teacher. I'm here to help you learn English. What would you like to discuss today?",
}) => {
  const {
    messages,
    isProcessing,
    isListening,
    isTeacherSpeaking,
    currentTranscript,
    toggleListening,
    stopSpeaking,
    speakMessage,
    replayLastResponse
  } = useTeacherLogic(initialGreeting);

  return (
    <Card className="w-full h-[700px] flex flex-col glass-panel overflow-hidden">
      <CardHeader className="pb-2 border-b">
        <TeacherControls 
          isListening={isListening}
          isTeacherSpeaking={isTeacherSpeaking}
          isProcessing={isProcessing}
          toggleListening={toggleListening}
          stopSpeaking={stopSpeaking}
          replayLastResponse={replayLastResponse}
          messages={messages}
        />
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto p-4 flex flex-col">
        <div className="flex flex-col items-center justify-center mb-4">
          <TeacherAvatar 
            isTeacherSpeaking={isTeacherSpeaking} 
            isListening={isListening && !isTeacherSpeaking}
          />
          
          {currentTranscript && isListening && !isTeacherSpeaking && (
            <div className="mt-2 px-4 py-2 bg-green-500/10 text-green-800 dark:text-green-300 rounded-full animate-pulse max-w-[80%] text-center">
              {currentTranscript}
            </div>
          )}
        </div>
        
        <div className="flex-grow overflow-hidden bg-card/50 rounded-lg border shadow-sm">
          <MessageList 
            messages={messages}
            speakMessage={speakMessage}
            stopSpeaking={stopSpeaking}
            isTeacherSpeaking={isTeacherSpeaking}
          />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t mt-auto">
        <TeacherFooter 
          isListening={isListening}
          isTeacherSpeaking={isTeacherSpeaking}
          isProcessing={isProcessing}
          toggleListening={toggleListening}
          stopSpeaking={stopSpeaking}
          replayLastResponse={replayLastResponse}
          currentTranscript={currentTranscript}
          messages={messages}
        />
      </CardFooter>
    </Card>
  );
};

export default VirtualTeacher;
