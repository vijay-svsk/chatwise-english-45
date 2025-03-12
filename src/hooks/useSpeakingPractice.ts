
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AIFeedbackResult } from '@/components/AIFeedback';
import { mockAnalyzeLanguageAPI } from '@/mock-api/analyzeLanguage';
import { processAnalysisToFeedback, processAnalysisToCorrections } from '@/services/languageAnalysisService';
import { grantReward } from '@/services/rewardsService';
import { db } from '@/services/databaseService';

export const useSpeakingPractice = () => {
  const [transcribedText, setTranscribedText] = useState('');
  const [feedback, setFeedback] = useState<AIFeedbackResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

  // Set mock user for demo purposes
  useEffect(() => {
    const setupUser = async () => {
      // Get users from database
      const users = await db.getUsers();
      
      // Use first user, or create one if none exist
      if (users.length > 0) {
        setUserId(users[0].id);
        setUserName(users[0].name);
      } else {
        const newUser = await db.createUser({
          name: 'Demo User',
          email: 'demo@example.com',
          points: 0,
          level: 1,
          lastLogin: new Date().toISOString()
        });
        setUserId(newUser.id);
        setUserName(newUser.name);
      }
    };
    
    setupUser();
  }, []);
  
  // Create a new practice session when the component mounts
  useEffect(() => {
    const createSession = async () => {
      if (userId) {
        const session = await db.createSession({
          userId,
          type: 'speaking',
          score: 0,
          duration: 0,
          date: new Date().toISOString()
        });
        setSessionId(session.id);
      }
    };
    
    if (userId) {
      createSession();
    }
  }, [userId]);
  
  const handleTranscriptionComplete = async (text: string) => {
    setTranscribedText(text);
    
    // Automatically analyze longer transcriptions
    if (text.split(' ').length > 10) {
      try {
        setIsAnalyzing(true);
        toast({
          title: "Auto-analyzing",
          description: "Analyzing your speech with AI...",
        });
        
        const analysis = await mockAnalyzeLanguageAPI({ text });
        const feedbackResult = processAnalysisToFeedback(analysis);
        
        setFeedback(feedbackResult);
        
        // Save corrections to database
        if (sessionId) {
          const corrections = processAnalysisToCorrections(analysis, sessionId);
          for (const correction of corrections) {
            await db.createCorrection(correction);
          }
          
          // Update session score
          const sessions = await db.getSessions();
          const currentSession = sessions.find(s => s.id === sessionId);
          if (currentSession) {
            currentSession.score = feedbackResult.overall;
            await db.updateSession(currentSession);
            
            // Grant reward if score is good
            if (userId && feedbackResult.overall >= 80 && !completedTasks.includes('practice_complete')) {
              await grantReward({
                type: 'practice_complete',
                userId
              });
              
              setCompletedTasks(prev => [...prev, 'practice_complete']);
              
              toast({
                title: "Achievement Unlocked!",
                description: "You earned points for completing a practice session.",
              });
            }
            
            // Check for grammar mastery
            if (userId && feedbackResult.grammar >= 85 && !completedTasks.includes('grammar_mastery')) {
              await grantReward({
                type: 'grammar_mastery',
                userId
              });
              
              setCompletedTasks(prev => [...prev, 'grammar_mastery']);
              
              toast({
                title: "Grammar Mastery!",
                description: "You earned points for excellent grammar skills.",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error analyzing speech:", error);
        toast({
          title: "Analysis Error",
          description: "Could not analyze your speech. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsAnalyzing(false);
      }
    }
  };
  
  const handleFeedbackComplete = (feedbackResult: AIFeedbackResult) => {
    setFeedback(feedbackResult);
  };
  
  const handlePronunciationScoreUpdate = async (score: number) => {
    if (userId && score >= 85 && !completedTasks.includes('pronunciation_mastery')) {
      await grantReward({
        type: 'pronunciation_mastery',
        userId
      });
      
      setCompletedTasks(prev => [...prev, 'pronunciation_mastery']);
      
      toast({
        title: "Pronunciation Mastery!",
        description: "You earned points for excellent pronunciation.",
      });
    }
  };

  return {
    transcribedText,
    feedback,
    isAnalyzing,
    userId,
    userName,
    completedTasks,
    handleTranscriptionComplete,
    handleFeedbackComplete,
    handlePronunciationScoreUpdate
  };
};
