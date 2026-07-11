import { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';

/**
 * Custom React hook to consume the global ChatContext state and dispatch actions.
 * Throws an error if used outside a ChatProvider wrapper.
 */
const useChat = () => {
  const context = useContext(ChatContext);
  
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider wrapper.');
  }
  
  return context;
};

export default useChat;
