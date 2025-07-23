import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Bot, User, Lightbulb } from 'lucide-react';
import { chatApi } from '../utils/api';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  documentId?: string;
  darkMode: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, documentId, darkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your LaTeX assistant. I can help you with formatting, equations, document structure, and more. What would you like to work on?',
      timestamp: new Date(),
      suggestions: [
        'Help me format a mathematical equation',
        'Show me how to create a table',
        'Suggest a better document structure'
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !documentId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatApi.sendMessage(documentId, inputMessage);
      
      if (response.data) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.data.message,
          timestamp: new Date(),
          suggestions: response.data.suggestions || []
        };
        
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Chat Panel */}
      <div className={`fixed right-0 top-0 h-full w-80 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${darkMode ? 'liquid-glass-dark' : 'liquid-glass'} flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle size={20} className="text-blue-500" />
            <span className="font-medium">AI Assistant</span>
          </div>
          <button
            onClick={onClose}
            className="liquid-glass-button p-1 rounded-ios hover:bg-red-500/20"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-bubble flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`max-w-[80%] rounded-ios-lg p-3 ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white'
                  : darkMode
                  ? 'bg-white/10 text-white'
                  : 'bg-white/50 text-gray-900'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'assistant' && (
                    <Bot size={16} className="mt-1 text-blue-500" />
                  )}
                  {message.type === 'user' && (
                    <User size={16} className="mt-1 text-white" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-xs text-blue-400">
                      <Lightbulb size={12} className="mr-1" />
                      Suggestions:
                    </div>
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="block w-full text-left text-xs p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`rounded-ios-lg p-3 ${
                darkMode ? 'bg-white/10' : 'bg-white/50'
              } flex items-center space-x-2`}>
                <Bot size={16} className="text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about LaTeX, formatting, or document structure..."
              className={`flex-1 resize-none rounded-ios border-0 px-3 py-2 text-sm ${
                darkMode 
                  ? 'bg-white/10 text-white placeholder-gray-400' 
                  : 'bg-white/50 text-gray-900 placeholder-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-blue-500/50`}
              rows={2}
              disabled={!documentId}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || !documentId}
              className="liquid-glass-button p-2 rounded-ios text-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          
          {!documentId && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              Create or select a document to start chatting
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatPanel;