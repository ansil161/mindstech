import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { renderMarkdown } from '../../utils/markdown';
import { cn } from '../../lib/utils';
import SupportAvatar from './SupportAvatar';

const MessageBubble = ({ message }) => {
  const { t } = useTranslation();
  const isUser = message.role === 'user';
  const words = message.content.split(' ');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unsupported/blocked — fail silently, no UI change needed
    }
  };
  
  // Only stream word-by-word for new assistant messages added in the last 6 seconds
  const [wordCount, setWordCount] = useState(() => {
    const isRecent = !isUser && message.timestamp && (Date.now() - new Date(message.timestamp).getTime() < 6000);
    return isRecent ? 0 : words.length;
  });

  useEffect(() => {
    if (wordCount < words.length) {
      const timer = setTimeout(() => {
        setWordCount((prev) => prev + 2); // Stream 2 words at a time for snappier feel
      }, 30); // speed of word streaming
      return () => clearTimeout(timer);
    }
  }, [wordCount, words.length]);

  const displayedContent = words.slice(0, wordCount).join(' ');

  return (
    <motion.div
      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 26, 
        mass: 0.9 
      }}
      layout
    >
      {isUser ? (
        /* User message container - Max width 75%, rounded 20px, red gradient background */
        <div className="flex flex-col items-end max-w-[75%] select-none">
          <div className="bg-[#2A2B32] border border-[rgba(255,255,255,0.06)] text-[#FAFAFA] text-[14px] px-4 py-3 rounded-[20px] rounded-tr-[4px] shadow-[0_4px_12px_rgba(0,0,0,0.15)] leading-[1.6] select-text font-sans font-medium break-words overflow-wrap-anywhere w-full">
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          {/* Timestamp - 10px, soft white text */}
          <span className="text-[10px] text-white/40 mt-1.5 px-1 uppercase tracking-wider font-semibold">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      ) : (
        /* Assistant message container - Max width 75%, rounded 20px, dark panel background */
        <div className="flex items-start space-x-3.5 max-w-[75%] select-none">
          <SupportAvatar size={32} showOnlineBadge={false} className="mt-0.5" />
          <div className="group flex flex-col min-w-0 flex-1">
            <div
              className={cn(
                "text-[#FAFAFA] text-[14px] px-4 py-3 rounded-[20px] rounded-tl-[4px] leading-[1.6] select-text font-sans break-words overflow-wrap-anywhere overflow-hidden w-full bg-[#111216] border",
                message.isError
                  ? "border-[rgba(204,0,1,0.35)] shadow-[0_0_16px_rgba(204,0,1,0.15)]"
                  : "border-[rgba(255,255,255,0.08)] shadow-sm"
              )}
            >
              {message.isError && (
                <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-[#ff4d4d]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3 h-3 flex-shrink-0"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  {t('chat.error.label', 'Something went wrong')}
                </div>
              )}
              <div className="prose prose-sm max-w-full text-white/80 prose-invert break-words prose-p:break-words prose-a:break-all prose-p:mb-4 prose-p:leading-[1.75] prose-li:leading-[1.75]">
                {renderMarkdown(displayedContent)}
              </div>
            </div>
            {/* Timestamp + copy-to-clipboard */}
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
              <button
                onClick={handleCopy}
                aria-label={copied ? t('chat.message.copied', 'Copied') : t('chat.message.copy', 'Copy message')}
                title={copied ? t('chat.message.copied', 'Copied') : t('chat.message.copy', 'Copy message')}
                className="w-5 h-5 rounded-full border border-white/10 bg-white/[0.04] text-white/40 flex items-center justify-center opacity-60 group-hover:opacity-100 focus:opacity-100 hover:bg-[rgba(204,0,1,0.12)] hover:border-[rgba(204,0,1,0.4)] hover:text-[#CC0001] transition-all duration-200 cursor-pointer"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(MessageBubble);
