export const API = import.meta.env.VITE_API_BASE || '/laoloterylive/api';

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || '/laoloterylive/uploads';

export function resolveAnimalImage(animal) {
  if (!animal) return '';
  if (animal.image_url && animal.image_url.trim() !== '') {
    const url = animal.image_url.trim();
    if (url.startsWith('/laoloterylive/uploads')) {
      return url.replace('/laoloterylive/uploads', UPLOADS_BASE);
    }
    if (url.startsWith('/uploads')) {
      return UPLOADS_BASE + url.slice('/uploads'.length);
    }
    return url;
  }
  return `${import.meta.env.BASE_URL}images/animals/${animal.animal_id}.png`;
}
