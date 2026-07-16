import axios from './axios';

// ── Admin: Regions ──

export const getRegions = () => axios.get('/admin/regions/');

export const createRegion = (data) => axios.post('/admin/regions/', data);

export const updateRegion = (id, data) => axios.patch(`/admin/regions/${id}/`, data);

export const deleteRegion = (id) => axios.delete(`/admin/regions/${id}/`);

// ── Admin: Team Members ──

export const getTeamMembers = (regionId) => axios.get(`/admin/regions/${regionId}/team/`);

export const addTeamMember = (regionId, formData) =>
  axios.post(`/admin/regions/${regionId}/team/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateTeamMember = (id, formData) =>
  axios.patch(`/admin/team-members/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTeamMember = (id) => axios.delete(`/admin/team-members/${id}/`);

// ── Admin: Region Contact ──

export const getRegionContact = (regionId) => axios.get(`/admin/regions/${regionId}/contact/`);

export const updateRegionContact = (regionId, data) =>
  axios.put(`/admin/regions/${regionId}/contact/`, data);

// ── Admin: Brands ──

export const getBrands = (regionId) => axios.get(`/admin/regions/${regionId}/brands/`);

export const addBrand = (regionId, formData) =>
  axios.post(`/admin/regions/${regionId}/brands/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateBrand = (id, formData) =>
  axios.patch(`/admin/brands/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteBrand = (id) => axios.delete(`/admin/brands/${id}/`);

// ── Public API (no auth) ──

export const getPublicRegionData = (slug) => axios.get(`/admin/public/region/${slug}/`);

// ── Admin: Testimonials ──

export const getTestimonials = (regionId) => axios.get(`/admin/regions/${regionId}/testimonials/`);

export const addTestimonial = (regionId, formData) =>
  axios.post(`/admin/regions/${regionId}/testimonials/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTestimonial = (id) => axios.delete(`/admin/testimonials/${id}/`);
