import React from 'react';
import useChat from '../../hooks/useChat';

const ChatHeader = () => {
  const { toggleChat } = useChat();

  return (
    <div className="flex items-center justify-between h-[72px] px-6 bg-[#0D0D0F] border-b border-white/5 text-white select-none">
      <div className="flex items-center space-x-3.5">
        {/* Status Avatar with Red Glow */}
        <div className="relative flex-shrink-0">
          <img 
            src="/mindstec-ai-logo.png" 
            alt="Mindstec AI" 
            className="w-8 h-8 rounded-full border border-[#E30613]/30 object-cover shadow-[0_0_10px_rgba(227,6,19,0.4)]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h3 className="font-bold text-[22px] leading-none tracking-tight text-white font-sans">
            Mindstec AI
          </h3>
          <div className="flex items-center mt-2">
            {/* Green animated online dot inline with subtitle */}
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[12px] tracking-wider font-semibold text-white/40 uppercase leading-none">
              Neural Link Active
            </span>
          </div>
        </div>
      </div>

      {/* Header Actions Panel - Circular Close Button moved slightly away from edge */}
      <div className="flex items-center mr-1">
        <button
          onClick={toggleChat}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 flex items-center justify-center cursor-pointer"
          title="Close chat"
          aria-label="Close chat"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-4.5 h-4.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default React.memo(ChatHeader);
