import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SupportAvatar from './SupportAvatar';
import { scrollToBottom } from '../../utils/scroll';

const welcomeTopics = [
  'Products',
  'Solutions',
  'Installations',
  'Warranty',
  'Technical Support',
  'E-waste Collection',
  'Company Information',
];

const ChatMessages = () => {
  const { messages, isTyping } = useChat();
  const scrollContainerRef = useRef(null);

  // Exclude the synthetic welcome seed message so the welcome screen shows
  const chatMessages = messages.filter((m) => m.id !== 'msg-welcome');

  useEffect(() => {
    if (chatMessages.length > 0 || isTyping) {
      scrollToBottom(scrollContainerRef.current, true);
    }
  }, [chatMessages.length, isTyping]);

  return (
    <div
      ref={scrollContainerRef}
      data-lenis-prevent
      className="flex-grow h-0 min-h-0 overflow-y-auto pl-5 pr-7 py-5 bg-[#F8FAFC] scroll-smooth custom-chatbot-scroll"
    >
      <style>{`
        .custom-chatbot-scroll::-webkit-scrollbar { width: 4px; }
        .custom-chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 9999px; }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
      `}</style>

      {chatMessages.length === 0 ? (
        /* Welcome screen */
        <motion.div
          className="flex flex-col items-center py-4 select-none w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SupportAvatar size={56} showOnlineBadge={false} className="mb-2 shadow-md border border-white" />

          <h2 className="text-[16px] font-sans font-extrabold text-[#111827] tracking-tight text-center leading-tight">
            Hello 👋
          </h2>
          <h1 className="text-[16px] font-sans font-extrabold text-[#111827] tracking-tight text-center leading-tight mt-0.5">
            I'm Mindstec AI Assistant
          </h1>

          <div className="mt-3.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Ask me anything about
          </div>
          <p className="mt-1.5 text-center text-[11.5px] font-medium text-neutral-500 max-w-[280px] leading-relaxed">
            {welcomeTopics.join('  •  ')}
          </p>
        </motion.div>
      ) : (
        /* Chat message list */
        <div className="space-y-5 pr-1">
          {chatMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatMessages);
