
import React from 'react';
import { Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingStateProps {
  loading: boolean;
  error: string | null;
  hasText: boolean;
  onGenerate: () => void;
}

export const FeedbackLoadingState: React.FC<LoadingStateProps> = ({ 
  loading, 
  error, 
  hasText,
  onGenerate
}) => {
  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
          {error}
        </div>
      )}
      
      <div className="text-center p-6">
        <Lightbulb className="h-12 w-12 mx-auto text-primary/60 mb-4" />
        <p className="text-muted-foreground">
          {hasText 
            ? "Click 'Generate Feedback' to analyze your speech." 
            : "Record your speech first, then generate AI feedback."}
        </p>
      </div>
      
      <Button 
        onClick={onGenerate} 
        disabled={loading || !hasText} 
        className="w-full gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Lightbulb className="h-4 w-4" />
            Generate Feedback
          </>
        )}
      </Button>
    </>
  );
};
