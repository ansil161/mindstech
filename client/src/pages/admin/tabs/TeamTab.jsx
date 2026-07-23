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
  } = useTeam();

  return (
    <div style={{ width: '100%' }}>
      {/* ── Section 1: Team Members ── */}
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

      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '32px' }}>
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

      {/* ── Section 2: Client Testimonials ── */}
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Client Testimonials</h3>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>Shown in the "What our clients say" section on the home page for all regions.</p>
          </div>
          <button onClick={() => setShowAddTestimonialForm(!showAddTestimonialForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
            {showAddTestimonialForm ? 'Cancel' : 'Add Testimonial'}
          </button>
        </div>

        {showAddTestimonialForm && (
          <form onSubmit={addTestimonial} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
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
                <button onClick={() => deleteTestimonial(item.id)} className="admin-btn" style={{ flexShrink: 0, width: 'auto', margin: 0, padding: '5px 10px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

