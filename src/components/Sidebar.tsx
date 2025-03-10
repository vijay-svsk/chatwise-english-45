
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  BarChart2,
  Settings,
  Users,
  Award,
  Mic,
  FileText,
  Bookmark,
  Headphones,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] bg-background border-r border-border overflow-y-auto no-scrollbar z-10">
      <div className="p-4">
        <nav className="space-y-1">
          <NavItem
            to="/dashboard"
            icon={<Home className="w-5 h-5" />}
            isActive={isActive('/dashboard')}
          >
            Dashboard
          </NavItem>
          <NavItem
            to="/lessons"
            icon={<BookOpen className="w-5 h-5" />}
            isActive={isActive('/lessons')}
          >
            Lessons
          </NavItem>
          <NavItem
            to="/progress"
            icon={<BarChart2 className="w-5 h-5" />}
            isActive={isActive('/progress')}
          >
            Progress
          </NavItem>
          <NavItem
            to="/community"
            icon={<Users className="w-5 h-5" />}
            isActive={isActive('/community')}
          >
            Community
          </NavItem>
          <NavItem
            to="/achievements"
            icon={<Award className="w-5 h-5" />}
            isActive={isActive('/achievements')}
          >
            Achievements
          </NavItem>
          
          <div className="pt-4 pb-2">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider pl-3">
              Practice
            </h3>
          </div>
          
          <NavItem
            to="/practice/speaking"
            icon={<Mic className="w-5 h-5" />}
            isActive={isActive('/practice/speaking')}
          >
            Speaking
          </NavItem>
          <NavItem
            to="/practice/listening"
            icon={<Headphones className="w-5 h-5" />}
            isActive={isActive('/practice/listening')}
          >
            Listening
          </NavItem>
          <NavItem
            to="/practice/writing"
            icon={<FileText className="w-5 h-5" />}
            isActive={isActive('/practice/writing')}
          >
            Writing
          </NavItem>
          <NavItem
            to="/practice/vocabulary"
            icon={<Bookmark className="w-5 h-5" />}
            isActive={isActive('/practice/vocabulary')}
          >
            Vocabulary
          </NavItem>
          <NavItem
            to="/practice/conversation"
            icon={<MessageCircle className="w-5 h-5" />}
            isActive={isActive('/practice/conversation')}
          >
            Conversation
          </NavItem>
          
          <div className="pt-4 pb-2">
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider pl-3">
              Account
            </h3>
          </div>
          
          <NavItem
            to="/settings"
            icon={<Settings className="w-5 h-5" />}
            isActive={isActive('/settings')}
          >
            Settings
          </NavItem>
        </nav>
      </div>
    </aside>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  isActive: boolean;
  children: React.ReactNode;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, isActive, children }) => {
  return (
    <NavLink
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent"
      )}
    >
      <span className="mr-3">{icon}</span>
      {children}
    </NavLink>
  );
};

export default Sidebar;
