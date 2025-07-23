import React, { useState, useEffect } from 'react';
import { Plus, Search, FileText, Tag, Calendar, MessageCircle } from 'lucide-react';
import { Document, Template } from '../types';
import { documentApi, templateApi } from '../utils/api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentSelect: (doc: Document) => void;
  onNewDocument: () => void;
  onTemplateSelect: (template: Template) => void;
  darkMode: boolean;
  currentDocumentId?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onDocumentSelect,
  onNewDocument,
  onTemplateSelect,
  darkMode,
  currentDocumentId
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'templates'>('documents');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
      loadTemplates();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    setLoading(true);
    const response = await documentApi.getAll();
    if (response.data) {
      setDocuments(response.data);
    }
    setLoading(false);
  };

  const loadTemplates = async () => {
    const response = await templateApi.getAll();
    if (response.data) {
      setTemplates(response.data);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'liquid-glass-dark' : 'liquid-glass'}`}>
        
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <button
            onClick={onNewDocument}
            className="w-full liquid-glass-button py-3 px-4 rounded-ios-lg flex items-center justify-center space-x-2 text-sm font-medium mb-4"
          >
            <Plus size={16} />
            <span>New Document</span>
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-ios border-0 ${
                darkMode 
                  ? 'bg-white/10 text-white placeholder-gray-400' 
                  : 'bg-white/50 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'documents'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} className="inline mr-2" />
            Documents
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'templates'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Tag size={16} className="inline mr-2" />
            Templates
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 text-center">
              <div className="loading-spinner w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <>
              {activeTab === 'documents' && (
                <div className="p-4 space-y-2">
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No documents found</p>
                    </div>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onDocumentSelect(doc)}
                        className={`p-3 rounded-ios cursor-pointer transition-all hover:scale-[1.02] ${
                          currentDocumentId === doc.id
                            ? 'bg-blue-500/20 border border-blue-500/50'
                            : darkMode
                            ? 'hover:bg-white/10'
                            : 'hover:bg-white/30'
                        }`}
                      >
                        <h3 className="font-medium text-sm mb-1 truncate">{doc.title}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar size={12} />
                            <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                          </div>
                          {doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-500/20 text-blue-600 rounded text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'templates' && (
                <div className="p-4 space-y-2">
                  {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Tag size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No templates found</p>
                    </div>
                  ) : (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        onClick={() => onTemplateSelect(template)}
                        className={`template-card p-3 rounded-ios cursor-pointer border ${
                          darkMode
                            ? 'hover:bg-white/10 border-white/10'
                            : 'hover:bg-white/30 border-white/30'
                        }`}
                      >
                        <h3 className="font-medium text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-600 rounded text-xs">
                            {template.category}
                          </span>
                          {template.is_builtin && (
                            <span className="text-xs text-green-600">Built-in</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;