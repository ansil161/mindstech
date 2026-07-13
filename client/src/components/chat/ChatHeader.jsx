import React from 'react';
import { useTranslation } from 'react-i18next';
import useChat from '../../hooks/useChat';
import SupportAvatar from './SupportAvatar';

const ChatHeader = () => {
  const { toggleChat } = useChat();
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between h-[76px] px-5 bg-[#0D0D0F] border-b border-white/5 text-white select-none">
      <div className="flex items-center space-x-3">
        {/* Customer Support Avatar */}
        <SupportAvatar size={42} showOnlineBadge={true} />
        
        <div className="flex flex-col justify-center">
          <h3 className="font-bold text-[16px] tracking-tight text-white font-sans leading-tight">
            {t('chat.header.title', 'Mindstec Support')}
          </h3>
          <div className="flex items-center mt-0.5">
            <span className="text-[12px] text-white/50 font-sans font-medium flex items-center gap-1.5">
              <span>{t('chat.header.online', 'Online')}</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>{t('chat.header.avg_response', 'Avg. response <30 sec')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions: Minimize and Close Buttons */}
      <div className="flex items-center space-x-2">
        {/* Minimize Button */}
        <button
          onClick={toggleChat}
          className="w-7 h-7 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer"
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

        {/* Close Button - Subtle and brighter on hover */}
        <button
          onClick={toggleChat}
          className="w-7 h-7 rounded-full bg-white/0 hover:bg-white/5 text-white/30 hover:text-white/90 transition-all duration-200 flex items-center justify-center cursor-pointer"
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

