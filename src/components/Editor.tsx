import { useRef } from 'react';
import { OpenFile } from '../App';
import MonacoEditor from '@monaco-editor/react';

interface EditorProps {
  file: OpenFile;
  onContentChange: (path: string, content: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
}

export function Editor({ file, onContentChange, onCursorChange }: EditorProps) {
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Define C/C++ theme matching the reference image exactly
    monaco.editor.defineTheme('vscode-dark-custom', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        // Keywords (void, char, int, return, etc.) - purple
        { token: 'keyword', foreground: 'C586C0' },
        { token: 'keyword.control', foreground: 'C586C0' },
        
        // Types (char, int, void) - teal/cyan
        { token: 'type', foreground: '4EC9B0' },
        { token: 'type.identifier', foreground: '4EC9B0' },
        
        // Strings - orange/yellow
        { token: 'string', foreground: 'CE9178' },
        
        // Comments - gray/green
        { token: 'comment', foreground: '6A9955' },
        
        // Numbers - light green
        { token: 'number', foreground: 'B5CEA8' },
        
        // Function names - yellow
        { token: 'identifier.function', foreground: 'DCDCAA' },
        { token: 'entity.name.function', foreground: 'DCDCAA' },
        
        // Preprocessor directives (#include, #define) - cyan/pink
        { token: 'keyword.directive', foreground: 'C586C0' },
        { token: 'meta.preprocessor', foreground: 'C586C0' },
        
        // Library names in includes (<stdio.h>) - orange
        { token: 'string.include', foreground: 'CE9178' },
        
        // Variables - light blue
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

    // Track cursor position
    editor.onDidChangeCursorPosition((e: any) => {
      onCursorChange({
        line: e.position.lineNumber,
        column: e.position.column,
      });
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(file.path, value);
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
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
        }}
      />
    </div>
  );
}