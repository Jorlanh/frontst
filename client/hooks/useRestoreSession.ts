import { useEffect } from 'react';
import { AppView } from '../types';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

interface RestoreSessionOptions {
  setUser: (user: any) => void;
  setAuthInitialMode: (mode: 'LOGIN' | 'REGISTER') => void;
  setIntendedView: (view: AppView | null) => void;
  setIsRestoring: (v: boolean) => void;
  navigate: (v: AppView) => void;
}

export function useRestoreSession({
  setUser,
  setAuthInitialMode,
  setIntendedView,
  setIsRestoring,
  navigate,
}: RestoreSessionOptions) {
  useEffect(() => {
    const hostname = window.location.hostname;
    const isAppSubdomain = hostname.startsWith('app.');
    const isLocal = hostname === 'localhost';
    const isDeployEnv = hostname.includes('railway.app') || hostname.includes('vercel.app');
    const savedUser = localStorage.getItem('studr_user');
    const savedView = localStorage.getItem('studr_view');
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    const jumpTo = urlParams.get('intendedView');

    if (savedUser && (isAppSubdomain || savedView || isLocal)) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      navigate(savedView ? (parseInt(savedView) as AppView) : AppView.HOME);
      if (jumpTo) setIntendedView(parseInt(jumpTo) as AppView);
      setAuthInitialMode(modeParam === 'register' ? 'REGISTER' : 'LOGIN');

      // Validate session with server in background
      const token = localStorage.getItem('studr_token');
      if (token) {
        fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
          .then(r => {
            if (r.status === 401 || r.status === 403) {
              // Token expired on initial restore — clear state and send to login silently
              console.warn('[Session] Token inválido na validação inicial, redirecionando para login');
              localStorage.removeItem('studr_token');
              localStorage.removeItem('studr_user');
              localStorage.removeItem('studr_view');
              setUser(null);
              navigate(AppView.AUTH);
            } else if (r.ok) {
              r.json().then(data => {
                if (data.user) {
                  setUser(data.user);
                  localStorage.setItem('studr_user', JSON.stringify(data.user));
                }
              });
            }
          })
          .catch(() => {}); // Network error: keep cached session
      }
    } else if (isAppSubdomain || isLocal || isDeployEnv) {
      setAuthInitialMode(modeParam === 'register' ? 'REGISTER' : 'LOGIN');
      navigate(AppView.AUTH);
      if (jumpTo) setIntendedView(parseInt(jumpTo) as AppView);
    } else {
      // Root domain (marketing site): always show landing
      setUser(null);
      navigate(AppView.LANDING);
    }

    setIsRestoring(false);
  }, []);
}
