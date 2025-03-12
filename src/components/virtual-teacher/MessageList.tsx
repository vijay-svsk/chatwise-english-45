
import React, { useRef, useEffect } from 'react';
import { Message } from './types';
import { Bot, User, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface MessageListProps {
  messages: Message[];
  speakMessage: (text: string) => void;
  stopSpeaking: () => void;
  isTeacherSpeaking: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  speakMessage,
  stopSpeaking,
  isTeacherSpeaking
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div 
          key={message.id} 
          className={cn(
            "flex flex-col gap-1", 
            message.sender === 'user' ? "items-end" : "items-start"
          )}
        >
          <div className="flex items-center gap-2">
            <div 
              className={cn(
                "rounded-full w-8 h-8 flex items-center justify-center",
                message.sender === 'user' ? "bg-secondary" : "bg-primary"
              )}
            >
              {message.sender === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4 text-primary-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          <div 
            className={cn(
              "max-w-[80%] px-4 py-3 rounded-xl",
              message.sender === 'user' 
                ? "bg-secondary text-secondary-foreground" 
                : "bg-primary/10 text-foreground"
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
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}
            
            {message.sender === 'ai' && !message.isProcessing && (
              <div className="mt-2 flex justify-end">
                {isTeacherSpeaking && message.isSpeaking ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full text-destructive"
                    onClick={stopSpeaking}
                    title="Stop speaking"
                  >
                    <VolumeX className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full"
                    onClick={() => speakMessage(message.content)}
                    title="Play message"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
