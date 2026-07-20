import axios from '../../../api/axios';

export const blogService = {
  getAll: async () => {
    const res = await axios.get('/admin/blogs/');
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post('/admin/blogs/', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await axios.patch(`/admin/blogs/${id}/`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/blogs/${id}/`);
    return res.data;
  },
};

export default blogService;
