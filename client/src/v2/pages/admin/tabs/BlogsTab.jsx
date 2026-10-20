import React from 'react';
import useBlogs from '../hooks/useBlogs';

export default function BlogsTab() {
  const {
    blogs,
    loading,
    error,
    submitting,
    showAddForm,
    setShowAddForm,
    title,
    setTitle,
    desc,
    setDesc,
    content,
    setContent,
    cat,
    setCat,
    publishDate,
    setPublishDate,
    isFeatured,
    setIsFeatured,
    addBlog,
    deleteBlog,
    editBlog,
    expandedBlogId,
    toggleExpand,
    editingBlogId,
    setEditingBlogId,
    editFields,
    setEditFields,
    submittingEdit,
  } = useBlogs();

  return (
    <div style={{ width: '100%' }}>
      {/* Header Section */}
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Blog Posts Control</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              Add and delete blog articles listed in the Mindstec Journal page.
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="admin-btn"
            style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}
          >
            {showAddForm ? 'Cancel' : 'Add Blog Post'}
          </button>
        </div>
      </div>

      {/* Add Blog Post Form */}
      {showAddForm && (
        <form onSubmit={addBlog} className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--ink-2)', border: '1px solid var(--line)' }}>
          <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '16px', fontWeight: '600' }}>New Blog Post</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Blog Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Why Interactive Display Panels Are Better..."
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Category</label>
              <input
                type="text"
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                placeholder="e.g. Displays, Signage, Collaboration"
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Publication Date</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Short Description</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Short summary paragraph..."
              rows={3}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }}
              required
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--grey)' }}>Full Content (Optional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Full article content text..."
              rows={5}
              style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '10px', borderRadius: '6px', color: 'var(--white)', fontSize: '14px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              id="isFeaturedBlog"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              style={{ cursor: 'pointer', width: '16px', height: '16px' }}
            />
            <label htmlFor="isFeaturedBlog" style={{ fontSize: '14px', color: 'var(--white)', cursor: 'pointer' }}>
              Feature this post at the top of the blogs page
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="admin-btn"
              disabled={submitting}
              style={{ width: 'auto', marginTop: 0, padding: '10px 24px' }}
            >
              {submitting ? 'Saving...' : 'Save Blog Post'}
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

      {/* Blogs List */}
      {loading ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading blog posts...</p>
      ) : error ? (
        <p style={{ color: 'var(--red)', fontSize: '14px' }}>{error}</p>
      ) : blogs.length === 0 ? (
        <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No blog posts found in database.</p>
      ) : (
        <div className="admin-welcome-panel" style={{ padding: 0, overflow: 'hidden' }}>
          {blogs.map((item, idx) => {
            const isExpanded = expandedBlogId === item.id;
            const isEditing = editingBlogId === item.id;
            return (
              <div key={item.id} style={{ borderBottom: idx < blogs.length - 1 ? '1px solid var(--line-soft)' : 'none' }}>
                {/* Row header - click to expand */}
                <div
                  onClick={() => { toggleExpand(item.id); if (isEditing) setEditingBlogId(null); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ width: '14px', height: '14px', color: 'var(--grey)', flexShrink: 0, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                  <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--red)', border: '1px solid rgba(204,0,1,0.25)', padding: '3px 8px', borderRadius: '999px', background: 'rgba(204,0,1,0.05)', flexShrink: 0 }}>
                    {item.cat}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--white)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--grey-dark)', flexShrink: 0 }}>{item.date || item.publish_date}</span>
                  {item.is_featured && (
                    <span style={{ fontSize: '9px', fontWeight: '700', letterSpacing: '.1em', textTransform: 'uppercase', color: '#16a34a', border: '1px solid rgba(34,197,94,0.25)', padding: '3px 8px', borderRadius: '999px', background: 'rgba(34,197,94,0.05)', flexShrink: 0 }}>
                      Featured
                    </span>
                  )}
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={{ padding: '0 20px 20px 46px', borderTop: '1px solid var(--line-soft)' }}>
                    {!isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px' }}>
                        <p style={{ fontSize: '13px', color: 'var(--grey)', lineHeight: '1.7' }}>{item.desc}</p>
                        {item.content && <p style={{ fontSize: '13px', color: 'var(--grey-dark)', lineHeight: '1.7', borderTop: '1px solid var(--line-soft)', paddingTop: '10px' }}>{item.content}</p>}
                        {item.href && <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--red)', textDecoration: 'underline', width: 'fit-content' }}>{item.href}</a>}
                        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingBlogId(item.id); setEditFields({ title: item.title, desc: item.desc, content: item.content || '', cat: item.cat, href: item.href || '', publish_date: item.publish_date, is_featured: item.is_featured }); }}
                            className="admin-btn"
                            style={{ width: 'auto', marginTop: 0, padding: '6px 16px', fontSize: '12px' }}
                          >Edit</button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteBlog(item.id); }}
                            className="admin-btn"
                            style={{ width: 'auto', marginTop: 0, padding: '6px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fee2e2', fontSize: '12px' }}
                          >Delete</button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={e => editBlog(e, item.id)} onClick={e => e.stopPropagation()}
                        style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Title</label>
                            <input value={editFields.title || ''} onChange={e => setEditFields(p => ({ ...p, title: e.target.value }))} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Category</label>
                            <input value={editFields.cat || ''} onChange={e => setEditFields(p => ({ ...p, cat: e.target.value }))} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Publication Date</label>
                            <input type="date" value={editFields.publish_date || ''} onChange={e => setEditFields(p => ({ ...p, publish_date: e.target.value }))} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px' }} />
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Short Description</label>
                          <textarea value={editFields.desc || ''} onChange={e => setEditFields(p => ({ ...p, desc: e.target.value }))} rows={3} required style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          <label style={{ fontSize: '11px', color: 'var(--grey)' }}>Full Content (optional)</label>
                          <textarea value={editFields.content || ''} onChange={e => setEditFields(p => ({ ...p, content: e.target.value }))} rows={5} style={{ background: 'var(--ink)', border: '1px solid var(--line)', padding: '9px', borderRadius: '6px', color: 'var(--white)', fontSize: '13px', resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" id={`feat-${item.id}`} checked={!!editFields.is_featured} onChange={e => setEditFields(p => ({ ...p, is_featured: e.target.checked }))} style={{ cursor: 'pointer', width: '15px', height: '15px' }} />
                          <label htmlFor={`feat-${item.id}`} style={{ fontSize: '13px', color: 'var(--white)', cursor: 'pointer' }}>Feature this post</label>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button type="submit" disabled={submittingEdit} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '7px 20px', fontSize: '12px' }}>
                            {submittingEdit ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button type="button" onClick={() => setEditingBlogId(null)} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '7px 20px', fontSize: '12px', background: 'var(--ink)', border: '1px solid var(--line)', color: 'var(--grey)' }}>
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
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
