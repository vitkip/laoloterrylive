// ── Client-side cache helpers ─────────────────────────────────────
// ໃຊ້ຮ່ວມກັນລະຫວ່າງ DataContext (ຂຽນ/ອ່ານ cache) ແລະ ໜ້າ /admin/cache
// (ສະແດງສະຖານະ + ລ້າງ cache)

/** localStorage key ທີ່ DataContext ເກັບ animals/draws/types/yearsByType */
export const APP_CACHE_KEY = 'lao_lottery_data_v1';

/** ເວີຊັນ cache ຫຼ້າສຸດທີ່ເຫັນຈາກ server — ຕ່າງກັນ = admin ສັ່ງລ້າງແລ້ວ */
export const CACHE_VERSION_KEY = 'lao_lottery_cache_ver';

/** key ທີ່ຕ້ອງຮັກສາໄວ້ເມື່ອລ້າງ storage (login ບໍ່ຫຼຸດ, theme ບໍ່ປ່ຽນ) */
export const PRESERVED_KEYS = [
  'lao_lottery_token',
  'lao_lottery_refresh_token',
  'lao_lottery_user',
  'lao_lottery_expires_at',
  'theme',
];

/** ຊື່ອ່ານງ່າຍຂອງແຕ່ລະ key ສຳລັບສະແດງໃນໜ້າ admin */
const KEY_LABELS = {
  [APP_CACHE_KEY]:      'ຂໍ້ມູນຫວຍ (animals · draws · types)',
  [CACHE_VERSION_KEY]:  'ເວີຊັນ cache ຈາກ server',
  'lao_lottery_token':  'Access token',
  'lao_lottery_refresh_token': 'Refresh token',
  'lao_lottery_user':   'ຂໍ້ມູນຜູ້ໃຊ້ທີ່ login',
  'lao_lottery_expires_at': 'ເວລາໝົດອາຍຸ token',
  'theme':              'ຮູບແບບສີ (light/dark)',
};

/** ຂະໜາດເປັນ byte ຂອງ string ໃນ UTF-16 storage */
function byteSize(value) {
  return value ? new Blob([value]).size : 0;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * ອ່ານທຸກ key ໃນ localStorage ພ້ອມຂະໜາດ.
 * @returns {{key:string,label:string,bytes:number,preserved:boolean}[]}
 */
export function listStorageEntries() {
  const entries = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) continue;
      entries.push({
        key,
        label: KEY_LABELS[key] || key,
        bytes: byteSize(localStorage.getItem(key)),
        preserved: PRESERVED_KEYS.includes(key),
      });
    }
  } catch {
    // private mode / storage disabled — ຄືນ array ວ່າງ
    return [];
  }
  return entries.sort((a, b) => b.bytes - a.bytes);
}

/**
 * ສະຫຼຸບສະຖານະ cache ຂໍ້ມູນຫວຍ.
 * @returns {{exists:boolean,bytes:number,ageMs:number|null,counts:object,version:string|null}}
 */
export function getDataCacheStats() {
  const empty = { exists: false, bytes: 0, ageMs: null, counts: {}, version: null };
  try {
    const raw = localStorage.getItem(APP_CACHE_KEY);
    const version = localStorage.getItem(CACHE_VERSION_KEY);
    if (!raw) return { ...empty, version };
    const parsed = JSON.parse(raw);
    return {
      exists: true,
      bytes: byteSize(raw),
      ageMs: parsed.ts ? Date.now() - parsed.ts : null,
      counts: {
        draws:   parsed.draws?.length   ?? 0,
        animals: parsed.animals?.length ?? 0,
        types:   parsed.types?.length   ?? 0,
        years:   Object.keys(parsed.yearsByType ?? {}).length,
      },
      version,
    };
  } catch {
    return empty;
  }
}

/** ລ້າງສະເພາະ cache ຂໍ້ມູນຫວຍ — ບໍ່ແຕະ login ຫຼື theme */
export function clearDataCache() {
  try {
    localStorage.removeItem(APP_CACHE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * ລ້າງ localStorage + sessionStorage.
 * @param {{keepAuth?:boolean}} opts keepAuth=true (ຄ່າເລີ່ມຕົ້ນ) ຈະບໍ່ລົບ token/theme
 * @returns {number} ຈຳນວນ key ທີ່ຖືກລົບ
 */
export function clearBrowserStorage({ keepAuth = true } = {}) {
  let removed = 0;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key === null) continue;
      if (keepAuth && PRESERVED_KEYS.includes(key)) continue;
      keys.push(key);
    }
    keys.forEach(k => { localStorage.removeItem(k); removed++; });
  } catch {
    // ignore — storage ບໍ່ພ້ອມໃຊ້
  }
  try {
    sessionStorage.clear();
  } catch {
    // ignore
  }
  return removed;
}

/**
 * ລ້າງ Cache Storage (ໄຟລ໌ JS/CSS/ຮູບທີ່ browser ເກັບໄວ້) ແລະ ຖອນ service worker.
 * @returns {Promise<{caches:number,workers:number}>}
 */
export async function clearBrowserCaches() {
  let cacheCount = 0;
  let workerCount = 0;
  try {
    if (typeof caches !== 'undefined') {
      const names = await caches.keys();
      await Promise.all(names.map(n => caches.delete(n)));
      cacheCount = names.length;
    }
  } catch {
    // ignore — ບໍ່ຮອງຮັບ ຫຼື ຖືກບລັອກ
  }
  try {
    if (navigator.serviceWorker?.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
      workerCount = regs.length;
    }
  } catch {
    // ignore
  }
  return { caches: cacheCount, workers: workerCount };
}

/** ອາຍຸ cache ເປັນຂໍ້ຄວາມພາສາລາວ */
export function formatAge(ms) {
  if (ms === null || ms === undefined) return '—';
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec} ວິນາທີກ່ອນ`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} ນາທີກ່ອນ`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ຊົ່ວໂມງກ່ອນ`;
  return `${Math.floor(hr / 24)} ວັນກ່ອນ`;
}
