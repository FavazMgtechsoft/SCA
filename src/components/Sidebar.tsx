import { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText, Upload, FileInput } from 'lucide-react';
import { FileNode } from '../App';

interface SidebarProps {
  rootFolder: FileNode | null;
  onImportFolder: () => void;
  onImportFile: () => void;
  onFileOpen: (fileNode: FileNode) => void;
  activeFilePath: string | null;
  
}

export function Sidebar({ rootFolder, onImportFolder, onImportFile, onFileOpen, activeFilePath }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (rootFolder) {
      setExpandedFolders(new Set([rootFolder.path]));
    }
  }, [rootFolder]);

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    newExpanded.has(path) ? newExpanded.delete(path) : newExpanded.add(path);
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isActive = activeFilePath === node.path;
    const isCOrCppFile =
      node.type === 'file' &&
      (node.name.endsWith('.c') ||
        node.name.endsWith('.cpp') ||
        node.name.endsWith('.h') ||
        node.name.endsWith('.hpp'));

    if (node.type === 'folder') {
      return (
        <div key={node.path}>
          <div
            className="flex items-center gap-1 px-2 py-0.5 hover:bg-[#2a2d2e] cursor-pointer text-sm"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDown size={14} className="text-[#cccccc]" />
            ) : (
              <ChevronRight size={14} className="text-[#cccccc]" />
            )}

            {isExpanded ? (
              <FolderOpen size={14} className="text-[#dcb67a]" />
            ) : (
              <Folder size={14} className="text-[#dcb67a]" />
            )}

            <span className="text-[#cccccc] truncate">{node.name}</span>
          </div>

          {isExpanded && node.children && (
            <div>{node.children.map(child => renderFileTree(child, depth + 1))}</div>
          )}
        </div>
      );
    }

    return (
      <div
        key={node.path}
        className={`flex items-center gap-1 px-2 py-0.5 cursor-pointer text-sm ${
          isActive ? 'bg-[#37373d]' : 'hover:bg-[#2a2d2e]'
        }`}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
        onClick={() => {
          if (isCOrCppFile) onFileOpen(node);
        }}
      >
        <FileText
          size={14}
          className={`${
            node.name.endsWith('.c') || node.name.endsWith('.cpp')
              ? 'text-[#519aba]'
              : node.name.endsWith('.h') || node.name.endsWith('.hpp')
              ? 'text-[#a074c4]'
              : 'text-[#cccccc]'
          }`}
        />
        <span className="text-[#cccccc] truncate">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="w-[200px] bg-[#252526] border-r border-[#1e1e1e] flex flex-col overflow-hidden">
      <div className="p-2 border-b border-[#1e1e1e] flex items-center justify-between">
        <span className="text-xs text-[#cccccc] uppercase tracking-wide">Explorer</span>

        <div className="flex items-center gap-1">
          {/* Import File Button */}
          <button
            onClick={onImportFile}
            className="p-1 rounded hover:bg-[#2a2d2e]"
            title="Import File"
          >
            <FileInput size={14} className="text-[#cccccc]" />
          </button>

          {/* Import Folder Button */}
          <button
            onClick={onImportFolder}
            className="p-1 rounded hover:bg-[#2a2d2e]"
            title="Import Folder"
          >
            <Upload size={14} className="text-[#cccccc]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {rootFolder ? (
          <div className="py-1">{renderFileTree(rootFolder)}</div>
        ) : (
          <div className="p-4 text-center text-xs text-[#858585]">
            <p className="mb-3">No folder opened</p>
            <p className="mb-3 text-[10px]">Import a C/C++ Project folder or file</p>

            <div className="flex flex-col gap-2">
              <button
                onClick={onImportFile}
                className="px-3 py-1.5 bg-[#6a4dbc] hover:bg-[#7b5cdf] text-white rounded text-xs"
              >
                Import File
              </button>

              <button
                onClick={onImportFolder}
                className="px-3 py-1.5 bg-[#0e639c] hover:bg-[#1177bb] text-white rounded text-xs"
              >
                Import Folder
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
