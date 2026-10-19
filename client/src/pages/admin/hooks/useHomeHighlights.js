import { useState, useEffect, useCallback } from 'react';
import homeHighlightService from '../services/homeHighlightService';
import regionService from '../services/regionService';
import notify from '../utils/notify';

const EMPTY_FORM = {
  kind: 'news',
  title: '',
  subtitle: '',
  link_url: '',
  region: '',
  display_order: 0,
};

export function useHomeHighlights() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [regions, setRegions] = useState([]);

  const setField = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await homeHighlightService.getAll());
    } catch (err) {
      console.error(err);
      setError('Failed to load home page cards.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Flattened region list for the "Region" picker (sub-regions included).
  useEffect(() => {
    regionService.getRegions()
      .then((res) => {
        const flat = [];
        const walk = (list) => (list || []).forEach((r) => { flat.push(r); walk(r.sub_regions); });
        walk(res.data);
        setRegions(flat);
      })
      .catch(() => setRegions([]));
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      notify('Please enter a title.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('kind', form.kind);
    formData.append('title', form.title.trim());
    formData.append('subtitle', form.subtitle.trim());
    formData.append('link_url', form.link_url.trim());
    formData.append('display_order', String(form.display_order || 0));
    if (form.region) formData.append('region', form.region);
    if (image) formData.append('image', image);

    try {
      const res = await homeHighlightService.create(formData);
      setItems((prev) => [...prev, res].sort((a, b) => a.display_order - b.display_order));
      setForm(EMPTY_FORM);
      setImage(null);
      setShowAddForm(false);
      notify('Card added to the home page.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify(`Failed to save card: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (item) => {
    const formData = new FormData();
    formData.append('is_active', item.is_active ? 'false' : 'true');
    try {
      const res = await homeHighlightService.update(item.id, formData);
      setItems((prev) => prev.map((i) => (i.id === item.id ? res : i)));
    } catch (err) {
      console.error(err);
      notify('Failed to update card.');
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card?')) return;
    try {
      await homeHighlightService.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      notify('Card deleted.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete card.');
    }
  };

  return {
    items, loading, error, submitting,
    showAddForm, setShowAddForm,
    form, setField, setImage, regions,
    addItem, toggleActive, deleteItem,
    refresh: fetchItems,
  };
}

export default useHomeHighlights;
