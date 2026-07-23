import * as regionApi from '../../../api/regionApi';
import * as testimonialApi from '../../../api/testimonialApi';

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

  // Testimonials (global, shared across all regions)
  getTestimonials: () => testimonialApi.getTestimonials(),
  addTestimonial: (formData) => testimonialApi.addTestimonial(formData),
  deleteTestimonial: (id) => testimonialApi.deleteTestimonial(id),
};

export default regionService;
