import axios from './axios';

// ── Admin: Client Testimonials (global, shared across all regions) ──

export const getTestimonials = () => axios.get('/admin/testimonials/');

export const addTestimonial = (formData) =>
  axios.post('/admin/testimonials/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTestimonial = (id) => axios.delete(`/admin/testimonials/${id}/`);

// ── Public API (no auth) ──
// Uses a plain fetch without credentials so DRF authentication
// middleware never interferes with this AllowAny endpoint.
export const getPublicTestimonials = () =>
  axios.get('/admin/public/testimonials/', { withCredentials: false });
