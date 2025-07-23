import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Save, Download, Copy, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { LatexRenderer } from '../utils/latexRenderer';
import FormattingToolbar from './FormattingToolbar';
import 'katex/dist/katex.min.css';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  darkMode: boolean;
}

const Editor: React.FC<EditorProps> = ({ content, onChange, darkMode }) => {
  const [previewContent, setPreviewContent] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationStatus, setCompilationStatus] = useState<'success' | 'error' | 'idle'>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Advanced LaTeX processing with proper rendering
  const processLatexContent = useCallback((latexContent: string) => {
    try {
      setIsCompiling(true);
      
      // Validate LaTeX syntax
      const validation = LatexRenderer.validateLatex(latexContent);
      setValidationErrors(validation.errors);

      // Render LaTeX content with advanced processing
      const rendered = LatexRenderer.renderLatex(latexContent);
      
      setCompilationStatus(validation.isValid ? 'success' : 'error');
      return rendered;
    } catch (error) {
      console.error('LaTeX rendering error:', error);
      setCompilationStatus('error');
      setValidationErrors([error instanceof Error ? error.message : 'Unknown rendering error']);
      return `<div class="error-message text-red-600 p-4 border border-red-300 rounded bg-red-50">
        <strong>LaTeX Rendering Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}
      </div>`;
    } finally {
      setIsCompiling(false);
    }
  }, []);

  // Real-time compilation with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setPreviewContent(processLatexContent(content));
    }, 500); // 500ms debounce for better performance

    return () => clearTimeout(debounceTimer);
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