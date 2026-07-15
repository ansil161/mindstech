import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

/**
 * Fetch all gallery items from the backend.
 * Returns an array of { id, title, category, image } objects.
 */
export async function fetchGalleryItems() {
  const { data } = await axios.get(`${BASE_URL}/gallery/`);
  return data;
}
