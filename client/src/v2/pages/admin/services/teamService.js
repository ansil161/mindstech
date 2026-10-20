import * as teamApi from '../../../api/teamApi';
import * as testimonialApi from '../../../api/testimonialApi';

export const teamService = {
  getTeamMembers: () => teamApi.getTeamMembers(),
  addTeamMember: (formData) => teamApi.addTeamMember(formData),
  updateTeamMember: (id, formData) => teamApi.updateTeamMember(id, formData),
  deleteTeamMember: (id) => teamApi.deleteTeamMember(id),

  // Testimonials (global)
  getTestimonials: () => testimonialApi.getTestimonials(),
  addTestimonial: (formData) => testimonialApi.addTestimonial(formData),
  deleteTestimonial: (id) => testimonialApi.deleteTestimonial(id),
};

export default teamService;

