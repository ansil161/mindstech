import React from 'react';
import { motion } from 'framer-motion';
import useChat from '../../hooks/useChat';

const FloatingButton = () => {
  const { isOpen, toggleChat } = useChat();

  return (
    <div className="fixed bottom-6 right-6" style={{ zIndex: 99999 }}>
      {/* Outer pulsing ring animation - active when chat is closed to grab attention */}
      {!isOpen && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4 z-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0d0d0f] shadow-sm"></span>
        </span>
      )}

      {/* Main button wrapper */}
      <motion.button
        onClick={toggleChat}
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#E30613] hover:bg-[#c20510] text-white shadow-[0_4px_20px_rgba(227,6,19,0.3)] border border-white/10 focus:outline-none cursor-pointer"
        whileHover={{ 
          scale: 1.08,
          boxShadow: '0 0 25px rgba(227, 6, 19, 0.6)' 
        }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        aria-label={isOpen ? "Close chat panel" : "Open chat assistant"}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.25 }}
        >
          {isOpen ? (
            // Close X Icon
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Speech Bubble Icon
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2} 
              stroke="currentColor" 
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a.75.75 0 01-1.074-.83l1.03-3.707C4.554 15.118 4 13.626 4 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
};

export default React.memo(FloatingButton);
