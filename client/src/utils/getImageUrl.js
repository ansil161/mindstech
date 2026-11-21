// Served from client/public, so it works with no third-party host.
const PLACEHOLDER = '/assets/img/placeholder.svg';

export const getImageUrl = (url) => {
  if (!url) return PLACEHOLDER;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  // Relative media paths (/media/...) are served by the same origin as the API.
  // With VITE_API_URL unset the site is same-origin, so leave the path relative.
  const backendUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const handleImageError = (e, fallback = PLACEHOLDER) => {
  e.target.onerror = null;
  e.target.src = fallback;
};

export default getImageUrl;
