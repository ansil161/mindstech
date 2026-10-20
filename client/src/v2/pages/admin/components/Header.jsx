import React from 'react';
import { ADMIN_TABS } from '../utils/constants';

export default function Header({ activeTab }) {
  const getTitle = () => {
    switch (activeTab) {
      case ADMIN_TABS.DASHBOARD:
        return 'Control Center Overview';
      case ADMIN_TABS.LEADS:
        return 'Client Inquiries';
      case ADMIN_TABS.FIELDWORK:
        return 'Recent Fieldwork';
      case ADMIN_TABS.GALLERY:
        return 'Gallery Manager';
      case ADMIN_TABS.REGIONS:
        return 'Region Management';
      default:
        return activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
    }
  };

  return (
    <header className="admin-header">
      <h1 className="admin-header-title">{getTitle()}</h1>
      <div className="admin-status-indicator">
        <span className="admin-pulse-dot"></span>
        <span className="admin-status-text">Backend Live</span>
      </div>
    </header>
  );
}
