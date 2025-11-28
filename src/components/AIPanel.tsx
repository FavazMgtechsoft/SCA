import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface AIPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

interface Suggestion {
  id: string;
  title: string;
  description: string;
  line: number;
}

export function AIPanel({ isVisible, onToggle }: AIPanelProps) {
  const [suggestions] = useState<Suggestion[]>([
    {
      id: '1',
      title: "Suggest replacing 'strcpy' with 'strncpy'",
      description: "Line 7: Using 'strcpy' can lead to buffer overflows. A safer alternative is recommended.",
      line: 7,
    },
    {
      id: '2',
      title: "Potential null pointer dereference",
      description: "Line 4: The 'name' parameter is not checked for NULL before being used.",
      line: 4,
    },
    {
      id: '3',
      title: "Reduce function complexity",
      description: "Consider breaking down the function into smaller, more manageable units.",
      line: 0,
    },
  ]);

  const handleAccept = (id: string) => {
    console.log('Accept suggestion:', id);
  };

  const handleEdit = (id: string) => {
    console.log('Edit suggestion:', id);
  };

  const handleReject = (id: string) => {
    console.log('Reject suggestion:', id);
  };

  if (!isVisible) {
    return (
      <div 
        className="h-[30px] bg-[#252526] border-t border-[#1e1e1e] flex items-center px-3 cursor-pointer hover:bg-[#2a2d2e] transition-colors" 
        onClick={onToggle}
      >
        <ChevronUp size={14} className="text-[#cccccc] mr-2" />
        <span className="text-xs text-[#cccccc]">AI Annotation Suggestions</span>
      </div>
    );
  }

  return (
    <div className="h-[280px] bg-[#252526] border-t border-[#1e1e1e] flex flex-col animate-in slide-in-from-bottom duration-200">
      <div className="h-[35px] bg-[#2d2d30] border-b border-[#1e1e1e] flex items-center justify-between px-3">
        <span className="text-sm text-[#cccccc]">AI Annotation Suggestions</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-[#3e3e42] transition-colors"
            title="Collapse Panel"
          >
            <ChevronDown size={16} className="text-[#cccccc]" />
          </button>
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-[#3e3e42] transition-colors"
            title="Close Panel"
          >
            <X size={16} className="text-[#cccccc]" />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {suggestions.map(suggestion => (
          <div
            key={suggestion.id}
            className="bg-[#2d2d30] border border-[#3e3e42] rounded p-3"
          >
            <h4 className="text-sm text-[#cccccc] mb-1">{suggestion.title}</h4>
            <p className="text-xs text-[#9d9d9d] mb-3">{suggestion.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(suggestion.id)}
                className="px-3 py-1 bg-[#0e7a0d] hover:bg-[#0f8b0e] text-white text-xs rounded transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => handleEdit(suggestion.id)}
                className="px-3 py-1 bg-[#5a5a5a] hover:bg-[#6a6a6a] text-white text-xs rounded transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleReject(suggestion.id)}
                className="px-3 py-1 bg-[#a1260d] hover:bg-[#b12d0e] text-white text-xs rounded transition-colors"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}