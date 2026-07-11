import React, { useState } from 'react';
import { motion } from 'framer-motion';
import useChat from '../../hooks/useChat';

const CHAR_LIMIT = 1000;

const ChatInput = () => {
  const { sendMessage, isLoading } = useChat();
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    sendMessage(text);
    setText('');
  };

  return (
    <div className="p-4 bg-[#0d0d0f] border-t border-white/5 select-none">
      <form onSubmit={handleSubmit} className="relative flex items-center h-[56px] bg-[#1A1A1E]/60 border border-white/10 backdrop-blur-md rounded-[28px] pl-5 pr-1.5 shadow-inner">
        {/* Microphone Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.8} 
          stroke="currentColor" 
          className="w-5 h-5 text-white/30 mr-3 flex-shrink-0"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 0 3-3v-6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z" />
        </svg>

        {/* Input field - centered vertically */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAR_LIMIT))}
          placeholder="Type your inquiry..."
          disabled={isLoading}
          className="flex-grow bg-transparent text-white placeholder-white/30 text-[15px] font-sans focus:outline-none focus:ring-0 border-none outline-none disabled:opacity-50 py-1"
        />

        {/* Submit Action Button - 44px circular, red gradient, click and hover scaling, subtle glow */}
        <motion.button
          type="submit"
          disabled={!text.trim() && !isLoading}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-[#E30613] to-[#B00020] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:shadow-none flex-shrink-0"
          whileHover={!text.trim() && !isLoading ? {} : { 
            scale: 1.05, 
            boxShadow: '0 0 15px rgba(227, 6, 19, 0.55)',
          }}
          whileTap={!text.trim() && !isLoading ? {} : { scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-label="Send message"
        >
          {isLoading ? (
            /* Loading Spinner while generating response */
            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            /* Top-Right Diagonal Arrow */
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-4.5 h-4.5 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default React.memo(ChatInput);
