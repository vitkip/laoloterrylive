import { createContext, useState, useEffect, useContext } from 'react';
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

  const fetchData = async () => {
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

      const sortedDraws = [...drawsData].sort((a, b) => new Date(b.draw_date) - new Date(a.draw_date));
      setAnimals(animalsData);
      setDraws(sortedDraws);
      setTypes(typesData);
      setLiveSettings(liveData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ animals, draws, types, liveSettings, loading, error, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
