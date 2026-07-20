import React from 'react';
import useEvents from '../hooks/useEvents';

export default function EventsTab() {
  const {
    eventNews,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    evType,
    setEvType,
    evTitle,
    setEvTitle,
    evDescription,
    setEvDescription,
    setEvImage,
    evCategory,
    setEvCategory,
    evDate,
    setEvDate,
    evLocation,
    setEvLocation,
    evExternalUrl,
    setEvExternalUrl,
    evRegisterUrl,
    setEvRegisterUrl,
    addEventNews,
    deleteEventNews,
  } = useEvents();

  return (
    <div style={{ width: '100%' }}>
      {/* Header Panel */}
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Events &amp; News Management</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              Publish upcoming live/virtual events and regional press news items.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="admin-btn"
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
          >
            {showAddForm ? 'Cancel' : 'Add Event / News'}
          </button>
        </div>
      </div>

      {/* Add Event/News Form Drawer */}
      {showAddForm && (
        <form onSubmit={addEventNews} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Publication</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'var(--ink)', padding: '4px', borderRadius: '8px', border: '1px solid var(--line)' }}>
              <button
                type="button"
                onClick={() => setEvType('event')}
                style={{ background: evType === 'event' ? 'var(--red)' : 'transparent', color: 'var(--white)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
              >
                Event
              </button>
              <button
                type="button"
                onClick={() => setEvType('news')}
                style={{ background: evType === 'news' ? 'var(--red)' : 'transparent', color: 'var(--white)', padding: '6px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: 'none', cursor: 'pointer' }}
              >
                News
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Title</label>
            <input
              type="text"
              value={evTitle}
              onChange={(e) => setEvTitle(e.target.value)}
              placeholder={evType === 'event' ? 'e.g. InfoComm Asia 2025' : 'e.g. Mindstec Expands Middle East Headquarters'}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Description / Summary</label>
            <textarea
              value={evDescription}
              onChange={(e) => setEvDescription(e.target.value)}
              placeholder="Short description snippet..."
              rows={3}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Image (Cover / Logo)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setEvImage(e.target.files[0])}
              style={{ color: 'var(--grey)', fontSize: '14px' }}
            />
          </div>

          {evType === 'news' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Category Tag</label>
                <input
                  type="text"
                  value={evCategory}
                  onChange={(e) => setEvCategory(e.target.value)}
                  placeholder="e.g. Press Release, Partnership"
                  style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--grey)' }}>External Article URL (optional)</label>
                <input
                  type="url"
                  value={evExternalUrl}
                  onChange={(e) => setEvExternalUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Event Date &amp; Time</label>
                <input
                  type="datetime-local"
                  value={evDate}
                  onChange={(e) => setEvDate(e.target.value)}
                  style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Location / Venue</label>
                <input
                  type="text"
                  value={evLocation}
                  onChange={(e) => setEvLocation(e.target.value)}
                  placeholder="e.g. Dubai, UAE / Zoom"
                  style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Registration Page URL (optional)</label>
                <input
                  type="url"
                  value={evRegisterUrl}
                  onChange={(e) => setEvRegisterUrl(e.target.value)}
                  placeholder="https://..."
                  style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="admin-btn"
              disabled={submitting}
              style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
            >
              {submitting ? 'Saving...' : 'Publish Item'}
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

      {/* List */}
      {loading ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading publications...</p>
      ) : error ? (
        <p style={{ color: 'var(--red)', fontSize: '14px' }}>{error}</p>
      ) : eventNews.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No items published yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {eventNews.map(item => (
            <div key={item.id} className="admin-stat-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: '12px' }}>
              {item.image && (
                <img src={item.image} alt="" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--line)' }} />
              )}
              <div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <span className="admin-welcome-chip" style={{ color: item.type === 'event' ? '#3b82f6' : '#22c55e', background: item.type === 'event' ? 'rgba(59,130,246,0.08)' : 'rgba(34,197,94,0.08)', border: `1px solid ${item.type === 'event' ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.2)'}`, fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' }}>
                    {item.type}
                  </span>
                  {item.category && (
                    <span className="admin-welcome-chip" style={{ color: 'var(--grey)', background: 'var(--line)', fontSize: '9px', textTransform: 'uppercase', fontWeight: '700' }}>
                      {item.category}
                    </span>
                  )}
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--white)', fontWeight: '600' }}>{item.title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--grey)', lineHeight: '1.4' }}>{item.description}</p>
                {item.type === 'event' && (
                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--grey)' }}>
                    <p>📅 {item.event_date ? new Date(item.event_date).toLocaleString() : 'No date set'}</p>
                    <p>📍 {item.location || 'No location set'}</p>
                  </div>
                )}
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid var(--line-soft)' }}>
                <button
                  onClick={() => deleteEventNews(item.id)}
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
