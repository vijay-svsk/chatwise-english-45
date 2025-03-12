
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BarChart, 
  Mic, 
  Headphones, 
  BookOpen, 
  Users, 
  Settings, 
  Award, 
  MessageSquare, 
  PenLine,
  Brain,
  BookText,
  Trophy,
  Gamepad2,
  GraduationCap,
  AudioWaveform
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <aside className="fixed top-16 left-0 w-64 h-screen bg-background border-r z-10">
      <div className="h-full p-4 flex flex-col">
        <nav className="space-y-1">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/dashboard" && "bg-muted text-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Practice & Learn
            </h3>
          </div>
          
          <Link
            to="/virtual-teacher"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/virtual-teacher" && "bg-muted text-foreground"
            )}
          >
            <GraduationCap className="h-5 w-5" />
            <span>Virtual Teacher</span>
          </Link>
          
          <Link
            to="/speaking-practice"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/speaking-practice" && "bg-muted text-foreground"
            )}
          >
            <Mic className="h-5 w-5" />
            <span>Speaking Practice</span>
          </Link>
          
          <Link
            to="/word-pronunciation"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/word-pronunciation" && "bg-muted text-foreground"
            )}
          >
            <AudioWaveform className="h-5 w-5" />
            <span>Word Pronunciation</span>
          </Link>
          
          <Link
            to="/writing-practice"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/writing-practice" && "bg-muted text-foreground"
            )}
          >
            <PenLine className="h-5 w-5" />
            <span>Writing Practice</span>
          </Link>
          
          <Link
            to="/listening-practice"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/listening-practice" && "bg-muted text-foreground"
            )}
          >
            <Headphones className="h-5 w-5" />
            <span>Listening Practice</span>
          </Link>
          
          <Link
            to="/vocabulary"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/vocabulary" && "bg-muted text-foreground"
            )}
          >
            <Brain className="h-5 w-5" />
            <span>Vocabulary</span>
          </Link>
          
          <Link
            to="/conversation"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/conversation" && "bg-muted text-foreground"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span>AI Conversation</span>
          </Link>
          
          <Link
            to="/lessons"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/lessons" && "bg-muted text-foreground"
            )}
          >
            <BookText className="h-5 w-5" />
            <span>Lessons</span>
          </Link>
          
          <div className="pt-4 pb-2">
            <h3 className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Community & Progress
            </h3>
          </div>
          
          <Link
            to="/community"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/community" && "bg-muted text-foreground"
            )}
          >
            <Users className="h-5 w-5" />
            <span>Community</span>
          </Link>
          
          <Link
            to="/progress"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/progress" && "bg-muted text-foreground"
            )}
          >
            <BarChart className="h-5 w-5" />
            <span>Progress</span>
          </Link>
          
          <Link
            to="/achievements"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              location.pathname === "/achievements" && "bg-muted text-foreground"
            )}
          >
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </Link>
          
          <div className="mt-auto pt-4">
            <Link
              to="/settings"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                location.pathname === "/settings" && "bg-muted text-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
