
import React from 'react';
import { Message } from './types';
import { Bot, User, Volume2, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageBubbleProps {
  message: Message;
  speakMessage: (text: string) => void;
  isCurrentlySpeaking: boolean;
  stopSpeaking: () => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  speakMessage,
  isCurrentlySpeaking,
  stopSpeaking
}) => {
  const isAi = message.sender === 'ai';
  const isUser = message.sender === 'user';
  
  const handleSpeakToggle = () => {
    if (isCurrentlySpeaking) {
      stopSpeaking();
    } else {
      speakMessage(message.content);
    }
  };
  
  return (
    <div 
      className={cn(
        "flex gap-2 items-start",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {isAi && (
        <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center flex-shrink-0 mt-1">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      
      <div 
        className={cn(
          "px-4 py-3 rounded-xl max-w-[80%]",
          isUser 
            ? "bg-secondary text-secondary-foreground" 
            : "bg-primary/10 text-foreground",
          message.isProcessing ? "animate-pulse" : ""
        )}
      >
        {message.isProcessing ? (
          message.content ? (
            <p className="text-muted-foreground italic">{message.content}</p>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          )
        ) : (
          <div>
            <p className="whitespace-pre-wrap">{message.content}</p>
            
            {isAi && (
              <div className="mt-2 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 rounded-full", 
                    isCurrentlySpeaking && "bg-primary/20"
                  )}
                  onClick={handleSpeakToggle}
                  title={isCurrentlySpeaking ? "Stop speaking" : "Speak this message"}
                >
                  {isCurrentlySpeaking ? (
                    <Pause className="h-4 w-4 text-primary" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="rounded-full w-8 h-8 bg-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
