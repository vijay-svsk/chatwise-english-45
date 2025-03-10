
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SpeakingPractice from "./pages/SpeakingPractice";
import ListeningPractice from "./pages/ListeningPractice";
import VocabularyBuilding from "./pages/VocabularyBuilding";
import Conversation from "./pages/Conversation";
import Lessons from "./pages/Lessons";
import Progress from "./pages/Progress";
import Community from "./pages/Community";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/practice/speaking" element={<SpeakingPractice />} />
          <Route path="/practice/listening" element={<ListeningPractice />} />
          <Route path="/vocabulary" element={<VocabularyBuilding />} />
          <Route path="/practice/conversation" element={<Conversation />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/community" element={<Community />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
