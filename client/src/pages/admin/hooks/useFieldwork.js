import { useState, useEffect, useCallback } from 'react';
import fieldworkService from '../services/fieldworkService';
import notify from '../utils/notify';

export function useFieldwork() {
  const [fieldwork, setFieldwork] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [locationMeta, setLocationMeta] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);

  const fetchFieldwork = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fieldworkService.getAll();
      setFieldwork(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load fieldwork projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFieldwork();
  }, [fetchFieldwork]);

  const addFieldwork = async (e) => {
    e.preventDefault();
    if (!title.trim() || !locationMeta.trim() || !category.trim() || !image) {
      notify('Please fill out all fields and select a project image.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('location_meta', locationMeta.trim());
    formData.append('category', category.trim());
    formData.append('image', image);

    try {
      const res = await fieldworkService.create(formData);
      setFieldwork((prev) => [res, ...prev]);
      setTitle('');
      setLocationMeta('');
      setCategory('');
      setImage(null);
      setShowAddForm(false);
      notify('Fieldwork project added successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      notify(`Failed to save project. Server error details: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFieldwork = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fieldwork project?')) return;
    try {
      await fieldworkService.delete(id);
      setFieldwork((prev) => prev.filter((item) => item.id !== id));
      notify('Fieldwork project deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete fieldwork project.');
    }
  };

  return {
    fieldwork,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    title,
    setTitle,
    locationMeta,
    setLocationMeta,
    category,
    setCategory,
    image,
    setImage,
    addFieldwork,
    deleteFieldwork,
    refresh: fetchFieldwork,
  };
}

export default useFieldwork;
