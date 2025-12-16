import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  showCopilotStatus?: boolean;
  onBackToFeatures?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = "WFM-AI",
  showCopilotStatus = false,
  onBackToFeatures
}) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Logo and feature status */}
        <div className="flex items-center space-x-6">
          <button
            onClick={handleLogoClick}
            className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hover:from-blue-300 hover:to-purple-300 transition-all"
          >
            WFM.ai
          </button>

          {showCopilotStatus && (
            <div className="flex items-center space-x-2 px-3 py-1 bg-green-900/30 border border-green-700 rounded-full">
              <span className="text-green-400 font-medium">✓</span>
              <span className="text-green-300 text-sm font-medium">WFM Copilot</span>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {onBackToFeatures && (
            <button
              onClick={onBackToFeatures}
              className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
            >
              ← Back to Features
            </button>
          )}

          <button
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
            title="Help"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};