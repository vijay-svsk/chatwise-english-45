
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
  label: string;
  score: number;
}

const getFeedbackColor = (score: number) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 80) return 'text-blue-500';
  if (score >= 70) return 'text-yellow-500';
  return 'text-red-500';
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ label, score }) => {
  if (score <= 0) return null;
  
  return (
    <div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="flex items-center">
        <div className="w-full bg-secondary rounded-full h-2 mr-2">
          <div 
            className="bg-primary rounded-full h-2" 
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={cn("text-sm font-semibold", getFeedbackColor(score))}>
          {score}
        </span>
      </div>
    </div>
  );
};

export const OverallScoreDisplay: React.FC<{ score: number }> = ({ score }) => {
  return (
    <div>
      <div className="text-sm font-medium mb-1">Overall Score</div>
      <div className="flex items-center">
        <div className="w-full bg-secondary rounded-full h-3 mr-2">
          <div 
            className="bg-primary rounded-full h-3" 
            style={{ width: `${score}%` }}
          />
        </div>
        <span className={cn("text-lg font-semibold", getFeedbackColor(score))}>
          {score}
        </span>
      </div>
    </div>
  );
};
