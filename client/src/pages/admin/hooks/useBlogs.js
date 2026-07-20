import { useState, useEffect, useCallback } from 'react';
import blogService from '../services/blogService';
import notify from '../utils/notify';

export function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for creating blog
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [content, setContent] = useState('');
  const [cat, setCat] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Expand / edit states
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await blogService.getAll();
      setBlogs(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const addBlog = async (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim() || !cat.trim() || !publishDate) {
      notify('Please fill out all required fields.');
      return;
    }
    setSubmitting(true);
    const payload = {
      title: title.trim(),
      desc: desc.trim(),
      content: content.trim(),
      cat: cat.trim(),
      publish_date: publishDate,
      is_featured: isFeatured,
    };

    try {
      const res = await blogService.create(payload);
      setBlogs((prev) => [res, ...prev]);
      setTitle('');
      setDesc('');
      setContent('');
      setCat('');
      setPublishDate('');
      setIsFeatured(false);
      setShowAddForm(false);
      notify('Blog post added successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      notify(`Failed to save blog post. Server error details: ${serverMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await blogService.delete(id);
      setBlogs((prev) => prev.filter((item) => item.id !== id));
      notify('Blog post deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete blog post.');
    }
  };

  const editBlog = async (e, id) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const res = await blogService.update(id, {
        title: editFields.title?.trim(),
        desc: editFields.desc?.trim(),
        content: editFields.content?.trim(),
        cat: editFields.cat?.trim(),
        publish_date: editFields.publish_date,
        is_featured: editFields.is_featured,
      });
      setBlogs((prev) => prev.map((b) => (b.id === id ? res : b)));
      setEditingBlogId(null);
      setEditFields({});
      notify('Blog post updated successfully.');
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
      notify(`Failed to update blog post: ${serverMsg}`);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedBlogId((prev) => (prev === id ? null : id));
  };

  return {
    blogs,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    title,
    setTitle,
    desc,
    setDesc,
    content,
    setContent,
    cat,
    setCat,
    publishDate,
    setPublishDate,
    isFeatured,
    setIsFeatured,
    addBlog,
    deleteBlog,
    editBlog,
    expandedBlogId,
    toggleExpand,
    editingBlogId,
    setEditingBlogId,
    editFields,
    setEditFields,
    submittingEdit,
    refresh: fetchBlogs,
  };
}

export default useBlogs;
