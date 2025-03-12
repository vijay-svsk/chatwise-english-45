
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot } from 'lucide-react';

interface TeacherAvatarProps {
  isTeacherSpeaking: boolean;
  teacherImage?: string;
}

const TeacherAvatar: React.FC<TeacherAvatarProps> = ({ 
  isTeacherSpeaking,
  teacherImage = '/lovable-uploads/41ce64ba-d9ac-49a0-b439-8b2207c221a0.png'
}) => {
  return (
    <div className="flex flex-col items-center mb-4">
      <div 
        className={`relative p-1 rounded-full ${isTeacherSpeaking ? 'animate-pulse ring-2 ring-primary' : ''}`}
      >
        <Avatar className="w-48 h-48 border-2 border-primary">
          {teacherImage ? (
            <AvatarImage src={teacherImage} alt="AI Teacher" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-primary-foreground">
              <Bot className="h-24 w-24 text-primary" />
            </AvatarFallback>
          )}
        </Avatar>
        
        {isTeacherSpeaking && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="text-center mt-2">
        <h3 className="font-semibold">Virtual English Teacher</h3>
        <p className="text-xs text-muted-foreground">
          {isTeacherSpeaking ? 'Speaking...' : 'Ready to help'}
        </p>
      </div>
    </div>
  );
};

export default TeacherAvatar;
