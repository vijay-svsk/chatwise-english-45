
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart, 
  BookOpen, 
  Headphones, 
  Home, 
  MessageSquare, 
  Mic, 
  Settings,
  Trophy,
  Users,
  LucideIcon
} from 'lucide-react';

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

const sidebarItems: SidebarItem[] = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Mic, label: 'Speaking Practice', path: '/practice/speaking' },
  { icon: Headphones, label: 'Listening Practice', path: '/practice/listening' },
  { icon: MessageSquare, label: 'Conversation', path: '/practice/conversation' },
  { icon: BookOpen, label: 'Lessons', path: '/lessons' },
  { icon: BarChart, label: 'Progress', path: '/progress' },
  { icon: Users, label: 'Community', path: '/community' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  return (
    <aside className="fixed left-0 top-16 bottom-0 w-64 glass-panel mx-4 my-2 py-6 px-2 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto space-y-1 px-2">
        {sidebarItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
              location.pathname === item.path 
                ? "bg-primary text-primary-foreground font-medium" 
                : "hover:bg-secondary text-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="mt-auto pt-4 border-t border-border px-2">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left hover:bg-secondary transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
