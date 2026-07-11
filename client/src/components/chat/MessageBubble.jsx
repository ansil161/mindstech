import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { renderMarkdown } from '../../utils/markdown';
import SourceReferences from './SourceReferences';

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
      className={`flex w-full ${isUser ? 'justify-end pr-4' : 'justify-start'}`}
      initial={{ opacity: 0, y: 20 }}
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
        /* User message container - Max width 72%, rounded-[18px], px-5 py-3.5 */
        <div className="flex flex-col items-end max-w-[72%]">
          <div className="bg-gradient-to-br from-[#E30613] to-[#B00020] text-white text-[15px] px-5 py-3.5 rounded-[18px] rounded-tr-[4px] shadow-[0_4px_15px_rgba(227,6,19,0.12)] leading-[1.62] select-text">
            <p className="whitespace-pre-wrap font-medium">{message.content}</p>
          </div>
          {/* Timestamp - 11px, 45% opacity */}
          <span className="text-[11px] text-white/45 mt-2 px-1 uppercase tracking-wider font-semibold select-none">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>
      ) : (
        /* Assistant message container - Max width 80%, rounded-[18px], px-5 py-3.5, avatar aligned with first line */
        <div className="flex items-start space-x-2.5 max-w-[80%] pl-4">
          <img 
            src="/mindstec-ai-logo.png" 
            alt="AI" 
            className="w-7 h-7 rounded-full border border-white/10 mt-1 object-cover flex-shrink-0 shadow-sm select-none"
          />
          <div className="flex flex-col">
            <div className="bg-[#1A1A1E] border border-white/5 text-white text-[15px] px-5 py-3.5 rounded-[18px] rounded-tl-[4px] shadow-[0_4px_15px_rgba(0,0,0,0.25)] leading-[1.62] select-text">
              {renderMarkdown(displayedContent)}
              {/* Render references/sources when streaming completes */}
              {wordCount >= words.length && <SourceReferences sources={message.sources} />}
            </div>
            {/* Timestamp - 11px, 45% opacity */}
            <span className="text-[11px] text-white/45 mt-2 px-1 uppercase tracking-wider font-semibold select-none">
              {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default React.memo(MessageBubble);
