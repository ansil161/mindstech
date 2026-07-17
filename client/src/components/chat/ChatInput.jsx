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

  const handleKeyDown = (e) => {
    // Submit on Enter keypress without shift modifier
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="px-4 py-4 bg-[#0B0B0E] border-t border-[rgba(255,255,255,0.08)] select-none flex-shrink-0 z-10">
      <form onSubmit={handleSubmit} className="relative flex items-center bg-[#111216] border border-[rgba(255,255,255,0.08)] rounded-[28px] pl-4 pr-1.5 py-1.5 shadow-inner focus-within:border-[#CC0001]/50 focus-within:ring-2 focus-within:ring-[#CC0001]/10 transition-all duration-200 w-full">
        
        {/* Textarea Input (Enter to Send, Shift+Enter for new line) */}
        <textarea
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAR_LIMIT))}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.input.placeholder', 'Type your question...')}
          disabled={isLoading}
          className="flex-grow bg-transparent text-[#FAFAFA] placeholder-white/30 text-[14px] font-sans focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none outline-none disabled:opacity-50 py-1 pr-3 resize-none max-h-20 overflow-y-auto leading-[1.4] h-[22px] min-h-[22px] align-middle"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          aria-label="Chat input field"
        />

        {/* Right Side: Gradient Send Button */}
        <motion.button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#CC0001] to-[#990000] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 flex-shrink-0 shadow-md shadow-[#CC0001]/10 focus:outline-none focus:ring-2 focus:ring-[#CC0001]/50"
          whileHover={!text.trim() || isLoading ? {} : { 
            scale: 1.05, 
            boxShadow: '0 4px 12px rgba(204, 0, 1, 0.3)',
          }}
          whileTap={!text.trim() || isLoading ? {} : { scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          aria-label="Send message"
        >
          {isLoading ? (
            /* Loading Spinner */
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
