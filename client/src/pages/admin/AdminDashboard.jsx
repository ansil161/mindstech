import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from './components/DashboardLayout';
import OverviewTab from './tabs/OverviewTab';
import SolutionsTab from './tabs/SolutionsTab';
import BlogsTab from './tabs/BlogsTab';
import InquiriesTab from './tabs/InquiriesTab';
import FieldworkTab from './tabs/FieldworkTab';
import CollectionCentresTab from './tabs/CollectionCentresTab';
import GalleryTab from './tabs/GalleryTab';
import EventsTab from './tabs/EventsTab';
import RegionsTab from './tabs/RegionsTab';
import DocumentsTab from './tabs/DocumentsTab';
import TeamTab from './tabs/TeamTab';
import AdminsTab from './tabs/AdminsTab';
import { ADMIN_TABS } from './utils/constants';

// Hooks for dashboard overview stats
import useSolutions from './hooks/useSolutions';
import useBlogs from './hooks/useBlogs';
import useInquiries from './hooks/useInquiries';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(ADMIN_TABS.DASHBOARD);

  // Load summary stats for overview tab
  const { solutions } = useSolutions();
  const { blogs } = useBlogs();
  const { enquiries } = useInquiries();

  // Instantly remove preloader on dashboard load
  useEffect(() => {
    const pre = document.getElementById('preloader');
    if (pre) {
      pre.remove();
    }
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Failed to logout:', err);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case ADMIN_TABS.SOLUTIONS:
        return <SolutionsTab />;
      case ADMIN_TABS.BLOGS:
        return <BlogsTab />;
      case ADMIN_TABS.LEADS:
        return <InquiriesTab />;
      case ADMIN_TABS.FIELDWORK:
        return <FieldworkTab />;
      case ADMIN_TABS.COLLECTION_CENTRES:
        return <CollectionCentresTab />;
      case ADMIN_TABS.GALLERY:
        return <GalleryTab />;
      case ADMIN_TABS.EVENT_NEWS:
        return <EventsTab />;
      case ADMIN_TABS.REGIONS:
        return <RegionsTab />;
      case ADMIN_TABS.DOCUMENTS:
        return <DocumentsTab />;
      case ADMIN_TABS.TEAM:
        return <TeamTab />;
      case ADMIN_TABS.ADMINS:
        return user?.is_superuser ? <AdminsTab /> : null;
      case ADMIN_TABS.DASHBOARD:
      default:
        return (
          <OverviewTab
            user={user}
            solutionsCount={solutions.length}
            blogsCount={blogs.length}
            enquiries={enquiries}
          />
        );
    }
  };

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={user}
      onLogout={handleLogout}
    >
      {renderContent()}
    </DashboardLayout>
  );
}
