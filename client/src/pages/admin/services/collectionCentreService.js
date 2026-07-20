import axios from '../../../api/axios';

export const collectionCentreService = {
  getAll: async () => {
    const res = await axios.get('/admin/collection-centres/');
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post('/admin/collection-centres/', data);
    return res.data;
  },
  toggleActive: async (centre) => {
    const res = await axios.patch(`/admin/collection-centres/${centre.id}/`, { is_active: !centre.is_active });
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`/admin/collection-centres/${id}/`);
    return res.data;
  },
};

export default collectionCentreService;
