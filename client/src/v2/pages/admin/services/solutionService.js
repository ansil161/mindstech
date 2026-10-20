import axios from '../../../api/axios';

export const solutionService = {
  getAll: async () => {
    const res = await axios.get('/admin/solutions/');
    return res.data;
  },
  create: async (formData) => {
    const res = await axios.post('/admin/solutions/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/solutions/${id}/`);
    return res.data;
  },
};

export default solutionService;
