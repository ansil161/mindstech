import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import useChat from '../../hooks/useChat';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import SupportAvatar from './SupportAvatar';
import { scrollToBottom } from '../../utils/scroll';

const ChatMessages = () => {
  const { messages, isTyping, sendMessage } = useChat();
  const scrollContainerRef = useRef(null);
  const { t } = useTranslation();

  // Filter out the initial flat text welcome message
  const chatMessages = messages.filter((msg) => msg.id !== 'msg-welcome');

  // Auto scroll to bottom when messages or typing indicators load
  useEffect(() => {
    if (chatMessages.length > 0 || isTyping) {
      scrollToBottom(scrollContainerRef.current, true);
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [messages, isTyping, chatMessages.length]);

  const quickActions = [
    {
      emoji: '🏢',
      title: t('chat.quick_actions.company_info.title', 'Company Info'),
      desc: t('chat.quick_actions.company_info.desc', 'Learn about Mindstec'),
      query: t('chat.quick_actions.company_info.query', 'Tell me about Mindstec')
    },
    {
      emoji: '📦',
      title: t('chat.quick_actions.products.title', 'Products'),
      desc: t('chat.quick_actions.products.desc', 'Browse products'),
      query: t('chat.quick_actions.products.query', 'What products does Mindstec offer?')
    },
    {
      emoji: '💡',
      title: t('chat.quick_actions.solutions.title', 'Solutions'),
      desc: t('chat.quick_actions.solutions.desc', 'Find business solutions'),
      query: t('chat.quick_actions.solutions.query', 'What solutions does Mindstec provide?')
    },
    {
      emoji: '🛠',
      title: t('chat.quick_actions.technical_support.title', 'Technical Support'),
      desc: t('chat.quick_actions.technical_support.desc', 'Troubleshoot products'),
      query: t('chat.quick_actions.technical_support.query', 'I need technical support for products')
    },
    {
      emoji: '📞',
      title: t('chat.quick_actions.contact_sales.title', 'Contact Sales'),
      desc: t('chat.quick_actions.contact_sales.desc', 'Speak with our team'),
      query: t('chat.quick_actions.contact_sales.query', 'How do I contact Mindstec sales?')
    },
    {
      emoji: '📅',
      title: t('chat.quick_actions.book_demo.title', 'Book a Demo'),
      desc: t('chat.quick_actions.book_demo.desc', 'Schedule a meeting'),
      query: t('chat.quick_actions.book_demo.query', 'I would like to book a product demo')
    }
  ];

  const suggestedQuestions = [
    t('chat.suggested_questions.0', "What services does Mindstec provide?"),
    t('chat.suggested_questions.1', "I need a display solution."),
    t('chat.suggested_questions.2', "Tell me about AV over IP."),
    t('chat.suggested_questions.3', "How can I contact sales?"),
    t('chat.suggested_questions.4', "Book a product demo.")
  ];

  return (
    <div
      ref={scrollContainerRef}
      data-lenis-prevent
      className="flex-grow h-0 min-h-0 overflow-y-auto p-4 pb-6 space-y-6 scroll-smooth custom-chatbot-scroll"
    >
      {/* 4px Scrollbar CSS styles injection */}
      <style>{`
        .custom-chatbot-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-chatbot-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-chatbot-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          transition: background 0.2s ease;
        }
        .custom-chatbot-scroll:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.22);
        }
      `}</style>

      {/* Empty State Welcome & Actions with Smooth Fade Out */}
      <AnimatePresence mode="popLayout">
        {chatMessages.length === 0 && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25, height: 0, overflow: 'hidden', margin: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Centered Welcome Box */}
            <div className="flex flex-col items-center pt-2 select-none text-center">
              <SupportAvatar size={60} showOnlineBadge={true} className="mb-3.5 shadow-xl" />
              
              <h2 className="text-[19px] font-bold text-white tracking-tight font-sans">
                👋 Welcome to Mindstec Support
              </h2>

              <div className="mt-4 p-4 w-full bg-[#1A1A1E]/30 border border-white/5 rounded-[18px] backdrop-blur-sm text-left">
                <span className="text-[12px] text-white/40 font-sans font-semibold uppercase tracking-wider block mb-2.5">
                  We can help you with:
                </span>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] font-sans text-white/70 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]"></span>
                    Products
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]"></span>
                    Solutions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]"></span>
                    Company Info
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]"></span>
                    Tech Support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]"></span>
                    Installations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E30613]"></span>
                    Contact Sales
                  </li>
                </ul>
              </div>

              <p className="text-[13px] text-white/50 mt-4 leading-normal font-sans font-medium">
                What would you like help with today?
              </p>
            </div>

            {/* Quick Action Cards (Grid) */}
            <div className="grid grid-cols-2 gap-2.5 px-0.5 select-none">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.query)}
                  className="flex items-center gap-2.5 p-2.5 h-[60px] bg-[#151518] border border-white/10 rounded-[14px] transition-all duration-300 hover:bg-[#1C1C22] hover:border-[#E30613]/40 hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(227,6,19,0.15)] group cursor-pointer text-left w-full overflow-hidden"
                >
                  <span className="text-[20px] leading-none filter drop-shadow flex-shrink-0">
                    {action.emoji}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[12px] font-bold text-white/90 leading-tight group-hover:text-[#E30613] transition-colors duration-200 truncate">
                      {action.title}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5 leading-tight font-medium group-hover:text-white/60 transition-colors duration-200 truncate">
                      {action.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2.5 select-none">
              <span className="text-[11px] text-white/40 font-semibold tracking-wider uppercase block pl-1">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-1.5 pl-0.5">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="px-3.5 py-1.5 text-[12px] font-sans font-medium bg-[#1A1A1E]/40 border border-white/5 hover:border-[#E30613]/30 hover:bg-[#E30613]/10 hover:text-white text-white/60 rounded-full transition-all duration-200 cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Stack */}
      <div className="space-y-6">
        {chatMessages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>

      {/* Typing Bubble */}
      {isTyping && <TypingIndicator />}

      {/* Powered by Footer - Muted fonts */}
      <div className="pt-6 pb-2 text-center select-none text-[10px] text-white/20 font-sans leading-relaxed border-t border-white/5">
        <p className="font-semibold tracking-wide uppercase">Powered by Mindstec AI</p>
        <p className="mt-0.5 text-white/15">AI responses may occasionally be inaccurate.</p>
      </div>
    </div>
  );
};

export default React.memo(ChatMessages);

