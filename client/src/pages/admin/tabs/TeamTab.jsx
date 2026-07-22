import React from 'react';
import useTeam from '../hooks/useTeam';

export default function TeamTab() {
  const {
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
  } = useTeam();

  return (
    <div style={{ width: '100%' }}>
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Manage Team</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              This team list is shown on the About page for every region.
            </p>
          </div>
          <button
            onClick={() => setShowAddTeamForm(!showAddTeamForm)}
            className="admin-btn"
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
          >
            {showAddTeamForm ? 'Cancel' : 'Add Member'}
          </button>
        </div>
      </div>

      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        {showAddTeamForm && (
          <form onSubmit={addTeamMember} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
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
                  <form onSubmit={e => editTeamMember(e, member.id)} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                      <button onClick={() => deleteTeamMember(member.id)} className="admin-btn" style={{ flex: 1, margin: 0, padding: '5px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
