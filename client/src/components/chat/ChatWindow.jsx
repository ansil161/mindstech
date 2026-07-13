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
      className="fixed bottom-24 right-6 w-[370px] max-w-[calc(100vw-32px)] h-[580px] flex flex-col bg-[#0D0D0F]/90 backdrop-blur-xl border border-white/10 rounded-[22px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden transition-all duration-300 animate-in fade-in"
      style={{ maxHeight: 'calc(100vh - 110px)', zIndex: 99999 }}
      variants={windowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Header Controls */}
      <ChatHeader />

      {/* Message History Viewport */}
      <ChatMessages />

      {/* Input panel */}
      <ChatInput />
    </motion.div>
  );
};


export default React.memo(ChatWindow);
