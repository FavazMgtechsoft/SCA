import { X } from 'lucide-react';
import { OpenFile } from '../App';

interface TabBarProps {
  openFiles: OpenFile[];
  activeFilePath: string | null;
  onTabClick: (path: string) => void;
  onTabClose: (path: string) => void;
}

export function TabBar({ openFiles, activeFilePath, onTabClick, onTabClose }: TabBarProps) {
  return (
    <div className="h-[35px] bg-[#252526] border-b border-[#1e1e1e] flex items-stretch overflow-x-auto">
      {openFiles.map(file => {
        const isActive = file.path === activeFilePath;
        return (
          <div
            key={file.path}
            className={`flex items-center gap-2 px-3 border-r border-[#1e1e1e] cursor-pointer group min-w-[120px] max-w-[200px] ${
              isActive ? 'bg-[#1e1e1e] text-[#ffffff]' : 'bg-[#2d2d30] text-[#969696] hover:bg-[#323233]'
            }`}
            onClick={() => onTabClick(file.path)}
          >
            <span className="text-xs truncate flex-1">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(file.path);
              }}
              className={`p-0.5 rounded hover:bg-[#3e3e42] transition-colors ${
                isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              }`}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
