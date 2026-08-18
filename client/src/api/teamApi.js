import axios, { publicClient } from './axios';

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
// Goes through publicClient, which sends no Authorization header at all.
// `withCredentials: false` on the authenticated client was NOT enough: it
// suppresses cookies but not the Bearer token the request interceptor adds
// from localStorage, so any visitor carrying a stale admin token got a 401
// from this AllowAny endpoint and the request stalled in the refresh queue.
export const getPublicTeamMembers = () => publicClient.get('/admin/public/team/');
