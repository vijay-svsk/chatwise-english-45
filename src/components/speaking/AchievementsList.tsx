
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface AchievementsListProps {
  completedTasks: string[];
}

export const AchievementsList: React.FC<AchievementsListProps> = ({ completedTasks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-display">Achievements</CardTitle>
        <CardDescription>Complete tasks to earn points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className={`h-5 w-5 ${completedTasks.includes('practice_complete') ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>Complete a practice</span>
            </div>
            <Badge variant={completedTasks.includes('practice_complete') ? "default" : "outline"}>10 pts</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className={`h-5 w-5 ${completedTasks.includes('grammar_mastery') ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>Grammar mastery</span>
            </div>
            <Badge variant={completedTasks.includes('grammar_mastery') ? "default" : "outline"}>20 pts</Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Check className={`h-5 w-5 ${completedTasks.includes('pronunciation_mastery') ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span>Pronunciation mastery</span>
            </div>
            <Badge variant={completedTasks.includes('pronunciation_mastery') ? "default" : "outline"}>20 pts</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
