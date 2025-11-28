interface StatusBarProps {
  line: number;
  column: number;
  language: string;
}

export function StatusBar({ line, column, language }: StatusBarProps) {
  const languageDisplay = 
    language === 'cpp' || language === 'hpp' ? 'C++' : 
    language === 'c' || language === 'h' ? 'C' : 
    language.toUpperCase();
  
  return (
    <div className="h-[22px] bg-[#007acc] flex items-center px-3 text-xs text-white gap-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-2">
          <span className="opacity-0">○</span>
          <span className="opacity-0">△</span>
          <span className="opacity-0">⚠</span>
          <span>2</span>
        </span>
      </div>
      
      <div className="flex-1"></div>
      
      <div className="flex items-center gap-4">
        <span>Ln {line}, Col {column}</span>
        <span>Spaces: 4</span>
        <span>UTF-8</span>
        <span>{languageDisplay}</span>
      </div>
    </div>
  );
}