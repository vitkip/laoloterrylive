import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { API } from '../utils/api';

const AuthContext = createContext();

const TOKEN_KEY         = 'lao_lottery_token';
const REFRESH_TOKEN_KEY = 'lao_lottery_refresh_token';
const USER_KEY          = 'lao_lottery_user';
const EXPIRES_KEY       = 'lao_lottery_expires_at'; // unix timestamp (ms)

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef     = useRef(null);
  const isRefreshing = useRef(false);

  useEffect(() => {
    const storedUser  = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      tokenRef.current = storedToken;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    tokenRef.current = null;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
  }, []);

  /** Attempt to get a new access token using the stored refresh token.
   *  Returns new access token string on success, null on failure. */
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing.current) return null;
    isRefreshing.current = true;
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      const res  = await fetch(`${API}/auth.php?action=refresh_token`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        tokenRef.current = data.token;
        localStorage.setItem(TOKEN_KEY, data.token);
        if (data.refresh_token) {
          localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
        }
        if (data.expires_in) {
          localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
        }
        return data.token;
      }
      return null;
    } finally {
      isRefreshing.current = false;
    }
  }, []);

  const login = async (username, password) => {
    const res  = await fetch(`${API}/auth.php?action=login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setToken(data.token);
      tokenRef.current = data.token;
      localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }
      if (data.expires_in) {
        localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
      }
      return { success: true, role: data.user.role };
    }
    return { success: false, error: data.error || 'Login failed' };
  };

  const socialLogin = async (provider, payload) => {
    const res  = await fetch(`${API}/auth.php?action=social_login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ provider, ...payload }),
    });
    const data = await res.json();
    if (res.ok) {
      setUser(data.user);
      setToken(data.token);
      tokenRef.current = data.token;
      localStorage.setItem(USER_KEY,  JSON.stringify(data.user));
      localStorage.setItem(TOKEN_KEY, data.token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }
      if (data.expires_in) {
        localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
      }
      return { success: true, role: data.user.role };
    }
    return { success: false, error: data.error || 'Social login failed' };
  };

  /**
   * Authenticated fetch wrapper.
   * - Auto-injects Authorization header
   * - On TOKEN_EXPIRED: attempts refresh once, then retries
   * - On REFRESH_INVALID/REFRESH_EXPIRED: logs out → /login
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const buildHeaders = (tk) => {
      const h = { ...(options.headers || {}) };
      if (!(options.body instanceof FormData)) {
        h['Content-Type'] = h['Content-Type'] || 'application/json';
      }
      if (tk) h['Authorization'] = `Bearer ${tk}`;
      return h;
    };

    let res  = await fetch(url, { ...options, headers: buildHeaders(tokenRef.current) });
    let data = await res.json();

    if (!res.ok && data?.code === 'TOKEN_EXPIRED') {
      const newToken = await refreshAccessToken();
      if (newToken) {
        res  = await fetch(url, { ...options, headers: buildHeaders(newToken) });
        data = await res.json();
      } else {
        logout();
        window.location.replace('/login');
        return { ok: false, data, status: res.status };
      }
    }

    if (!res.ok && (data?.code === 'REFRESH_INVALID' || data?.code === 'REFRESH_EXPIRED')) {
      logout();
      window.location.replace('/login');
      return { ok: false, data, status: res.status };
    }

    return { ok: res.ok, data, status: res.status };
  }, [logout, refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
