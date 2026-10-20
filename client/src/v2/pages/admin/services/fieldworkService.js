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
  // The detail endpoint is PATCH-only and partial, so this is safe for a
  // single-field edit (e.g. flipping status) without re-uploading the image.
  update: async (id, payload) => {
    const formData = payload instanceof FormData ? payload : Object.entries(payload).reduce(
      (fd, [key, value]) => {
        fd.append(key, value);
        return fd;
      },
      new FormData(),
    );
    const res = await axios.patch(`/admin/fieldwork/${id}/`, formData, {
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
