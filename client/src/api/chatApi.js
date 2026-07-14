/**
 * API communication layer for the AI Chatbot widget.
 * Designed to separate network mechanics from React presentation components.
 * 
 * Set USE_MOCK = false to route requests directly to the Django REST backend.
 */
import apiClient from './axios';

const USE_MOCK = false; // Toggle for mock vs active Django backend communication

// Realistic mock dialogue log to show scroll bars and demo capability
const MOCK_HISTORY = [
  {
    id: 'msg-welcome',
    role: 'assistant',
    content: 'Hi there! How can I help you today?',
    timestamp: new Date().toISOString(),
  }
];

export const chatApi = {
  /**
   * Fetch historical message logs for a conversation session.
   */
  getConversationHistory: async (conversationId = 'default') => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([...MOCK_HISTORY]);
        }, 300);
      });
    }
    
    // Live API call to Django
    try {
      const response = await apiClient.get(`/admin/chat/history/${conversationId}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      // Fallback to empty history on network error
      return [];
    }
  },

  /**
   * Submit a new message to the AI and await response.
   */
  sendMessage: async (message, conversationId = 'default') => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const userQuery = message.toLowerCase();
          let answer = "I have recorded your request. The AI microservice is currently running in local standby mode. Please ask about 'company', 'services', or 'contact'.";
          let citations = [];

          if (userQuery.includes('company') || userQuery.includes('about') || userQuery.includes('who are you')) {
            answer = "Our company specializes in AI-powered enterprise software, custom web development, cloud solutions, and digital transformation services.";
            citations = [
              { document_name: 'About Us Document', source: 'https://mindstech.com/about' }
            ];
          } else if (userQuery.includes('service') || userQuery.includes('solution') || userQuery.includes('do you do')) {
            answer = "We deliver premium bespoke software, vector index search setups, serverless system architectures, and generative AI interfaces.";
            citations = [
              { document_name: 'Services Guide', source: 'https://mindstech.com/services' }
            ];
          } else if (userQuery.includes('contact') || userQuery.includes('email') || userQuery.includes('phone')) {
            answer = "You can contact our engineering offices via email at info@mindstech.com, or fill out the Enquiry form located on our contact page.";
            citations = [
              { document_name: 'Contact Page', source: 'https://mindstech.com/contact' }
            ];
          }

          resolve({
            answer,
            content: answer,
            citations,
          });
        }, 1200); // 1.2s delay to simulate network latency and show typing bouncing dots
      });
    }

    // Live API call to Django
    const response = await apiClient.post('/admin/chatbot/', {
      message,
      conversation_id: conversationId,
    });
    return response.data;
  },

  /**
   * Submit a chatbot enquiry to the Django REST API.
   * Maps to POST /api/v1/admin/enquiries/submit/ (AllowAny, rate-limited).
   *
   * @param {Object} enquiry - { name, email, phone, company, message }
   * @returns {Promise<Object>} - { message, data } on success
   */
  submitEnquiry: async ({ name, email, phone }) => {
    const payload = {
      name:    name.trim(),
      email:   email.trim(),
      phone:   phone.trim(),
      subject: 'General Enquiry',
      message: `Chatbot enquiry submitted by ${name.trim()}.`,
      source:  'chatbot',
    };

    const response = await apiClient.post('/admin/enquiries/submit/', payload);
    return response.data;
  },
};

export default chatApi;
