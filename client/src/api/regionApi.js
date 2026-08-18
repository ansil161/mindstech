import axios, { publicClient } from './axios';

// ── Admin: Regions ──

export const getRegions = () => axios.get('/admin/regions/');

export const createRegion = (data) => axios.post('/admin/regions/', data);

export const updateRegion = (id, data) => axios.patch(`/admin/regions/${id}/`, data);

export const deleteRegion = (id) => axios.delete(`/admin/regions/${id}/`);

// ── Admin: Region Contact ──

export const getRegionContact = (regionId) => axios.get(`/admin/regions/${regionId}/contact/`);

export const updateRegionContact = (regionId, data) =>
  axios.put(`/admin/regions/${regionId}/contact/`, data);

export const getRegionContacts = (regionId) => axios.get(`/admin/regions/${regionId}/contacts/`);
export const createRegionContact = (regionId, data) => axios.post(`/admin/regions/${regionId}/contacts/`, data);
export const updateRegionContactDetail = (id, data) => axios.put(`/admin/contacts/${id}/`, data);
export const deleteRegionContactDetail = (id) => axios.delete(`/admin/contacts/${id}/`);

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
// Uses a plain fetch without credentials so DRF authentication
// middleware never interferes with this AllowAny endpoint.
export const getPublicRegions = () =>
  publicClient.get('/admin/public/regions/');

export const getPublicRegionData = (slug) =>
  publicClient.get(`/admin/public/region/${slug}/`);

export const getPublicRegionSolutionBrands = (regionSlug, solutionSlug) =>
  publicClient.get(`/admin/public/region/${regionSlug}/solution/${solutionSlug}/brands/`);
