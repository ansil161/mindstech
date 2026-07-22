import * as regionApi from '../../../api/regionApi';

export const regionService = {
  // Regions
  getRegions: () => regionApi.getRegions(),
  createRegion: (data) => regionApi.createRegion(data),
  updateRegion: (id, data) => regionApi.updateRegion(id, data),
  deleteRegion: (id) => regionApi.deleteRegion(id),

  // Contacts
  getRegionContacts: (regionId) => regionApi.getRegionContacts(regionId),
  createRegionContact: (regionId, data) => regionApi.createRegionContact(regionId, data),
  updateRegionContactDetail: (id, data) => regionApi.updateRegionContactDetail(id, data),
  deleteRegionContactDetail: (id) => regionApi.deleteRegionContactDetail(id),

  // Brands
  getBrands: (regionId) => regionApi.getBrands(regionId),
  addBrand: (regionId, formData) => regionApi.addBrand(regionId, formData),
  deleteBrand: (id) => regionApi.deleteBrand(id),

  // Testimonials
  getTestimonials: (regionId) => regionApi.getTestimonials(regionId),
  addTestimonial: (regionId, formData) => regionApi.addTestimonial(regionId, formData),
  deleteTestimonial: (id) => regionApi.deleteTestimonial(id),
};

export default regionService;
