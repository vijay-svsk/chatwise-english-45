
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isProcessing?: boolean;
}

export interface VirtualTeacherProps {
  initialGreeting?: string;
  autoListen?: boolean;
}

export interface TeacherAvatarProps {
  isTeacherSpeaking: boolean;
  isListening: boolean;
  teacherImage?: string;
}
