export const API = import.meta.env.VITE_API_BASE || '/laoloterylive/api';

const UPLOADS_BASE = import.meta.env.VITE_UPLOADS_BASE || '/laoloterylive/uploads';

/** Resolve any /uploads/... path to the correct URL for the current environment */
export function resolveUploadUrl(url) {
  if (!url) return null;
  const u = url.trim();
  if (u.startsWith('/laoloterylive/uploads')) {
    return u.replace('/laoloterylive/uploads', UPLOADS_BASE);
  }
  if (u.startsWith('/uploads')) {
    return UPLOADS_BASE + u.slice('/uploads'.length);
  }
  return u;
}

export function resolveAnimalImage(animal) {
  if (!animal) return '';
  if (animal.image_url && animal.image_url.trim() !== '') {
    return resolveUploadUrl(animal.image_url) || '';
  }
  return `${import.meta.env.BASE_URL}images/animals/${animal.animal_id}.png`;
}
