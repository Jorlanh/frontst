/**
 * gamification.ts
 * ---------------
 * Thin HTTP client for /api/gamification/* endpoints.
 * All gamification logic lives server-side (gamificationService.js).
 * This file only sends events and reads state — no local calculations.
 */

import { apiRequest } from './apiService';

// ─── Types (matching server/services/gamificationService.js output) ───────────

export interface GamBadge {
  key: string;
  title: string;
  description: string;
  category: string;
  iconEmoji: string | null;
  awardedAt?: string;
}

export interface GamXp {
  totalXp: number;
  level: number;
  weeklyXp: number;
}

export interface GamStreak {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
}

export interface GamProgress {
  subject: string;
  questionsAnswered: number;
  questionsCorrect: number;
}

export interface ServerGamificationState {
  xp: GamXp;
  title: string;
  currentLevelXp: number;
  nextLevelXp: number | null;
  streak: GamStreak;
  badges: GamBadge[];
  progress: GamProgress[];
}

export interface EventResult {
  xpDelta: number;
  totalXp: number;
  level: number;
  leveledUp: boolean;
  newBadges: GamBadge[];
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function emitGamificationEvent(
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<EventResult> {
  return apiRequest('/gamification/event', 'POST', { eventType, payload });
}

export async function fetchGamificationState(): Promise<ServerGamificationState> {
  return apiRequest('/gamification/state', 'GET');
}
