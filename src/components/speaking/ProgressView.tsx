
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import Leaderboard from '@/components/Leaderboard';

interface ProgressViewProps {
  userId: string | null;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ userId }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="text-xl font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Your Progress
            </CardTitle>
            <CardDescription>Track your improvement over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Grammar</span>
                  <span className="text-sm font-medium">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Vocabulary</span>
                  <span className="text-sm font-medium">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Pronunciation</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Fluency</span>
                  <span className="text-sm font-medium">68%</span>
                </div>
                <Progress value={68} className="h-2" />
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-3">Recent Sessions</h3>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-muted/40 rounded">
                  <span>Speaking Practice</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/40 rounded">
                  <span>Pronunciation Exercise</span>
                  <span className="font-medium">Yesterday</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/40 rounded">
                  <span>Grammar Practice</span>
                  <span className="font-medium">3 days ago</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Leaderboard currentUserId={userId || undefined} />
      </div>
    </div>
  );
};
