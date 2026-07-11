import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { scrollToBottom } from '../../utils/scroll';

const ChatMessages = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const scrollContainerRef = useRef(null);

  // Filter out the initial flat text welcome message
  const chatMessages = messages.filter((msg) => msg.id !== 'msg-welcome');

  // Auto scroll to bottom when messages or typing indicators load
  useEffect(() => {
    scrollToBottom(scrollContainerRef.current, true);
  }, [messages, isTyping]);

  const quickActions = [
    {
      title: 'Company Information',
      query: 'Company Information',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
        </svg>
      )
    },
    {
      title: 'Products',
      query: 'Products',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
        </svg>
      )
    },
    {
      title: 'Solutions',
      query: 'Solutions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      )
    },
    {
      title: 'Contact Sales',
      query: 'Contact Sales',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.122-4.1-6.924-6.924l1.293-.97c.362-.271.528-.733.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
        </svg>
      )
    }
  ];

  return (
    <div
      ref={scrollContainerRef}
      data-lenis-prevent
      className="flex-grow h-0 min-h-0 overflow-y-auto p-5 pb-8 space-y-6 scroll-smooth custom-chatbot-scroll"
    >
      {/* 4px Scrollbar CSS styles injection */}
      <style>{`
        .custom-chatbot-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-chatbot-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          transition: background 0.2s ease;
        }
        .custom-chatbot-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.22);
        }
      `}</style>

      {/* Empty State Welcome & Actions with Smooth Fade Out */}
      <AnimatePresence mode="popLayout">
        {chatMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25, height: 0, overflow: 'hidden', margin: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Centered Welcome Box */}
            <div className="flex flex-col items-center justify-center pt-2 pb-1 text-center select-none">
              {/* logo container scaled to 76px */}
              <div className="relative w-[76px] h-[76px] mx-auto bg-zinc-900/60 border border-white/5 rounded-[18px] flex items-center justify-center shadow-[0_0_15px_rgba(227,6,19,0.1)] mb-2.5">
                <img 
                  src="/mindstec-ai-logo.png" 
                  alt="Mindstec AI Logo" 
                  className="w-13 h-13 object-cover"
                />
              </div>
              
              <h2 className="text-[22px] font-bold text-white tracking-tight font-sans leading-none uppercase">
                Mindstec AI
              </h2>
              <p className="text-[13px] text-white/50 max-w-[280px] mt-3.5 leading-normal font-sans font-medium">
                How can I help today?
              </p>
            </div>

            {/* Quick Actions (2x2 Grid) */}
            <div className="grid grid-cols-2 gap-3.5 px-0.5 select-none pb-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.query)}
                  className="flex flex-col justify-center items-center p-3 h-[74px] bg-[#1A1A1E]/30 border border-white/5 rounded-[18px] backdrop-blur-sm transition-all duration-200 hover:bg-[#1A1A1E]/60 hover:border-[#E30613]/30 hover:-translate-y-1 hover:shadow-[0_4px_15px_rgba(227,6,19,0.15)] hover:scale-[1.02] text-center group cursor-pointer"
                >
                  <div className="text-white/60 group-hover:text-[#E30613] transition-colors duration-200">
                    {action.icon}
                  </div>
                  <span className="text-[13px] font-semibold text-white/80 group-hover:text-white mt-2 transition-colors duration-200 leading-none">
                    {action.title}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Stack */}
      <div className="space-y-6">
        {chatMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Typing Bubble */}
      {isTyping && <TypingIndicator />}
    </div>
  );
};

export default React.memo(ChatMessages);
