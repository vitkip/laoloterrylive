export const API = import.meta.env.VITE_API_BASE || '/laoloterylive/api';

/**
 * Resolve an animal's display image URL.
 *
 * DB stores absolute Apache paths like /laoloterylive/uploads/animals/...
 * These work directly as <img src> in both production (XAMPP) and dev (via Vite proxy).
 * If no upload exists, fall back to static assets under public/images/animals/.
 */
export function resolveAnimalImage(animal) {
  if (!animal) return '';
  if (animal.image_url && animal.image_url.trim() !== '') {
    // Use the DB path as-is — Apache serves it at the correct URL
    return animal.image_url;
  }
  // Fallback: static placeholder under public/ (uses Vite BASE_URL so it works in prod)
  return `${import.meta.env.BASE_URL}images/animals/${animal.animal_id}.png`;
}
