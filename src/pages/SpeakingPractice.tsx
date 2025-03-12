
import React from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import TranscriptionBox from '@/components/TranscriptionBox';
import AIFeedback from '@/components/AIFeedback';
import PronunciationModule from '@/components/PronunciationModule';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopicsList } from '@/components/speaking/TopicsList';
import { AchievementsList } from '@/components/speaking/AchievementsList';
import { ProgressView } from '@/components/speaking/ProgressView';
import { GrammarRuleHighlights } from '@/components/speaking/GrammarRuleHighlights';
import { useSpeakingPractice } from '@/hooks/useSpeakingPractice';
import { speakingTopics, pronunciationExercises } from '@/data/speakingTopics';
import Leaderboard from '@/components/Leaderboard';

const SpeakingPractice = () => {
  const {
    transcribedText,
    feedback,
    isAnalyzing,
    userId,
    userName,
    completedTasks,
    handleTranscriptionComplete,
    handleFeedbackComplete,
    handlePronunciationScoreUpdate
  } = useSpeakingPractice();
  
  return (
    <div className="min-h-screen bg-background">
      <Header user={{ name: userName || 'User', email: 'user@example.com', avatar: 'https://i.pravatar.cc/300?img=47' }} />
      <Sidebar />
      
      <main className="pt-24 pb-16 pl-72 pr-6">
        <div className="max-w-7xl mx-auto animate-fade-in">
          <section className="mb-8">
            <h1 className="text-3xl font-display font-semibold mb-2">Speaking Practice</h1>
            <p className="text-muted-foreground mb-6">Improve your pronunciation and fluency through guided practice.</p>
            
            <Tabs defaultValue="practice" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                <TabsTrigger value="practice">Practice</TabsTrigger>
                <TabsTrigger value="pronunciation">Pronunciation</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <TranscriptionBox 
                        onTranscriptionComplete={handleTranscriptionComplete} 
                        isProcessing={isAnalyzing}
                      />
                      <AIFeedback 
                        text={transcribedText} 
                        onFeedbackComplete={handleFeedbackComplete} 
                      />
                    </div>
                    
                    <GrammarRuleHighlights feedback={feedback} />
                  </div>
                  
                  <div className="space-y-6">
                    <Leaderboard currentUserId={userId || undefined} limit={5} />
                    <AchievementsList completedTasks={completedTasks} />
                  </div>
                </div>
                
                <TopicsList topics={speakingTopics} />
              </TabsContent>
              
              <TabsContent value="pronunciation" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pronunciationExercises.map((exercise, index) => (
                    <PronunciationModule 
                      key={index}
                      phrase={exercise.phrase}
                      phonetics={exercise.phonetics}
                      difficulty={exercise.difficulty as any}
                      onScoreUpdate={handlePronunciationScoreUpdate}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="progress" className="space-y-6">
                <ProgressView userId={userId} />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

export default SpeakingPractice;
