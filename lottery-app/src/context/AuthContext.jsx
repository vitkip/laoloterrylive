import { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { API } from '../utils/api';

const AuthContext = createContext();

const TOKEN_KEY         = 'lao_lottery_token';
const REFRESH_TOKEN_KEY = 'lao_lottery_refresh_token';
const USER_KEY          = 'lao_lottery_user';
const EXPIRES_KEY       = 'lao_lottery_expires_at';         // access token expiry (unix ms)
const SESSION_KEY       = 'lao_lottery_session_ends_at';    // hard session deadline (unix ms)

// Refresh this long before the access token actually expires, so a request
// never goes out with a token that dies in flight.
const REFRESH_SKEW_MS = 30 * 1000;

/** res.json() throws on empty bodies and on PHP fatals that emit HTML. */
async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenRef      = useRef(null);
  const refreshInFlight = useRef(null);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const clearSession = useCallback(() => {
    setUser(null);
    setToken(null);
    tokenRef.current = null;
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_KEY);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const accessToken  = tokenRef.current;
    clearSession();
    // Fire-and-forget: revoke the refresh token server-side so the session
    // cannot be resumed. Failure here must not block the local logout.
    if (refreshToken) {
      fetch(`${API}/auth.php?action=logout`, {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }).catch(() => {});
    }
  }, [clearSession]);

  const persistTokens = useCallback((data) => {
    setToken(data.token);
    tokenRef.current = data.token;
    localStorage.setItem(TOKEN_KEY, data.token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }
    if (data.expires_in) {
      localStorage.setItem(EXPIRES_KEY, String(Date.now() + data.expires_in * 1000));
    }
    if (data.session_ends_in) {
      localStorage.setItem(SESSION_KEY, String(Date.now() + data.session_ends_in * 1000));
    }
  }, []);

  /**
   * Exchange the refresh token for a new access token.
   *
   * Concurrent callers share one in-flight request — the server rotates and
   * revokes the refresh token on every use, so two parallel refreshes would
   * make the second one fail and log the user out.
   *
   * Returns { token }   → refreshed, retry the request
   *         { expired } → session is over, log out
   *         { retry }   → network/server hiccup, keep the session
   */
  const refreshAccessToken = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current;

    refreshInFlight.current = (async () => {
      try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) return { expired: true };

        const sessionEndsAt = Number(localStorage.getItem(SESSION_KEY) || 0);
        if (sessionEndsAt && Date.now() >= sessionEndsAt) return { expired: true };

        let res;
        try {
          res = await fetch(`${API}/auth.php?action=refresh_token`, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ refresh_token: refreshToken }),
          });
        } catch {
          return { retry: true }; // offline — don't destroy a valid session
        }

        const data = await safeJson(res);
        if (res.ok && data?.token) {
          persistTokens(data);
          return { token: data.token };
        }
        // 401/403 = the session is genuinely finished; anything else is a
        // server-side problem the user shouldn't be logged out for.
        if (res.status === 401 || res.status === 403) return { expired: true };
        return { retry: true };
      } finally {
        refreshInFlight.current = null;
      }
    })();

    return refreshInFlight.current;
  }, [persistTokens]);

  // Restore the session on boot. If the stored access token is already stale we
  // refresh before rendering, so a returning user lands straight in the app
  // instead of flashing it and being bounced by the first 401.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser  = localStorage.getItem(USER_KEY);
        if (!storedToken || !storedUser) return;

        let parsedUser;
        try {
          parsedUser = JSON.parse(storedUser);
        } catch {
          clearSession();
          return;
        }

        const sessionEndsAt = Number(localStorage.getItem(SESSION_KEY) || 0);
        if (sessionEndsAt && Date.now() >= sessionEndsAt) {
          clearSession();
          return;
        }

        const accessEndsAt = Number(localStorage.getItem(EXPIRES_KEY) || 0);
        if (accessEndsAt && Date.now() >= accessEndsAt - REFRESH_SKEW_MS) {
          const result = await refreshAccessToken();
          if (cancelled) return;
          if (result.expired) {
            clearSession();
            return;
          }
          // On { retry } keep the stale token — authFetch will try again.
        }

        if (cancelled) return;
        setUser(parsedUser);
        if (!tokenRef.current) {
          setToken(storedToken);
          tokenRef.current = storedToken;
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [clearSession, refreshAccessToken]);

  const startSession = useCallback((data) => {
    setUser(data.user);
    persistTokens(data);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  }, [persistTokens]);

  const login = async (username, password) => {
    const res  = await fetch(`${API}/auth.php?action=login`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (res.ok) {
      startSession(data);
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
      startSession(data);
      return { success: true, role: data.user.role };
    }
    return { success: false, error: data.error || 'Social login failed' };
  };

  const endSessionAndRedirect = useCallback(() => {
    clearSession();
    window.location.replace('/login');
  }, [clearSession]);

  /**
   * Authenticated fetch wrapper.
   * - Auto-injects Authorization header
   * - Refreshes ahead of expiry, and once more on TOKEN_EXPIRED
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

    // Proactive refresh — avoids a guaranteed 401 round-trip.
    const accessEndsAt = Number(localStorage.getItem(EXPIRES_KEY) || 0);
    if (tokenRef.current && accessEndsAt && Date.now() >= accessEndsAt - REFRESH_SKEW_MS) {
      const pre = await refreshAccessToken();
      if (pre.expired) {
        endSessionAndRedirect();
        return { ok: false, data: null, status: 401 };
      }
    }

    let res  = await fetch(url, { ...options, headers: buildHeaders(tokenRef.current) });
    let data = await safeJson(res);

    if (!res.ok && data?.code === 'TOKEN_EXPIRED') {
      const result = await refreshAccessToken();
      if (result.token) {
        res  = await fetch(url, { ...options, headers: buildHeaders(result.token) });
        data = await safeJson(res);
      } else if (result.expired) {
        endSessionAndRedirect();
        return { ok: false, data, status: res.status };
      }
      // { retry } → fall through with the original 401; session stays alive.
    }

    if (!res.ok && (data?.code === 'REFRESH_INVALID' || data?.code === 'REFRESH_EXPIRED')) {
      endSessionAndRedirect();
      return { ok: false, data, status: res.status };
    }

    return { ok: res.ok, data, status: res.status };
  }, [endSessionAndRedirect, refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, authFetch, socialLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
