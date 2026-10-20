import React from 'react';
import useHomeHighlights from '../hooks/useHomeHighlights';

const inputStyle = { background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' };
const labelStyle = { fontSize: '12px', color: 'var(--grey)' };
const fieldStyle = { display: 'flex', flexDirection: 'column', gap: '6px' };
const chipStyle = { color: 'var(--grey)', background: 'var(--line)', fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' };

export default function HomeHighlightsTab() {
  const {
    items, loading, error, submitting,
    showAddForm, setShowAddForm,
    form, setField, setImage, regions,
    addItem, toggleActive, deleteItem,
  } = useHomeHighlights();

  return (
    <div style={{ width: '100%' }}>
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Home: News &amp; Projects</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              Cards for the &ldquo;News and projects&rdquo; section on the home page. The page shows news, project, news
              in that order, using the first matching cards by display order.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="admin-btn"
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
          >
            {showAddForm ? 'Cancel' : 'Add Card'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={addItem} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Card</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--ink)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              {['news', 'project'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setField('kind', k)}
                  style={{ background: form.kind === k ? 'var(--red)' : 'transparent', color: 'var(--white)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder={form.kind === 'news' ? 'e.g. Mindstec opens new Riyadh office' : 'e.g. Control room, Dubai Metro'}
              style={inputStyle}
              required
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Subtitle (a date, location or client)</label>
            <input
              type="text"
              value={form.subtitle}
              onChange={(e) => setField('subtitle', e.target.value)}
              placeholder="e.g. 12 Oct 2026 or Dubai, UAE"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ color: 'var(--grey)', fontSize: '14px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={fieldStyle}>
              <label style={labelStyle}>Link (optional)</label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setField('link_url', e.target.value)}
                placeholder="/projects or https://..."
                style={inputStyle}
              />
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Region</label>
              <select value={form.region} onChange={(e) => setField('region', e.target.value)} style={inputStyle}>
                <option value="">All regions (global)</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={fieldStyle}>
              <label style={labelStyle}>Display order (lower shows first)</label>
              <input
                type="number"
                min="0"
                value={form.display_order}
                onChange={(e) => setField('display_order', e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" className="admin-btn" disabled={submitting} style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}>
              {submitting ? 'Saving...' : 'Add to Home Page'}
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

      {loading ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading cards...</p>
      ) : error ? (
        <p style={{ color: 'var(--red)', fontSize: '14px' }}>{error}</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No cards yet. The home page shows placeholders until you add some.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {items.map((item) => (
            <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px', opacity: item.is_active ? 1 : 0.55 }}>
              {item.image && (
                <img src={item.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }} />
              )}
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span className="admin-welcome-chip" style={{ ...chipStyle, color: item.kind === 'project' ? '#3b82f6' : '#22c55e' }}>{item.kind}</span>
                  <span className="admin-welcome-chip" style={chipStyle}>{item.region_name || 'All regions'}</span>
                  <span className="admin-welcome-chip" style={chipStyle}>Order {item.display_order}</span>
                  {!item.is_active && <span className="admin-welcome-chip" style={chipStyle}>Hidden</span>}
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                {item.subtitle && <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)' }}>{item.subtitle}</p>}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                <button
                  onClick={() => toggleActive(item)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '6px 12px', background: 'var(--line-soft)', color: 'var(--white)', border: '1px solid var(--line)', fontSize: '11px' }}
                >
                  {item.is_active ? 'Hide' : 'Show'}
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="admin-btn"
                  style={{ width: 'auto', marginTop: 0, padding: '6px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '11px' }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
