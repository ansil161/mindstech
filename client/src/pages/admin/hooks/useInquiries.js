import { useState, useEffect, useCallback } from 'react';
import inquiryService from '../services/inquiryService';
import notify from '../utils/notify';

export function useInquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await inquiryService.getAll();
      setEnquiries(data);
    } catch (err) {
      console.error(err);
      setError('Failed to load inquiries.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const updateStatus = async (id, status) => {
    try {
      await inquiryService.updateStatus(id, status);
      setEnquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
      notify('Inquiry status updated.');
    } catch (err) {
      console.error(err);
      notify('Failed to update status.');
    }
  };

  const deleteInquiry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record?')) return;
    try {
      await inquiryService.delete(id);
      setEnquiries((prev) => prev.filter((item) => item.id !== id));
      notify('Enquiry deleted successfully.');
    } catch (err) {
      console.error(err);
      notify('Failed to delete enquiry.');
    }
  };

  return {
    enquiries,
    loading,
    error,
    refresh: fetchEnquiries,
    updateStatus,
    deleteInquiry,
  };
}

export default useInquiries;
