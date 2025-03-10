
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Lessons from './pages/Lessons';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Community from './pages/Community';
import Achievements from './pages/Achievements';
import SpeakingPractice from './pages/SpeakingPractice';
import WritingPractice from './pages/WritingPractice';
import VocabularyBuilding from './pages/VocabularyBuilding';
import ListeningPractice from './pages/ListeningPractice';
import Conversation from './pages/Conversation';
import './App.css';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from './components/ui/toaster';
import { initDatabase } from './services/initDatabaseService';

function App() {
  useEffect(() => {
    // Initialize database with default data
    initDatabase();
  }, []);
  
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/community" element={<Community />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/practice/speaking" element={<SpeakingPractice />} />
          <Route path="/practice/writing" element={<WritingPractice />} />
          <Route path="/practice/vocabulary" element={<VocabularyBuilding />} />
          <Route path="/practice/listening" element={<ListeningPractice />} />
          <Route path="/practice/conversation" element={<Conversation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
