import axios from '../../../api/axios';

export const galleryService = {
  getAll: async () => {
    const res = await axios.get('/admin/gallery/');
    return res.data;
  },
  create: async (formData) => {
    const res = await axios.post('/admin/gallery/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/gallery/${id}/`);
    return res.data;
  },
};

export default galleryService;
