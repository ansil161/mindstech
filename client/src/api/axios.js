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

const BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/v1';

/**
 * Guard against the SPA/dev-server HTML fallback being mistaken for data.
 * When the API host isn't reachable, whatever serves the frontend answers
 * /api/* with index.html and a 200. Axios resolves happily, callers get a
 * string where they expected JSON, and the first `.map()` downstream throws
 * inside render — which the router error boundary turns into a blank page.
 * Rejecting here routes it into the `.catch()` handlers callers already have.
 */
const rejectIfHtml = (response) => {
  const contentType = response.headers?.['content-type'] || '';
  if (typeof response.data === 'string' && /^\s*<(!doctype|html)/i.test(response.data)) {
    return Promise.reject({
      success: false,
      message:
        `Expected JSON from ${response.config?.url ?? 'the API'} but received HTML ` +
        `(content-type: ${contentType || 'unknown'}). Is the backend running?`,
      errors: {},
    });
  }
  return null;
};

const toFallbackError = (error) => ({
  success: false,
  message: error.response?.data?.message || error.message || 'An unexpected error occurred.',
  errors: error.response?.data?.errors || {},
});

/**
 * Client for the `/admin/public/*` endpoints, which are AllowAny and are read
 * by ordinary visitors who are not signed in.
 *
 * These used to go through `apiClient` with `withCredentials: false`, on the
 * assumption that this kept DRF's authentication out of the way. It does not:
 * `withCredentials` only suppresses cookies, while the request interceptor
 * below still attached `Authorization: Bearer <token>` from localStorage. Any
 * visitor holding a stale admin token — anyone who has opened the dashboard on
 * that browser — therefore sent an invalid Bearer to a public endpoint. DRF
 * fails authentication BEFORE it consults permission classes, so the view's
 * AllowAny never applies and the response is a 401. That 401 then entered the
 * refresh/retry machinery, where a request queued behind an in-flight refresh
 * can be left permanently pending — which the About page renders as a
 * "Loading team..." that never resolves.
 *
 * Public data needs no identity, so this instance simply never sends one, and
 * never runs the refresh dance.
 */
export const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

publicClient.interceptors.request.use(
  (config) => {
    config.headers['Accept-Language'] = localStorage.getItem('i18nextLng') || 'en';
    return config;
  },
  (error) => Promise.reject(error)
);

publicClient.interceptors.response.use(
  (response) => rejectIfHtml(response) || response,
  (error) => Promise.reject(toFallbackError(error))
);

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
    const htmlRejection = rejectIfHtml(response);
    if (htmlRejection) return htmlRejection;

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

    return Promise.reject(toFallbackError(error));
  }
);

export default apiClient;

