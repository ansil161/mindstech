import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SupportAvatar from './SupportAvatar';

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
      className="relative z-10 flex-grow h-0 min-h-0 overflow-y-auto pl-4 pr-5 pt-4 pb-6 bg-[#060608]/95 scroll-smooth custom-chatbot-scroll"
    >
      {chatMessages.length === 0 ? (
        /* Welcome screen */
        <motion.div
          className="flex flex-col items-center py-6 select-none w-full"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <SupportAvatar size={56} showOnlineBadge={false} className="mb-3 shadow-md border border-white/10" />

          <h2 className="text-[16px] font-sans font-extrabold text-[#FAFAFA] tracking-tight text-center leading-tight">
            Hello 👋
          </h2>
          <h1 className="text-[16px] font-sans font-extrabold text-[#FAFAFA] tracking-tight text-center leading-tight mt-0.5">
            I'm Mindstec AI Assistant
          </h1>
        </motion.div>
      ) : (
        /* Chat message list with bottom clearance to avoid input collision */
        <div ref={contentRef} className="space-y-4 pr-1 pb-4">
          {chatMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <AnimatePresence>
            {isTyping && <TypingIndicator />}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default React.memo(ChatMessages);
