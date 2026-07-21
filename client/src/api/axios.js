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

// Request interceptor to manually attach CSRF token and Bearer token on requests
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve CSRF token from localStorage (set during login/refresh)
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // Attach Bearer token header as fallback for cross-domain browsers blocking 3rd party cookies
    const accessToken = localStorage.getItem('access_token');
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const currentLang = localStorage.getItem('i18nextLng') || 'en';
    config.headers['Accept-Language'] = currentLang;
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global error payloads and save tokens from responses
apiClient.interceptors.response.use(
  (response) => {
    // Save tokens to localStorage as fallback for cross-origin setups
    if (response.data?.data?.csrf_token) {
      localStorage.setItem('csrf_token', response.data.data.csrf_token);
    }
    if (response.data?.data?.access_token) {
      localStorage.setItem('access_token', response.data.data.access_token);
    }
    if (response.data?.data?.refresh_token) {
      localStorage.setItem('refresh_token', response.data.data.refresh_token);
    }
    return response;
  },
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
        // Call refresh endpoint with fallback payload
        const refreshToken = localStorage.getItem('refresh_token');
        const refreshResponse = await apiClient.post('/accounts/refresh/', { refresh: refreshToken });
        if (refreshResponse.data?.data?.access_token) {
          localStorage.setItem('access_token', refreshResponse.data.data.access_token);
        }
        isRefreshing = false;
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);
        // Dispatch custom event to notify auth context to log out
        localStorage.removeItem('csrf_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
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

