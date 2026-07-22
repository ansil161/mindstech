import { useState, useEffect, useCallback } from 'react';
import teamService from '../services/teamService';
import notify from '../utils/notify';

export function useTeam() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(false);

  // Add form
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberPhoto, setNewMemberPhoto] = useState(null);
  const [submittingTeam, setSubmittingTeam] = useState(false);

  // Edit form
  const [editingMemberId, setEditingMemberId] = useState(null);
  const [editMemberName, setEditMemberName] = useState('');
  const [editMemberRole, setEditMemberRole] = useState('');
  const [editMemberPhoto, setEditMemberPhoto] = useState(null);
  const [submittingMemberEdit, setSubmittingMemberEdit] = useState(false);

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

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

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
    editTeamMember,

    refresh: fetchTeamMembers,
  };
}

export default useTeam;
