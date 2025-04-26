import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

function AISuggestionBox({ aiLoading, aiSuggestion, setShowAiBox }) {
  return (
    <div className="mt-6 p-4 w-full max-w-2xl bg-gray-100 rounded-lg shadow-lg relative">
      {/* Close Button */}
      <button 
        onClick={() => setShowAiBox(false)} 
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500"
        title="Close AI Suggestion"
      >
        <FontAwesomeIcon icon={faTimes} size="lg" />
      </button>

      {/* AI Text Display */}
      <div className="text-gray-800 text-lg whitespace-pre-wrap font-mono">
        {aiLoading ? (
          <div className="animate-pulse">Thinking...</div>
        ) : (
          aiSuggestion || "No suggestion available."
        )}
      </div>
    </div>
  );
}

export default AISuggestionBox;
