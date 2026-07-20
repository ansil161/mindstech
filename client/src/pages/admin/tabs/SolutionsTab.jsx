import React from 'react';
import useSolutions from '../hooks/useSolutions';

export default function SolutionsTab() {
  const {
    solutions,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    title,
    setTitle,
    slug,
    setSlug,
    description,
    setDescription,
    setImage,
    addSolution,
    deleteSolution,
  } = useSolutions();

  return (
    <div style={{ width: '100%' }}>
      {/* Header Section */}
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Manage Solutions</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              Add and delete service solutions displayed under 'What We Distribute' on the homepage.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="admin-btn"
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
          >
            {showAddForm ? 'Cancel' : 'Add Solution'}
          </button>
        </div>
      </div>

      {/* Add Solution Form Drawer */}
      {showAddForm && (
        <form onSubmit={addSolution} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Solution</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Solution Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Digital Signage"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Slug Link (URL key)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. digital-signage"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Description (for Homepage)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what we distribute in this vertical..."
              rows={3}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Preview Image File</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{ color: 'var(--grey)', fontSize: '14px', padding: '4px 0' }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="admin-btn"
              disabled={submitting}
              style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
            >
              {submitting ? 'Saving...' : 'Save Solution'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="admin-btn"
              style={{ width: 'auto', marginTop: 0, padding: '10px 24px', background: 'var(--line-soft)', color: 'var(--white)', border: '1px solid var(--line)' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Solutions List Grid */}
      {loading ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading solutions...</p>
      ) : error ? (
        <p style={{ color: 'var(--red)', fontSize: '14px' }}>{error}</p>
      ) : solutions.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No solutions found in database.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {solutions.map((item) => (
            <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px' }}>
              <img
                src={item.image}
                alt={item.title}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }}
              />
              <div>
                <span className="admin-welcome-chip" style={{ color: 'var(--red)', background: 'rgba(204,0,1,0.08)', border: '1px solid rgba(204,0,1,0.2)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '700' }}>
                  {item.slug}
                </span>
                <h4 style={{ margin: '8px 0 4px', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)', lineHeight: '1.4' }}>{item.desc}</p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                <button
                  onClick={() => deleteSolution(item.id)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                >
                  Delete Solution
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
