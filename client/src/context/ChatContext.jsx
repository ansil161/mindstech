import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import chatApi from '../api/chatApi';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);
  const [theme, setTheme] = useState(() => {
    // Read theme from localStorage or fallback to system dark preference
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme) return savedTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Populate historical conversation on startup for this session
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await chatApi.getConversationHistory(conversationId);
        setMessages(history);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    fetchHistory();
  }, [conversationId]);

  // Sync theme with HTML class attribute for Tailwind dark support
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 Hi there!

I'm your AI Assistant.

I can help you with:

- Company Information
- Products & Services
- FAQs
- Contact Details
- Policies

How can I help you today?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await chatApi.sendMessage(content.trim(), conversationId);
      
      const assistantMessage = {
        id: `msg-assistant-${Date.now()}`,
        role: 'assistant',
        content: response.answer || response.content,
        timestamp: new Date().toISOString(),
        sources: response.citations || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage = {
        id: `msg-error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered a temporary connection issue. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [conversationId]);

  const value = useMemo(
    () => ({
      isOpen,
      messages,
      isLoading,
      isTyping,
      theme,
      toggleChat,
      toggleTheme,
      clearChat,
      sendMessage,
    }),
    [isOpen, messages, isLoading, isTyping, theme, toggleChat, toggleTheme, clearChat, sendMessage]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
