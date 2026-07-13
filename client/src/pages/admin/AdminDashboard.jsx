import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import DocumentManager from '../../components/admin/DocumentManager';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [enquiries, setEnquiries] = useState([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);
  const [enquiriesError, setEnquiriesError] = useState('');



  // Instantly remove preloader on dashboard load
  useEffect(() => {
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.remove();
    }
  }, []);

  const fetchEnquiries = async () => {
    setLoadingEnquiries(true);
    setEnquiriesError('');
    try {
      const res = await axios.get('/admin/enquiries/');
      setEnquiries(res.data);
    } catch (err) {
      console.error(err);
      setEnquiriesError('Failed to load inquiries.');
    } finally {
      setLoadingEnquiries(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    fetchSolutions();
    fetchBlogs();
  }, []);

  // Fieldwork states
  const [fieldwork, setFieldwork] = useState([]);
  const [loadingFieldwork, setLoadingFieldwork] = useState(false);
  const [fieldworkError, setFieldworkError] = useState('');

  // Add fieldwork form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocationMeta, setNewLocationMeta] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [submittingFieldwork, setSubmittingFieldwork] = useState(false);

  const fetchFieldwork = async () => {
    setLoadingFieldwork(true);
    setFieldworkError('');
    try {
      const res = await axios.get('/admin/fieldwork/');
      setFieldwork(res.data);
    } catch (err) {
      console.error(err);
      setFieldworkError('Failed to load fieldwork projects.');
    } finally {
      setLoadingFieldwork(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'fieldwork') {
      fetchFieldwork();
    }
  }, [activeTab]);

  const handleAddFieldwork = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLocationMeta.trim() || !newCategory.trim() || !newImage) {
      alert('Please fill out all fields and select a project image.');
      return;
    }
    setSubmittingFieldwork(true);
    const formData = new FormData();
    formData.append('title', newTitle.trim());
    formData.append('location_meta', newLocationMeta.trim());
    formData.append('category', newCategory.trim());
    formData.append('image', newImage);

    try {
      const res = await axios.post('/admin/fieldwork/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFieldwork(prev => [res.data, ...prev]);
      // Reset form fields
      setNewTitle('');
      setNewLocationMeta('');
      setNewCategory('');
      setNewImage(null);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : err.message;
      alert(`Failed to save project. Server error details: ${serverMsg}`);
    } finally {
      setSubmittingFieldwork(false);
    }
  };

  const handleDeleteFieldwork = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fieldwork project?')) return;
    try {
      await axios.delete(`/admin/fieldwork/${id}/`);
      setFieldwork(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete fieldwork project.');
    }
  };

  // Solutions states
  const [solutions, setSolutions] = useState([]);
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [solutionsError, setSolutionsError] = useState('');
  
  // Add solution form states
  const [showAddSolutionForm, setShowAddSolutionForm] = useState(false);
  const [solTitle, setSolTitle] = useState('');
  const [solSlug, setSolSlug] = useState('');
  const [solDescription, setSolDescription] = useState('');
  const [solImage, setSolImage] = useState(null);
  const [submittingSolution, setSubmittingSolution] = useState(false);

  // Blogs states
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [blogsError, setBlogsError] = useState('');

  // Add blog form states
  const [showAddBlogForm, setShowAddBlogForm] = useState(false);
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogDesc, setNewBlogDesc] = useState('');
  const [newBlogHref, setNewBlogHref] = useState('');
  const [newBlogCat, setNewBlogCat] = useState('');
  const [newBlogPublishDate, setNewBlogPublishDate] = useState('');
  const [newBlogIsFeatured, setNewBlogIsFeatured] = useState(false);
  const [submittingBlog, setSubmittingBlog] = useState(false);

  // Collection centre states
  const [collectionCentres, setCollectionCentres] = useState([]);
  const [loadingCollectionCentres, setLoadingCollectionCentres] = useState(false);
  const [collectionCentresError, setCollectionCentresError] = useState('');
  const [showCollectionCentreForm, setShowCollectionCentreForm] = useState(false);
  const [newCentre, setNewCentre] = useState({ operator: '', city: '', address: '', contact_name: '', phone: '' });
  const [submittingCentre, setSubmittingCentre] = useState(false);

  const fetchCollectionCentres = async () => {
    setLoadingCollectionCentres(true);
    setCollectionCentresError('');
    try {
      const res = await axios.get('/admin/collection-centres/');
      setCollectionCentres(res.data);
    } catch (err) {
      console.error(err);
      setCollectionCentresError('Failed to load collection centres.');
    } finally {
      setLoadingCollectionCentres(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'collection-centres') fetchCollectionCentres();
  }, [activeTab]);

  const handleAddCollectionCentre = async (e) => {
    e.preventDefault();
    if (Object.values(newCentre).some(value => !value.trim())) {
      alert('Please fill out all collection centre fields.');
      return;
    }
    setSubmittingCentre(true);
    try {
      const res = await axios.post('/admin/collection-centres/', newCentre);
      setCollectionCentres(prev => [...prev, res.data]);
      setNewCentre({ operator: '', city: '', address: '', contact_name: '', phone: '' });
      setShowCollectionCentreForm(false);
    } catch (err) {
      console.error(err);
      alert(`Failed to save collection centre: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingCentre(false);
    }
  };

  const handleCentreActiveChange = async (centre) => {
    try {
      const res = await axios.patch(`/admin/collection-centres/${centre.id}/`, { is_active: !centre.is_active });
      setCollectionCentres(prev => prev.map(item => item.id === centre.id ? res.data : item));
    } catch (err) {
      console.error(err);
      alert('Failed to update collection centre.');
    }
  };

  const handleDeleteCollectionCentre = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection centre?')) return;
    try {
      await axios.delete(`/admin/collection-centres/${id}/`);
      setCollectionCentres(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete collection centre.');
    }
  };

  const fetchSolutions = async () => {
    setLoadingSolutions(true);
    setSolutionsError('');
    try {
      const res = await axios.get('/admin/solutions/');
      setSolutions(res.data);
    } catch (err) {
      console.error(err);
      setSolutionsError('Failed to load solutions.');
    } finally {
      setLoadingSolutions(false);
    }
  };

  const handleAddSolution = async (e) => {
    e.preventDefault();
    if (!solTitle.trim() || !solSlug.trim() || !solDescription.trim() || !solImage) {
      alert('Please fill out all fields and select a solution image.');
      return;
    }
    setSubmittingSolution(true);

    const formData = new FormData();
    formData.append('title', solTitle.trim());
    formData.append('slug', solSlug.trim());
    formData.append('desc', solDescription.trim());
    formData.append('image', solImage);

    try {
      const res = await axios.post('/admin/solutions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSolutions(prev => [...prev, res.data]);
      // Reset fields
      setSolTitle('');
      setSolSlug('');
      setSolDescription('');
      setSolImage(null);
      setShowAddSolutionForm(false);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : err.message;
      alert(`Failed to save solution. Server error details: ${serverMsg}`);
    } finally {
      setSubmittingSolution(false);
    }
  };

  const handleDeleteSolution = async (id) => {
    if (!window.confirm('Are you sure you want to delete this solution?')) return;
    try {
      await axios.delete(`/admin/solutions/${id}/`);
      setSolutions(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete solution.');
    }
  };

  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    setBlogsError('');
    try {
      const res = await axios.get('/admin/blogs/');
      setBlogs(res.data);
    } catch (err) {
      console.error(err);
      setBlogsError('Failed to load blog posts.');
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blogs') {
      fetchBlogs();
    }
  }, [activeTab]);

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!newBlogTitle.trim() || !newBlogDesc.trim() || !newBlogHref.trim() || !newBlogCat.trim() || !newBlogPublishDate) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmittingBlog(true);

    const payload = {
      title: newBlogTitle.trim(),
      desc: newBlogDesc.trim(),
      href: newBlogHref.trim(),
      cat: newBlogCat.trim(),
      publish_date: newBlogPublishDate,
      is_featured: newBlogIsFeatured,
    };

    try {
      const res = await axios.post('/admin/blogs/', payload);
      setBlogs(prev => [res.data, ...prev]);
      // Reset fields
      setNewBlogTitle('');
      setNewBlogDesc('');
      setNewBlogHref('');
      setNewBlogCat('');
      setNewBlogPublishDate('');
      setNewBlogIsFeatured(false);
      setShowAddBlogForm(false);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : err.message;
      alert(`Failed to save blog post. Server error details: ${serverMsg}`);
    } finally {
      setSubmittingBlog(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await axios.delete(`/admin/blogs/${id}/`);
      setBlogs(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete blog post.');
    }
  };



  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await axios.patch(`/admin/enquiries/${id}/`, { status: newStatus });
      setEnquiries(prev => prev.map(item => item.id === id ? res.data : item));
    } catch (err) {
      console.error(err);
      alert('Failed to update enquiry status.');
    }
  };

  const handleDeleteEnquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await axios.delete(`/admin/enquiries/${id}/`);
      setEnquiries(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete enquiry.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'solutions':
        return (
          <div style={{ width: '100%' }}>
            {/* Header Section */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>Manage Solutions</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                    Add and delete service solutions displayed under 'What We Distribute' on the homepage.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddSolutionForm(!showAddSolutionForm)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
                >
                  {showAddSolutionForm ? 'Cancel' : 'Add Solution'}
                </button>
              </div>
            </div>

            {/* Add Solution Form Drawer */}
            {showAddSolutionForm && (
              <form onSubmit={handleAddSolution} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Solution</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Solution Title</label>
                    <input
                      type="text"
                      value={solTitle}
                      onChange={(e) => setSolTitle(e.target.value)}
                      placeholder="e.g. Digital Signage"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Slug Link (URL key)</label>
                    <input
                      type="text"
                      value={solSlug}
                      onChange={(e) => setSolSlug(e.target.value)}
                      placeholder="e.g. digital-signage"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Description (for Homepage)</label>
                  <textarea
                    value={solDescription}
                    onChange={(e) => setSolDescription(e.target.value)}
                    placeholder="Describe what we distribute in this vertical..."
                    rows={3}
                    style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Preview Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSolImage(e.target.files[0])}
                    style={{ color: 'var(--grey)', fontSize: '14px', padding: '4px 0' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="admin-btn"
                    disabled={submittingSolution}
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
                  >
                    {submittingSolution ? 'Saving...' : 'Save Solution'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSolutionForm(false)}
                    className="admin-btn"
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px', background: 'var(--line-soft)', color: 'var(--white)', border: '1px solid var(--line)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Solutions List Grid */}
            {loadingSolutions ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading solutions...</p>
            ) : solutionsError ? (
              <p style={{ color: 'var(--red)', fontSize: '14px' }}>{solutionsError}</p>
            ) : solutions.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No solutions found in database.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {solutions.map((item) => (
                  <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
                    />
                    <div>
                      <span className="admin-welcome-chip" style={{ color: 'var(--red)', background: 'rgba(204,0,1,0.08)', border: '1px solid rgba(204,0,1,0.2)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                        {item.slug}
                      </span>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)', lineHeight: '1.4' }}>{item.desc}</p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                      <button
                        onClick={() => handleDeleteSolution(item.id)}
                        className="admin-btn"
                        style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                      >
                        Delete Solution
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'blogs':
        return (
          <div style={{ width: '100%' }}>
            {/* Header Section */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>Blog Posts Control</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                    Add and delete blog articles listed in the Mindstec Journal page.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddBlogForm(!showAddBlogForm)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
                >
                  {showAddBlogForm ? 'Cancel' : 'Add Blog Post'}
                </button>
              </div>
            </div>

            {/* Add Blog Post Form */}
            {showAddBlogForm && (
              <form onSubmit={handleAddBlog} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Blog Post</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Blog Title</label>
                    <input
                      type="text"
                      value={newBlogTitle}
                      onChange={(e) => setNewBlogTitle(e.target.value)}
                      placeholder="e.g. Why Interactive Display Panels Are Better..."
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Category</label>
                    <input
                      type="text"
                      value={newBlogCat}
                      onChange={(e) => setNewBlogCat(e.target.value)}
                      placeholder="e.g. Displays, Signage, Collaboration"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>External Article Link (URL)</label>
                    <input
                      type="url"
                      value={newBlogHref}
                      onChange={(e) => setNewBlogHref(e.target.value)}
                      placeholder="e.g. https://www.mindstec.com/in/article-slug/"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Publication Date</label>
                    <input
                      type="date"
                      value={newBlogPublishDate}
                      onChange={(e) => setNewBlogPublishDate(e.target.value)}
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Short Description</label>
                  <textarea
                    value={newBlogDesc}
                    onChange={(e) => setNewBlogDesc(e.target.value)}
                    placeholder="Short summary paragraph..."
                    rows={3}
                    style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isFeaturedBlog"
                    checked={newBlogIsFeatured}
                    onChange={(e) => setNewBlogIsFeatured(e.target.checked)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <label htmlFor="isFeaturedBlog" style={{ fontSize: '14px', color: 'var(--white)', cursor: 'pointer' }}>
                    Feature this post at the top of the blogs page
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="admin-btn"
                    disabled={submittingBlog}
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
                  >
                    {submittingBlog ? 'Saving...' : 'Save Blog Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddBlogForm(false)}
                    className="admin-btn"
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px', background: 'var(--line-soft)', color: 'var(--white)', border: '1px solid var(--line)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Blogs List */}
            {loadingBlogs ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading blog posts...</p>
            ) : blogsError ? (
              <p style={{ color: 'var(--red)', fontSize: '14px' }}>{blogsError}</p>
            ) : blogs.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No blog posts found in database.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {blogs.map((item) => (
                  <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="admin-welcome-chip" style={{ color: 'var(--red)', background: 'rgba(204,0,1,0.08)', border: '1px solid rgba(204,0,1,0.2)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                        {item.cat}
                      </span>
                      {item.is_featured && (
                        <span className="admin-welcome-chip" style={{ color: '#16a34a', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                          Featured
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: '4px 0', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                      <p style={{ margin: '4px 0', fontSize: '11px', color: 'var(--grey)' }}>Published: {item.date}</p>
                      <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--grey)', lineHeight: '1.4' }}>{item.desc}</p>
                      <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', fontSize: '11px', color: 'var(--red)', textDecoration: 'underline' }}>
                        Visit Link
                      </a>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                      <button
                        onClick={() => handleDeleteBlog(item.id)}
                        className="admin-btn"
                        style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'leads':
        return (
          <div style={{ width: '100%' }}>
            {/* Header section */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>Client Inquiries</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                    View and manage submitted contact forms from your prospective clients.
                  </p>
                </div>
                <button onClick={fetchEnquiries} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}>
                  Refresh List
                </button>
              </div>
            </div>

            {/* Inquiries Summary Statistics Boxes */}
            <div className="admin-stats-grid" style={{ marginBottom: '32px' }}>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Inquiries</p>
                <p className="admin-stat-value">{enquiries.length}</p>
                <p className="admin-stat-subtext">All submissions logged</p>
              </div>

              <div className="admin-stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
                <p className="admin-stat-label" style={{ color: '#dc2626' }}>Pending</p>
                <p className="admin-stat-value" style={{ color: '#dc2626' }}>
                  {enquiries.filter(e => e.status === 'Pending').length}
                </p>
                <p className="admin-stat-subtext">Awaiting admin review</p>
              </div>

              <div className="admin-stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
                <p className="admin-stat-label" style={{ color: '#2563eb' }}>Read</p>
                <p className="admin-stat-value" style={{ color: '#2563eb' }}>
                  {enquiries.filter(e => e.status === 'Read').length}
                </p>
                <p className="admin-stat-subtext">In progress / reviewed</p>
              </div>

              <div className="admin-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
                <p className="admin-stat-label" style={{ color: '#16a34a' }}>Resolved (Solved)</p>
                <p className="admin-stat-value" style={{ color: '#16a34a' }}>
                  {enquiries.filter(e => e.status === 'Resolved').length}
                </p>
                <p className="admin-stat-subtext">Successfully addressed</p>
              </div>
            </div>

            {/* Table Card Panel */}
            <div className="admin-welcome-panel" style={{ width: '100%' }}>
              {loadingEnquiries ? (
                <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading inquiries...</p>
              ) : enquiriesError ? (
                <p style={{ color: 'var(--red)', fontSize: '14px' }}>{enquiriesError}</p>
              ) : enquiries.length === 0 ? (
                <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No inquiries found.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--grey)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        <th style={{ padding: '12px 16px' }}>Submitter</th>
                        <th style={{ padding: '12px 16px' }}>Subject</th>
                        <th style={{ padding: '12px 16px' }}>Message</th>
                        <th style={{ padding: '12px 16px' }}>Date</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enquiries.map((item) => {
                        let statusColor = '#fef3c7'; // Pending
                        let statusTextColor = '#d97706';
                        if (item.status === 'Read') {
                          statusColor = '#eff6ff';
                          statusTextColor = '#2563eb';
                        } else if (item.status === 'Resolved') {
                          statusColor = '#f0fdf4';
                          statusTextColor = '#16a34a';
                        }

                        return (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--line-soft)', fontSize: '14px' }}>
                            <td style={{ padding: '16px' }}>
                              <div style={{ fontWeight: '600' }}>{item.name}</div>
                              <div style={{ fontSize: '12px', color: 'var(--grey)' }}>{item.email}</div>
                              <div style={{ fontSize: '12px', color: 'var(--grey)' }}>{item.phone}</div>
                            </td>
                            <td style={{ padding: '16px', verticalAlign: 'top' }}>
                              <span className="admin-welcome-chip" style={{ background: 'var(--line-soft)', border: '1px solid var(--line)' }}>
                                {item.subject}
                              </span>
                            </td>
                            <td style={{ padding: '16px', maxWidth: '300px', whiteSpace: 'pre-wrap', color: 'var(--white)', fontSize: '13px' }}>
                              {item.message}
                            </td>
                            <td style={{ padding: '16px', color: 'var(--grey)', whiteSpace: 'nowrap' }}>
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                backgroundColor: statusColor,
                                color: statusTextColor
                              }}>
                                {item.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                                  style={{
                                    background: 'var(--ink)',
                                    border: '1px solid var(--line)',
                                    color: 'var(--white)',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Read">Read</option>
                                  <option value="Resolved">Resolved</option>
                                </select>
                                <button
                                  onClick={() => handleDeleteEnquiry(item.id)}
                                  className="admin-logout-btn"
                                  style={{ padding: '6px', color: 'var(--grey)', background: 'none' }}
                                  title="Delete"
                                >
                                  <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );
      case 'fieldwork':
        return (
          <div style={{ width: '100%' }}>
            {/* Header Section */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>Recent Fieldwork</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                    Manage client installations shown on the homepage. Upload high-res images and meta details.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
                >
                  {showAddForm ? 'Cancel' : 'Add Project'}
                </button>
              </div>
            </div>

            {/* Add Project Form Drawer */}
            {showAddForm && (
              <form onSubmit={handleAddFieldwork} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Fieldwork Project</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Project Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Government command centre"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Category</label>
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="e.g. Control room, Hospitality"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Location & Specifications Meta</label>
                  <input
                    type="text"
                    value={newLocationMeta}
                    onChange={(e) => setNewLocationMeta(e.target.value)}
                    placeholder="e.g. New Delhi, India — 48-screen video wall"
                    style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Project Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewImage(e.target.files[0])}
                    style={{ color: 'var(--grey)', fontSize: '14px', padding: '4px 0' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="admin-btn"
                    disabled={submittingFieldwork}
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
                  >
                    {submittingFieldwork ? 'Saving...' : 'Save Project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="admin-btn"
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px', background: 'var(--line-soft)', color: 'var(--white)', border: '1px solid var(--line)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Fieldwork list cards */}
            {loadingFieldwork ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading fieldwork projects...</p>
            ) : fieldworkError ? (
              <p style={{ color: 'var(--red)', fontSize: '14px' }}>{fieldworkError}</p>
            ) : fieldwork.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No fieldwork projects found.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {fieldwork.map((item) => (
                  <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
                    />
                    <div>
                      <span className="admin-welcome-chip" style={{ color: 'var(--red)', background: 'rgba(204,0,1,0.08)', border: '1px solid rgba(204,0,1,0.2)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                        {item.category}
                      </span>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)', lineHeight: '1.4' }}>{item.location_meta}</p>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                      <button
                        onClick={() => handleDeleteFieldwork(item.id)}
                        className="admin-btn"
                        style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'collection-centres':
        return (
          <div style={{ width: '100%' }}>
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>E-Waste Collection Centres</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>Manage the centres displayed on the public E-Waste page.</p>
                </div>
                <button onClick={() => setShowCollectionCentreForm(value => !value)} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}>
                  {showCollectionCentreForm ? 'Cancel' : 'Add Collection Centre'}
                </button>
              </div>
            </div>

            {showCollectionCentreForm && (
              <form onSubmit={handleAddCollectionCentre} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>New Collection Centre</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {[
                    ['operator', 'Operator', 'e.g. Deshwal Waste Management'],
                    ['city', 'City', 'e.g. New Delhi'],
                    ['contact_name', 'Contact person', 'e.g. Mr. Kumar'],
                    ['phone', 'Phone number', 'e.g. 9555999163'],
                  ].map(([field, label, placeholder]) => (
                    <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                      {label}
                      <input value={newCentre[field]} onChange={e => setNewCentre(prev => ({ ...prev, [field]: e.target.value }))} placeholder={placeholder} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                    </label>
                  ))}
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                  Full address
                  <textarea value={newCentre.address} onChange={e => setNewCentre(prev => ({ ...prev, address: e.target.value }))} placeholder="Full collection-centre address" required rows="3" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }} />
                </label>
                <button type="submit" disabled={submittingCentre} className="admin-btn" style={{ width: 'fit-content', marginTop: 0, padding: '10px 24px' }}>{submittingCentre ? 'Saving...' : 'Save Collection Centre'}</button>
              </form>
            )}

            {loadingCollectionCentres ? <p style={{ color: 'var(--grey)' }}>Loading collection centres...</p> : collectionCentresError ? <p style={{ color: 'var(--red)' }}>{collectionCentresError}</p> : (
              <div style={{ overflowX: 'auto' }} className="admin-welcome-panel">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px', textAlign: 'left' }}>
                  <thead><tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--grey)', fontSize: '11px', textTransform: 'uppercase' }}><th style={{ padding: '12px' }}>City</th><th style={{ padding: '12px' }}>Operator</th><th style={{ padding: '12px' }}>Address</th><th style={{ padding: '12px' }}>Contact</th><th style={{ padding: '12px' }}>Status</th><th style={{ padding: '12px' }}>Actions</th></tr></thead>
                  <tbody>{collectionCentres.map(centre => <tr key={centre.id} style={{ borderBottom: '1px solid var(--line-soft)', fontSize: '13px' }}><td style={{ padding: '12px', fontWeight: '600' }}>{centre.city}</td><td style={{ padding: '12px' }}>{centre.operator}</td><td style={{ padding: '12px', color: 'var(--grey)', maxWidth: '280px' }}>{centre.address}</td><td style={{ padding: '12px' }}>{centre.contact_name}<br /><span style={{ color: 'var(--grey)' }}>{centre.phone}</span></td><td style={{ padding: '12px' }}><button onClick={() => handleCentreActiveChange(centre)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '5px 10px', fontSize: '11px', background: centre.is_active ? '#f0fdf4' : '#fef2f2', color: centre.is_active ? '#16a34a' : '#dc2626', border: centre.is_active ? '1px solid #dcfce7' : '1px solid #fee2e2' }}>{centre.is_active ? 'Active' : 'Inactive'}</button></td><td style={{ padding: '12px' }}><button onClick={() => handleDeleteCollectionCentre(centre.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '5px 10px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Delete</button></td></tr>)}</tbody>
                </table>
              </div>
            )}
          </div>
        );
      case 'documents':
        return <DocumentManager />;
      default:
        return (
          <>
            {/* Quick Stats Grid */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card active-card">
                <p className="admin-stat-label">Active Solutions</p>
                <p className="admin-stat-value">{solutions.length}</p>
                <p className="admin-stat-subtext">Core tech services listed</p>
              </div>

              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Blog Posts</p>
                <p className="admin-stat-value">{blogs.length}</p>
                <p className="admin-stat-subtext">Articles & updates</p>
              </div>

              <div className="admin-stat-card">
                <p className="admin-stat-label">Pending Inquiries</p>
                <p className="admin-stat-value">
                  {enquiries.filter(e => e.status === 'Pending').length}
                </p>
                <p className="admin-stat-subtext" style={{ color: '#22c55e' }}>
                  Total: {enquiries.length}
                </p>
              </div>

              <div className="admin-stat-card">
                <p className="admin-stat-label">Admin Status</p>
                <p className="admin-stat-value" style={{ fontSize: '20px', color: 'var(--red)', marginTop: '8px' }}>
                  {user?.is_staff ? 'Super Admin' : 'Staff'}
                </p>
                <p className="admin-stat-subtext">Read/write privileges</p>
              </div>
            </div>

            {/* Welcome Panel */}
            <div className="admin-welcome-panel">
              <img src="/mindstec-logo-web.png" alt="" className="admin-welcome-bg-logo" />
              <div className="admin-welcome-text">
                <h2 className="admin-welcome-title">
                  Welcome back, {user?.first_name || user?.email || 'Administrator'}!
                </h2>
                <p className="admin-welcome-desc">
                  This is your portal control center. From here you can manage solutions descriptions, edit blogs and news, view incoming customer query forms, and configure website settings.
                </p>
                <div className="admin-welcome-meta">
                  <span className="admin-welcome-chip">Environment: Development</span>
                  <span className="admin-welcome-chip">Role: {user?.is_staff ? 'STAFF_MEMBER' : 'USER'}</span>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="admin-dashboard-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div>
          {/* Brand header */}
          <div className="admin-sidebar-brand">
            <img src="/mindstec-logo-web.png" alt="Mindstec" />
            <span className="admin-tag">Admin</span>
          </div>

          {/* Navigation Links */}
          <nav className="admin-sidebar-nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`admin-sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`admin-sidebar-link ${activeTab === 'solutions' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Solutions</span>
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`admin-sidebar-link ${activeTab === 'blogs' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <span>Blog Posts</span>
            </button>
             <button
              onClick={() => setActiveTab('leads')}
              className={`admin-sidebar-link ${activeTab === 'leads' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Inquiries</span>
            </button>
            <button
              onClick={() => setActiveTab('fieldwork')}
              className={`admin-sidebar-link ${activeTab === 'fieldwork' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Fieldwork</span>
            </button>
            <button
              onClick={() => setActiveTab('collection-centres')}
              className={`admin-sidebar-link ${activeTab === 'collection-centres' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01" />
              </svg>
              <span>Collection Centres</span>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`admin-sidebar-link ${activeTab === 'documents' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Document Uploads</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="admin-sidebar-footer">
          <div className="admin-footer-user">
            <div className="admin-user-info">
              <p className="admin-user-label">Logged in as</p>
              <p className="admin-user-email" title={user?.email}>
                {user?.email || 'admin@mindstec.com'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="admin-logout-btn"
              title="Logout"
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Header */}
        <header className="admin-header">
          <h1 className="admin-header-title">
            {activeTab === 'dashboard' 
              ? 'Control Center Overview' 
              : activeTab === 'leads' 
                ? 'Client Inquiries' 
                : activeTab === 'fieldwork'
                  ? 'Recent Fieldwork'
                  : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
          <div className="admin-status-indicator">
            <span className="admin-pulse-dot"></span>
            <span className="admin-status-text">Backend Live</span>
          </div>
        </header>

        {/* Content Pane */}
        <div className="admin-content-scrollable">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}


