
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  sendMessage: () => void;
  toggleMicrophone: () => void;
  isRecording: boolean;
  isProcessing: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
  inputText,
  setInputText,
  sendMessage,
  toggleMicrophone,
  isRecording,
  isProcessing,
  handleKeyDown
}) => {
  return (
    <div className="flex items-center w-full gap-2">
      <Button 
        variant={isRecording ? "destructive" : "outline"} 
        size="icon" 
        onClick={toggleMicrophone}
        className={`${isRecording ? "animate-pulse" : ""}`}
      >
        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
      
      <Input
        placeholder="Ask your question here..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isProcessing}
        className="flex-grow"
      />
      
      <Button 
        onClick={sendMessage} 
        disabled={!inputText.trim() || isProcessing}
        className="gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Send
          </>
        )}
      </Button>
    </div>
  );
};

export default MessageInput;
