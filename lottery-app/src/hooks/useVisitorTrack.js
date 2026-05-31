import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API } from '../utils/api';

function getOrCreateSessionId() {
  let sid = sessionStorage.getItem('_vsid');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('_vsid', sid);
  }
  return sid;
}

export function useVisitorTrack() {
  const location = useLocation();

  useEffect(() => {
    const session_id = getOrCreateSessionId();
    fetch(`${API}/index.php?action=track_visit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: location.pathname, session_id }),
    }).catch(() => {});
  }, [location.pathname]);
}
