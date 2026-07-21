import { useState, useEffect, useCallback } from 'react';
import solutionService from '../services/solutionService';
import notify from '../utils/notify';

export function useSolutions() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);

  const fetchSolutions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await solutionService.getAll();
      setSolutions(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load solutions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolutions();
  }, [fetchSolutions]);

  const addSolution = async (e) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !description.trim() || !image) {
      notify('Please fill out all fields and select a cover image.');
      return;
    }
    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('slug', slug.trim());
    formData.append('desc', description.trim());
    formData.append('description', description.trim());
    formData.append('image', image);

    try {
      const res = await solutionService.create(formData);
      setSolutions((prev) => [res, ...prev]);
      setTitle('');
      setSlug('');
      setDescription('');
      setImage(null);
      setShowAddForm(false);
      notify('Solution added successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify(`Failed to save solution: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSolution = async (id) => {
    if (!window.confirm('Are you sure you want to delete this solution?')) return;
    try {
      await solutionService.delete(id);
      setSolutions((prev) => prev.filter((item) => item.id !== id));
      notify('Solution deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete solution.');
    }
  };

  return {
    solutions,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    title,
    setTitle,
    slug,
    setSlug,
    description,
    setDescription,
    image,
    setImage,
    addSolution,
    deleteSolution,
    refresh: fetchSolutions,
  };
}

export default useSolutions;
