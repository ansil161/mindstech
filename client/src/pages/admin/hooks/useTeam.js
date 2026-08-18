import { useState, useEffect, useCallback } from 'react';
import teamService from '../services/teamService';
import notify from '../utils/notify';

export function useTeam() {
  // Team members
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Team Add form
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Team Edit form
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberPhoto, setEditMemberPhoto] = useState(null);
  const [submittingMemberEdit, setSubmittingMemberEdit] = useState(false);
  const [reorderingTeam, setReorderingTeam] = useState(false);

  // Testimonials
  const [testimonials, setTestimonials] = useState([]);
  const [loadingTestimonials, setLoadingTestimonials] = useState(false);
  const [showAddTestimonialForm, setShowAddTestimonialForm] = useState(false);
  const [newTestiName, setNewTestiName] = useState('');
  const [newTestiDesignation, setNewTestiDesignation] = useState('');
  const [newTestiCompany, setNewTestiCompany] = useState('');
  const [newTestiMessage, setNewTestiMessage] = useState('');
  const [newTestiPhoto, setNewTestiPhoto] = useState(null);
  const [submittingTestimonial, setSubmittingTestimonial] = useState(false);

  const fetchTeamMembers = useCallback(async () => {
    setLoadingTeam(true);
    try {
      const res = await teamService.getTeamMembers();
      setTeamMembers(res.data);
    } catch (err) {
      console.error(err);
      notify('Failed to load team members.');
    } finally {
      setLoadingTeam(false);
    }
  }, []);

  const fetchTestimonials = useCallback(async () => {
    setLoadingTestimonials(true);
    try {
      const res = await teamService.getTestimonials();
      setTestimonials(res.data || []);
    } catch (err) {
      console.error(err);
      notify('Failed to load testimonials.');
    } finally {
      setLoadingTestimonials(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
    fetchTestimonials();
  }, [fetchTeamMembers, fetchTestimonials]);

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
      const res = await teamService.addTeamMember(formData);
      setTeamMembers((prev) => [...prev, res.data]);
      setNewMemberName('');
      setNewMemberRole('');
      setNewMemberPhoto(null);
      setShowAddTeamForm(false);
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
      await teamService.deleteTeamMember(id);
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      notify('Team member deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete team member.');
    }
  };

  /**
   * Move a member one place up or down the published order.
   *
   * The About page renders whatever `GET /admin/public/team/` returns, which is
   * ordered by `display_order` then `created_at`. Until now nothing in the CMS
   * could write `display_order` after creation, so the running order was fixed
   * at whatever sequence people happened to be added in — which is why the
   * founder sat second with no way to fix it without a developer.
   *
   * Renormalises the whole list to 0..n-1 rather than swapping two values:
   * rows created before ordering was editable all carry `display_order: 0`, so
   * a plain two-row swap would leave those ties intact and the list would
   * spring back to creation order on the next load. Only rows whose position
   * actually changed are sent, so after the first move this is two requests.
   */
  const moveTeamMember = async (memberId, direction) => {
    const from = teamMembers.findIndex((m) => m.id === memberId);
    const to = from + (direction === 'up' ? -1 : 1);
    if (from === -1 || to < 0 || to >= teamMembers.length) return;

    const reordered = [...teamMembers];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];

    // Optimistic: reordering is the entire point of the interaction, so it has
    // to feel immediate. Rolled back below if the save fails.
    const previous = teamMembers;
    const stale = reordered.filter((m, i) => m.display_order !== i);
    setTeamMembers(reordered.map((m, i) => ({ ...m, display_order: i })));
    setReorderingTeam(true);

    try {
      await Promise.all(
        stale.map((m) => {
          const fd = new FormData();
          fd.append('display_order', String(reordered.indexOf(m)));
          return teamService.updateTeamMember(m.id, fd);
        })
      );
    } catch (err) {
      console.error(err);
      setTeamMembers(previous);
      notify('Could not save the new order. Please try again.');
    } finally {
      setReorderingTeam(false);
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
      const res = await teamService.updateTeamMember(memberId, fd);
      setTeamMembers((prev) => prev.map((m) => (m.id === memberId ? res.data : m)));
      setEditingMemberId(null);
      notify('Team member updated successfully.');
    } catch (err) {
      notify(`Failed to update: ${JSON.stringify(err.response?.data || err.message)}`);
    } finally {
      setSubmittingMemberEdit(false);
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
      const res = await teamService.addTestimonial(fd);
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
      await teamService.deleteTestimonial(id);
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
      notify('Testimonial deleted successfully.');
    } catch (err) {
      notify('Failed to delete testimonial.');
    }
  };

  return {
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
    reorderingTeam,
    moveTeamMember,
    editTeamMember,

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

    refresh: () => {
      fetchTeamMembers();
      fetchTestimonials();
    },
  };
}

export default useTeam;

