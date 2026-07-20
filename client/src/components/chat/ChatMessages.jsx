import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SupportAvatar from './SupportAvatar';

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

  // Keep track of whether the user is near the bottom
  const isNearBottomRef = useRef(true);
  const contentRef = useRef(null);

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Consider "near bottom" if within 100px of the bottom
    isNearBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
  };

  const scrollToBottomIfNear = () => {
    if (!scrollContainerRef.current) return;
    if (isNearBottomRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      return () => container.removeEventListener('scroll', checkScrollPosition);
    }
  }, []);

  useEffect(() => {
    if (!contentRef.current) return;
    const observer = new ResizeObserver(() => {
      scrollToBottomIfNear();
    });
    observer.observe(contentRef.current);
    
    // Also trigger on new messages specifically
    scrollToBottomIfNear();
    
    return () => observer.disconnect();
  }, [chatMessages.length, isTyping]);

  return (
    <div
      ref={scrollContainerRef}
      data-lenis-prevent
      className="flex-grow h-0 min-h-0 overflow-y-auto pl-5 pr-7 py-5 bg-[#060608] scroll-smooth custom-chatbot-scroll"
    >
      <style>{`
        .custom-chatbot-scroll::-webkit-scrollbar { width: 4px; }
        .custom-chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 9999px; }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {chatMessages.length === 0 ? (
        /* Welcome screen */
        <motion.div
          className="flex flex-col items-center py-4 select-none w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SupportAvatar size={56} showOnlineBadge={false} className="mb-2 shadow-md border border-[rgba(255,255,255,0.08)]" />

          <h2 className="text-[16px] font-sans font-extrabold text-[#FAFAFA] tracking-tight text-center leading-tight">
            Hello 👋
          </h2>
          <h1 className="text-[16px] font-sans font-extrabold text-[#FAFAFA] tracking-tight text-center leading-tight mt-0.5">
            I'm Mindstec AI Assistant
          </h1>

          <div className="mt-3.5 text-[10px] font-bold text-[rgba(255,255,255,0.4)] uppercase tracking-wider">
            Ask me anything about
          </div>
          <p className="mt-1.5 text-center text-[11.5px] font-medium text-[rgba(255,255,255,0.72)] max-w-[280px] leading-relaxed">
            {welcomeTopics.join('  •  ')}
          </p>
        </motion.div>
      ) : (
        /* Chat message list */
        <div ref={contentRef} className="space-y-5 pr-1">
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
