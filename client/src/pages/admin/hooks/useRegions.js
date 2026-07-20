import { useState, useEffect, useCallback } from 'react';
import regionService from '../services/regionService';
import solutionService from '../services/solutionService';
import notify from '../utils/notify';

const slugifyRegion = (name) =>
  name.toLowerCase().replace(/ \/ /g, '-').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '');

export function useRegions() {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState(null);

  // Sub-data states
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [allSolutions, setAllSolutions] = useState([]);

  // Form states
  const [showAddRegionForm, setShowAddRegionForm] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionSlug, setNewRegionSlug] = useState('');
  const [newRegionParent, setNewRegionParent] = useState('');
  const [submittingRegion, setSubmittingRegion] = useState(false);

  // Team Form & Edit
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [submittingTeam, setSubmittingTeam] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberPhoto, setEditMemberPhoto] = useState(null);
  const [submittingMemberEdit, setSubmittingMemberEdit] = useState(false);

  // Brand Form
  const [showAddBrandForm, setShowAddBrandForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandWebsite, setNewBrandWebsite] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState(null);
  const [selectedSolutions, setSelectedSolutions] = useState([]);
  const [submittingBrand, setSubmittingBrand] = useState(false);

  // Contact Form & Edit
  const [showAddContactForm, setShowAddContactForm] = useState(false);
  const [newOfficeName, setNewOfficeName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactAddress, setNewContactAddress] = useState('');
  const [newContactMapEmbed, setNewContactMapEmbed] = useState('');
  const [newContactMapLink, setNewContactMapLink] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);
  const [editingContactId, setEditingContactId] = useState(null);
  const [editOfficeName, setEditOfficeName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactEmail, setEditContactEmail] = useState('');
  const [editContactAddress, setEditContactAddress] = useState('');
  const [editContactMapEmbed, setEditContactMapEmbed] = useState('');
  const [editContactMapLink, setEditContactMapLink] = useState('');

  // Testimonial Form
  const [showAddTestimonialForm, setShowAddTestimonialForm] = useState(false);
  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiDesignation, setNewTestiDesignation] = useState('');
  const [newTestiCompany, setNewTestiCompany] = useState('');
  const [newTestiMessage, setNewTestiMessage] = useState('');
  const [newTestiPhoto, setNewTestiPhoto] = useState(null);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await regionService.getRegions();
      setRegions(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load regions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegions();
    solutionService.getAll().then((data) => setAllSolutions(data)).catch(() => {});
  }, [fetchRegions]);

  const loadRegionDetail = async (region) => {
    setSelectedRegion(region);
    setLoadingTeam(true);
    setLoadingContacts(true);
    setLoadingBrands(true);
    setLoadingTestimonials(true);
    try {
      const [teamRes, contactsRes, brandsRes, testiRes] = await Promise.all([
        regionService.getTeamMembers(region.id),
        regionService.getRegionContacts(region.id),
        regionService.getBrands(region.id),
        regionService.getTestimonials(region.id),
      ]);
      setTeamMembers(teamRes.data);
      setContacts(contactsRes.data || []);
      setBrands(brandsRes.data || []);
      setTestimonials(testiRes.data || []);
    } catch (err) {
      console.error(err);
      notify('Failed to load region details.');
    } finally {
      setLoadingTeam(false);
      setLoadingContacts(false);
      setLoadingBrands(false);
      setLoadingTestimonials(false);
    }
  };

  const addRegion = async (e) => {
    e.preventDefault();
    if (!newRegionName.trim()) {
      notify('Please enter a region name.');
      return;
    }
    const slug = newRegionSlug.trim() || slugifyRegion(newRegionName);
    setSubmittingRegion(true);
    try {
      const payload = { name: newRegionName.trim(), slug, display_order: regions.length };
      if (newRegionParent) payload.parent = newRegionParent;
      const res = await regionService.createRegion(payload);
      setRegions((prev) => [...prev, res.data]);
      setNewRegionName('');
      setNewRegionSlug('');
      setNewRegionParent('');
      setShowAddRegionForm(false);
      notify('Region created successfully.');
    } catch (err) {
      console.error(err);
      notify(`Failed to create region: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingRegion(false);
    }
  };

  const deleteRegion = async (id) => {
    if (!window.confirm('Delete this region and all its team members and contact info?')) return;
    try {
      await regionService.deleteRegion(id);
      setRegions((prev) => prev.filter((r) => r.id !== id));
      if (selectedRegion?.id === id) setSelectedRegion(null);
      notify('Region deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete region.');
    }
  };

  const toggleRegionActive = async (region) => {
    try {
      const res = await regionService.updateRegion(region.id, { is_active: !region.is_active });
      setRegions((prev) => prev.map((r) => (r.id === region.id ? { ...r, is_active: res.data.is_active } : r)));
      if (selectedRegion?.id === region.id) setSelectedRegion((p) => ({ ...p, is_active: res.data.is_active }));
      notify('Region status updated.');
    } catch (err) {
      notify('Failed to toggle region status.');
    }
  };

  // Team Member actions
  const addTeamMember = async (e) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim() || !newMemberPhoto) {
      notify('Please fill out name, role, and upload a photo.');
      return;
    }
    setSubmittingTeam(true);
    const formData = new FormData();
    formData.append('name', newMemberName.trim());
    formData.append('role', newMemberRole.trim());
    formData.append('photo', newMemberPhoto);
    formData.append('display_order', teamMembers.length);
    formData.append('is_active', 'true');
    try {
      const res = await regionService.addTeamMember(selectedRegion.id, formData);
      setTeamMembers((prev) => [...prev, res.data]);
      setNewMemberName('');
      setNewMemberRole('');
      setNewMemberPhoto(null);
      setShowAddTeamForm(false);
      setRegions((prev) => prev.map((r) => (r.id === selectedRegion.id ? { ...r, team_count: (r.team_count || 0) + 1 } : r)));
      notify('Team member added successfully.');
    } catch (err) {
      console.error(err);
      notify(`Failed to add team member: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingTeam(false);
    }
  };

  const deleteTeamMember = async (id) => {
    if (!window.confirm('Delete this team member?')) return;
    try {
      await regionService.deleteTeamMember(id);
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      setRegions((prev) => prev.map((r) => (r.id === selectedRegion.id ? { ...r, team_count: Math.max(0, (r.team_count || 1) - 1) } : r)));
      notify('Team member deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete team member.');
    }
  };

  const editTeamMember = async (e, memberId) => {
    e.preventDefault();
    if (!editMemberName.trim() || !editMemberRole.trim()) {
      notify('Name and role are required.');
      return;
    }
    setSubmittingMemberEdit(true);
    const fd = new FormData();
    fd.append('name', editMemberName.trim());
    fd.append('role', editMemberRole.trim());
    if (editMemberPhoto) fd.append('photo', editMemberPhoto);
    try {
      const res = await regionService.updateTeamMember(memberId, fd);
      setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? res.data : m)));
      setEditingMemberId(null);
      notify('Team member updated successfully.');
    } catch (err) {
      notify(`Failed to update: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingMemberEdit(false);
    }
  };

  // Brand actions
  const addBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      notify('Brand name is required.');
      return;
    }
    setSubmittingBrand(true);
    const fd = new FormData();
    fd.append('name', newBrandName.trim());
    fd.append('website_url', newBrandWebsite.trim());
    fd.append('display_order', brands.length);
    fd.append('is_active', 'true');
    if (newBrandLogo) fd.append('logo', newBrandLogo);
    selectedSolutions.forEach((id) => {
      fd.append('solutions', id);
    });
    try {
      const res = await regionService.addBrand(selectedRegion.id, fd);
      setBrands((prev) => [...prev, res.data]);
      setNewBrandName('');
      setNewBrandWebsite('');
      setNewBrandLogo(null);
      setSelectedSolutions([]);
      setShowAddBrandForm(false);
      notify('Brand added successfully.');
    } catch (err) {
      notify(`Failed to add brand: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingBrand(false);
    }
  };

  const deleteBrand = async (id) => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      await regionService.deleteBrand(id);
      setBrands((prev) => prev.filter((b) => b.id !== id));
      notify('Brand deleted successfully.');
    } catch (err) {
      notify('Failed to delete brand.');
    }
  };

  // Contact actions
  const addContact = async (e) => {
    e.preventDefault();
    if (!newOfficeName.trim() || !newContactAddress.trim() || !newContactEmail.trim() || !newContactPhone.trim()) {
      notify('Please fill out office name, address, email, and phone.');
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
      const res = await regionService.createRegionContact(selectedRegion.id, data);
      setContacts((prev) => [...prev, res.data]);
      setNewOfficeName('');
      setNewContactPhone('');
      setNewContactEmail('');
      setNewContactAddress('');
      setNewContactMapEmbed('');
      setNewContactMapLink('');
      setShowAddContactForm(false);
      setRegions((prev) => prev.map((r) => (r.id === selectedRegion.id ? { ...r, has_contact: true } : r)));
      notify('Contact office added successfully.');
    } catch (err) {
      console.error(err);
      notify(`Failed to add contact office: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingContact(false);
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('Delete this contact office?')) return;
    try {
      await regionService.deleteRegionContactDetail(id);
      setContacts((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          setRegions((rPrev) => rPrev.map((r) => (r.id === selectedRegion.id ? { ...r, has_contact: false } : r)));
        }
        return next;
      });
      notify('Contact office deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete contact office.');
    }
  };

  const editContact = async (e, id) => {
    e.preventDefault();
    if (!editOfficeName.trim() || !editContactAddress.trim() || !editContactEmail.trim() || !editContactPhone.trim()) {
      notify('Office name, address, email, and phone are required.');
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
      const res = await regionService.updateRegionContactDetail(id, data);
      setContacts((prev) => prev.map((c) => (c.id === id ? res.data : c)));
      setEditingContactId(null);
      notify('Contact office updated successfully.');
    } catch (err) {
      notify(`Failed to update contact office: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingContact(false);
    }
  };

  // Testimonial actions
  const addTestimonial = async (e) => {
    e.preventDefault();
    if (!newTestiName.trim() || !newTestiDesignation.trim() || !newTestiCompany.trim() || !newTestiMessage.trim()) {
      notify('Name, designation, company and message are required.');
      return;
    }
    setSubmittingTestimonial(true);
    const fd = new FormData();
    fd.append('name', newTestiName.trim());
    fd.append('designation', newTestiDesignation.trim());
    fd.append('company', newTestiCompany.trim());
    fd.append('message', newTestiMessage.trim());
    fd.append('display_order', testimonials.length);
    fd.append('is_active', 'true');
    if (newTestiPhoto) fd.append('photo', newTestiPhoto);
    try {
      const res = await regionService.addTestimonial(selectedRegion.id, fd);
      setTestimonials((prev) => [...prev, res.data]);
      setNewTestiName('');
      setNewTestiDesignation('');
      setNewTestiCompany('');
      setNewTestiMessage('');
      setNewTestiPhoto(null);
      setShowAddTestimonialForm(false);
      notify('Testimonial added successfully.');
    } catch (err) {
      notify(`Failed to add testimonial: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingTestimonial(false);
    }
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await regionService.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      notify('Testimonial deleted successfully.');
    } catch (err) {
      notify('Failed to delete testimonial.');
    }
  };

  return {
    regions,
    loading,
    error,
    selectedRegion,
    setSelectedRegion,
    loadRegionDetail,
    slugifyRegion,
    addRegion,
    deleteRegion,
    toggleRegionActive,
    showAddRegionForm,
    setShowAddRegionForm,
    newRegionName,
    setNewRegionName,
    newRegionSlug,
    setNewRegionSlug,
    newRegionParent,
    setNewRegionParent,
    submittingRegion,

    // Team
    teamMembers,
    loadingTeam,
    showAddTeamForm,
    setShowAddTeamForm,
    newMemberName,
    setNewMemberName,
    newMemberRole,
    setNewMemberRole,
    setNewMemberPhoto,
    submittingTeam,
    addTeamMember,
    deleteTeamMember,
    editingMemberId,
    setEditingMemberId,
    editMemberName,
    setEditMemberName,
    editMemberRole,
    setEditMemberRole,
    setEditMemberPhoto,
    submittingMemberEdit,
    editTeamMember,

    // Brands
    brands,
    loadingBrands,
    showAddBrandForm,
    setShowAddBrandForm,
    newBrandName,
    setNewBrandName,
    newBrandWebsite,
    setNewBrandWebsite,
    setNewBrandLogo,
    selectedSolutions,
    setSelectedSolutions,
    allSolutions,
    submittingBrand,
    addBrand,
    deleteBrand,

    // Contacts
    contacts,
    loadingContacts,
    showAddContactForm,
    setShowAddContactForm,
    newOfficeName,
    setNewOfficeName,
    newContactPhone,
    setNewContactPhone,
    newContactEmail,
    setNewContactEmail,
    newContactAddress,
    setNewContactAddress,
    newContactMapEmbed,
    setNewContactMapEmbed,
    newContactMapLink,
    setNewContactMapLink,
    submittingContact,
    addContact,
    deleteContact,
    editingContactId,
    setEditingContactId,
    editOfficeName,
    setEditOfficeName,
    editContactPhone,
    setEditContactPhone,
    editContactEmail,
    setEditContactEmail,
    editContactAddress,
    setEditContactAddress,
    editContactMapEmbed,
    setEditContactMapEmbed,
    editContactMapLink,
    setEditContactMapLink,
    editContact,

    // Testimonials
    testimonials,
    loadingTestimonials,
    showAddTestimonialForm,
    setShowAddTestimonialForm,
    newTestiName,
    setNewTestiName,
    newTestiDesignation,
    setNewTestiDesignation,
    newTestiCompany,
    setNewTestiCompany,
    newTestiMessage,
    setNewTestiMessage,
    setNewTestiPhoto,
    submittingTestimonial,
    addTestimonial,
    deleteTestimonial,

    refresh: fetchRegions,
  };
}

export default useRegions;
