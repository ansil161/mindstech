import React from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  onSelectRegion,
  user,
  onLogout,
  children,
}) {
  return (
    <div className="admin-dashboard-page">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectRegion={onSelectRegion}
        user={user}
        onLogout={onLogout}
      />
      <main className="admin-main">
        <Header activeTab={activeTab} />
        <div className="admin-content-scrollable">
          {children}
        </div>
      </main>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}
