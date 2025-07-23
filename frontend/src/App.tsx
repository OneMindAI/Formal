import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Editor from './components/Editor';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import { Document, Template } from './types';
import { documentApi, templateApi, healthApi } from './utils/api';

function App() {
  // UI State
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Document State
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [documentContent, setDocumentContent] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // App State
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check backend connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await healthApi.check();
        setIsConnected(!!response.data);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (currentDocument && hasUnsavedChanges) {
      const saveTimer = setTimeout(async () => {
        await saveCurrentDocument();
      }, 2000); // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(saveTimer);
    }
  }, [documentContent, hasUnsavedChanges]);

  const saveCurrentDocument = async () => {
    if (!currentDocument) return;

    try {
      const response = await documentApi.update(currentDocument.id, {
        content: documentContent,
        updated_at: new Date().toISOString()
      });

      if (response.data) {
        setCurrentDocument(response.data);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Failed to save document:', error);
    }
  };

  const handleDocumentSelect = async (doc: Document) => {
    if (hasUnsavedChanges && currentDocument) {
      await saveCurrentDocument();
    }
    
    setCurrentDocument(doc);
    setDocumentContent(doc.content);
    setHasUnsavedChanges(false);
    setSidebarOpen(false);
  };

  const handleNewDocument = async () => {
    if (hasUnsavedChanges && currentDocument) {
      await saveCurrentDocument();
    }

    const newDoc: Omit<Document, 'id' | 'created_at' | 'updated_at'> = {
      title: `Untitled Document ${new Date().getTime()}`,
      content: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}

\\title{Your Title Here}
\\author{Your Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introduction}
Write your introduction here.

\\section{Main Content}
Add your main content here.

\\section{Conclusion}
Conclude your document here.

\\end{document}`,
      tags: [],
      is_public: false,
      metadata: {}
    };

    try {
      const response = await documentApi.create(newDoc);
      if (response.data) {
        setCurrentDocument(response.data);
        setDocumentContent(response.data.content);
        setHasUnsavedChanges(false);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    if (hasUnsavedChanges && currentDocument) {
      await saveCurrentDocument();
    }

    const newDoc: Omit<Document, 'id' | 'created_at' | 'updated_at'> = {
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      content: template.content,
      template_id: template.id,
      tags: [template.category],
      is_public: false,
      metadata: { template_name: template.name }
    };

    try {
      const response = await documentApi.create(newDoc);
      if (response.data) {
        setCurrentDocument(response.data);
        setDocumentContent(response.data.content);
        setHasUnsavedChanges(false);
        setSidebarOpen(false);
      }
    } catch (error) {
      console.error('Failed to create document from template:', error);
    }
  };

  const handleContentChange = (content: string) => {
    setDocumentContent(content);
    setHasUnsavedChanges(true);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="formal-logo text-6xl font-bold mb-4">
            F<sub className="text-3xl">ormal</sub>
          </div>
          <div className="loading-spinner w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading LaTeX Editor...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center liquid-glass p-8 rounded-ios-lg max-w-md">
          <div className="formal-logo text-4xl font-bold mb-4">
            F<sub className="text-2xl">ormal</sub>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the backend server. Please ensure the server is running.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="liquid-glass-button px-6 py-2 rounded-ios"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Layout
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      >
        <div className="flex h-screen pt-16"> {/* Account for header height */}
          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onDocumentSelect={handleDocumentSelect}
            onNewDocument={handleNewDocument}
            onTemplateSelect={handleTemplateSelect}
            darkMode={darkMode}
            currentDocumentId={currentDocument?.id}
          />

          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {currentDocument ? (
              <>
                {/* Document Header */}
                <div className="liquid-glass border-b border-white/20 px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h1 className="text-lg font-semibold">{currentDocument.title}</h1>
                    {hasUnsavedChanges && (
                      <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-1 rounded">
                        Unsaved changes
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleChat}
                      className={`liquid-glass-button p-2 rounded-ios ${
                        chatOpen ? 'bg-blue-500/20 text-blue-600' : ''
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Editor */}
                <div className="flex-1">
                  <Editor
                    content={documentContent}
                    onChange={handleContentChange}
                    darkMode={darkMode}
                  />
                </div>
              </>
            ) : (
              /* Welcome Screen */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <div className="formal-logo text-6xl font-bold mb-6">
                    F<sub className="text-3xl">ormal</sub>
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Welcome to Formal</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    A modern LaTeX editor with AI-powered assistance. Create beautiful documents with real-time preview and intelligent suggestions.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleNewDocument}
                      className="w-full liquid-glass-button py-3 px-6 rounded-ios-lg font-medium"
                    >
                      Create New Document
                    </button>
                    <button
                      onClick={toggleSidebar}
                      className="w-full liquid-glass-button py-3 px-6 rounded-ios-lg font-medium"
                    >
                      Browse Templates
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Panel */}
          <ChatPanel
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            documentId={currentDocument?.id}
            darkMode={darkMode}
          />
        </div>
      </Layout>
    </div>
  );
}

export default App;