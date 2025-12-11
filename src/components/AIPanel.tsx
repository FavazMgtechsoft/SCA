import { ChevronUp, ChevronDown, X } from 'lucide-react';
import { Annotation } from '../App';

interface AIPanelProps {
  isVisible: boolean;
  onToggle: () => void;
  annotations: Annotation[];
  onAnnotationClick: (annotation: Annotation) => void;
  onAcceptAnnotation: (line: number) => void;
  onRejectAnnotation: (line: number) => void;
  onEditAnnotation: (line: number) => void;
}

export function AIPanel({ 
  isVisible, 
  onToggle, 
  annotations,
  onAnnotationClick,
  onAcceptAnnotation,
  onRejectAnnotation,
  onEditAnnotation
}: AIPanelProps) {
  const pendingAnnotations = annotations.filter(a => a.status === 'pending');

  const scrollToLine = (line: number) => {
    // Scroll to line in editor
    if ((window as any).editorScrollToLine) {
      (window as any).editorScrollToLine(line);
    }
  };

  const handleAccept = (line: number) => {
    onAcceptAnnotation(line);
  };

  const handleEdit = (annotation: Annotation) => {
    onEditAnnotation(annotation.line);
    scrollToLine(annotation.line);
  };

  const handleReject = (line: number) => {
    onRejectAnnotation(line);
  };

  if (!isVisible) {
    return (
      <div 
        className="h-[30px] bg-[#252526] border-t border-[#1e1e1e] flex items-center px-3 cursor-pointer hover:bg-[#2a2d2e] transition-colors" 
        onClick={onToggle}
      >
        <ChevronUp size={14} className="text-[#cccccc] mr-2" />
        <span className="text-xs text-[#cccccc]">AI Annotation Suggestions</span>
        {annotations.length > 0 && (
          <span className="ml-2 text-xs text-[#858585]">({pendingAnnotations.length})</span>
        )}
      </div>
    );
  }

  return (
    <div className="h-[280px] bg-[#252526] border-t border-[#1e1e1e] flex flex-col">
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
        {annotations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#858585]">
            <p className="text-xs text-center">No annotations available</p>
            <p className="text-xs text-center mt-1">Generate annotations to see AI suggestions</p>
          </div>
        ) : (
          pendingAnnotations.map((annotation, index) => (
            <div
              key={index}
              className="bg-[#2d2d30] border border-[#3e3e42] rounded p-3 cursor-pointer hover:border-[#3b82f6] transition-colors"
              onClick={() => scrollToLine(annotation.line)}
            >
              <h4 className="text-sm text-[#cccccc] mb-1">
                Suggestion for Line {annotation.line}
              </h4>
              <p className="text-xs text-[#9d9d9d] mb-3 font-mono">
                {annotation.suggestion}
              </p>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => handleAccept(annotation.line)}
                  className="px-3 py-1 bg-[#0e7a0d] hover:bg-[#0f8b0e] text-white text-xs rounded transition-colors"
                  title="Mark as accepted (acknowledge the suggestion)"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleEdit(annotation)}
                  className="px-3 py-1 bg-[#5a5a5a] hover:bg-[#6a6a6a] text-white text-xs rounded transition-colors"
                  title="Mark as edited (will implement manually)"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleReject(annotation.line)}
                  className="px-3 py-1 bg-[#a1260d] hover:bg-[#b12d0e] text-white text-xs rounded transition-colors"
                  title="Dismiss this suggestion"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
        
        {annotations.length > 0 && pendingAnnotations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-[#858585]">
            <p className="text-xs text-center">All suggestions have been reviewed</p>
            <p className="text-xs text-center mt-1 text-[#16a34a]">
              ✓ {annotations.filter(a => a.status === 'accepted').length} accepted
            </p>
            {annotations.filter(a => a.status === 'rejected').length > 0 && (
              <p className="text-xs text-center text-[#ef4444]">
                ✗ {annotations.filter(a => a.status === 'rejected').length} rejected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}