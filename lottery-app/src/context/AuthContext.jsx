import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { API } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('lao_lottery_user');
    const storedToken = localStorage.getItem('lao_lottery_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      tokenRef.current = storedToken;
    }
    setLoading(false);
  }, []);

  // Keep ref in sync so authFetch always has latest token
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    tokenRef.current = null;
    localStorage.removeItem('lao_lottery_user');
    localStorage.removeItem('lao_lottery_token');
  }, []);

  const login = async (username, password) => {
    const res = await fetch(`${API}/auth.php?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setToken(data.token);
      tokenRef.current = data.token;
      localStorage.setItem('lao_lottery_user', JSON.stringify(data.user));
      localStorage.setItem('lao_lottery_token', data.token);
      return { success: true };
    }
    return { success: false, error: data.error || 'Login failed' };
  };

  /**
   * Authenticated fetch wrapper.
   * - Auto-injects Authorization header
   * - On TOKEN_EXPIRED: logs out and redirects to /login
   * - Returns { ok, data, status } like a normal fetch response
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    }
    if (tokenRef.current) {
      headers['Authorization'] = `Bearer ${tokenRef.current}`;
    }

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok && data?.code === 'TOKEN_EXPIRED') {
      logout();
      window.location.replace('/login');
      return { ok: false, data, status: res.status };
    }

    return { ok: res.ok, data, status: res.status };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);