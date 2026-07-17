import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';
import DocumentManager from '../../components/admin/DocumentManager';
import {
  getRegions, createRegion, deleteRegion, updateRegion,
  getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember,
  getRegionContact, updateRegionContact,
  getRegionContacts, createRegionContact, updateRegionContactDetail, deleteRegionContactDetail,
  getBrands, addBrand, deleteBrand,
  getTestimonials, addTestimonial, deleteTestimonial,
} from '../../api/regionApi';

const slugifyRegion = (name) =>
  name.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

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
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogCat, setNewBlogCat] = useState('');
  const [newBlogPublishDate, setNewBlogPublishDate] = useState('');
  const [newBlogHref, setNewBlogHref] = useState('');
  const [newBlogIsFeatured, setNewBlogIsFeatured] = useState(false);
  const [submittingBlog, setSubmittingBlog] = useState(false);

  // Expand / edit states
  const [expandedBlogId, setExpandedBlogId] = useState(null);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [editFields, setEditFields] = useState({});
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Collection centre states
  const [collectionCentres, setCollectionCentres] = useState([]);
  const [loadingCollectionCentres, setLoadingCollectionCentres] = useState(false);
  const [collectionCentresError, setCollectionCentresError] = useState('');
  const [showCollectionCentreForm, setShowCollectionCentreForm] = useState(false);
  const [newCentre, setNewCentre] = useState({ operator: '', city: '', address: '', contact_name: '', phone: '' });
  const [submittingCentre, setSubmittingCentre] = useState(false);

  // Gallery states
  const [galleryItems, setGalleryItems] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [showAddGalleryForm, setShowAddGalleryForm] = useState(false);
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState('');
  const [galImage, setGalImage] = useState(null);
  const [submittingGallery, setSubmittingGallery] = useState(false);

  // Region states
  const [regions, setRegions] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [regionsError, setRegionsError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [showAddRegionForm, setShowAddRegionForm] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionSlug, setNewRegionSlug] = useState('');
  const [submittingRegion, setSubmittingRegion] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submittingContact, setSubmittingContact] = useState(false);
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactMapEmbed, setNewContactMapEmbed] = useState('');
  const [newContactMapLink, setNewContactMapLink] = useState('');

  // Contact edit states
  const [editingContactId, setEditingContactId] = useState(null);
  const [editOfficeName, setEditOfficeName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactAddress, setEditContactAddress] = useState('');
  const [editContactMapEmbed, setEditContactMapEmbed] = useState('');
  const [editContactMapLink, setEditContactMapLink] = useState('');

  // Team member edit states
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberPhoto, setEditMemberPhoto] = useState(null);
  const [submittingMemberEdit, setSubmittingMemberEdit] = useState(false);

  // Toast notifications state
  const [toast, setToast] = useState(null);

  const triggerToast = (type, title, msg) => {
    setToast({ type, title, message: msg });
  };

  const alert = (msg) => {
    const isSuccess = msg.toLowerCase().includes('success') || msg.toLowerCase().includes('saved') || msg.toLowerCase().includes('uploaded') || msg.toLowerCase().includes('updated') || msg.toLowerCase().includes('added') || msg.toLowerCase().includes('deleted');
    triggerToast(isSuccess ? 'success' : 'error', isSuccess ? 'Success' : 'Notification', msg);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  // Brand states
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [showAddBrandForm, setShowAddBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState(null);
  const [submittingBrand, setSubmittingBrand] = useState(false);
  const [selectedSolutions, setSelectedSolutions] = useState([]);

  // Testimonial states
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [showAddTestimonialForm, setShowAddTestimonialForm] = useState(false);
  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiDesignation, setNewTestiDesignation] = useState('');
  const [newTestiCompany, setNewTestiCompany] = useState('');
  const [newTestiMessage, setNewTestiMessage] = useState('');
  const [newTestiPhoto, setNewTestiPhoto] = useState(null);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);
  const [heroFactsForm, setHeroFactsForm] = useState([
    { bold: '', sub: '' },
    { bold: '', sub: '' },
    { bold: '', sub: '' },
  ]);
  const [submittingHeroFacts, setSubmittingHeroFacts] = useState(false);

  const fetchGalleryItems = async () => {
    setLoadingGallery(true);
    setGalleryError('');
    try {
      const res = await axios.get('/admin/gallery/');
      setGalleryItems(res.data);
    } catch (err) {
      console.error(err);
      setGalleryError('Failed to load gallery items.');
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'gallery') fetchGalleryItems();
  }, [activeTab]);

  const handleAddGalleryItem = async (e) => {
    e.preventDefault();
    if (!galTitle.trim() || !galCategory.trim() || !galImage) {
      alert('Please fill out all fields and select an image.');
      return;
    }
    setSubmittingGallery(true);
    const formData = new FormData();
    formData.append('title', galTitle.trim());
    formData.append('category', galCategory.trim());
    formData.append('image', galImage);

    try {
      const res = await axios.post('/admin/gallery/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setGalleryItems(prev => [res.data, ...prev]);
      setGalTitle('');
      setGalCategory('');
      setGalImage(null);
      setShowAddGalleryForm(false);
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data
        ? JSON.stringify(err.response.data)
        : err.message;
      alert(`Failed to save gallery item. Server error details: ${serverMsg}`);
    } finally {
      setSubmittingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    try {
      await axios.delete(`/admin/gallery/${id}/`);
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete gallery item.');
    }
  };

  const fetchRegions = async () => {
    setLoadingRegions(true);
    setRegionsError('');
    try {
      const res = await getRegions();
      setRegions(res.data);
    } catch (err) {
      console.error(err);
      setRegionsError('Failed to load regions.');
    } finally {
      setLoadingRegions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'regions') fetchRegions();
  }, [activeTab]);

  const loadRegionDetail = async (region) => {
    setSelectedRegion(region);
    setLoadingTeam(true);
    setLoadingContacts(true);
    setLoadingBrands(true);
    try {
      const [teamRes, contactsRes, brandsRes, testiRes] = await Promise.all([
        getTeamMembers(region.id),
        getRegionContacts(region.id),
        getBrands(region.id),
        getTestimonials(region.id),
      ]);
      setTeamMembers(teamRes.data);
      setBrands(brandsRes.data || []);
      setTestimonials(testiRes.data || []);
      setContacts(contactsRes.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load region details.');
    } finally {
      setLoadingTeam(false);
      setLoadingContacts(false);
      setLoadingBrands(false);
    }
  };

  const handleAddRegion = async (e) => {
    e.preventDefault();
    if (!newRegionName.trim()) {
      alert('Please enter a region name.');
      return;
    }
    const slug = newRegionSlug.trim() || slugifyRegion(newRegionName);
    setSubmittingRegion(true);
    try {
      const res = await createRegion({ name: newRegionName.trim(), slug, display_order: regions.length });
      setRegions(prev => [...prev, res.data]);
      setNewRegionName('');
      setNewRegionSlug('');
      setShowAddRegionForm(false);
      alert('Region created successfully.');
    } catch (err) {
      console.error(err);
      alert(`Failed to create region: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingRegion(false);
    }
  };

  const handleDeleteRegion = async (id) => {
    if (!window.confirm('Delete this region and all its team members and contact info?')) return;
    try {
      await deleteRegion(id);
      setRegions(prev => prev.filter(r => r.id !== id));
      if (selectedRegion?.id === id) setSelectedRegion(null);
      alert('Region deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete region.');
    }
  };

  const handleAddTeamMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim() || !newMemberPhoto) {
      alert('Please fill out name, role, and upload a photo.');
      return;
    }
    setSubmittingTeam(true);
    const formData = new FormData();
    formData.append('name', newMemberName.trim());
    formData.append('role', newMemberRole.trim());
    formData.append('photo', newMemberPhoto);
    formData.append('display_order', teamMembers.length);
    try {
      const res = await addTeamMember(selectedRegion.id, formData);
      setTeamMembers(prev => [...prev, res.data]);
      setNewMemberName('');
      setNewMemberRole('');
      setNewMemberPhoto(null);
      setShowAddTeamForm(false);
      setRegions(prev => prev.map(r => r.id === selectedRegion.id ? { ...r, team_count: (r.team_count || 0) + 1 } : r));
      alert('Team member added successfully.');
    } catch (err) {
      console.error(err);
      alert(`Failed to add team member: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingTeam(false);
    }
  };

  const handleDeleteTeamMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await deleteTeamMember(id);
      setTeamMembers(prev => prev.filter(m => m.id !== id));
      setRegions(prev => prev.map(r => r.id === selectedRegion.id ? { ...r, team_count: Math.max(0, (r.team_count || 1) - 1) } : r));
      alert('Team member deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete team member.');
    }
  };

  const handleEditTeamMember = async (e, memberId) => {
    e.preventDefault();
    if (!editMemberName.trim() || !editMemberRole.trim()) { alert('Name and role are required.'); return; }
    setSubmittingMemberEdit(true);
    const fd = new FormData();
    fd.append('name', editMemberName.trim());
    fd.append('role', editMemberRole.trim());
    if (editMemberPhoto) fd.append('photo', editMemberPhoto);
    try {
      const res = await updateTeamMember(memberId, fd);
      setTeamMembers(prev => prev.map(m => m.id === memberId ? res.data : m));
      setEditingMemberId(null);
      alert('Team member updated successfully.');
    } catch (err) {
      alert(`Failed to update: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally { setSubmittingMemberEdit(false); }
  };

  const handleToggleRegionActive = async (region) => {
    try {
      const res = await updateRegion(region.id, { is_active: !region.is_active });
      setRegions(prev => prev.map(r => r.id === region.id ? { ...r, is_active: res.data.is_active } : r));
      if (selectedRegion?.id === region.id) setSelectedRegion(p => ({ ...p, is_active: res.data.is_active }));
    } catch (err) { alert('Failed to toggle region status.'); }
  };

  const handleAddBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) { alert('Brand name is required.'); return; }
    setSubmittingBrand(true);
    const fd = new FormData();
    fd.append('name', newBrandName.trim());
    fd.append('website_url', newBrandWebsite.trim());
    fd.append('display_order', brands.length);
    if (newBrandLogo) fd.append('logo', newBrandLogo);
    selectedSolutions.forEach(id => {
      fd.append('solutions', id);
    });
    try {
      const res = await addBrand(selectedRegion.id, fd);
      setBrands(prev => [...prev, res.data]);
      setNewBrandName(''); 
      setNewBrandWebsite(''); 
      setNewBrandLogo(null); 
      setSelectedSolutions([]);
      setShowAddBrandForm(false);
    } catch (err) {
      alert(`Failed to add brand: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally { setSubmittingBrand(false); }
  };

  const handleDeleteBrand = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      alert('Brand deleted successfully.');
    } catch (err) { alert('Failed to delete brand.'); }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newOfficeName.trim() || !newContactAddress.trim() || !newContactEmail.trim() || !newContactPhone.trim()) {
      alert('Please fill out office name, address, email, and phone.');
      return;
    }
    setSubmittingContact(true);
    const data = {
      office_name: newOfficeName.trim(),
      phone: newContactPhone.trim(),
      phone_display: newContactPhone.trim(),
      email: newContactEmail.trim(),
      address: newContactAddress.trim(),
      map_embed_url: newContactMapEmbed.trim(),
      map_link: newContactMapLink.trim(),
    };
    try {
      const res = await createRegionContact(selectedRegion.id, data);
      setContacts(prev => [...prev, res.data]);
      setNewOfficeName('');
      setNewContactPhone('');
      setNewContactEmail('');
      setNewContactAddress('');
      setNewContactMapEmbed('');
      setNewContactMapLink('');
      setShowAddContactForm(false);
      setRegions(prev => prev.map(r => r.id === selectedRegion.id ? { ...r, has_contact: true } : r));
      alert('Contact office added successfully.');
    } catch (err) {
      console.error(err);
      alert(`Failed to add contact office: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleDeleteContact = async (id) => {
    if (!window.confirm('Delete this contact office?')) return;
    try {
      await deleteRegionContactDetail(id);
      setContacts(prev => {
        const next = prev.filter(c => c.id !== id);
        if (next.length === 0) {
          setRegions(rPrev => rPrev.map(r => r.id === selectedRegion.id ? { ...r, has_contact: false } : r));
        }
        return next;
      });
      alert('Contact office deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete contact office.');
    }
  };

  const handleEditContact = async (e, id) => {
    e.preventDefault();
    if (!editOfficeName.trim() || !editContactAddress.trim() || !editContactEmail.trim() || !editContactPhone.trim()) {
      alert('Office name, address, email, and phone are required.');
      return;
    }
    setSubmittingContact(true);
    const data = {
      office_name: editOfficeName.trim(),
      phone: editContactPhone.trim(),
      phone_display: editContactPhone.trim(),
      email: editContactEmail.trim(),
      address: editContactAddress.trim(),
      map_embed_url: editContactMapEmbed.trim(),
      map_link: editContactMapLink.trim(),
    };
    try {
      const res = await updateRegionContactDetail(id, data);
      setContacts(prev => prev.map(c => c.id === id ? res.data : c));
      setEditingContactId(null);
      alert('Contact office updated successfully.');
    } catch (err) {
      alert(`Failed to update contact office: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleAddTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestiName.trim() || !newTestiDesignation.trim() || !newTestiCompany.trim() || !newTestiMessage.trim()) {
      alert('Name, designation, company and message are required.'); return;
    }
    setSubmittingTestimonial(true);
    const fd = new FormData();
    fd.append('name', newTestiName.trim());
    fd.append('designation', newTestiDesignation.trim());
    fd.append('company', newTestiCompany.trim());
    fd.append('message', newTestiMessage.trim());
    fd.append('display_order', testimonials.length);
    if (newTestiPhoto) fd.append('photo', newTestiPhoto);
    try {
      const res = await addTestimonial(selectedRegion.id, fd);
      setTestimonials(prev => [...prev, res.data]);
      setNewTestiName(''); setNewTestiDesignation(''); setNewTestiCompany('');
      setNewTestiMessage(''); setNewTestiPhoto(null); setShowAddTestimonialForm(false);
    } catch (err) {
      alert(`Failed to add testimonial: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally { setSubmittingTestimonial(false); }
  };

  const handleDeleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
    } catch (err) { alert('Failed to delete testimonial.'); }
  };

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
      console.log('cnjjndc',res.data)
    } catch (err) {
      console.error(err);
      setSolutionsError('Failed to load solutions.');
    } finally {
      setLoadingSolutions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'solutions' || activeTab === 'regions') fetchSolutions();
  }, [activeTab]);

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
    if (!newBlogTitle.trim() || !newBlogDesc.trim() || !newBlogCat.trim() || !newBlogPublishDate) {
      alert('Please fill out all required fields.');
      return;
    }
    setSubmittingBlog(true);

    const payload = {
      title: newBlogTitle.trim(),
      desc: newBlogDesc.trim(),
      content: newBlogContent.trim(),
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
      setNewBlogContent('');
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

  const handleEditBlog = async (e, id) => {
    e.preventDefault();
    setSubmittingEdit(true);
    try {
      const res = await axios.patch(`/admin/blogs/${id}/`, {
        title: editFields.title?.trim(),
        desc: editFields.desc?.trim(),
        content: editFields.content?.trim(),
        cat: editFields.cat?.trim(),
        href: editFields.href?.trim(),
        publish_date: editFields.publish_date,
        is_featured: editFields.is_featured,
      });
      setBlogs(prev => prev.map(b => b.id === id ? res.data : b));
      setEditingBlogId(null);
      setEditFields({});
    } catch (err) {
      console.error(err);
      alert('Failed to update blog post.');
    } finally {
      setSubmittingEdit(false);
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
              <div className="admin-welcome-panel" style={{ padding: 0, overflow: 'hidden' }}>
                {blogs.map((item, idx) => {
                  const isExpanded = expandedBlogId === item.id;
                  const isEditing = editingBlogId === item.id;
                  return (
                    <div key={item.id} style={{ borderBottom: idx < blogs.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                      {/* Row header - click to expand */}
                      <div
                        onClick={() => { setExpandedBlogId(isExpanded ? null : item.id); if (isEditing) setEditingBlogId(null); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          style={{ width: '14px', height: '14px', color: 'var(--grey)', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                        <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(204,0,1,0.25)', padding: '3px 8px', borderRadius: '999px', background: 'rgba(204,0,1,0.05)', flexShrink: 0 }}>
                          {item.cat}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--white)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--grey-dark)', flexShrink: 0 }}>{item.date || item.publish_date}</span>
                        {item.is_featured && (
                          <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.1em', textTransform: 'uppercase', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)', padding: '3px 8px', borderRadius: '999px', background: 'rgba(34,197,94,0.05)', flexShrink: 0 }}>
                            Featured
                          </span>
                        )}
                      </div>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div style={{ padding: '0 20px 20px 46px', borderTop: '1px solid var(--line-soft)' }}>
                          {!isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px' }}>
                              <p style={{ fontSize: '13px', color: 'var(--grey)', lineHeight: '1.7' }}>{item.desc}</p>
                              {item.content && <p style={{ fontSize: '13px', color: 'var(--grey-dark)', lineHeight: '1.7', borderTop: '1px solid var(--line-soft)', paddingTop: '10px' }}>{item.content}</p>}
                              {item.href && <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--red)', textDecoration: 'underline', width: 'fit-content' }}>{item.href}</a>}
                              <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                                <button
                                  onClick={e => { e.stopPropagation(); setEditingBlogId(item.id); setEditFields({ title: item.title, desc: item.desc, content: item.content || '', cat: item.cat, href: item.href || '', publish_date: item.publish_date, is_featured: item.is_featured }); }}
                                  className="admin-btn"
                                  style={{ width: 'auto', marginTop: 0, padding: '6px 16px', fontSize: '12px' }}
                                >Edit</button>
                                <button
                                  onClick={e => { e.stopPropagation(); handleDeleteBlog(item.id); }}
                                  className="admin-btn"
                                  style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                                >Delete</button>
                              </div>
                            </div>
                          ) : (
                            <form onSubmit={e => handleEditBlog(e, item.id)} onClick={e => e.stopPropagation()}
                              style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                  <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Title</label>
                                  <input value={editFields.title} onChange={e => setEditFields(p => ({ ...p, title: e.target.value }))} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                  <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Category</label>
                                  <input value={editFields.cat} onChange={e => setEditFields(p => ({ ...p, cat: e.target.value }))} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                  <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Publication Date</label>
                                  <input type="date" value={editFields.publish_date} onChange={e => setEditFields(p => ({ ...p, publish_date: e.target.value }))} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                  <label style={{ fontSize: '11px', color: 'var(--grey)' }}>External Link (URL)</label>
                                  <input type="url" value={editFields.href} onChange={e => setEditFields(p => ({ ...p, href: e.target.value }))} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Short Description</label>
                                <textarea value={editFields.desc} onChange={e => setEditFields(p => ({ ...p, desc: e.target.value }))} rows={3} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Full Content (optional)</label>
                                <textarea value={editFields.content} onChange={e => setEditFields(p => ({ ...p, content: e.target.value }))} rows={5} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="checkbox" id={`feat-${item.id}`} checked={editFields.is_featured} onChange={e => setEditFields(p => ({ ...p, is_featured: e.target.checked }))} style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                                <label htmlFor={`feat-${item.id}`} style={{ fontSize: '13px', color: 'var(--white)', cursor: 'pointer' }}>Feature this post</label>
                              </div>
                              <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" disabled={submittingEdit} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '7px 20px', fontSize: '12px' }}>
                                  {submittingEdit ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button type="button" onClick={() => setEditingBlogId(null)} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '7px 20px', fontSize: '12px', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--grey)' }}>
                                  Cancel
                                </button>
                              </div>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
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
      case 'regions':
        return (
          <div style={{ width: '100%' }}>
            {!selectedRegion ? (
              <>
                <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 className="admin-welcome-title" style={{ margin: 0 }}>Manage Regions</h2>
                      <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                        Configure team members and contact information for each geographic region.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddRegionForm(!showAddRegionForm)}
                      className="admin-btn"
                      style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
                    >
                      {showAddRegionForm ? 'Cancel' : 'Add Region'}
                    </button>
                  </div>
                </div>

                {showAddRegionForm && (
                  <form onSubmit={handleAddRegion} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                    <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Region</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Region Name</label>
                        <input
                          type="text"
                          value={newRegionName}
                          onChange={(e) => {
                            setNewRegionName(e.target.value);
                            if (!newRegionSlug) setNewRegionSlug(slugifyRegion(e.target.value));
                          }}
                          placeholder="e.g. India"
                          style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Slug (URL key)</label>
                        <input
                          type="text"
                          value={newRegionSlug}
                          onChange={(e) => setNewRegionSlug(e.target.value)}
                          placeholder="e.g. india"
                          style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" disabled={submittingRegion} className="admin-btn" style={{ width: 'fit-content', marginTop: 0, padding: '10px 24px' }}>
                      {submittingRegion ? 'Creating...' : 'Create Region'}
                    </button>
                  </form>
                )}

                {loadingRegions ? (
                  <p style={{ color: 'var(--grey)' }}>Loading regions...</p>
                ) : regionsError ? (
                  <p style={{ color: 'var(--red)' }}>{regionsError}</p>
                ) : regions.length === 0 ? (
                  <p style={{ color: 'var(--grey)' }}>No regions yet. Click "Add Region" to create one.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
                    {regions.map((region) => (
                      <div key={region.id} className="admin-stat-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', opacity: region.is_active ? 1 : 0.6 }} onClick={() => loadRegionDetail(region)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 style={{ margin: 0, fontSize: '18px', color: 'var(--white)', fontWeight: '600' }}>{region.name}</h4>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', background: region.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: region.is_active ? '#4ade80' : '#f87171', border: `1px solid ${region.is_active ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                              {region.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <span className="admin-welcome-chip" style={{ fontSize: '10px' }}>{region.slug}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--grey)' }}>
                          <span>{region.team_count || 0} team member{(region.team_count || 0) !== 1 ? 's' : ''}</span>
                          <span>{region.has_contact ? 'Contact set' : 'No contact'}</span>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); loadRegionDetail(region); }}
                            className="admin-btn"
                            style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}
                          >
                            Manage
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleRegionActive(region); }}
                            className="admin-btn"
                            style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px', background: region.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: region.is_active ? '#f87171' : '#4ade80', border: `1px solid ${region.is_active ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}` }}
                          >
                            {region.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteRegion(region.id); }}
                            className="admin-btn"
                            style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                  <button
                    onClick={() => { setSelectedRegion(null); setTeamMembers([]); setShowAddTeamForm(false); }}
                    className="admin-btn"
                    style={{ width: 'auto', margin: '0 0 12px', padding: '6px 14px', fontSize: '12px', background: 'var(--line-soft)' }}
                  >
                    ← Back to Regions
                  </button>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>{selectedRegion.name}</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                    Slug: <code style={{ color: 'var(--red)' }}>{selectedRegion.slug}</code> — Manage contact info and team members for this region.
                  </p>
                </div>
                <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Contact Offices</h3>
                    <button onClick={() => setShowAddContactForm(!showAddContactForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                      {showAddContactForm ? 'Cancel' : 'Add Office'}
                    </button>
                  </div>

                  {showAddContactForm && (
                    <form onSubmit={handleAddContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Office Name
                          <input type="text" value={newOfficeName} onChange={e => setNewOfficeName(e.target.value)} required placeholder="Dubai HQ" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Phone
                          <input type="text" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} required placeholder="+971 4 346 6111" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Email
                          <input type="email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} required placeholder="middleeast@mindstec.com" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                        Address
                        <textarea value={newContactAddress} onChange={e => setNewContactAddress(e.target.value)} required placeholder="Full office address details..." rows="3" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }} />
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Map Embed URL
                          <input type="url" value={newContactMapEmbed} onChange={e => setNewContactMapEmbed(e.target.value)} placeholder="https://maps.google.com/..." style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Map Link (external)
                          <input type="url" value={newContactMapLink} onChange={e => setNewContactMapLink(e.target.value)} placeholder="https://www.google.com/maps/..." style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                      </div>
                      <button type="submit" disabled={submittingContact} className="admin-btn" style={{ width: 'fit-content', padding: '10px 24px' }}>
                        {submittingContact ? 'Adding...' : 'Add Contact Office'}
                      </button>
                    </form>
                  )}

                  {loadingContacts ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading office contacts...</p>
                  ) : contacts.length === 0 ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>No office contacts configured yet. Click "Add Office" to create one.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {contacts.map((contact) => (
                        <div key={contact.id} style={{ padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                          {editingContactId === contact.id ? (
                            <form onSubmit={e => handleEditContact(e, contact.id)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  Office Name
                                  <input type="text" value={editOfficeName} onChange={e => setEditOfficeName(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </label>
                                <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  Phone
                                  <input type="text" value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </label>
                                <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  Email
                                  <input type="email" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </label>
                              </div>
                              <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                Address
                                <textarea value={editContactAddress} onChange={e => setEditContactAddress(e.target.value)} required rows="3" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                              </label>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  Map Embed URL
                                  <input type="url" value={editContactMapEmbed} onChange={e => setEditContactMapEmbed(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </label>
                                <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  Map Link (external)
                                  <input type="url" value={editContactMapLink} onChange={e => setEditContactMapLink(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                                </label>
                              </div>
                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" disabled={submittingContact} className="admin-btn" style={{ width: 'fit-content', margin: 0, padding: '10px 24px' }}>
                                  {submittingContact ? 'Saving...' : 'Save Office Details'}
                                </button>
                                <button type="button" onClick={() => setEditingContactId(null)} className="admin-btn" style={{ width: 'fit-content', margin: 0, padding: '10px 24px', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--grey)' }}>
                                  Cancel
                                </button>
                              </div>
                            </form>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: 'var(--white)' }}>{contact.office_name || 'Unnamed Office'}</h4>
                                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--grey)' }}>Email: {contact.email} | Phone: {contact.phone}</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => {
                                    setEditingContactId(contact.id);
                                    setEditOfficeName(contact.office_name || '');
                                    setEditContactPhone(contact.phone || '');
                                    setEditContactEmail(contact.email || '');
                                    setEditContactAddress(contact.address || '');
                                    setEditContactMapEmbed(contact.map_embed_url || '');
                                    setEditContactMapLink(contact.map_link || '');
                                  }} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '11px' }}>
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteContact(contact.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>
                                    Remove
                                  </button>
                                </div>
                              </div>
                              <div style={{ fontSize: '13px', color: 'var(--grey)', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '10px', whiteSpace: 'pre-line' }}>
                                {contact.address}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Team Members */}
                <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Team Members</h3>
                    <button onClick={() => setShowAddTeamForm(!showAddTeamForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                      {showAddTeamForm ? 'Cancel' : 'Add Member'}
                    </button>
                  </div>

                  {showAddTeamForm && (
                    <form onSubmit={handleAddTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Name
                          <input type="text" value={newMemberName} onChange={e => setNewMemberName(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Role
                          <input type="text" value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                          Photo
                          <input type="file" accept="image/*" onChange={e => setNewMemberPhoto(e.target.files[0])} required style={{ color: 'var(--grey)', fontSize: '14px', padding: '4px 0' }} />
                        </label>
                      </div>
                      <button type="submit" disabled={submittingTeam} className="admin-btn" style={{ width: 'fit-content', padding: '10px 24px' }}>
                        {submittingTeam ? 'Uploading...' : 'Add Team Member'}
                      </button>
                    </form>
                  )}

                  {loadingTeam ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading team members...</p>
                  ) : teamMembers.length === 0 ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>No team members yet. Click "Add Member" to upload one.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                      {teamMembers.map((member) => (
                        <div key={member.id} style={{ padding: '14px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {editingMemberId === member.id ? (
                            <form onSubmit={e => handleEditTeamMember(e, member.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Name<input type="text" value={editMemberName} onChange={e => setEditMemberName(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                              <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Role<input type="text" value={editMemberRole} onChange={e => setEditMemberRole(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                              <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>New photo (optional)<input type="file" accept="image/*" onChange={e => setEditMemberPhoto(e.target.files[0])} style={{ color: 'var(--grey)', fontSize: '12px' }} /></label>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button type="submit" disabled={submittingMemberEdit} className="admin-btn" style={{ flex: 1, margin: 0, padding: '6px', fontSize: '11px' }}>{submittingMemberEdit ? 'Saving...' : 'Save'}</button>
                                <button type="button" onClick={() => setEditingMemberId(null)} className="admin-btn" style={{ flex: 1, margin: 0, padding: '6px', fontSize: '11px', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--grey)' }}>Cancel</button>
                              </div>
                            </form>
                          ) : (
                            <>
                              {member.photo && <img src={member.photo} alt={member.name} style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px' }} />}
                              <div>
                                <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: 'var(--white)' }}>{member.name}</h4>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>{member.role}</p>
                              </div>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button onClick={() => { setEditingMemberId(member.id); setEditMemberName(member.name); setEditMemberRole(member.role); setEditMemberPhoto(null); }} className="admin-btn" style={{ flex: 1, margin: 0, padding: '5px', fontSize: '11px' }}>Edit</button>
                                <button onClick={() => handleDeleteTeamMember(member.id)} className="admin-btn" style={{ flex: 1, margin: 0, padding: '5px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brands */}
                <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Brands</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>Brands shown in the "Brands we distribute" section on every solution page for this region.</p>
                    </div>
                    <button onClick={() => setShowAddBrandForm(!showAddBrandForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                      {showAddBrandForm ? 'Cancel' : 'Add Brand'}
                    </button>
                  </div>

                  {showAddBrandForm && (
                    <form onSubmit={handleAddBrand} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Brand Name
                          <input type="text" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="e.g. Christie" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Website URL (optional)
                          <input type="url" value={newBrandWebsite} onChange={e => setNewBrandWebsite(e.target.value)} placeholder="https://www.brand.com" style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Logo Image
                          <input type="file" accept="image/*" onChange={e => setNewBrandLogo(e.target.files[0])} style={{ color: 'var(--grey)', fontSize: '12px', padding: '4px 0' }} />
                        </label>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--grey)', fontWeight: '600' }}>Associated Solutions</span>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '4px' }}>
                          {solutions.length > 0 ? (
                            solutions.map(sol => (
                              <label key={sol.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--white)', cursor: 'pointer' }}>
                                <input
                                  type="checkbox"
                                  checked={selectedSolutions.includes(sol.id)}
                                  onChange={e => {
                                    if (e.target.checked) {
                                      setSelectedSolutions(prev => [...prev, sol.id]);
                                    } else {
                                      setSelectedSolutions(prev => prev.filter(id => id !== sol.id));
                                    }
                                  }}
                                />
                                {sol.title}
                              </label>
                            ))
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--grey)' }}>
                              Loading solutions...
                            </span>
                          )}
                        </div>
                      </div>

                      <button type="submit" disabled={submittingBrand} className="admin-btn" style={{ width: 'fit-content', margin: 0, padding: '8px 20px', fontSize: '12px' }}>
                        {submittingBrand ? 'Adding...' : 'Add Brand'}
                      </button>
                    </form>
                  )}

                  {loadingBrands ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading brands...</p>
                  ) : brands.length === 0 ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>No brands yet. Click "Add Brand" to add one.</p>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
                      {brands.map(brand => (
                        <div key={brand.id} style={{ padding: '12px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                          {brand.logo && <img src={brand.logo} alt={brand.name} style={{ width: '80px', height: '48px', objectFit: 'contain' }} />}
                          <span style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '600' }}>{brand.name}</span>
                          {brand.website_url && <a href={brand.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '10px', color: 'var(--grey)', wordBreak: 'break-all' }}>website</a>}
                          {brand.solutions && brand.solutions.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center', marginTop: '2px', marginBottom: '2px' }}>
                              {brand.solutions.map(solId => {
                                const sol = solutions.find(s => s.id === solId);
                                return (
                                  <span key={solId} style={{ fontSize: '9px', background: 'var(--line)', padding: '2px 6px', borderRadius: '4px', color: 'var(--grey)' }}>
                                    {sol ? sol.title : `Sol #${solId}`}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                          <button onClick={() => handleDeleteBrand(brand.id)} className="admin-btn" style={{ width: '100%', margin: 0, padding: '4px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Testimonials */}
                <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px', color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Client Testimonials</h3>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>Shown in the "What our clients say" section on the home page for this region.</p>
                    </div>
                    <button onClick={() => setShowAddTestimonialForm(!showAddTestimonialForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                      {showAddTestimonialForm ? 'Cancel' : 'Add Testimonial'}
                    </button>
                  </div>

                  {showAddTestimonialForm && (
                    <form onSubmit={handleAddTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Client Name
                          <input type="text" value={newTestiName} onChange={e => setNewTestiName(e.target.value)} placeholder="e.g. Rajesh Kumar" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Designation
                          <input type="text" value={newTestiDesignation} onChange={e => setNewTestiDesignation(e.target.value)} placeholder="e.g. Head of AV" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Company
                          <input type="text" value={newTestiCompany} onChange={e => setNewTestiCompany(e.target.value)} placeholder="e.g. Infosys Ltd." required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                        </label>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                          Photo (optional)
                          <input type="file" accept="image/*" onChange={e => setNewTestiPhoto(e.target.files[0])} style={{ color: 'var(--grey)', fontSize: '12px', padding: '4px 0' }} />
                        </label>
                      </div>
                      <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                        Message / Review
                        <textarea value={newTestiMessage} onChange={e => setNewTestiMessage(e.target.value)} placeholder="What did the client say about Mindstec?" rows={3} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                      </label>
                      <button type="submit" disabled={submittingTestimonial} className="admin-btn" style={{ width: 'fit-content', margin: 0, padding: '8px 20px', fontSize: '12px' }}>
                        {submittingTestimonial ? 'Saving...' : 'Save Testimonial'}
                      </button>
                    </form>
                  )}

                  {loadingTestimonials ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading testimonials...</p>
                  ) : testimonials.length === 0 ? (
                    <p style={{ color: 'var(--grey)', fontSize: '13px' }}>No testimonials yet. Click "Add Testimonial" to add one.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {testimonials.map(item => (
                        <div key={item.id} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, background: 'var(--ink)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {item.photo
                              ? <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--red)' }}>{item.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</span>
                            }
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: '13px', color: 'var(--white)' }}>{item.name}</strong>
                              <span style={{ fontSize: '11px', color: 'var(--grey)' }}>{item.designation}</span>
                              <span style={{ fontSize: '11px', color: 'var(--red)', fontWeight: '500' }}>{item.company}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)', lineHeight: '1.6', fontStyle: 'italic' }}>"{item.message}"</p>
                          </div>
                          <button onClick={() => handleDeleteTestimonial(item.id)} className="admin-btn" style={{ flexShrink: 0, width: 'auto', margin: 0, padding: '5px 10px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </>
            )}
          </div>
        );
      case 'documents':
        return <DocumentManager />;
      case 'gallery':
        return (
          <div style={{ width: '100%' }}>
            {/* Header Section */}
            <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 className="admin-welcome-title" style={{ margin: 0 }}>Gallery Manager</h2>
                  <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                    Upload and manage photos displayed on the public Gallery page.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddGalleryForm(!showAddGalleryForm)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
                >
                  {showAddGalleryForm ? 'Cancel' : 'Add Photo'}
                </button>
              </div>
            </div>

            {/* Add Gallery Item Form Drawer */}
            {showAddGalleryForm && (
              <form onSubmit={handleAddGalleryItem} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Gallery Photo</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Photo Title</label>
                    <input
                      type="text"
                      value={galTitle}
                      onChange={(e) => setGalTitle(e.target.value)}
                      placeholder="e.g. Annual Tech Summit 2024"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Category</label>
                    <input
                      type="text"
                      value={galCategory}
                      onChange={(e) => setGalCategory(e.target.value)}
                      placeholder="e.g. Annual Meet, Tech Workshop, Team Outing"
                      style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Photo Image File</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setGalImage(e.target.files[0])}
                    style={{ color: 'var(--grey)', fontSize: '14px', padding: '4px 0' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="submit"
                    className="admin-btn"
                    disabled={submittingGallery}
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
                  >
                    {submittingGallery ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddGalleryForm(false)}
                    className="admin-btn"
                    style={{ width: 'auto', marginTop: 0, padding: '10px 24px', background: 'var(--line-soft)', color: 'var(--white)', border: '1px solid var(--line)' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Gallery summary stat */}
            <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
              <div className="admin-stat-card">
                <p className="admin-stat-label">Total Photos</p>
                <p className="admin-stat-value">{galleryItems.length}</p>
                <p className="admin-stat-subtext">Uploaded to gallery</p>
              </div>
            </div>

            {/* Gallery Items Grid */}
            {loadingGallery ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading gallery items...</p>
            ) : galleryError ? (
              <p style={{ color: 'var(--red)', fontSize: '14px' }}>{galleryError}</p>
            ) : galleryItems.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No gallery items found. Click "Add Photo" to upload your first image.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {galleryItems.map((item) => (
                  <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px' }}>
                    <img
                      src={item.image}
                      alt={item.title}
                      style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
                    />
                    <div>
                      <span className="admin-welcome-chip" style={{ color: 'var(--red)', background: 'rgba(204,0,1,0.08)', border: '1px solid rgba(204,0,1,0.2)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                        {item.category}
                      </span>
                      <h4 style={{ margin: '8px 0 4px', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id)}
                        className="admin-btn"
                        style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                      >
                        Delete Photo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
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
              onClick={() => setActiveTab('gallery')}
              className={`admin-sidebar-link ${activeTab === 'gallery' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Gallery</span>
            </button>
            <button
              onClick={() => { setActiveTab('regions'); setSelectedRegion(null); }}
              className={`admin-sidebar-link ${activeTab === 'regions' ? 'active' : ''}`}
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Regions</span>
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
                  : activeTab === 'gallery'
                    ? 'Gallery Manager'
                    : activeTab === 'regions'
                      ? 'Region Management'
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

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          background: toast.type === 'success' ? 'rgba(6, 78, 59, 0.95)' : 'rgba(127, 29, 29, 0.95)',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '380px',
          animation: 'adminSlideIn 0.3s ease-out',
          color: '#ffffff'
        }}>
          <style>{`
            @keyframes adminSlideIn {
              from { transform: translateY(100px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
          {toast.type === 'success' ? (
            <svg style={{ width: '22px', height: '22px', color: '#10b981', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg style={{ width: '22px', height: '22px', color: '#ef4444', flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: '700', fontSize: '13.5px' }}>{toast.title}</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)' }}>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.5, cursor: 'pointer', padding: '4px', fontSize: '14px', marginLeft: 'auto', outline: 'none' }}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}


