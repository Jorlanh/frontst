import { useState, useRef, useCallback } from 'react';

// Motor de Cálculo Dinâmico de Tempo (Modo Jornada)
export function calculateEssayTimeLimit(towerLevel: number): number {
  if (towerLevel < 10) return (90 * 60) - (towerLevel * 60); 
  if (towerLevel < 30) return (70 * 60) - ((towerLevel - 10) * 30);
  if (towerLevel < 70) return (55 * 60) - ((towerLevel - 30) * 15);
  return Math.max(30 * 60, (40 * 60) - ((towerLevel - 70) * 30));
}

export function useTimer(onTimeUp: () => void) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [maxTime, setMaxTime] = useState(0);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback((durationSeconds: number) => {
    stopTimer();
    setMaxTime(durationSeconds);
    setTimeRemaining(durationSeconds);
    setIsTimeUp(false);

    timerRef.current = window.setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          stopTimer();
          setIsTimeUp(true);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  const resetTimer = useCallback(() => {
    stopTimer();
    setTimeRemaining(0);
    setMaxTime(0);
    setIsTimeUp(false);
  }, [stopTimer]);

  // Telemetria de Pressão Psicológica
  const percentageLeft = maxTime > 0 ? (timeRemaining / maxTime) * 100 : 100;
  const isAlertPhase = percentageLeft <= 15 && percentageLeft > 5;
  const isCriticalPhase = percentageLeft <= 5 && timeRemaining > 60;
  const isFinalBattle = timeRemaining <= 60 && timeRemaining > 0 && maxTime > 0;

  return { 
    timeRemaining, 
    maxTime,
    isTimeUp, 
    startTimer, 
    stopTimer, 
    resetTimer,
    isAlertPhase,
    isCriticalPhase,
    isFinalBattle
  };
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}