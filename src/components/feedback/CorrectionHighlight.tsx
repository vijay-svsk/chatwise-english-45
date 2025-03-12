
import React from 'react';

interface CorrectionHighlightProps {
  original: string;
  corrected: string;
  explanation: string;
  rule?: string;
}

export const CorrectionHighlight: React.FC<CorrectionHighlightProps> = ({ 
  original, 
  corrected,
  explanation,
  rule
}) => {
  if (original === corrected) {
    return (
      <div className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
        <span className="text-green-500">{original}</span>
        <p className="mt-1 text-muted-foreground">{explanation}</p>
      </div>
    );
  }
  
  return (
    <div className="text-sm border-b border-border pb-2 last:border-0 last:pb-0">
      <div className="space-y-1">
        <div>
          <span className="text-sm font-medium">Original: </span>
          <span className="text-red-500">{original}</span>
        </div>
        <div>
          <span className="text-sm font-medium">Corrected: </span>
          <span className="text-green-500">{corrected}</span>
        </div>
      </div>
      <p className="mt-1 text-muted-foreground">{explanation}</p>
      {rule && <p className="text-xs text-muted-foreground mt-1">Rule: {rule}</p>}
    </div>
  );
};
