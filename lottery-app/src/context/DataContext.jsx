import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { API } from '../utils/api';

const DataContext = createContext({
  animals: [],
  draws: [],
  types: [],
  loading: true,
  error: null
});

// ── localStorage stale-while-revalidate cache ─────────────────────
// ຂໍ້ມູນ animals/types ບໍ່ຄ່ອຍປ່ຽນ → cache 5 ນາທີ (fresh window)
// ຂໍ້ມູນ draws ອາດປ່ຽນທຸກ session → cache 60 ວິ (ສັ້ນ)
const CACHE_KEY   = 'lao_lottery_data_v1';
const DRAWS_TTL   =  60 * 1000;   // 60 ວິ — draws fresh window
const STATIC_TTL  =   5 * 60 * 1000; // 5 ນາທີ — animals/types fresh window

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(payload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...payload, ts: Date.now() }));
  } catch {
    // localStorage full / private mode — silently ignore
  }
}

function expireDrawsCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const cache = JSON.parse(raw);
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...cache, ts: 0 }));
  } catch {
    // silently ignore
  }
}

export const DataProvider = ({ children }) => {
  // Seed state from cache immediately so first render has data (no spinner on return visits)
  const cached = readCache();
  const [animals, setAnimals] = useState(cached?.animals ?? []);
  const [draws, setDraws]     = useState(cached?.draws   ?? []);
  const [types, setTypes]     = useState(cached?.types   ?? []);
  const [liveSettings, setLiveSettings] = useState({ youtube_live_url: '', is_live: '0' });
  // loading=false if we already have cached data to show
  const [loading, setLoading] = useState(!cached?.draws?.length);
  const [error, setError] = useState(null);

  // Track previous draw data to avoid unnecessary re-renders
  const prevDrawsJsonRef = useRef(cached ? JSON.stringify(cached.draws) : '');

  const fetchData = useCallback(async (force = false) => {
    // Stale-while-revalidate: check if ALL data is still within its fresh window
    const now = Date.now();
    const cache = readCache();
    const drawsFresh  = !force && cache && (now - cache.ts) < DRAWS_TTL;
    const staticFresh = !force && cache && (now - cache.ts) < STATIC_TTL;
    // force=true bypasses browser HTTP cache (e.g. after saving a new draw)
    const fetchOpts = force ? { cache: 'no-cache' } : undefined;

    try {
      // Only fetch what's stale — avoid unnecessary requests
      const fetches = [];
      if (!staticFresh) {
        fetches.push(
          fetch(`${API}/index.php?action=animals`, fetchOpts),
          fetch(`${API}/index.php?action=types`, fetchOpts),
        );
      }
      if (!drawsFresh) {
        fetches.push(fetch(`${API}/index.php?action=draws`, fetchOpts));
      }
      // live_settings always polled (lightweight, handled separately)
      fetches.push(fetch(`${API}/index.php?action=live_settings`));

      if (fetches.length === 1) {
        // Only live_settings needed — nothing else stale
        const liveRes = await fetches[0];
        if (liveRes.ok) setLiveSettings(await liveRes.json());
        setLoading(false);
        return;
      }

      const responses = await Promise.all(fetches);
      for (const r of responses) {
        if (!r.ok) throw new Error('Failed to fetch data');
      }

      // Parse each response by which fetches we triggered
      let idx = 0;
      let animalsData = cache?.animals;
      let typesData   = cache?.types;
      let drawsData   = cache?.draws;

      if (!staticFresh) {
        animalsData = await responses[idx++].json();
        typesData   = await responses[idx++].json();
      }
      if (!drawsFresh) {
        drawsData = await responses[idx++].json();
      }
      const liveData = await responses[idx].json();

      // Only update draws state if data actually changed
      const drawsJson = JSON.stringify(drawsData);
      if (drawsJson !== prevDrawsJsonRef.current) {
        prevDrawsJsonRef.current = drawsJson;
        const sortedDraws = [...drawsData].sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
        setDraws(sortedDraws);
        drawsData = sortedDraws;
      }

      if (!staticFresh) {
        setAnimals(animalsData);
        setTypes(typesData);
      }
      setLiveSettings(liveData);

      // Persist to cache
      writeCache({ animals: animalsData, draws: drawsData, types: typesData });
      setLoading(false);
    } catch (err) {
      console.error(err);
      // If we have cache, keep showing it and don't show error
      if (cached?.draws?.length) {
        setLoading(false);
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  }, []);

  // Separate lightweight poll for live settings only (every 10s)
  const fetchLiveOnly = useCallback(async () => {
    try {
      const res = await fetch(`${API}/index.php?action=live_settings`);
      if (res.ok) {
        const data = await res.json();
        setLiveSettings(data);
      }
    } catch {
      // silently ignore — non-critical
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Full data refresh every 60s (was 30s — reduces server load by 50%)
    const fullInterval = setInterval(fetchData, 60000);

    // Live settings poll every 10s (lightweight — single small query)
    const liveInterval = setInterval(fetchLiveOnly, 10000);

    return () => {
      clearInterval(fullInterval);
      clearInterval(liveInterval);
    };
  }, [fetchData, fetchLiveOnly]);

  const refreshData = useCallback(async () => {
    expireDrawsCache();
    return fetchData(true); // force=true bypasses browser HTTP cache
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ animals, draws, types, liveSettings, loading, error, refreshData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
