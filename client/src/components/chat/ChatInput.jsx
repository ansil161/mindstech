import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useChat from '../../hooks/useChat';

const CHAR_LIMIT = 1000;

const ChatInput = () => {
  const { sendMessage, isLoading } = useChat();
  const [text, setText] = useState('');
  const { t } = useTranslation();
  const textareaRef = useRef(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  useEffect(() => {
    resizeTextarea();
  }, [text]);

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
    <div className="relative px-4 pt-3.5 pb-4 bg-[#0B0B0E] border-t border-white/[0.08] select-none flex-shrink-0 z-10">
      {/* Top subtle highlight divider */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent"
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-[#13141A] border border-white/[0.1] rounded-[24px] pl-4 pr-1.5 py-1.5 min-h-[48px] shadow-lg focus-within:border-[#CC0001]/60 focus-within:ring-2 focus-within:ring-[#CC0001]/20 transition-all duration-200 w-full"
      >
        {/* Textarea Input (Enter to Send, Shift+Enter for new line) */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, CHAR_LIMIT))}
          onKeyDown={handleKeyDown}
          placeholder={t('chat.input.placeholder', 'Type your message...')}
          disabled={isLoading}
          className="flex-grow bg-transparent text-[#FAFAFA] placeholder-white/40 text-[14px] font-sans focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none outline-none disabled:opacity-50 py-2 pr-3.5 resize-none overflow-y-auto leading-[1.45] min-h-[24px] max-h-[110px] my-auto custom-chatbot-scroll"
          style={{ outline: 'none', border: 'none', boxShadow: 'none' }}
          aria-label="Chat input field"
        />

        {/* Right Side: Gradient Send Button */}
        <motion.button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="group relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#CC0001] to-[#990000] text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-30 flex-shrink-0 shadow-md shadow-[#CC0001]/20 focus:outline-none focus:ring-2 focus:ring-[#CC0001]/50 overflow-hidden my-auto ml-1"
          whileHover={!text.trim() || isLoading ? {} : {
            scale: 1.05,
            boxShadow: '0 4px 12px rgba(204, 0, 1, 0.35)',
          }}
          whileTap={!text.trim() || isLoading ? {} : { scale: 0.95 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          aria-label="Send message"
        >
          {/* Diagonal shine-sweep hover effect */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] [transform:skewX(-25deg)] transition-transform duration-700 ease-out pointer-events-none"
          />
          <span className="relative z-10 flex items-center justify-center">
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
          </span>
        </motion.button>
      </form>
    </div>
  );
};

export default React.memo(ChatInput);
