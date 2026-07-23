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
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [allSolutions, setAllSolutions] = useState([]);

  // Form states
  const [showAddRegionForm, setShowAddRegionForm] = useState(false);
  const [newRegionName, setNewRegionName] = useState('');
  const [newRegionSlug, setNewRegionSlug] = useState('');
  const [newRegionParent, setNewRegionParent] = useState('');
  const [submittingRegion, setSubmittingRegion] = useState(false);

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
    setLoadingContacts(true);
    setLoadingBrands(true);
    try {
      const [contactsRes, brandsRes] = await Promise.all([
        regionService.getRegionContacts(region.id),
        regionService.getBrands(region.id),
      ]);
      setContacts(contactsRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (err) {
      console.error(err);
      notify('Failed to load region details.');
    } finally {
      setLoadingContacts(false);
      setLoadingBrands(false);
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
    if (!window.confirm('Delete this region and all its contact info and brands?')) return;
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

    refresh: fetchRegions,
  };
}

export default useRegions;

