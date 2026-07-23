import axios from './axios';

// ── Admin: Admin account management (superuser only) ──

export const getAdmins = () => axios.get('/accounts/admins/');

export const createAdmin = (data) => axios.post('/accounts/admins/', data);

export const setAdminActive = (id, is_active) => axios.patch(`/accounts/admins/${id}/`, { is_active });

export const deleteAdmin = (id) => axios.delete(`/accounts/admins/${id}/`);
