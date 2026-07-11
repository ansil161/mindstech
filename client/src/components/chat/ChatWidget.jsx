import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatProvider } from '../../context/ChatContext';
import useChat from '../../hooks/useChat';
import FloatingButton from './FloatingButton';
import ChatWindow from './ChatWindow';

const ChatWidgetContent = () => {
  const { isOpen } = useChat();

  return (
    <>
      {/* Floating button */}
      <FloatingButton />

      {/* Animate entrance and exit of the chat panel */}
      <AnimatePresence>
        {isOpen && <ChatWindow />}
      </AnimatePresence>
    </>
  );
};

/**
 * Main AI Chatbot entry point wrapped in ChatProvider context.
 */
const ChatWidget = () => {
  return (
    <ChatProvider>
      <ChatWidgetContent />
    </ChatProvider>
  );
};

export default React.memo(ChatWidget);
