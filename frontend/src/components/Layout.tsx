import React from 'react';
import { FileText, Settings, Moon, Sun } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  darkMode, 
  toggleDarkMode, 
  sidebarOpen, 
  toggleSidebar 
}) => {
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      {/* Header */}
      <header className="liquid-glass border-b border-white/20 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="formal-logo text-3xl font-bold">
              F<sub className="text-lg">ormal</sub>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              LaTeX Editor with AI
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="liquid-glass-button p-2 rounded-ios text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <FileText size={20} />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="liquid-glass-button p-2 rounded-ios text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button className="liquid-glass-button p-2 rounded-ios text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;