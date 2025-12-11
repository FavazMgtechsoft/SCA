import { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Sidebar } from './components/Sidebar';
import { TabBar } from './components/TabBar';
import { Editor } from './components/Editor';
import { AIPanel } from './components/AIPanel';
import { StatusBar } from './components/StatusBar';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  handle?: FileSystemFileHandle;
}

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  handle?: FileSystemFileHandle;
}

export interface Annotation {
  line: number;
  suggestion: string;
  status: 'pending' | 'accepted' | 'rejected' | 'edited';
}

export default function App() {
  const [rootFolder, setRootFolder] = useState<FileNode | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [aiPanelVisible, setAiPanelVisible] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock annotations data
  const mockAnnotations: Annotation[] = [
    { line: 3, suggestion: '__ASTREE_octagon_pack(wheel_speed_fl, wheel_speed_fr, max_ws, vehicle_speed);', status: 'pending' },
    { line: 8, suggestion: '__ASTREE_assert(vehicle_speed - max_ws >= -10);', status: 'pending' },
    { line: 14, suggestion: '__ASTREE_assert(max_ws - wheel_speed_fl >= 0);', status: 'pending' },
    { line: 19, suggestion: '__ASTREE_assert(max_ws - wheel_speed_fr >= 0);', status: 'pending' },
    { line: 24, suggestion: '__ASTREE_assert(vehicle_speed - max_ws <= 5);', status: 'pending' }
  ];

  useEffect(() => {
    const savedOpenFiles = localStorage.getItem('openFiles');
    const savedActiveFile = localStorage.getItem('activeFile');
    
    if (savedOpenFiles) {
      try {
        setOpenFiles(JSON.parse(savedOpenFiles));
      } catch (e) {
        console.error('Failed to parse saved files', e);
      }
    }
    
    if (savedActiveFile) {
      setActiveFilePath(savedActiveFile);
    }
  }, []);

  useEffect(() => {
    if (openFiles.length > 0) {
      localStorage.setItem('openFiles', JSON.stringify(openFiles.map(f => ({
        path: f.path,
        name: f.name,
        content: f.content
      }))));
    } else {
      localStorage.removeItem('openFiles');
    }
  }, [openFiles]);

  useEffect(() => {
    if (activeFilePath) {
      localStorage.setItem('activeFile', activeFilePath);
    } else {
      localStorage.removeItem('activeFile');
    }
  }, [activeFilePath]);

  const handleGenerateAnnotations = () => {
    if (!activeFilePath) {
      alert('Please open a file first');
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      setAnnotations(mockAnnotations);
      setIsGenerating(false);
    }, 1500);
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    // This will be handled by the Editor component
  };

  const handleAcceptAnnotation = (line: number) => {
    const annotation = annotations.find(ann => ann.line === line);
    if (!annotation) return;

    // Find the file and update its content with the suggestion
    const file = openFiles.find(f => f.path === activeFilePath);
    if (file) {
      const lines = file.content.split('\n');
      // Insert the suggestion at the specified line
      lines.splice(line - 1, 0, '    ' + annotation.suggestion);
      const newContent = lines.join('\n');
      
      handleContentChange(activeFilePath!, newContent);
    }

    // Mark annotation as accepted
    setAnnotations(annotations.map(ann => 
      ann.line === line ? { ...ann, status: 'accepted' } : ann
    ));
  };

  const handleRejectAnnotation = (line: number) => {
    setAnnotations(annotations.map(ann => 
      ann.line === line ? { ...ann, status: 'rejected' } : ann
    ));
  };

  const handleFolderImport = async () => {
    try {
      // @ts-ignore
      if (typeof window.showDirectoryPicker === 'function' && window.self === window.top) {
        try {
          // @ts-ignore
          const dirHandle = await window.showDirectoryPicker();
          const folderTree = await buildFolderTree(dirHandle, '');
          setRootFolder(folderTree);
          return;
        } catch (e: any) {
          if (e.name === 'AbortError') {
            return;
          }
        }
      }
      
      useFallbackFolderImport();
    } catch (error) {
      console.error('Error importing folder:', error);
      alert('Error importing folder: ' + (error as Error).message);
    }
  };

  const useFallbackFolderImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    // @ts-ignore
    input.webkitdirectory = true;
    input.multiple = true;
    
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files || []) as File[];
      if (files.length === 0) return;
      
      const folderTree = buildFolderTreeFromFiles(files);
      setRootFolder(folderTree);
    };
    
    input.click();
  };

  const buildFolderTreeFromFiles = (files: File[]): FileNode => {
    const firstPath = (files[0] as any).webkitRelativePath || files[0].name;
    const rootName = firstPath.split('/')[0] || 'project';
    
    const root: FileNode = {
      name: rootName,
      path: rootName,
      type: 'folder',
      children: [],
    };
    
    const folderMap = new Map<string, FileNode>();
    folderMap.set(rootName, root);
    
    files.forEach((file: any) => {
      const relativePath = file.webkitRelativePath || file.name;
      const parts = relativePath.split('/');
      
      let currentPath = rootName;
      for (let i = 1; i < parts.length - 1; i++) {
        const folderName = parts[i];
        const folderPath = `${currentPath}/${folderName}`;
        
        if (!folderMap.has(folderPath)) {
          const folderNode: FileNode = {
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: [],
          };
          
          const parent = folderMap.get(currentPath);
          if (parent && parent.children) {
            parent.children.push(folderNode);
          }
          
          folderMap.set(folderPath, folderNode);
        }
        
        currentPath = folderPath;
      }
      
      const fileName = parts[parts.length - 1];
      const filePath = `${currentPath}/${fileName}`;
      const fileNode: FileNode = {
        name: fileName,
        path: filePath,
        type: 'file',
      };
      
      (fileNode as any).fileObject = file;
      
      const parent = folderMap.get(currentPath);
      if (parent && parent.children) {
        parent.children.push(fileNode);
      }
    });
    
    const sortChildren = (node: FileNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name);
          return a.type === 'folder' ? -1 : 1;
        });
        node.children.forEach(sortChildren);
      }
    };
    sortChildren(root);
    
    return root;
  };

  const buildFolderTree = async (
    dirHandle: FileSystemDirectoryHandle,
    parentPath: string
  ): Promise<FileNode> => {
    const path = parentPath ? `${parentPath}/${dirHandle.name}` : dirHandle.name;
    const children: FileNode[] = [];

    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        children.push({
          name: entry.name,
          path: `${path}/${entry.name}`,
          type: 'file',
          handle: entry as FileSystemFileHandle,
        });
      } else if (entry.kind === 'directory') {
        const subFolder = await buildFolderTree(entry as FileSystemDirectoryHandle, path);
        children.push(subFolder);
      }
    }

    children.sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });

    return {
      name: dirHandle.name,
      path,
      type: 'folder',
      children,
    };
  };

  const handleFileImport = async () => {
    try {
      // @ts-ignore
      if (typeof window.showOpenFilePicker === "function" && window.self === window.top) {
        try {
          // @ts-ignore
          const [handle] = await window.showOpenFilePicker({
            multiple: false,
            types: [
              {
                description: "C / C++ Source Files",
                accept: { "text/*": [".c", ".cpp", ".h", ".hpp"] }
              }
            ]
          });

          const file = await handle.getFile();
          const content = await file.text();

          const fileNode: FileNode = {
            name: file.name,
            path: file.name,
            type: "file",
            handle: handle
          };

          if (!rootFolder) {
            setRootFolder({
              name: "Project",
              path: "Project",
              type: "folder",
              children: [fileNode]
            });
          } else {
            setRootFolder({
              ...rootFolder,
              children: [...(rootFolder.children || []), fileNode]
            });
          }

          handleFileOpen(fileNode);
          return;
        } catch (e: any) {
          if (e.name === "AbortError") return;
        }
      }

      useFallbackSingleFileImport();

    } catch (err) {
      console.error("Error importing file:", err);
      alert("Error importing file: " + (err as Error).message);
    }
  };

  const useFallbackSingleFileImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".c,.cpp,.h,.hpp";

    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const content = await file.text();

      const fileNode: FileNode = {
        name: file.name,
        path: file.name,
        type: "file",
      };

      (fileNode as any).fileObject = file;

      if (!rootFolder) {
        setRootFolder({
          name: "Project",
          path: "Project",
          type: "folder",
          children: [fileNode]
        });
      } else {
        setRootFolder({
          ...rootFolder,
          children: [...(rootFolder.children || []), fileNode]
        });
      }

      handleFileOpen(fileNode);
    };

    input.click();
  };

  const handleFileOpen = async (fileNode: FileNode) => {
    const existingFile = openFiles.find(f => f.path === fileNode.path);
    if (existingFile) {
      setActiveFilePath(fileNode.path);
      return;
    }

    try {
      if (fileNode.handle) {
        const file = await fileNode.handle.getFile();
        const content = await file.text();
        
        const newFile: OpenFile = {
          path: fileNode.path,
          name: fileNode.name,
          content,
          handle: fileNode.handle,
        };
        
        setOpenFiles([...openFiles, newFile]);
        setActiveFilePath(fileNode.path);
      } else if ((fileNode as any).fileObject) {
        const file = (fileNode as any).fileObject;
        const content = await file.text();
        
        const newFile: OpenFile = {
          path: fileNode.path,
          name: fileNode.name,
          content,
        };
        
        setOpenFiles([...openFiles, newFile]);
        setActiveFilePath(fileNode.path);
      }
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const handleFileClose = (filePath: string) => {
    const updatedFiles = openFiles.filter(f => f.path !== filePath);
    setOpenFiles(updatedFiles);
    
    if (activeFilePath === filePath) {
      setActiveFilePath(updatedFiles.length > 0 ? updatedFiles[updatedFiles.length - 1].path : null);
      // Clear annotations when closing file
      setAnnotations([]);
    }
  };

  const handleContentChange = (filePath: string, newContent: string) => {
    setOpenFiles(openFiles.map(f => 
      f.path === filePath ? { ...f, content: newContent } : f
    ));
  };

  const activeFile = openFiles.find(f => f.path === activeFilePath);
  const activeFileExtension = activeFile?.name.split('.').pop() || 'c';

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();

    const items = event.dataTransfer.items;
    if (!items || items.length === 0) return;

    const entries: any[] = [];

    for (let i = 0; i < items.length; i++) {
      // @ts-ignore
      const entry = items[i].webkitGetAsEntry();
      if (entry) entries.push(entry);
    }

    const fileNodes: FileNode[] = [];

    for (const entry of entries) {
      const node = await traverseEntry(entry, "");
      if (node) fileNodes.push(node);
    }

    if (fileNodes.length === 0) return;

    if (fileNodes.length === 1 && fileNodes[0].type === "folder") {
      setRootFolder(fileNodes[0]);
    } else {
      setRootFolder({
        name: "Project",
        path: "Project",
        type: "folder",
        children: fileNodes,
      });
    }

    const firstFile = findFirstCodeFile(fileNodes);
    if (firstFile) handleFileOpen(firstFile);
  };

  const traverseEntry = async (entry: any, parentPath: string): Promise<FileNode | null> => {
    const fullPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;

    if (entry.isFile) {
      return new Promise<FileNode>((resolve) => {
        entry.file((file: File) => {
          const node: FileNode = {
            name: file.name,
            path: fullPath,
            type: "file"
          };
          (node as any).fileObject = file;
          resolve(node);
        });
      });
    }

    if (entry.isDirectory) {
      const children: FileNode[] = [];

      const reader = entry.createReader();

      const readEntries = (): Promise<any[]> =>
        new Promise((resolve) => reader.readEntries(resolve));

      let batch = await readEntries();
      while (batch.length > 0) {
        for (const subEntry of batch) {
          const child = await traverseEntry(subEntry, fullPath);
          if (child) children.push(child);
        }
        batch = await readEntries();
      }

      children.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === "folder" ? -1 : 1;
      });

      return {
        name: entry.name,
        path: fullPath,
        type: "folder",
        children,
      };
    }

    return null;
  };

  const findFirstCodeFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === "file" &&
          (node.name.endsWith(".c") || node.name.endsWith(".cpp") ||
           node.name.endsWith(".h") || node.name.endsWith(".hpp"))) {
        return node;
      }
      if (node.type === "folder" && node.children) {
        const found = findFirstCodeFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <div 
      className="flex flex-col h-screen bg-[#1e1e1e] text-[#cccccc] overflow-hidden"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <Toolbar
        currentFilePath={activeFilePath || ''}
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        sidebarVisible={sidebarVisible}
        onOpenFile={handleFolderImport}
        onGenerateAnnotations={handleGenerateAnnotations}
        isGenerating={isGenerating}
        hasAnnotations={annotations.length > 0}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {sidebarVisible && (
          <Sidebar
            rootFolder={rootFolder}
            onImportFolder={handleFolderImport}
            onImportFile={handleFileImport}
            onFileOpen={handleFileOpen}
            activeFilePath={activeFilePath}
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {openFiles.length > 0 ? (
            <>
              <TabBar
                openFiles={openFiles}
                activeFilePath={activeFilePath}
                onTabClick={setActiveFilePath}
                onTabClose={handleFileClose}
              />
              {activeFile && (
                <Editor
                  file={activeFile}
                  onContentChange={handleContentChange}
                  onCursorChange={setCursorPosition}
                  annotations={annotations}
                  onAcceptAnnotation={handleAcceptAnnotation}
                  onRejectAnnotation={handleRejectAnnotation}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[#6a737d]">
              <div className="text-center">
                <p className="mb-2">No file open</p>
                <p className="text-sm">Import a folder and select a C/C++ file to start editing</p>
              </div>
            </div>
          )}
          
          <AIPanel
            isVisible={aiPanelVisible}
            onToggle={() => setAiPanelVisible(!aiPanelVisible)}
            annotations={annotations}
            onAnnotationClick={handleAnnotationClick}
            onAcceptAnnotation={handleAcceptAnnotation}
            onRejectAnnotation={handleRejectAnnotation}
          />
        </div>
      </div>
      
      <StatusBar
        line={cursorPosition.line}
        column={cursorPosition.column}
        language={activeFileExtension}
      />
    </div>
  );
}