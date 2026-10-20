import * as adminUsersApi from '../../../api/adminUsersApi';

export const adminUserService = {
  getAdmins: () => adminUsersApi.getAdmins(),
  createAdmin: (data) => adminUsersApi.createAdmin(data),
  setAdminActive: (id, is_active) => adminUsersApi.setAdminActive(id, is_active),
  deleteAdmin: (id) => adminUsersApi.deleteAdmin(id),
};

export default adminUserService;
