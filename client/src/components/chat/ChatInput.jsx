import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useChat from '../../hooks/useChat';

const CHAR_LIMIT = 1000;

const ChatInput = () => {
  const { sendMessage, isLoading } = useChat();
  const [text, setText] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || isLoading) return;

    sendMessage(text);
    setText('');
  };

  return (
    <div className="p-3 bg-[#0d0d0f] border-t border-white/5 select-none">
      <form onSubmit={handleSubmit} className="relative flex items-center h-[52px] bg-[#1A1A1E]/50 border border-white/10 backdrop-blur-md rounded-[26px] pl-4 pr-1 shadow-inner focus-within:border-[#E30613]/50 transition-all duration-200">
        
        {/* Attachment Button */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-all duration-200 cursor-pointer flex-shrink-0 mr-1"
          aria-label="Attach file"
          title="Attach file"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={2} 
            stroke="currentColor" 
            className="w-4.5 h-4.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32a1.5 1.5 0 01-2.12-2.121L16.208 7.4" />
          </svg>
        </button>

        {/* Input field */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAR_LIMIT))}
          placeholder={t('chat.input.placeholder', 'Ask about products, solutions or support...')}
          disabled={isLoading}
          className="flex-grow bg-transparent text-white placeholder-white/30 text-[14px] font-sans focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none outline-none disabled:opacity-50 py-1"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
        />

        {/* Submit Action Button - Circular with a red background, disabled when empty */}
        <motion.button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-[#E30613] hover:bg-[#c20510] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-20 disabled:hover:shadow-none flex-shrink-0 transition-colors duration-200"
          whileHover={!text.trim() || isLoading ? {} : { 
            scale: 1.05, 
            boxShadow: '0 0 10px rgba(227, 6, 19, 0.4)',
          }}
          whileTap={!text.trim() || isLoading ? {} : { scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-label="Send message"
        >
          {isLoading ? (
            /* Loading Spinner while generating response */
            <svg className="animate-spin h-4.5 w-4.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            /* Send Icon */
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={2.5} 
              stroke="currentColor" 
              className="w-4 h-4 text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default React.memo(ChatInput);

