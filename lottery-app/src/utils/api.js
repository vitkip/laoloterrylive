export const API = import.meta.env.VITE_API_BASE || '/laoloterylive/api';

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || '/laoloterylive/uploads';

export function resolveAnimalImage(animal) {
  if (!animal) return '';
  if (animal.image_url && animal.image_url.trim() !== '') {
    // DB stores /laoloterylive/uploads/... — normalize to env-specific prefix
    return animal.image_url.replace('/laoloterylive/uploads', UPLOADS_BASE);
  }
  return `${import.meta.env.BASE_URL}images/animals/${animal.animal_id}.png`;
}
