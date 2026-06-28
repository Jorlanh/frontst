import React, { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';

interface UIContextValue {
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  // Chat
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  // Pricing modal
  isPricingModalOpen: boolean;
  openPricing: () => void;
  closePricing: () => void;
  // Gamification toast notification
  notification: string | null;
  showNotification: (msg: string) => void;
  dismissNotification: () => void;
  // Session expired modal
  sessionExpired: boolean;
  setSessionExpired: (v: boolean) => void;
  // Fetch error modal (network failure during question load)
  fetchErrorOpen: boolean;
  fetchErrorRetrying: boolean;
  openFetchError: () => void;
  closeFetchError: () => void;
  setFetchErrorRetrying: (v: boolean) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('studr_theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [fetchErrorOpen, setFetchErrorOpen] = useState(false);
  const [fetchErrorRetrying, setFetchErrorRetrying] = useState(false);

  // Apply theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studr_theme', theme);
  }, [theme]);

  // Auto-dismiss notifications after 4s
  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(t);
  }, [notification]);

  // Session expired event from apiService
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      console.warn('[Session] Evento session-expired recebido:', detail);
      setSessionExpired(true);
    };
    window.addEventListener('studr:session-expired', handler);
    return () => window.removeEventListener('studr:session-expired', handler);
  }, []);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'light' ? 'dark' : 'light'), []);
  const setChatOpen = useCallback((open: boolean) => setIsChatOpen(open), []);
  const openPricing = useCallback(() => setIsPricingModalOpen(true), []);
  const closePricing = useCallback(() => setIsPricingModalOpen(false), []);
  const showNotification = useCallback((msg: string) => setNotification(msg), []);
  const dismissNotification = useCallback(() => setNotification(null), []);
  const openFetchError = useCallback(() => setFetchErrorOpen(true), []);
  const closeFetchError = useCallback(() => setFetchErrorOpen(false), []);

  return (
    <UIContext.Provider value={{
      theme, toggleTheme,
      isChatOpen, setChatOpen,
      isPricingModalOpen, openPricing, closePricing,
      notification, showNotification, dismissNotification,
      sessionExpired, setSessionExpired,
      fetchErrorOpen, fetchErrorRetrying,
      openFetchError, closeFetchError, setFetchErrorRetrying,
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI must be used inside UIProvider');
  return ctx;
}
