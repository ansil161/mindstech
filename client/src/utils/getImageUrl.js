export const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/600x400?text=No+Image';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const backendUrl = (import.meta.env.VITE_API_URL || 'https://mindstech.onrender.com').replace(/\/$/, '');
  return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const handleImageError = (e, fallback = 'https://via.placeholder.com/600x400?text=Image+Not+Found') => {
  e.target.onerror = null;
  e.target.src = fallback;
};

export default getImageUrl;
