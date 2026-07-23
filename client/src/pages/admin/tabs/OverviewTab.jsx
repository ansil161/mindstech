import React from 'react';
import AdminsTab from './AdminsTab';

export default function OverviewTab({ user, solutionsCount = 0, blogsCount = 0, enquiries = [] }) {
  const pendingCount = enquiries.filter(e => e.status === 'Pending').length;
  const totalEnquiries = enquiries.length;

  return (
    <>
      {/* Quick Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card active-card">
          <p className="admin-stat-label">Active Solutions</p>
          <p className="admin-stat-value">{solutionsCount}</p>
          <p className="admin-stat-subtext">Core tech services listed</p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Total Blog Posts</p>
          <p className="admin-stat-value">{blogsCount}</p>
          <p className="admin-stat-subtext">Articles & updates</p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Pending Inquiries</p>
          <p className="admin-stat-value">{pendingCount}</p>
          <p className="admin-stat-subtext" style={{ color: '#22c55e' }}>
            Total: {totalEnquiries}
          </p>
        </div>

        <div className="admin-stat-card">
          <p className="admin-stat-label">Admin Status</p>
          <p className="admin-stat-value" style={{ fontSize: '20px', color: 'var(--red)', marginTop: '8px' }}>
            {user?.is_superuser ? 'Super Admin' : 'Staff'}
          </p>
          <p className="admin-stat-subtext">Read/write privileges</p>
        </div>
      </div>

      {/* Welcome Panel */}
      <div className="admin-welcome-panel">
        <img src="/mindstec-logo-web.png" alt="" className="admin-welcome-bg-logo" />
        <div className="admin-welcome-text">
          <h2 className="admin-welcome-title">
            Welcome back, {user?.first_name || user?.email || 'Administrator'}!
          </h2>
          <p className="admin-welcome-desc">
            This is your portal control center. From here you can manage solutions descriptions, edit blogs and news, view incoming customer query forms, and configure website settings.
          </p>
          <div className="admin-welcome-meta">
            <span className="admin-welcome-chip">Role: {user?.is_superuser ? 'SUPERUSER' : 'STAFF_MEMBER'}</span>
          </div>
        </div>
      </div>

      {/* Admin Management Section on Main Dashboard (Superuser only) */}
      {user?.is_superuser && (
        <div style={{ marginTop: '32px' }}>
          <AdminsTab />
        </div>
      )}
    </>
  );
}
