
import React from 'react';

interface SuggestionsListProps {
  suggestions: string[];
}

export const SuggestionsList: React.FC<SuggestionsListProps> = ({ suggestions }) => {
  if (!suggestions || suggestions.length === 0) return null;
  
  return (
    <div>
      <h4 className="font-semibold mb-2">Suggestions for Improvement</h4>
      <ul className="list-disc pl-5 space-y-1">
        {suggestions.map((suggestion, i) => (
          <li key={i} className="text-sm">{suggestion}</li>
        ))}
      </ul>
    </div>
  );
};
