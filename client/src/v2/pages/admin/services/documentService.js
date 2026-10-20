import { documentApi } from '../../../api/documentApi';

export const documentService = {
  getAll: () => documentApi.getDocuments(),
  upload: (formData) => documentApi.uploadDocument(formData),
  parse: (id) => documentApi.parseDocument(id),
  index: (id) => documentApi.indexDocument(id),
  update: (id, data) => documentApi.updateDocument(id, data),
  delete: (id) => documentApi.deleteDocument(id),
};

export default documentService;
