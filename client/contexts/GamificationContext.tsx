import React, { createContext, useContext, useState, useEffect, useCallback, PropsWithChildren } from 'react';
import { emitGamificationEvent, fetchGamificationState } from '../services/gamification';
import { useUser } from './UserContext';
import { useUI } from './UIContext';
import { AppView } from '../types';
import { useNavigation } from './NavigationContext';

interface GamificationContextValue {
  navLevel: number;
  navXp: number;
  navXpPercent: number;
  fireGamificationEvent: (eventType: string, payload?: Record<string, unknown>) => void;
}

const GamificationContext = createContext<GamificationContextValue | null>(null);

export function GamificationProvider({ children }: PropsWithChildren) {
  const { user } = useUser();
  const { view } = useNavigation();
  const { showNotification } = useUI();
  const [navLevel, setNavLevel] = useState(1);
  const [navXp, setNavXp] = useState(0);
  const [navXpPercent, setNavXpPercent] = useState(0);

  // Load gamification state when user logs in
  useEffect(() => {
    if (!user?.id) return;
    fetchGamificationState()
      .then(state => {
        setNavLevel(state.xp.level);
        setNavXp(state.xp.totalXp);
        const cur = state.currentLevelXp ?? 0;
        const next = state.nextLevelXp;
        if (next && next > cur) {
          setNavXpPercent(Math.min(100, Math.round(((state.xp.totalXp - cur) / (next - cur)) * 100)));
        }
      })
      .catch(() => {}); // non-critical
  }, [user?.id]);

  const fireGamificationEvent = useCallback((eventType: string, payload: Record<string, unknown> = {}) => {
    // Silence badge toasts during simulado to avoid distraction
    const silent = view === AppView.MOCK_EXAM;

    emitGamificationEvent(eventType, payload)
      .then(result => {
        setNavLevel(result.level);
        setNavXp(result.totalXp);
        if (result.leveledUp && !silent) {
          showNotification(`🚀 LEVEL UP! Você alcançou o Nível ${result.level}!`);
        } else if (!silent && result.newBadges.length > 0) {
          const badge = result.newBadges[0];
          showNotification(`${badge.iconEmoji ?? '🎖️'} Nova conquista: ${badge.title}`);
        }
      })
      .catch(err => console.warn('[gamification] Evento falhou (não-crítico):', err?.message));
  }, [view, showNotification]);

  return (
    <GamificationContext.Provider value={{ navLevel, navXp, navXpPercent, fireGamificationEvent }}>
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used inside GamificationProvider');
  return ctx;
}
