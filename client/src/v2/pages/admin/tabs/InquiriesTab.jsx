import React from 'react';
import useInquiries from '../hooks/useInquiries';

export default function InquiriesTab() {
  const { enquiries, loading, error, refresh, updateStatus, deleteInquiry } = useInquiries();

  return (
    <div style={{ width: '100%' }}>
      {/* Header section */}
      <div className="admin-welcome-panel" style={{ width: '100%', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="admin-welcome-title" style={{ margin: 0 }}>Client Inquiries</h2>
            <p className="admin-welcome-desc" style={{ margin: '8px 0 0' }}>
              View and manage submitted contact forms from your prospective clients.
            </p>
          </div>
          <button onClick={refresh} className="admin-btn" style={{ width: 'auto', marginTop: 0, padding: '8px 16px' }}>
            Refresh List
          </button>
        </div>
      </div>

      {/* Inquiries Summary Statistics Boxes */}
      <div className="admin-stats-grid" style={{ marginBottom: '32px' }}>
        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Inquiries</p>
          <p className="admin-stat-value">{enquiries.length}</p>
          <p className="admin-stat-subtext">All submissions logged</p>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid #dc2626' }}>
          <p className="admin-stat-label" style={{ color: '#dc2626' }}>Pending</p>
          <p className="admin-stat-value" style={{ color: '#dc2626' }}>
            {enquiries.filter(e => e.status === 'Pending').length}
          </p>
          <p className="admin-stat-subtext">Awaiting admin review</p>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <p className="admin-stat-label" style={{ color: '#2563eb' }}>Read</p>
          <p className="admin-stat-value" style={{ color: '#2563eb' }}>
            {enquiries.filter(e => e.status === 'Read').length}
          </p>
          <p className="admin-stat-subtext">In progress / reviewed</p>
        </div>

        <div className="admin-stat-card" style={{ borderLeft: '4px solid #16a34a' }}>
          <p className="admin-stat-label" style={{ color: '#16a34a' }}>Resolved (Solved)</p>
          <p className="admin-stat-value" style={{ color: '#16a34a' }}>
            {enquiries.filter(e => e.status === 'Resolved').length}
          </p>
          <p className="admin-stat-subtext">Successfully addressed</p>
        </div>
      </div>

      {/* Table Card Panel */}
      <div className="admin-welcome-panel" style={{ width: '100%' }}>
        {loading ? (
          <p style={{ color: 'var(--grey)', fontSize: '14px' }}>Loading inquiries...</p>
        ) : error ? (
          <p style={{ color: 'var(--red)', fontSize: '14px' }}>{error}</p>
        ) : enquiries.length === 0 ? (
          <p style={{ color: 'var(--grey)', fontSize: '14px' }}>No inquiries found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--grey)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  <th style={{ padding: '12px 16px' }}>Submitter</th>
                  <th style={{ padding: '12px 16px' }}>Subject</th>
                  <th style={{ padding: '12px 16px' }}>Message</th>
                  <th style={{ padding: '12px 16px' }}>Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((item) => {
                  let statusColor = '#fef3c7'; // Pending
                  let statusTextColor = '#d97706';
                  if (item.status === 'Read') {
                    statusColor = '#eff6ff';
                    statusTextColor = '#2563eb';
                  } else if (item.status === 'Resolved') {
                    statusColor = '#f0fdf4';
                    statusTextColor = '#16a34a';
                  }

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--line-soft)', fontSize: '14px' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--grey)' }}>{item.email}</div>
                        <div style={{ fontSize: '12px', color: 'var(--grey)' }}>{item.phone}</div>
                      </td>
                      <td style={{ padding: '16px', verticalAlign: 'top' }}>
                        <span className="admin-welcome-chip" style={{ background: 'var(--line-soft)', border: '1px solid var(--line)' }}>
                          {item.subject}
                        </span>
                      </td>
                      <td style={{ padding: '16px', maxWidth: '300px', whiteSpace: 'pre-wrap', color: 'var(--white)', fontSize: '13px' }}>
                        {item.message}
                      </td>
                      <td style={{ padding: '16px', color: 'var(--grey)', whiteSpace: 'nowrap' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          textTransform: 'uppercase',
                          backgroundColor: statusColor,
                          color: statusTextColor
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <select
                            value={item.status}
                            onChange={(e) => updateStatus(item.id, e.target.value)}
                            style={{
                              background: 'var(--ink)',
                              border: '1px solid var(--line)',
                              color: 'var(--white)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Read">Read</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <button
                            onClick={() => deleteInquiry(item.id)}
                            className="admin-logout-btn"
                            style={{ padding: '6px', color: 'var(--grey)', background: 'none' }}
                            title="Delete"
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
