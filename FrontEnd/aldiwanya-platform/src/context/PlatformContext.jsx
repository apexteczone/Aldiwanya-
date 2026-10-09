import {useCallback, useEffect, useState} from 'react';
import {PlatformContext} from './platform-context';
import api from '../services/api';

export function PlatformProvider({children}) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = useCallback(async () => {
    const response = await api.get('/user/me');
    setProfile(response.data.data);
    return response.data.data;
  }, []);
  useEffect(() => {
    let active = true;
    if (!(sessionStorage.getItem('token') || localStorage.getItem('token'))) {
      Promise.resolve().then(() => {if (active) setLoading(false);});
      return () => {active = false;};
    }
    api.get('/user/me').then(r => {if (active) setProfile(r.data.data);})
      .catch(e => {if (active && e.response?.status !== 401) setError('تعذر تحميل حسابك. أعد المحاولة.');})
      .finally(() => {if (active) setLoading(false);});
    return () => {active = false;};
  }, []);
  useEffect(() => {
    const expire = () => setProfile(null);
    window.addEventListener('session-expired', expire);
    return () => window.removeEventListener('session-expired', expire);
  }, []);
  async function login(values) {
    const r = await api.post('/auth/login', values);
    sessionStorage.removeItem('token'); localStorage.removeItem('token');
    (values.rememberMe ? localStorage : sessionStorage).setItem('token', r.data.data.accessToken);
    setError('');
    return refresh();
  }
  async function logout() {
    try {await api.post('/auth/logout');}
    finally {sessionStorage.removeItem('token'); localStorage.removeItem('token'); setProfile(null);}
  }
  return <PlatformContext.Provider value={{profile, loading, error, refresh, login, logout}}>{children}</PlatformContext.Provider>;
}
