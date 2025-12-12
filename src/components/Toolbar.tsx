import { FolderOpen, Search, Settings, Play, Sparkles, Wand2, Upload } from 'lucide-react';

interface ToolbarProps {
  currentFilePath: string;
  onToggleSidebar: () => void;
  sidebarVisible: boolean;
  onOpenFile: () => void;
  onGenerateAnnotations: () => void;
  isGenerating: boolean;
  hasAnnotations: boolean;
}

export function Toolbar({ 
  currentFilePath, 
  onToggleSidebar, 
  sidebarVisible, 
  onOpenFile,
  onGenerateAnnotations,
  isGenerating,
  hasAnnotations
}: ToolbarProps) {
  return (
    <div className="h-[50px] bg-[#1a1d23] border-b border-[#2d3139] flex items-center justify-between px-4">
      {/* Left side - Logo and Title */}
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] rounded flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6 11L13 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-white">SCA Auto Annotation</span>
      </div>
      
      {/* Right side - Action buttons */}
      <div className="flex items-center gap-2">
        {/* <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white hover:bg-[#2d3139] rounded transition-colors"
          title="Run Analysis"
        >
          <Play size={16} />
          <span>Run Analysis</span>
        </button> */}
        
        <button
          onClick={onGenerateAnnotations}
          disabled={isGenerating || !currentFilePath}
          className={`flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded transition-colors ${
            isGenerating || !currentFilePath
              ? 'opacity-50 cursor-not-allowed'
              : hasAnnotations
              ? 'bg-[#16a34a] hover:bg-[#15803d]'
              : 'hover:bg-[#2d3139]'
          }`}
          title="Generate Annotations"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate Annotations</span>
            </>
          )}
        </button>
        
        {/* <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white hover:bg-[#2d3139] rounded transition-colors"
          title="Refine"
        >
          <Wand2 size={16} />
          <span>Refine</span>
        </button> */}
        
        {/* <button
          onClick={onOpenFile}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#2563eb] hover:bg-[#1d4ed8] rounded transition-colors"
          title="Export"
        >
          <Upload size={16} />
          <span>Export</span>
        </button> */}
        
        <div className="w-px h-6 bg-[#2d3139] mx-1"></div>
        
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded hover:bg-[#2d3139] transition-colors ${
            sidebarVisible ? 'bg-[#2d3139]' : ''
          }`}
          title="Toggle Sidebar"
        >
          <FolderOpen size={18} className="text-white" />
        </button>
        
        {/* <button
          className="p-2 rounded hover:bg-[#2d3139] transition-colors"
          title="Search"
        >
          <Search size={18} className="text-white" />
        </button>
        
        <button
          className="p-2 rounded hover:bg-[#2d3139] transition-colors"
          title="Settings"
        >
          <Settings size={18} className="text-white" />
        </button> */}
      </div>
    </div>
  );
}