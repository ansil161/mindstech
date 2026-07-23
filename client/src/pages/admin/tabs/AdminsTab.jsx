import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import useAdminUsers from '../hooks/useAdminUsers';

export default function AdminsTab() {
  const { user } = useAuth();
  const {
    admins,
    loading,
    error,
    showAddForm,
    setShowAddForm,
    newEmail,
    setNewEmail,
    newPassword,
    setNewPassword,
    newFirstName,
    setNewFirstName,
    newLastName,
    setNewLastName,
    submitting,
    addAdmin,
    toggleAdminActive,
    deleteAdmin,
  } = useAdminUsers();

  return (
    <div style={{ width: '100%' }}>
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Admin Access</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              Create, block, or remove admin dashboard accounts. Only superusers can access this screen.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="admin-btn"
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
          >
            {showAddForm ? 'Cancel' : 'Add Admin'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={addAdmin} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Admin</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Email</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="name@mindstec.com"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Temporary password"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>First Name</label>
              <input
                type="text"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
                placeholder="Optional"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Last Name</label>
              <input
                type="text"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
                placeholder="Optional"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
              />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="admin-btn" style={{ width: 'fit-content', marginTop: 0, padding: '10px 24px' }}>
            {submitting ? 'Creating...' : 'Create Admin'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: 'var(--grey)' }}>Loading admins...</p>
      ) : error ? (
        <p style={{ color: 'var(--red)' }}>{error}</p>
      ) : admins.length === 0 ? (
        <p style={{ color: 'var(--grey)' }}>No admins yet. Click "Add Admin" to create one.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {admins.map((admin) => {
            const isSelf = admin.id === user?.id;
            return (
              <div key={admin.id} className="admin-stat-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', opacity: admin.is_active ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--white)', fontWeight: '600', wordBreak: 'break-word' }}>
                    {[admin.first_name, admin.last_name].filter(Boolean).join(' ') || admin.email}
                  </h4>
                  <span style={{ fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '999px', background: admin.is_active ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: admin.is_active ? '#4ade80' : '#f87171', border: `1px solid ${admin.is_active ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
                    {admin.is_active ? 'Active' : 'Blocked'}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px', color: 'var(--grey)' }}>
                  <span>{admin.email}</span>
                  {admin.is_superuser && <span className="admin-welcome-chip" style={{ fontSize: '10px', width: 'fit-content' }}>Superuser</span>}
                  {isSelf && <span style={{ fontSize: '11px' }}>(You)</span>}
                </div>
                {!isSelf && (
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--line-soft)', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleAdminActive(admin)}
                      className="admin-btn"
                      style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px', background: admin.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: admin.is_active ? '#f87171' : '#4ade80', border: `1px solid ${admin.is_active ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}` }}
                    >
                      {admin.is_active ? 'Block' : 'Unblock'}
                    </button>
                    <button
                      onClick={() => deleteAdmin(admin)}
                      className="admin-btn"
                      style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
