
import React from 'react';
import { Bot, Volume2, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  speakMessage: (text: string) => void;
  isTeacherSpeaking: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  speakMessage,
  isTeacherSpeaking
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSpeakClick = () => {
    speakMessage(message.content);
  };

  return (
    <div 
      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}
    >
      {message.sender === 'ai' && (
        <div className="w-8 h-8 mt-1 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
          <Bot className="h-4 w-4" />
        </div>
      )}
      
      <div className={`max-w-[80%] flex flex-col`}>
        <div className={`rounded-lg p-3 ${
          message.sender === 'user' 
            ? 'bg-primary text-primary-foreground self-end' 
            : 'bg-secondary text-secondary-foreground'
        }`}>
          {message.isProcessing ? (
            <div className="flex gap-1 items-center h-6 px-2">
              <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-current opacity-75 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          ) : (
            message.content
          )}
        </div>
        
        <div className={`text-xs text-muted-foreground mt-1 flex items-center gap-2 ${
          message.sender === 'user' ? 'justify-end' : 'justify-start'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          
          {message.sender === 'ai' && !message.isProcessing && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 rounded-full"
              onClick={handleSpeakClick}
              title={isTeacherSpeaking ? "AI is speaking" : "Speak this message"}
            >
              {isTeacherSpeaking ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>
      
      {message.sender === 'user' && (
        <div className="w-8 h-8 mt-1 rounded-full bg-primary flex items-center justify-center text-primary-foreground flex-shrink-0">
          <span className="text-xs font-semibold">You</span>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
