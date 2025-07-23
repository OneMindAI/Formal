import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Save, Download, Copy, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { LatexRenderer } from '../utils/latexRenderer';
// import FormattingToolbar from './FormattingToolbar';
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
    setIsCompiling(true);
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Insert text at cursor position
  const handleInsertText = (text: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + text + content.substring(end);
      onChange(newContent);
      
      // Move cursor to the end of inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    }
  };

  // Get compilation status icon
  const getStatusIcon = () => {
    switch (compilationStatus) {
      case 'success':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Advanced Formatting Toolbar - Temporarily commented out */}
      {/* <FormattingToolbar onInsert={handleInsertText} darkMode={darkMode} /> */}

      {/* Enhanced Toolbar */}
      <div className="liquid-glass border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className={`liquid-glass-button px-4 py-2 rounded-ios flex items-center space-x-2 text-sm font-medium ${
                isCompiling ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isCompiling ? (
                <div className="loading-spinner w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <Play size={16} />
              )}
              <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
            </button>
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="liquid-glass-button px-4 py-2 rounded-ios text-sm font-medium flex items-center space-x-2"
            >
              {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
              <span>{isPreviewMode ? 'Editor Only' : 'Show Preview'}</span>
            </button>

            {/* Compilation Status */}
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {compilationStatus === 'error' && validationErrors.length > 0 && (
                <div className="text-xs text-red-500">
                  {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
                </div>
              )}
              {compilationStatus === 'success' && (
                <div className="text-xs text-green-500">Compiled successfully</div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="liquid-glass-button p-2 rounded-ios"
              title="Copy LaTeX Source"
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
              title="Download LaTeX File"
            >
              <Download size={16} />
            </button>
          </div>
        </div>

        {/* Error Display */}
        {validationErrors.length > 0 && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-ios">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm font-medium text-red-700">LaTeX Errors:</span>
            </div>
            <ul className="text-xs text-red-600 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="ml-4">• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Editor/Preview Area */}
      <div className="flex-1 flex">
        {/* Enhanced Editor Pane */}
        <div className={`${isPreviewMode ? 'w-1/2' : 'w-full'} border-r border-white/20 flex flex-col`}>
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => onChange(e.target.value)}
              className={`w-full h-full resize-none border-none outline-none p-6 latex-editor custom-scrollbar ${
                darkMode 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white/50 text-gray-900'
              }`}
              placeholder="Enter your LaTeX content here...

Example - Try some advanced math:
\documentclass{article}
\usepackage{amsmath,amssymb}
\begin{document}

\title{Advanced LaTeX Document}
\author{Your Name}
\date{\today}
\maketitle

\section{Mathematical Expressions}

Inline math: $E = mc^2$ and $\int_0^\infty e^{-x} dx = 1$

Display math:
$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$

Complex equations:
\begin{align}
\nabla \times \mathbf{E} &= -\frac{\partial \mathbf{B}}{\partial t} \\
\nabla \times \mathbf{H} &= \mathbf{J} + \frac{\partial \mathbf{D}}{\partial t}
\end{align}

Matrix example:
$$\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}$$

\section{Advanced Features}
\textbf{Bold text}, \textit{italic text}, and \textcolor{red}{colored text}.

\begin{itemize}
\item Bullet points work perfectly
\item With proper formatting
\item And mathematical symbols: $\alpha, \beta, \gamma$
\end{itemize}

\end{document}"
              spellCheck={false}
            />

            {/* Line Numbers (optional) */}
            <div className={`absolute left-0 top-0 bottom-0 w-12 ${
              darkMode ? 'bg-gray-900/50' : 'bg-white/30'
            } border-r border-white/20 flex flex-col text-xs text-gray-500 py-6`}>
              {content.split('\n').map((_, index) => (
                <div key={index} className="leading-6 text-center">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Preview Pane */}
        {isPreviewMode && (
          <div className={`w-1/2 overflow-auto custom-scrollbar ${
            darkMode ? 'bg-gray-800' : 'bg-white/30'
          }`}>
            <div className="p-6">
              {/* Preview Header */}
              <div className={`flex items-center justify-between mb-4 pb-2 border-b ${
                darkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <h3 className="text-sm font-medium">LaTeX Preview</h3>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className="text-xs text-gray-500">
                    {compilationStatus === 'success' ? 'Live Preview' : 'Preview (with errors)'}
                  </span>
                </div>
              </div>

              {/* Rendered Content */}
              <div 
                className={`latex-preview prose prose-lg max-w-none ${
                  darkMode ? 'prose-invert' : ''
                }`}
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;