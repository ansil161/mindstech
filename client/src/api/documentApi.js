import api from './axios';

export const documentApi = {
    // Get all documents
    getDocuments: async () => {
        const response = await api.get('/admin/documents/');
        return response.data;
    },

    // Upload a new document
    uploadDocument: async (formData) => {
        const response = await api.post('/admin/documents/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Trigger parsing of document
    parseDocument: async (id) => {
        const response = await api.post(`/admin/documents/${id}/parse/`);
        return response.data;
    },

    // Trigger indexing of document
    indexDocument: async (id) => {
        const response = await api.post(`/admin/documents/${id}/index/`);
        return response.data;
    },

    // Update document metadata or extracted text
    updateDocument: async (id, data) => {
        const response = await api.patch(`/admin/documents/${id}/`, data);
        return response.data;
    },

    // Delete document
    deleteDocument: async (id) => {
        const response = await api.delete(`/admin/documents/${id}/`);
        return response.data;
    },
};
