
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
}

export interface VirtualTeacherProps {
  initialGreeting?: string;
}

export interface TeacherAvatarProps {
  isTeacherSpeaking: boolean;
  teacherImage?: string;
}
