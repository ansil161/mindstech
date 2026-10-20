import axios from '../../../api/axios';

export const inquiryService = {
  getAll: async () => {
    const res = await axios.get('/admin/enquiries/');
    return res.data;
  },
  updateStatus: async (id, status) => {
    const res = await axios.patch(`/admin/enquiries/${id}/`, { status });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/enquiries/${id}/`);
    return res.data;
  },
};

export default inquiryService;
