import * as teamApi from '../../../api/teamApi';

export const teamService = {
  getTeamMembers: () => teamApi.getTeamMembers(),
  addTeamMember: (formData) => teamApi.addTeamMember(formData),
  updateTeamMember: (id, formData) => teamApi.updateTeamMember(id, formData),
  deleteTeamMember: (id) => teamApi.deleteTeamMember(id),
};

export default teamService;
