import React, { useState, useCallback, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { Play, Save, Download, Copy } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  darkMode: boolean;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, darkMode }) => {
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  // Process LaTeX content for preview
  const processLatexContent = useCallback((latexContent: string) => {
    try {
      // Simple processing - in a real app, you'd use a proper LaTeX parser
      let processed = latexContent;
      
      // Convert common LaTeX commands to HTML/React components
      processed = processed
        .replace(/\\section\{([^}]+)\}/g, '<h2 class="text-2xl font-bold mb-4 mt-6">$1</h2>')
        .replace(/\\subsection\{([^}]+)\}/g, '<h3 class="text-xl font-bold mb-3 mt-4">$1</h3>')
        .replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>')
        .replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>')
        .replace(/\\title\{([^}]+)\}/g, '<h1 class="text-4xl font-bold mb-6 text-center">$1</h1>')
        .replace(/\\author\{([^}]+)\}/g, '<div class="text-lg text-center mb-4 text-gray-600">$1</div>')
        .replace(/\\date\{([^}]+)\}/g, '<div class="text-center mb-8 text-gray-500">$1</div>')
        .replace(/\\maketitle/g, '')
        .replace(/\\begin\{abstract\}/g, '<div class="bg-gray-50 p-4 rounded-lg mb-6"><h4 class="font-bold mb-2">Abstract</h4>')
        .replace(/\\end\{abstract\}/g, '</div>')
        .replace(/\\begin\{itemize\}/g, '<ul class="list-disc pl-6 mb-4">')
        .replace(/\\end\{itemize\}/g, '</ul>')
        .replace(/\\item\s+/g, '<li class="mb-1">')
        .replace(/\\par\s+/g, '<p class="mb-4">')
        .replace(/\n\n/g, '</p><p class="mb-4">');

      return processed;
    } catch (error) {
      return 'Error processing LaTeX content';
    }
  }, []);

  useEffect(() => {
    setPreviewContent(processLatexContent(content));
  }, [content, processLatexContent]);

  const handleCompile = () => {
    setPreviewContent(processLatexContent(content));
  };

  const handleSave = () => {
    // This would save the document via API
    console.log('Saving document...');
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="liquid-glass border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCompile}
              className="liquid-glass-button px-4 py-2 rounded-ios flex items-center space-x-2 text-sm font-medium"
            >
              <Play size={16} />
              <span>Compile</span>
            </button>
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="liquid-glass-button px-4 py-2 rounded-ios text-sm font-medium"
            >
              {isPreviewMode ? 'Show Editor' : 'Show Preview'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="liquid-glass-button p-2 rounded-ios"
              title="Copy LaTeX"
            >
              <Copy size={16} />
            </button>
            
            <button
              onClick={handleSave}
              className="liquid-glass-button p-2 rounded-ios"
              title="Save Document"
            >
              <Save size={16} />
            </button>
            
            <button
              onClick={handleDownload}
              className="liquid-glass-button p-2 rounded-ios"
              title="Download LaTeX"
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 flex">
        {/* Editor Pane */}
        <div className={`${isPreviewMode ? 'w-1/2' : 'w-full'} border-r border-white/20`}>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-full resize-none border-none outline-none p-6 latex-editor custom-scrollbar ${
              darkMode 
                ? 'bg-gray-800 text-white' 
                : 'bg-white/50 text-gray-900'
            }`}
            placeholder="Enter your LaTeX content here...

Example:
\documentclass{article}
\begin{document}

\title{My Document}
\author{Author Name}
\date{\today}
\maketitle

\section{Introduction}
Welcome to \textbf{Formal} - the modern LaTeX editor.

\subsection{Features}
\begin{itemize}
    \item Real-time preview
    \item AI assistance
    \item Modern UI
\end{itemize}

\end{document}"
            spellCheck={false}
          />
        </div>

        {/* Preview Pane */}
        {isPreviewMode && (
          <div className={`w-1/2 overflow-auto custom-scrollbar ${
            darkMode ? 'bg-gray-800' : 'bg-white/30'
          }`}>
            <div 
              className="p-6 latex-preview prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;