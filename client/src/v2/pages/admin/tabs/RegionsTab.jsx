import React from 'react';
import useRegions from '../hooks/useRegions';

export default function RegionsTab() {
  const {
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
  } = useRegions();

  return (
    <div style={{ width: '100%' }}>
      {!selectedRegion ? (
        <>
          <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 className="admin-welcome-title" style={{ margin: 0 }}>Manage Regions</h2>
                <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
                  Select a region to manage its brands and contact info, or add a new region.
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

          <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
            {showAddRegionForm && (
              <form onSubmit={addRegion} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                    Region Name
                    <input type="text" value={newRegionName} onChange={e => { setNewRegionName(e.target.value); setNewRegionSlug(slugifyRegion(e.target.value)); }} placeholder="e.g. India" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                    URL Slug
                    <input type="text" value={newRegionSlug} onChange={e => setNewRegionSlug(e.target.value)} placeholder="e.g. india" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--grey)' }}>
                    Parent Region (Optional)
                    <select value={newRegionParent} onChange={e => setNewRegionParent(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}>
                      <option value="">None (Top-Level Region)</option>
                      {regions.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button type="submit" disabled={submittingRegion} className="admin-btn" style={{ width: 'fit-content', padding: '10px 24px' }}>
                  {submittingRegion ? 'Creating...' : 'Create Region'}
                </button>
              </form>
            )}

            {loading ? (
              <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading regions...</p>
            ) : error ? (
              <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {regions.map(region => (
                  <div
                    key={region.id}
                    onClick={() => loadRegionDetail(region)}
                    style={{ padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)', cursor: 'pointer', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--white)', fontWeight: '600' }}>{region.name}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--grey)' }}>slug: {region.slug}</span>
                      </div>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '11px', background: region.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: region.is_active ? '#22c55e' : '#ef4444', border: `1px solid ${region.is_active ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                        {region.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--grey)', border: '1px solid var(--line)' }}>
                        {region.has_contact ? '✓ Contact Info' : 'No Contact Info'}
                      </span>
                      {region.sub_regions && region.sub_regions.length > 0 && (
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'var(--ink)', color: 'var(--grey)', border: '1px solid var(--line)' }}>
                          {region.sub_regions.length} Sub-region{region.sub_regions.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }} onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => toggleRegionActive(region)}
                        className="admin-btn"
                        style={{ flex: 1, margin: 0, padding: '6px', fontSize: '11px', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--grey)' }}
                      >
                        {region.is_active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteRegion(region.id)}
                        className="admin-btn"
                        style={{ flex: 1, margin: 0, padding: '6px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="admin-btn"
                  style={{ width: 'auto', margin: '0 0 12px', padding: '4px 12px', fontSize: '12px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}
                >
                  ← Back to Regions
                </button>
                <h2 className="admin-welcome-title" style={{ margin: 0 }}>Managing: {selectedRegion.name}</h2>
                <p className="admin-welcome-desc" style={{ margin: '4px 0 0' }}>slug: {selectedRegion.slug}</p>
              </div>
            </div>
          </div>

          {/* Contact Offices */}
          <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Contact Offices</h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>Address and phone shown on the Contact page when {selectedRegion.name} is selected.</p>
              </div>
              <button onClick={() => setShowAddContactForm(!showAddContactForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                {showAddContactForm ? 'Cancel' : 'Add Contact Office'}
              </button>
            </div>

            {showAddContactForm && (
              <form onSubmit={addContact} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Office Name
                    <input type="text" value={newOfficeName} onChange={e => setNewOfficeName(e.target.value)} placeholder="e.g. Mindstec India HQ" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Phone Number
                    <input type="text" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} placeholder="e.g. +91 80 4123 4567" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Email Address
                    <input type="email" value={newContactEmail} onChange={e => setNewContactEmail(e.target.value)} placeholder="e.g. india@mindstec.com" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                </div>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                  Full Physical Address
                  <textarea value={newContactAddress} onChange={e => setNewContactAddress(e.target.value)} placeholder="Building, Street, City, Pincode" rows={2} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Google Maps Embed URL (optional)
                    <input type="text" value={newContactMapEmbed} onChange={e => setNewContactMapEmbed(e.target.value)} placeholder="https://www.google.com/maps/embed?pb=..." style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Google Maps Link URL (optional)
                    <input type="text" value={newContactMapLink} onChange={e => setNewContactMapLink(e.target.value)} placeholder="https://maps.google.com/?q=..." style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                </div>
                <button type="submit" disabled={submittingContact} className="admin-btn" style={{ width: 'fit-content', margin: 0, padding: '8px 20px', fontSize: '12px' }}>
                  {submittingContact ? 'Saving...' : 'Save Contact Office'}
                </button>
              </form>
            )}

            {loadingContacts ? (
              <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading contacts...</p>
            ) : contacts.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: '13px' }}>No contact offices for this region. Click "Add Contact Office" to create one.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {contacts.map(c => (
                  <div key={c.id} style={{ padding: '14px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                    {editingContactId === c.id ? (
                      <form onSubmit={e => editContact(e, c.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Office Name<input type="text" value={editOfficeName} onChange={e => setEditOfficeName(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                          <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Phone<input type="text" value={editContactPhone} onChange={e => setEditContactPhone(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                          <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Email<input type="email" value={editContactEmail} onChange={e => setEditContactEmail(e.target.value)} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                        </div>
                        <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Address<textarea value={editContactAddress} onChange={e => setEditContactAddress(e.target.value)} rows={2} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Map Embed URL<input type="text" value={editContactMapEmbed} onChange={e => setEditContactMapEmbed(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                          <label style={{ fontSize: '11px', color: 'var(--grey)', display: 'flex', flexDirection: 'column', gap: '4px' }}>Map Link URL<input type="text" value={editContactMapLink} onChange={e => setEditContactMapLink(e.target.value)} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '8px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} /></label>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" disabled={submittingContact} className="admin-btn" style={{ width: 'auto', padding: '6px 16px', fontSize: '12px' }}>{submittingContact ? 'Saving...' : 'Save Changes'}</button>
                          <button type="button" onClick={() => setEditingContactId(null)} className="admin-btn" style={{ width: 'auto', padding: '6px 16px', fontSize: '12px', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--grey)' }}>Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                        <div>
                          {c.office_name && <h4 style={{ margin: '0 0 4px', color: 'var(--white)', fontSize: '14px' }}>{c.office_name}</h4>}
                          <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'var(--white)' }}>{c.address}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>📞 {c.phone_display || c.phone} | ✉ {c.email}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                          <button
                            onClick={() => {
                              setEditingContactId(c.id);
                              setEditOfficeName(c.office_name || '');
                              setEditContactPhone(c.phone || '');
                              setEditContactEmail(c.email || '');
                              setEditContactAddress(c.address || '');
                              setEditContactMapEmbed(c.map_embed_url || '');
                              setEditContactMapLink(c.map_link || '');
                            }}
                            className="admin-btn"
                            style={{ margin: 0, padding: '4px 10px', fontSize: '11px' }}
                          >
                            Edit
                          </button>
                          <button onClick={() => deleteContact(c.id)} className="admin-btn" style={{ margin: 0, padding: '4px 10px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Associated Brands */}
          <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: '0 0 4px', color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Associated Brands / Partners</h3>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>Brands represented in {selectedRegion.name}. Option to tag solutions for filtering.</p>
              </div>
              <button onClick={() => setShowAddBrandForm(!showAddBrandForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                {showAddBrandForm ? 'Cancel' : 'Add Brand'}
              </button>
            </div>

            {showAddBrandForm && (
              <form onSubmit={addBrand} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Brand Name
                    <input type="text" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="e.g. Crestron" required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Website URL (optional)
                    <input type="url" value={newBrandWebsite} onChange={e => setNewBrandWebsite(e.target.value)} placeholder="https://..." style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '12px', color: 'var(--grey)' }}>
                    Logo Image
                    <input type="file" accept="image/*" onChange={e => setNewBrandLogo(e.target.files[0])} style={{ color: 'var(--grey)', fontSize: '12px', padding: '4px 0' }} />
                  </label>
                </div>

                {allSolutions.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--grey)' }}>Associated Solution Verticals (optional filter tag)</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {allSolutions.map((sol) => {
                        const isChecked = selectedSolutions.includes(sol.id);
                        return (
                          <label key={sol.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: isChecked ? 'var(--white)' : 'var(--grey)', background: isChecked ? 'var(--ink)' : 'transparent', border: '1px solid var(--line)', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSolutions((prev) => [...prev, sol.id]);
                                else setSelectedSolutions((prev) => prev.filter((id) => id !== sol.id));
                              }}
                            />
                            {sol.title}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button type="submit" disabled={submittingBrand} className="admin-btn" style={{ width: 'fit-content', margin: 0, padding: '8px 20px', fontSize: '12px' }}>
                  {submittingBrand ? 'Uploading...' : 'Save Brand'}
                </button>
              </form>
            )}

            {loadingBrands ? (
              <p style={{ color: 'var(--grey)', fontSize: '13px' }}>Loading brands...</p>
            ) : brands.length === 0 ? (
              <p style={{ color: 'var(--grey)', fontSize: '13px' }}>No brands added for this region yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {brands.map(b => (
                  <div key={b.id} style={{ padding: '12px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', textAlign: 'center' }}>
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} style={{ maxHeight: '40px', maxWidth: '100%', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--white)' }}>{b.name}</div>
                    )}
                    <span style={{ fontSize: '12px', color: 'var(--white)', fontWeight: '500' }}>{b.name}</span>
                    <button onClick={() => deleteBrand(b.id)} className="admin-btn" style={{ width: '100%', margin: 0, padding: '4px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
