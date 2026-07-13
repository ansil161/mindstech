import React, { useEffect, useRef } from 'react';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { scrollToBottom } from '../../utils/scroll';

const ChatMessages = () => {
  const { messages, isTyping } = useChat();
  const scrollContainerRef = useRef(null);
  const chatMessages = messages.filter((message) => message.id !== 'msg-welcome');

  useEffect(() => {
    if (chatMessages.length > 0 || isTyping) {
      scrollToBottom(scrollContainerRef.current, true);
    }
  }, [chatMessages.length, isTyping]);

  return (
    <div
      ref={scrollContainerRef}
      data-lenis-prevent
      className="flex-grow h-0 min-h-0 overflow-y-auto px-5 py-5 scroll-smooth custom-chatbot-scroll"
    >
      <style>{`
        .custom-chatbot-scroll::-webkit-scrollbar { width: 4px; }
        .custom-chatbot-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 9999px; }
      `}</style>

      <div className="space-y-5">
        {chatMessages.map((message) => <MessageBubble key={message.id} message={message} />)}
        {isTyping && <TypingIndicator />}
      </div>
    </div>
  );
};

export default React.memo(ChatMessages);
