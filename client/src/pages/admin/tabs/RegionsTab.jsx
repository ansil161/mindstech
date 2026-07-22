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
                  Configure contact information, brands, and testimonials for each geographic region.
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
            <form onSubmit={addRegion} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Parent Region (Optional)</label>
                  <select
                    value={newRegionParent}
                    onChange={(e) => setNewRegionParent(e.target.value)}
                    style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                  >
                    <option value="">None (Top-Level)</option>
                    {regions.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={submittingRegion} className="admin-btn" style={{ width: 'fit-content', marginTop: 0, padding: '10px 24px' }}>
                {submittingRegion ? 'Creating...' : 'Create Region'}
              </button>
            </form>
          )}

          {loading ? (
            <p style={{ color: 'var(--grey)' }}>Loading regions...</p>
          ) : error ? (
            <p style={{ color: 'var(--red)' }}>{error}</p>
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
                      onClick={(e) => { e.stopPropagation(); toggleRegionActive(region); }}
                      className="admin-btn"
                      style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px', background: region.is_active ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)', color: region.is_active ? '#f87171' : '#4ade80', border: `1px solid ${region.is_active ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)'}` }}
                    >
                      {region.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteRegion(region.id); }}
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
              onClick={() => { setSelectedRegion(null); }}
              className="admin-btn"
              style={{ width: 'auto', margin: '0 0 12px', padding: '6px 14px', fontSize: '12px', background: 'var(--line-soft)' }}
            >
              ← Back to Regions
            </button>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>{selectedRegion.name}</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              Slug: <code style={{ color: 'var(--red)' }}>{selectedRegion.slug}</code> — Manage contact info, brands, and testimonials for this region.
            </p>
          </div>

          {/* Contact Offices */}
          <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>Contact Offices</h3>
              <button onClick={() => setShowAddContactForm(!showAddContactForm)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 16px', fontSize: '12px' }}>
                {showAddContactForm ? 'Cancel' : 'Add Office'}
              </button>
            </div>

            {showAddContactForm && (
              <form onSubmit={addContact} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
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
                      <form onSubmit={e => editContact(e, contact.id)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                            <button onClick={() => deleteContact(contact.id)} className="admin-btn" style={{ width: 'auto', margin: 0, padding: '6px 12px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>
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
              <form onSubmit={addBrand} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', padding: '16px', background: 'var(--ink-2)', borderRadius: '8px', border: '1px solid var(--line)' }}>
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
                    {allSolutions.length > 0 ? (
                      allSolutions.map(sol => (
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
                          const sol = allSolutions.find(s => s.id === solId);
                          return (
                            <span key={solId} style={{ fontSize: '9px', background: 'var(--line)', padding: '2px 6px', borderRadius: '4px', color: 'var(--grey)' }}>
                              {sol ? sol.title : `Sol #${solId}`}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    <button onClick={() => deleteBrand(brand.id)} className="admin-btn" style={{ width: '100%', margin: 0, padding: '4px', fontSize: '11px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2' }}>Remove</button>
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
        </>
      )}
    </div>
  );
}
