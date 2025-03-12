
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface Topic {
  id: string;
  title: string;
  prompt: string;
}

interface TopicsListProps {
  topics: Topic[];
}

export const TopicsList: React.FC<TopicsListProps> = ({ topics }) => {
  return (
    <Card className="glass-panel">
      <CardHeader>
        <CardTitle className="text-xl font-display flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Suggested Topics
        </CardTitle>
        <p className="text-muted-foreground">Practice with these prompts to improve your speaking skills</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="glass-panel">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">{topic.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{topic.prompt}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
