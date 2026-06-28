import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { AppView } from '../types';

interface NavigationContextValue {
  view: AppView;
  navigate: (v: AppView) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: PropsWithChildren) {
  const [view, setView] = useState<AppView>(AppView.LANDING);

  // Persist view changes (except transient auth/landing)
  useEffect(() => {
    if (view !== AppView.LANDING && view !== AppView.AUTH) {
      localStorage.setItem('studr_view', view.toString());
    }
  }, [view]);

  return (
    <NavigationContext.Provider value={{ view, navigate: setView }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used inside NavigationProvider');
  return ctx;
}
