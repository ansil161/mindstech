import axios from './axios';

// ── Admin: Team Members (global, shared across all regions) ──

export const getTeamMembers = () => axios.get('/admin/team-members/');

export const addTeamMember = (formData) =>
  axios.post('/admin/team-members/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateTeamMember = (id, formData) =>
  axios.patch(`/admin/team-members/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteTeamMember = (id) => axios.delete(`/admin/team-members/${id}/`);

// ── Public API (no auth) ──
// Uses a plain fetch without credentials so DRF authentication
// middleware never interferes with this AllowAny endpoint.
export const getPublicTeamMembers = () =>
  axios.get('/admin/public/team/', { withCredentials: false });
