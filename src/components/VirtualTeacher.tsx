
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import MessageList from './virtual-teacher/MessageList';
import MessageInput from './virtual-teacher/MessageInput';
import { Message, VirtualTeacherProps } from './virtual-teacher/types';
import { useSpeechServices } from './virtual-teacher/SpeechService';

const VirtualTeacher: React.FC<VirtualTeacherProps> = ({ 
  initialGreeting = "Hello! I'm your AI English teacher. What English topic would you like help with today?"
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const {
    isRecording,
    isTeacherSpeaking,
    toggleMicrophone: toggleMic,
    speakMessage,
  } = useSpeechServices();
  
  // Initialize messages with greeting
  useEffect(() => {
    setMessages([
      {
        id: '1',
        content: initialGreeting,
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
  }, [initialGreeting]);
  
  const toggleMicrophone = () => {
    toggleMic(setInputText);
  };
  
  const sendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputText.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);
    
    // Add a placeholder for the AI response with loading state
    const aiMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: aiMessageId,
      content: "",
      sender: 'ai',
      timestamp: new Date(),
      isProcessing: true
    }]);
    
    try {
      // Get response from Gemini API
      const response = await geminiService.generateText({
        prompt: `As a helpful and encouraging English teacher, please respond to this student question or statement in a clear and helpful way: "${userMessage.content}"`,
        temperature: 0.7,
        maxTokens: 500
      });
      
      // Update the AI message with the actual response
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return {
            ...msg,
            content: response.text,
            isProcessing: false
          };
        }
        return msg;
      }));
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Update the AI message with an error response
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId) {
          return {
            ...msg,
            content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
            isProcessing: false
          };
        }
        return msg;
      }));
      
      toast({
        title: "Error",
        description: "Failed to get a response from the AI teacher. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full h-[600px] flex flex-col glass-panel">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-xl font-display">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            AI English Teacher
            {isTeacherSpeaking && (
              <Badge variant="outline" className="animate-pulse">Speaking</Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <MessageList 
          messages={messages}
          speakMessage={speakMessage}
          isTeacherSpeaking={isTeacherSpeaking}
        />
      </CardContent>
      
      <CardFooter className="p-3 border-t mt-auto">
        <MessageInput 
          inputText={inputText}
          setInputText={setInputText}
          sendMessage={sendMessage}
          toggleMicrophone={toggleMicrophone}
          isRecording={isRecording}
          isProcessing={isProcessing}
          handleKeyDown={handleKeyDown}
        />
      </CardFooter>
    </Card>
  );
};

export default VirtualTeacher;
