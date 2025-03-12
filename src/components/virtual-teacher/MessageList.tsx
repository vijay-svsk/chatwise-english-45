
import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
  speakMessage: (text: string) => void;
  isTeacherSpeaking: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  speakMessage,
  isTeacherSpeaking 
}) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={messageContainerRef}
      className="h-full overflow-y-auto p-4 space-y-4"
    >
      {messages.map((message) => (
        <MessageBubble 
          key={message.id}
          message={message}
          speakMessage={speakMessage}
          isTeacherSpeaking={isTeacherSpeaking}
        />
      ))}
    </div>
  );
};

export default MessageList;
