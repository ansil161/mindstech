import React, { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import chatApi from '../api/chatApi';

export const ChatContext = createContext(null);

// ---------------------------------------------------------------------------
// Enquiry collection state machine
// ---------------------------------------------------------------------------
// States:
//   null        — not collecting
//   'collecting' — bot has asked, waiting for user to provide details
//   'done'      — enquiry submitted, session complete
const ENQUIRY_IDLE       = null;
const ENQUIRY_COLLECTING = 'collecting';
const ENQUIRY_DONE       = 'done';

// ---------------------------------------------------------------------------
// Service-intent keyword detection
// Scans AI reply text; returns true when the user likely wants our services.
// ---------------------------------------------------------------------------
const SERVICE_KEYWORDS = [
  'contact us', 'get in touch', 'reach out', 'enquir', 'inquir',
  'quote', 'pricing', 'proposal', 'demo', 'trial',
  'interested in', 'would like to', 'want to', 'looking to', 'sign up',
  'get started', 'learn more', 'find out more', 'more information',
  'our services', 'our solutions', 'our team', 'our experts',
  'partner with', 'work with us', 'hire us',
  'fill out', 'submit a form', 'leave your details', 'your details',
  'contact form', 'enquiry form',
];

const detectServiceIntent = (text) => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SERVICE_KEYWORDS.some((kw) => lower.includes(kw));
};

// ---------------------------------------------------------------------------
// Simple field extractors — parse free-form user text for contact details.
// These are intentionally liberal so users can reply naturally.
// ---------------------------------------------------------------------------
const extractEmail = (text) => {
  const m = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  return m ? m[0].trim() : null;
};

const extractPhone = (text) => {
  // Accepts +, spaces, dashes, parentheses; min 7 digits
  const m = text.match(/[\+]?[\d][\d\s\-\(\)]{6,}[\d]/);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, '');
  return digits.length >= 7 ? m[0].trim() : null;
};

const extractName = (text, email, phone) => {
  let remaining = text;
  if (email) remaining = remaining.replace(email, '');
  if (phone) remaining = remaining.replace(phone, '');
  remaining = remaining
    .replace(/\b(my name is|i am|i'm|name[:\-]?|email[:\-]?|phone[:\-]?|number[:\-]?)\b/gi, '')
    .replace(/[,\.\|\/\\]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
  const candidate = remaining.split(/\s{2,}|\n/)[0].trim();
  return candidate.length >= 2 && candidate.length <= 40 && /[a-zA-Z]/.test(candidate)
    ? candidate
    : null;
};

/**
 * Given a raw user message, attempt to fill in any missing enquiry fields.
 * Only collects name, email, and phone.
 */
const parseUserReply = (text, existing) => {
  const updated = { ...existing };
  const email   = extractEmail(text);
  const phone   = extractPhone(text);
  const name    = extractName(text, email, phone);

  if (!updated.email && email) updated.email = email;
  if (!updated.phone && phone) updated.phone = phone;
  if (!updated.name  && name && name.split(' ').length <= 5) updated.name = name;

  return updated;
};

/**
 * Build a follow-up prompt listing which required fields are still missing.
 */
const buildFollowUpPrompt = (collected) => {
  const missing = [];
  if (!collected.name)  missing.push('**full name**');
  if (!collected.email) missing.push('**email address**');
  if (!collected.phone) missing.push('**phone number**');

  if (missing.length === 0) return null; // all collected

  if (missing.length === 1) {
    return `Just one more thing — could you also share your ${missing[0]}?`;
  }
  const last = missing.pop();
  return `Could you also share your ${missing.join(', ')} and ${last}?`;
};

// ---------------------------------------------------------------------------
// Validate the complete collected set before submission
// ---------------------------------------------------------------------------
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /[\d]{5,}/.test((v || '').replace(/\D/g, ''));
const isCollectionComplete = (c) =>
  c.name?.trim() && isValidEmail(c.email) && isValidPhone(c.phone);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping]   = useState(false);
  const [conversationId] = useState(
    () => `session_${Math.random().toString(36).substr(2, 9)}`
  );

  // Enquiry collection state
  const [enquiryState, setEnquiryState]       = useState(ENQUIRY_IDLE);
  const [collectedData, setCollectedData]     = useState({});
  // Keep a ref so sendMessage closure always sees the latest values
  const enquiryStateRef  = useRef(ENQUIRY_IDLE);
  const collectedDataRef = useRef({});

  const setEnquiryStateSynced = (val) => {
    enquiryStateRef.current = val;
    setEnquiryState(val);
  };
  const setCollectedDataSynced = (val) => {
    collectedDataRef.current = val;
    setCollectedData(val);
  };

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('chat-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Load conversation history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await chatApi.getConversationHistory(conversationId);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    fetchHistory();
  }, [conversationId]);

  // Sync Tailwind dark class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('chat-theme', theme);
  }, [theme]);

  const toggleChat  = useCallback(() => setIsOpen((p) => !p), []);
  const toggleTheme = useCallback(() => setTheme((p) => (p === 'light' ? 'dark' : 'light')), []);

  const clearChat = useCallback(() => {
    setEnquiryStateSynced(ENQUIRY_IDLE);
    setCollectedDataSynced({});
    setMessages([
      {
        id: 'msg-welcome',
        role: 'assistant',
        content: `👋 Hi there!\n\nI'm your AI Assistant.\n\nI can help you with:\n\n- Company Information\n- Products & Services\n- FAQs\n- Contact Details\n- Policies\n\nHow can I help you today?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // ---------------------------------------------------------------------------
  // Helper: push a bot message without going through the AI service
  // ---------------------------------------------------------------------------
  const pushBotMessage = useCallback((content) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  // ---------------------------------------------------------------------------
  // sendMessage — handles both normal AI chat and the enquiry collection flow
  // ---------------------------------------------------------------------------
  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim()) return;

      const userMessage = {
        id: `msg-user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // ── Branch A: currently collecting enquiry details ──────────────────
      if (enquiryStateRef.current === ENQUIRY_COLLECTING) {
        const updated = parseUserReply(content.trim(), collectedDataRef.current);
        setCollectedDataSynced(updated);

        if (isCollectionComplete(updated)) {
          // All required fields collected — submit silently
          setIsTyping(true);
          try {
            await chatApi.submitEnquiry({
              name:  updated.name,
              email: updated.email,
              phone: updated.phone,
            });
            setEnquiryStateSynced(ENQUIRY_DONE);
            setTimeout(() => {
              setIsTyping(false);
              pushBotMessage(
                `Thank you, **${updated.name}**! 🎉\n\nWe've received your details and a member of our team will be in touch at **${updated.email}** shortly.\n\nIs there anything else I can help you with?`
              );
            }, 900);
          } catch (err) {
            console.error('Enquiry submission failed:', err);
            setIsTyping(false);
            pushBotMessage(
              "I'm sorry, something went wrong saving your details. Please try again or email us directly at **info@mindstec.com**."
            );
          }
        } else {
          // Still missing fields — ask again
          const followUp = buildFollowUpPrompt(updated);
          setTimeout(() => pushBotMessage(followUp), 400);
        }
        return;
      }

      // ── Branch B: enquiry already done — treat as normal chat ───────────
      // ── Branch C: normal AI chat ─────────────────────────────────────────
      setIsLoading(true);
      setIsTyping(true);

      try {
        const response = await chatApi.sendMessage(content.trim(), conversationId);
        const aiText = response.answer || response.content || '';

        const assistantMessage = {
          id: `msg-assistant-${Date.now()}`,
          role: 'assistant',
          content: aiText,
          timestamp: new Date().toISOString(),
          sources: response.citations || [],
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Disabled automatic intent detection hijack because it causes an infinite 
        // lead-gen loop that blocks natural AI conversation. The LLM now natively 
        // provides contact info via its system prompt.
        const intentDetected = false;

        if (enquiryStateRef.current === ENQUIRY_IDLE && intentDetected) {
          // Unreachable now, but preserved for future structured function calling
          setEnquiryStateSynced(ENQUIRY_COLLECTING);
        }
      } catch (err) {
        console.error('Failed to send message:', err);
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-error-${Date.now()}`,
            role: 'assistant',
            content: 'Sorry, I encountered a temporary connection issue. Please try again.',
            timestamp: new Date().toISOString(),
            isError: true,
          },
        ]);
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    },
    [conversationId, pushBotMessage]
  );

  const value = useMemo(
    () => ({
      isOpen,
      messages,
      isLoading,
      isTyping,
      theme,
      enquiryState,
      toggleChat,
      toggleTheme,
      clearChat,
      sendMessage,
    }),
    [isOpen, messages, isLoading, isTyping, theme, enquiryState, toggleChat, toggleTheme, clearChat, sendMessage]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
