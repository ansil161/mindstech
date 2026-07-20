import axios from '../../../api/axios';

export const eventService = {
  getAll: async () => {
    const res = await axios.get('/admin/event-news/');
    return res.data;
  },
  create: async (formData) => {
    const res = await axios.post('/admin/event-news/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/event-news/${id}/`);
    return res.data;
  },
};

export default eventService;
