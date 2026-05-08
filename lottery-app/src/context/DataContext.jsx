import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { API } from '../utils/api';

const DataContext = createContext({
  animals: [],
  draws: [],
  types: [],
  loading: true,
  error: null
});

export const DataProvider = ({ children }) => {
  const [animals, setAnimals] = useState([]);
  const [draws, setDraws] = useState([]);
  const [types, setTypes] = useState([]);
  const [liveSettings, setLiveSettings] = useState({ youtube_live_url: '', is_live: '0' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track previous draw data to avoid unnecessary re-renders
  const prevDrawsJsonRef = useRef('');

  const fetchData = useCallback(async () => {
    try {
      const [animalsRes, drawsRes, typesRes, liveRes] = await Promise.all([
        fetch(`${API}/index.php?action=animals`),
        fetch(`${API}/index.php?action=draws`),
        fetch(`${API}/index.php?action=types`),
        fetch(`${API}/index.php?action=live_settings`)
      ]);
      
      if (!animalsRes.ok || !drawsRes.ok || !typesRes.ok || !liveRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const animalsData = await animalsRes.json();
      const drawsData = await drawsRes.json();
      const typesData = await typesRes.json();
      const liveData = await liveRes.json();

      // Only update draws if data actually changed (prevents unnecessary re-renders
      // and re-computation of useStatistics which is O(N²))
      const drawsJson = JSON.stringify(drawsData);
      if (drawsJson !== prevDrawsJsonRef.current) {
        prevDrawsJsonRef.current = drawsJson;
        // Sort once here, no need to sort again in consumers
        const sortedDraws = drawsData.sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
        setDraws(sortedDraws);
      }

      setAnimals(animalsData);
      setTypes(typesData);
      setLiveSettings(liveData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
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

  return (
    <DataContext.Provider value={{ animals, draws, types, liveSettings, loading, error, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
