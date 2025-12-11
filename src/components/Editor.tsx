import { useRef, useEffect, useState } from 'react';
import { OpenFile, Annotation } from '../App';
import MonacoEditor from '@monaco-editor/react';
import { AlertCircle, Check, X } from 'lucide-react';

interface EditorProps {
  file: OpenFile;
  onContentChange: (path: string, content: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
  annotations: Annotation[];
  onAcceptAnnotation: (line: number) => void;
  onRejectAnnotation: (line: number) => void;
}

interface TooltipState {
  visible: boolean;
  line: number;
  x: number;
  y: number;
  suggestion: string;
}

export function Editor({ 
  file, 
  onContentChange, 
  onCursorChange, 
  annotations,
  onAcceptAnnotation,
  onRejectAnnotation
}: EditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [decorations, setDecorations] = useState<string[]>([]);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [isEditable, setIsEditable] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    line: 0,
    x: 0,
    y: 0,
    suggestion: ''
  });

  useEffect(() => {
    if (editorRef.current && monacoRef.current && annotations.length > 0) {
      updateDecorations();
    }
  }, [annotations, file.content]);

  const updateDecorations = () => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations: any[] = [];

    annotations.forEach(annotation => {
      const model = editorRef.current.getModel();
      if (!model) return;

      const lineContent = model.getLineContent(annotation.line);
      const lineLength = lineContent.length;

      if (annotation.status === 'pending') {
        // Add light blue/cyan background highlight for the entire line content
        newDecorations.push({
          range: new monacoRef.current.Range(annotation.line, 1, annotation.line, lineLength + 1),
          options: {
            inlineClassName: 'suggestion-inline-highlight',
            glyphMarginClassName: 'suggestion-glyph-margin',
            linesDecorationsClassName: 'suggestion-line-decoration'
          }
        });
      } else if (annotation.status === 'accepted') {
        // Add green indicator for accepted
        newDecorations.push({
          range: new monacoRef.current.Range(annotation.line, 1, annotation.line, 1),
          options: {
            isWholeLine: false,
            afterContentClassName: 'accepted-annotation-badge',
            glyphMarginClassName: 'accepted-glyph-margin'
          }
        });
      }
    });

    const ids = editorRef.current.deltaDecorations(decorations, newDecorations);
    setDecorations(ids);
  };

  const scrollToLine = (line: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      editorRef.current.focus();
    }
  };

  // Expose scrollToLine function globally for AIPanel to use
  useEffect(() => {
    (window as any).editorScrollToLine = scrollToLine;
    return () => {
      delete (window as any).editorScrollToLine;
    };
  }, []);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add custom CSS for annotations
    const style = document.createElement('style');
    style.innerHTML = `
      .suggestion-inline-highlight {
        background: rgba(100, 181, 246, 0.25) !important;
        border-radius: 2px;
      }
      
      .suggestion-glyph-margin {
        background: transparent !important;
        width: 16px !important;
        margin-left: 0px;
        cursor: pointer;
      }
      
.suggestion-glyph-margin::before {
        content: '💡';
        font-size: 14px;
        position: absolute;
        left: 2px;
        cursor: pointer;
      }
      
      .accepted-glyph-margin {
        background: transparent !important;
        width: 16px !important;
        margin-left: 0px;
      }
      
      .accepted-glyph-margin::before {
        content: '✓';
        color: #16a34a;
        font-size: 14px;
        font-weight: bold;
        position: absolute;
        left: 2px;
      }
      
      .accepted-annotation-badge::after {
        content: ' [EDITED]';
        color: #16a34a;
        font-size: 11px;
        font-weight: bold;
        margin-left: 8px;
        background: rgba(22, 163, 74, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
      }
    `;
    document.head.appendChild(style);

    monaco.editor.defineTheme('vscode-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'keyword.control', foreground: 'C586C0' },
        { token: 'type', foreground: '4EC9B0' },
        { token: 'type.identifier', foreground: '4EC9B0' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'identifier.function', foreground: 'DCDCAA' },
        { token: 'entity.name.function', foreground: 'DCDCAA' },
        { token: 'keyword.directive', foreground: 'C586C0' },
        { token: 'meta.preprocessor', foreground: 'C586C0' },
        { token: 'string.include', foreground: 'CE9178' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'identifier', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorCursor.foreground': '#aeafad',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
      },
    });

    monaco.editor.setTheme('vscode-dark-custom');

    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Add mouse move event listener for glyph margin hover
    editor.onMouseMove((e: any) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const line = e.target.position?.lineNumber;
        if (line) {
          const annotation = annotations.find(a => a.line === line && a.status === 'pending');
          if (annotation) {
            const editorDom = editor.getDomNode();
            if (editorDom) {
              const rect = editorDom.getBoundingClientRect();
              setTooltip({
                visible: true,
                line: line,
                x: e.event.posx - rect.left + 30,
                y: e.event.posy - rect.top,
                suggestion: annotation.suggestion
              });
            }
          }
        }
      } else {
        if (tooltip.visible) {
          setTooltip({ ...tooltip, visible: false });
        }
      }
    });

    // Update decorations when annotations change
    if (annotations.length > 0) {
      updateDecorations();
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && isEditable) {
      onContentChange(file.path, value);
    }
  };

  return (
    <div className="flex-1 overflow-hidden relative">
      {annotations.length > 0 && !isEditable && (
        <div className="absolute top-2 right-2 z-10 bg-[#1e1e1e] border border-[#3b82f6] rounded px-3 py-2 text-xs text-[#3b82f6] flex items-center gap-2">
          <AlertCircle size={14} />
          <span>Read-only: Accept/Reject suggestions to edit</span>
          <button
            onClick={() => setIsEditable(true)}
            className="ml-2 px-2 py-1 bg-[#3b82f6] text-white rounded hover:bg-[#2563eb] transition-colors"
          >
            Enable Editing
          </button>
        </div>
      )}
      
      {/* Custom Tooltip Popup */}
      {tooltip.visible && (
        <div 
          className="absolute z-50 bg-[#2d2d30] border border-[#3b82f6] rounded-lg shadow-2xl p-4 max-w-md"
          style={{ 
            left: `${tooltip.x}px`, 
            top: `${tooltip.y}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#3b82f6]">AI Suggestion</span>
              <span className="text-xs text-[#858585]">Line {tooltip.line}</span>
            </div>
          </div>
          
          <div className="bg-[#1e1e1e] border border-[#3e3e42] rounded p-2 mb-3">
            <code className="text-xs text-[#d4d4d4] font-mono break-all">
              {tooltip.suggestion}
            </code>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                onAcceptAnnotation(tooltip.line);
                setTooltip({ ...tooltip, visible: false });
              }}
              className="flex items-center gap-1 px-2 py-1 bg-[#0e7a0d] hover:bg-[#0f8b0e] text-white text-xs rounded transition-colors"
            >
              <Check size={12} />
              Accept
            </button>
            <button
              onClick={() => {
                onRejectAnnotation(tooltip.line);
                setTooltip({ ...tooltip, visible: false });
              }}
              className="flex items-center gap-1 px-2 py-1 bg-[#a1260d] hover:bg-[#b12d0e] text-white text-xs rounded transition-colors"
            >
              <X size={12} />
              Reject
            </button>
          </div>
        </div>
      )}
      
      <MonacoEditor
        height="100%"
        language={file.name.endsWith('.cpp') || file.name.endsWith('.hpp') ? 'cpp' : 'c'}
        value={file.content}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        theme="vscode-dark-custom"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          insertSpaces: true,
          renderWhitespace: 'none',
          fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
          lineHeight: 19,
          padding: { top: 8, bottom: 8 },
          readOnly: annotations.length > 0 && !isEditable,
          glyphMargin: true,
          lineDecorationsWidth: 10,
        }}
      />
    </div>
  );
}