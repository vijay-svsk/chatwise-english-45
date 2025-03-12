
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

interface TeacherAvatarProps {
  isTeacherSpeaking: boolean;
  isListening: boolean;
  teacherImage?: string;
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({ 
  isTeacherSpeaking,
  isListening,
  teacherImage = '/lovable-uploads/f89ceb72-0c39-4750-b503-e35c3a9deb90.png'
}) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div 
        className={`relative p-1 rounded-full transition-all duration-300 ${
          isTeacherSpeaking 
            ? 'animate-pulse ring-4 ring-primary' 
            : isListening 
              ? 'ring-4 ring-green-500' 
              : 'ring-2 ring-primary/40'
        }`}
      >
        <Avatar className="w-56 h-56 border-2 border-primary/60 shadow-lg">
          {teacherImage ? (
            <AvatarImage src={teacherImage} alt="AI Teacher" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-primary-foreground">
              <Bot className="h-24 w-24 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
        
        {isTeacherSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-blue-300/20 rounded-full animate-pulse"></div>
            <div className="absolute w-48 h-48 bg-blue-400/10 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}

        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 bg-green-300/20 rounded-full animate-pulse"></div>
            <div className="absolute w-48 h-48 bg-green-400/10 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        )}
        
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <div className="flex space-x-2">
            {isTeacherSpeaking && (
              <>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
              </>
            )}
            {isListening && (
              <>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-center mt-4">
        <h3 className="font-display font-semibold text-xl">Virtual English Teacher</h3>
        <p className="text-sm text-muted-foreground">
          {isTeacherSpeaking 
            ? 'Speaking...' 
            : isListening 
              ? 'Listening to you...' 
              : 'Ready to help'}
        </p>
      </div>
    </div>
  );
};

export default TeacherAvatar;
