import axios from 'axios';

/**
 * Configure production Axios instance with defaults.
 * withCredentials: true ensures HttpOnly cookies are automatically sent with requests.
 */
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Crucial for sending JWT HttpOnly cookies
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Request interceptor to manually attach the CSRF token on cross-origin requests
apiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Attach the access token if it exists
    const accessToken = getCookie('@access_token');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    config.headers['Accept-Language'] = currentLang;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global error payloads (matching backend response format)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized, and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Do not try to refresh if the request was to login or refresh itself
      const requestUrl = originalRequest.url || '';
      if (requestUrl.includes('/accounts/login/') || requestUrl.includes('/accounts/refresh/')) {
        const fallbackError = {
          success: false,
          message: error.response?.data?.message || 'Authentication failed.',
          errors: error.response?.data?.errors || {},
        };
        return Promise.reject(fallbackError);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint - HttpOnly cookies will be sent automatically
        await apiClient.post('/accounts/refresh/');
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        // Dispatch custom event to notify auth context to log out
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        const fallbackError = {
          success: false,
          message: 'Session expired. Please log in again.',
          errors: {},
        };
        return Promise.reject(fallbackError);
      }
    }

    const fallbackError = {
      success: false,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
      errors: error.response?.data?.errors || {},
    };
    return Promise.reject(fallbackError);
  }
);

export default apiClient;

