import axios from '../../../api/axios';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const homeHighlightService = {
  getAll: async () => {
    const res = await axios.get('/admin/home-highlights/');
    return res.data;
  },
  create: async (formData) => {
    const res = await axios.post('/admin/home-highlights/', formData, multipart);
    return res.data;
  },
  update: async (id, formData) => {
    const res = await axios.patch(`/admin/home-highlights/${id}/`, formData, multipart);
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/home-highlights/${id}/`);
    return res.data;
  },
};

export default homeHighlightService;
