import axios from '../../../api/axios';

export const fieldworkService = {
  getAll: async () => {
    const res = await axios.get('/admin/fieldwork/');
    return res.data;
  },
  create: async (formData) => {
    const res = await axios.post('/admin/fieldwork/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/fieldwork/${id}/`);
    return res.data;
  },
};

export default fieldworkService;
