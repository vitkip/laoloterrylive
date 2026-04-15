import { createContext, useState, useEffect, useContext } from 'react';

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
        fetch('http://localhost/laoloterylive/api/index.php?action=animals'),
        fetch('http://localhost/laoloterylive/api/index.php?action=draws'),
        fetch('http://localhost/laoloterylive/api/index.php?action=types'),
        fetch('http://localhost/laoloterylive/api/index.php?action=live_settings')
      ]);
      
      if (!animalsRes.ok || !drawsRes.ok || !typesRes.ok || !liveRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const animalsData = await animalsRes.json();
      const drawsData = await drawsRes.json();
      const typesData = await typesRes.json();
      const liveData = await liveRes.json();

      setAnimals(animalsData);
      setDraws(drawsData);
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
    const interval = setInterval(fetchData, 5000); // Polling every 5 seconds for Real-Time updates
    return () => clearInterval(interval);
  }, []);

  return (
    <DataContext.Provider value={{ animals, draws, types, liveSettings, loading, error, refreshData: fetchData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
