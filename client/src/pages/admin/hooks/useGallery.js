import { useState, useEffect, useCallback } from 'react';
import galleryService from '../services/galleryService';
import notify from '../utils/notify';

export function useGallery() {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null);

  const fetchGalleryItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await galleryService.getAll();
      setGalleryItems(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load gallery items.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  const addGalleryItem = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category.trim() || !image) {
      notify('Please fill out title, category, and select an image.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category.trim());
    formData.append('image', image);

    try {
      const res = await galleryService.create(formData);
      setGalleryItems((prev) => [res, ...prev]);
      setTitle('');
      setCategory('');
      setImage(null);
      setShowAddForm(false);
      notify('Gallery item added successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify(`Failed to add gallery item: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await galleryService.delete(id);
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      notify('Gallery item deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete gallery item.');
    }
  };

  return {
    galleryItems,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    title,
    setTitle,
    category,
    setCategory,
    image,
    setImage,
    addGalleryItem,
    deleteGalleryItem,
    refresh: fetchGalleryItems,
  };
}

export default useGallery;
