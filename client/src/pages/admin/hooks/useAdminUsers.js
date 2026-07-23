import { useState, useEffect, useCallback } from 'react';
import adminUserService from '../services/adminUserService';
import notify from '../utils/notify';

export function useAdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add-admin form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminUserService.getAdmins();
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load admins.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim() || !newPassword) {
      notify('Please enter an email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        email: newEmail.trim(),
        password: newPassword,
        first_name: newFirstName.trim(),
        last_name: newLastName.trim(),
      };
      const res = await adminUserService.createAdmin(payload);
      setAdmins((prev) => [res.data, ...prev]);
      setNewEmail('');
      setNewPassword('');
      setNewFirstName('');
      setNewLastName('');
      setShowAddForm(false);
      notify('Admin created successfully.');
    } catch (err) {
      console.error(err);
      notify(`Failed to create admin: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAdminActive = async (admin) => {
    try {
      const res = await adminUserService.setAdminActive(admin.id, !admin.is_active);
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, is_active: res.data.is_active } : a)));
      notify('Admin status updated.');
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.detail || 'Failed to update admin status.');
    }
  };

  const deleteAdmin = async (admin) => {
    if (!window.confirm(`Delete admin ${admin.email}? This cannot be undone.`)) return;
    try {
      await adminUserService.deleteAdmin(admin.id);
      setAdmins((prev) => prev.filter((a) => a.id !== admin.id));
      notify('Admin deleted successfully.');
    } catch (err) {
      console.error(err);
      notify(err.response?.data?.detail || 'Failed to delete admin.');
    }
  };

  return {
    admins,
    loading,
    error,
    showAddForm,
    setShowAddForm,
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    newFirstName,
    setNewFirstName,
    newLastName,
    setNewLastName,
    submitting,
    addAdmin,
    toggleAdminActive,
    deleteAdmin,
    refresh: fetchAdmins,
  };
}

export default useAdminUsers;
