import React from 'react';
import { useTranslation } from 'react-i18next';
import useChat from '../../hooks/useChat';
import SupportAvatar from './SupportAvatar';

const ChatHeader = () => {
  const { toggleChat } = useChat();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-black/65 backdrop-blur-md border-b border-white/10 text-white shadow-sm select-none z-10 flex-shrink-0">
      <div className="flex items-center space-x-3">
        {/* Circular AI Avatar (40x40) */}
        <SupportAvatar size={40} showOnlineBadge={false} />
        
        {/* Title and Status */}
        <div className="flex flex-col justify-center">
          <h3 className="font-sans font-bold text-[15px] tracking-tight text-white leading-none">
            {t('chat.header.title', 'Mindstec Support')}
          </h3>
          <div className="flex items-center mt-1">
            <span className="text-[11px] font-sans font-semibold text-emerald-400 tracking-wide flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {t('chat.header.online', 'Online')}
            </span>
          </div>
        </div>
      </div>

      {/* Minimize and Close Controls */}
      <div className="flex items-center gap-2">
        {/* Minimize Button */}
        <button
          onClick={toggleChat}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          title="Minimize chat"
          aria-label="Minimize chat"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>

        {/* Close Button */}
        <button
          onClick={toggleChat}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          title="Close chat"
          aria-label="Close chat"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-3.5 h-3.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ChatHeader);
