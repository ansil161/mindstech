import { useState, useEffect, useCallback } from 'react';
import collectionCentreService from '../services/collectionCentreService';
import notify from '../utils/notify';

export function useCollectionCentres() {
  const [collectionCentres, setCollectionCentres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newCentre, setNewCentre] = useState({
    operator: '',
    city: '',
    address: '',
    contact_name: '',
    phone: '',
  });

  const fetchCollectionCentres = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await collectionCentreService.getAll();
      setCollectionCentres(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load collection centres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollectionCentres();
  }, [fetchCollectionCentres]);

  const addCollectionCentre = async (e) => {
    e.preventDefault();
    if (!newCentre.operator || !newCentre.city || !newCentre.address || !newCentre.contact_name || !newCentre.phone) {
      notify('Please fill in all collection centre fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await collectionCentreService.create(newCentre);
      setCollectionCentres((prev) => [res, ...prev]);
      setNewCentre({ operator: '', city: '', address: '', contact_name: '', phone: '' });
      setShowAddForm(false);
      notify('Collection centre added successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify(`Failed to add collection centre: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (centre) => {
    try {
      const updated = await collectionCentreService.toggleActive(centre);
      setCollectionCentres((prev) =>
        prev.map((c) => (c.id === centre.id ? updated : c))
      );
      notify('Status updated.');
    } catch (err) {
      console.error(err);
      notify('Failed to update status.');
    }
  };

  const deleteCollectionCentre = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection centre?')) return;
    try {
      await collectionCentreService.delete(id);
      setCollectionCentres((prev) => prev.filter((item) => item.id !== id));
      notify('Collection centre deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete collection centre.');
    }
  };

  return {
    collectionCentres,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    newCentre,
    setNewCentre,
    addCollectionCentre,
    toggleActive,
    deleteCollectionCentre,
    refresh: fetchCollectionCentres,
  };
}

export default useCollectionCentres;
