import { useState, useEffect, useCallback } from 'react';
import eventService from '../services/eventService';
import notify from '../utils/notify';

export function useEvents() {
  const [eventNews, setEventNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [evType, setEvType] = useState('event');
  const [evTitle, setEvTitle] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evImage, setEvImage] = useState(null);
  const [evCategory, setEvCategory] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evExternalUrl, setEvExternalUrl] = useState('');
  const [evRegisterUrl, setEvRegisterUrl] = useState('');

  const fetchEventNews = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await eventService.getAll();
      setEventNews(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load events and news.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEventNews();
  }, [fetchEventNews]);

  const addEventNews = async (e) => {
    e.preventDefault();
    if (!evTitle.trim() || !evDescription.trim()) {
      notify('Please fill out the title and description.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('type', evType);
    formData.append('title', evTitle.trim());
    formData.append('description', evDescription.trim());
    if (evImage) formData.append('image', evImage);

    if (evType === 'news') {
      if (evCategory) formData.append('category', evCategory.trim());
      if (evExternalUrl) formData.append('external_url', evExternalUrl.trim());
    } else {
      if (evDate) formData.append('event_date', evDate);
      if (evLocation) formData.append('location', evLocation.trim());
      if (evRegisterUrl) formData.append('register_url', evRegisterUrl.trim());
    }

    try {
      const res = await eventService.create(formData);
      setEventNews((prev) => [res, ...prev]);
      setEvTitle('');
      setEvDescription('');
      setEvImage(null);
      setEvCategory('');
      setEvDate('');
      setEvLocation('');
      setEvExternalUrl('');
      setEvRegisterUrl('');
      setShowAddForm(false);
      notify('Event/News item added successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify(`Failed to save item: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEventNews = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await eventService.delete(id);
      setEventNews((prev) => prev.filter((item) => item.id !== id));
      notify('Item deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete item.');
    }
  };

  return {
    eventNews,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    evType,
    setEvType,
    evTitle,
    setEvTitle,
    evDescription,
    setEvDescription,
    setEvImage,
    evCategory,
    setEvCategory,
    evDate,
    setEvDate,
    evLocation,
    setEvLocation,
    evExternalUrl,
    setEvExternalUrl,
    evRegisterUrl,
    setEvRegisterUrl,
    addEventNews,
    deleteEventNews,
    refresh: fetchEventNews,
  };
}

export default useEvents;
