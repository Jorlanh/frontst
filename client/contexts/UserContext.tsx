import React, { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';
import { AppView } from '../types';
import { useNavigation } from './NavigationContext';
import { useRestoreSession } from '../hooks/useRestoreSession';
import { useAffiliateTracking } from '../hooks/useAffiliateTracking';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  affiliateStatus?: string;
  xp: number;
  level: number;
  isPremium: boolean;
  subscriptionStatus?: string | null;
  trialEndsAt?: string;
  trialActive?: boolean;
}

interface UserContextValue {
  user: User | null;
  isRestoring: boolean;
  authInitialMode: 'LOGIN' | 'REGISTER';
  setAuthInitialMode: (m: 'LOGIN' | 'REGISTER') => void;
  intendedView: AppView | null;
  setIntendedView: (v: AppView | null) => void;
  affiliateData: any;
  trialActive: boolean;
  isTrial: boolean;
  handleLoginSuccess: (data: { user: User; token: string }) => void;
  handleLogout: () => void;
  handleSessionExpiredConfirm: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: PropsWithChildren) {
  const { navigate } = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [authInitialMode, setAuthInitialMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [intendedView, setIntendedView] = useState<AppView | null>(null);
  const [affiliateData, setAffiliateData] = useState<any>(null);

  useRestoreSession({ setUser, setAuthInitialMode, setIntendedView, setIsRestoring, navigate });
  useAffiliateTracking(setAffiliateData);

  const trialActive = user?.isPremium ? false : (user?.trialEndsAt ? new Date() < new Date(user.trialEndsAt) : false);
  const isTrial = trialActive && !user?.isPremium && user?.subscriptionStatus !== 'MOCK_ONLY';

  const handleLoginSuccess = useCallback((data: { user: User; token: string }) => {
    setUser(data.user);
    localStorage.setItem('studr_user', JSON.stringify(data.user));
    localStorage.setItem('studr_token', data.token);

    // Force redirect to app subdomain when on root domain
    const hostname = window.location.hostname;
    if (!hostname.startsWith('app.') && hostname !== 'localhost' && !hostname.includes('railway.app')) {
      const mode = authInitialMode === 'REGISTER' ? 'mode=register' : '';
      const iv = intendedView ? `&intendedView=${intendedView}` : '';
      window.location.href = `https://app.studr.com.br?${mode}${iv}`.replace('?&', '?');
      return;
    }

    if (data.user.role === 'affiliate') {
      navigate(AppView.AFFILIATE_DASHBOARD);
    } else {
      navigate(intendedView ?? AppView.HOME);
      setIntendedView(null);
    }
  }, [authInitialMode, intendedView, navigate]);

  const handleLogout = useCallback(() => {
    if (confirm('Deseja realmente sair? Isso reiniciará o aplicativo.')) {
      setUser(null);
      localStorage.removeItem('studr_user');
      localStorage.removeItem('studr_token');
      navigate(AppView.LANDING);
    }
  }, [navigate]);

  const handleSessionExpiredConfirm = useCallback(() => {
    localStorage.removeItem('studr_user');
    localStorage.removeItem('studr_token');
    localStorage.removeItem('studr_view');
    setUser(null);
    navigate(AppView.AUTH);
  }, [navigate]);

  return (
    <UserContext.Provider value={{
      user, isRestoring,
      authInitialMode, setAuthInitialMode,
      intendedView, setIntendedView,
      affiliateData,
      trialActive, isTrial,
      handleLoginSuccess, handleLogout, handleSessionExpiredConfirm,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
