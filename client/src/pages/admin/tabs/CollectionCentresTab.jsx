import React from 'react';
import useCollectionCentres from '../hooks/useCollectionCentres';

export default function CollectionCentresTab() {
  const {
    collectionCentres,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    newCentre,
    setNewCentre,
    addCollectionCentre,
    toggleActive,
    deleteCollectionCentre,
  } = useCollectionCentres();

  return (
    <div style={{ width: '100%' }}>
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>E-Waste Collection Centres</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>Manage the centres displayed on the public E-Waste page.</p>
          </div>
          <button onClick={() => setShowAddForm(prev => !prev)} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}>
            {showAddForm ? 'Cancel' : 'Add Collection Centre'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={addCollectionCentre} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
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
          <button type="submit" disabled={submitting} className="admin-btn" style={{ width: 'fit-content', marginTop: 0, padding: '10px 24px' }}>{submitting ? 'Saving...' : 'Save Collection Centre'}</button>
        </form>
      )}

      {loading ? <p style={{ color: 'var(--grey)' }}>Loading collection centres...</p> : error ? <p style={{ color: 'var(--red)' }}>{error}</p> : (
        <div style={{ overflowX: 'auto' }} className="admin-welcome-panel">
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px', textAlign: 'left' }}>
            <thead><tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--grey)', fontSize: '11px', textTransform: 'uppercase' }}><th style={{ padding: '12px' }}>City</th><th style={{ padding: '12px' }}>Operator</th><th style={{ padding: '12px' }}>Address</th><th style={{ padding: '12px' }}>Contact</th><th style={{ padding: '12px' }}>Status</th><th style={{ padding: '12px' }}>Actions</th></tr></thead>
            <tbody>{collectionCentres.map(centre => <tr key={centre.id} style={{ borderBottom: '1px solid var(--line-soft)', fontSize: '13px' }}><td style={{ padding: '12px', fontWeight: '600' }}>{centre.city}</td><td style={{ padding: '12px' }}>{centre.operator}</td><td style={{ padding: '12px', color: 'var(--grey)', maxWidth: '280px' }}>{centre.address}</td><td style={{ padding: '12px' }}>{centre.contact_name}<br /><span style={{ color: 'var(--grey)' }}>{centre.phone}</span></td><td style={{ padding: '12px' }}><button onClick={() => toggleActive(centre)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '5px 10px', fontSize: '11px', background: centre.is_active ? '#f0fdf4' : '#fef2f2', color: centre.is_active ? '#16a34a' : '#dc2626', border: centre.is_active ? '1px solid #dcfce7' : '1px solid #fee2e2' }}>{centre.is_active ? 'Active' : 'Inactive'}</button></td><td style={{ padding: '12px' }}><button onClick={() => deleteCollectionCentre(centre.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '5px 10px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Delete</button></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
