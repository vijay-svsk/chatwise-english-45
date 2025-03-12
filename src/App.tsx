
import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import initDatabase from "./services/initDatabaseService";
import { APP_SETTINGS } from "./config/appConfig";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Progress from "./pages/Progress";
import SpeakingPractice from "./pages/SpeakingPractice";
import ListeningPractice from "./pages/ListeningPractice";
import Community from "./pages/Community";
import VocabularyBuilding from "./pages/VocabularyBuilding";
import Lessons from "./pages/Lessons";
import Achievements from "./pages/Achievements";
import Conversation from "./pages/Conversation";
import VirtualTeacher from "./pages/VirtualTeacher";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import WritingPractice from "./pages/WritingPractice";
import WordPronunciation from "./pages/WordPronunciation";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  useEffect(() => {
    // Initialize the database with default data
    initDatabase().catch(error => {
      console.error("Failed to initialize database:", error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme={APP_SETTINGS.DEFAULT_THEME || "system"} storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/speaking-practice" element={<SpeakingPractice />} />
            <Route path="/writing-practice" element={<WritingPractice />} />
            <Route path="/listening-practice" element={<ListeningPractice />} />
            <Route path="/community" element={<Community />} />
            <Route path="/vocabulary" element={<VocabularyBuilding />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/conversation" element={<Conversation />} />
            <Route path="/virtual-teacher" element={<VirtualTeacher />} />
            <Route path="/word-pronunciation" element={<WordPronunciation />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
