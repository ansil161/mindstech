import React from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

const windowVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 23,
      mass: 0.9,
    },
  },
  exit: {
    opacity: 0,
    y: 30,
    scale: 0.96,
    transition: {
      duration: 0.2,
      ease: 'easeInOut',
    },
  },
};

const ChatWindow = () => {
  return (
    <motion.div
      data-lenis-prevent
      className="fixed bottom-24 right-6 w-full max-w-[calc(100vw-48px)] sm:w-[340px] lg:w-[360px] h-[min(580px,calc(100vh-112px))] min-h-[460px] max-h-[580px] flex flex-col bg-[#0B0B0E]/90 backdrop-blur-xl border border-[rgba(255,255,255,0.08)] rounded-[20px] shadow-[0_24px_50px_rgba(0,0,0,0.65)] overflow-hidden transition-all duration-300 max-sm:w-full max-sm:h-full max-sm:max-h-full max-sm:min-h-full max-sm:max-w-none max-sm:bottom-0 max-sm:right-0 max-sm:rounded-none"
      style={{ zIndex: 99999 }}
      variants={windowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      role="dialog"
      aria-label="Mindstec AI Assistant Chat Window"
    >
      {/* Ambient red radial glow, scaled from the site's body::before motif */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_260px_at_50%_-80px,rgba(204,0,1,0.08),transparent_80%)]"
      />

      {/* Header Controls (Fixed 64px, Glassmorphic) */}
      <ChatHeader />

      {/* Message History Viewport (Slate-50 background, thin scrollbar, Welcome screen) */}
      <ChatMessages />

      {/* Input panel (Sticky bottom, rounded pill) */}
      <ChatInput />
    </motion.div>
  );
};

export default React.memo(ChatWindow);
