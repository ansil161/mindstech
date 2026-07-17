import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { renderMarkdown } from '../../utils/markdown';
import SupportAvatar from './SupportAvatar';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  const words = message.content.split(' ');
  
  // Only stream word-by-word for new assistant messages added in the last 6 seconds
  const [wordCount, setWordCount] = useState(() => {
    const isRecent = !isUser && message.timestamp && (Date.now() - new Date(message.timestamp).getTime() < 6000);
    return isRecent ? 0 : words.length;
  });

  useEffect(() => {
    if (wordCount < words.length) {
      const timer = setTimeout(() => {
        setWordCount((prev) => prev + 1);
      }, 40); // speed of word streaming (40ms per word)
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
          <div className="bg-gradient-to-br from-[#CC0001] to-[#990000] border border-red-500/20 text-[#FAFAFA] text-[14px] px-4 py-3 rounded-[20px] rounded-tr-[4px] shadow-[0_4px_12px_rgba(204,0,1,0.15)] leading-[1.6] select-text font-sans font-medium break-words w-full">
            <p className="whitespace-pre-wrap">{message.content}</p>
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
          <div className="flex flex-col">
            <div className="bg-[#111216] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] text-[14px] px-4 py-3 rounded-[20px] rounded-tl-[4px] shadow-sm leading-[1.6] select-text font-sans break-words">
              <div className="prose prose-sm max-w-none text-[#FAFAFA] prose-invert">
                {renderMarkdown(displayedContent)}
              </div>
            </div>
            {/* Timestamp */}
            <span className="text-[10px] text-white/40 mt-1.5 px-1 uppercase tracking-wider font-semibold">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(MessageBubble);
