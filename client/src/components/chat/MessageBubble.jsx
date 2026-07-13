import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { renderMarkdown } from '../../utils/markdown';
import SourceReferences from './SourceReferences';
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
        /* User message container - Max width 75%, rounded 20px, transparent background with soft border */
        <div className="flex flex-col items-end max-w-[75%] select-none">
          <div className="bg-transparent border border-neutral-300/80 text-neutral-800 text-[14px] px-4 py-3 rounded-[20px] rounded-tr-[4px] shadow-none leading-[1.6] select-text font-sans font-medium break-words w-full">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {/* Timestamp - 10px, high contrast dark gray text */}
          <span className="text-[10px] text-neutral-400 mt-1.5 px-1 uppercase tracking-wider font-semibold">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      ) : (
        /* Assistant message container - Max width 75%, rounded 20px, avatar visible next to message */
        <div className="flex items-start space-x-3.5 max-w-[75%] select-none">
          <SupportAvatar size={32} showOnlineBadge={false} className="mt-0.5" />
          <div className="flex flex-col">
            <div className="bg-white border border-neutral-100 text-neutral-800 text-[14px] px-4 py-3 rounded-[20px] rounded-tl-[4px] shadow-sm leading-[1.6] select-text font-sans break-words">
              <div className="prose prose-sm max-w-none text-neutral-800">
                {renderMarkdown(displayedContent)}
              </div>
            </div>
            {/* Timestamp */}
            <span className="text-[10px] text-neutral-400 mt-1.5 px-1 uppercase tracking-wider font-semibold">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(MessageBubble);
