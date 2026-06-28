import React, { createContext, useContext, useState, useRef, useEffect, useCallback, PropsWithChildren } from 'react';
import { AreaOfKnowledge, Question, AppView } from '../types';
import { generateQuestionBatch } from '../services/aiClientService';
import { apiRequest } from '../services/apiService';
import { useNavigation } from './NavigationContext';
import { useUI } from './UIContext';
import { useGamification } from './GamificationContext';
import { useUser } from './UserContext';
import { useTimer, formatTime } from '../hooks/useTimer';

const FULL_EXAM_DURATION = 19800;  // 5h 30m in seconds
const AREA_EXAM_DURATION = 5400;   // 1h 30m in seconds

interface MockContextValue {
  questions: Question[];
  userAnswers: Record<string, number>;
  currentQuestionIndex: number;
  simuladoMode: 'FULL' | 'AREA' | null;
  simuladoTargetCount: number;
  simuladoTargetArea: AreaOfKnowledge | null;
  currentExamId: string | null;
  lastExamScore: number | undefined;
  lastExamBand: string | undefined;
  timeRemaining: number;
  isTimeUp: boolean;
  loading: boolean;
  startSimulado: (mode: 'FULL' | 'AREA', targetArea?: AreaOfKnowledge, options?: { towerQuestionsCount?: number }) => Promise<void>;
  handleAnswerSelect: (optionIndex: number) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  cancelMock: () => void;
  retryFetchNext: () => Promise<void>;
  finalizeWithPartial: () => void;
  formatTime: (seconds: number) => string;
  examDuration: number;
}

const MockContext = createContext<MockContextValue | null>(null);

const DIFFICULTY_KEY: Record<string, string> = {
  'Fácil': 'Fácil', 'Média': 'Média', 'Difícil': 'Difícil',
};

export function MockProvider({ children }: PropsWithChildren) {
  const { navigate, view } = useNavigation();
  const { openPricing, openFetchError, closeFetchError, setFetchErrorRetrying } = useUI();
  const { fireGamificationEvent } = useGamification();
  const { user } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [simuladoMode, setSimuladoMode] = useState<'FULL' | 'AREA' | null>(null);
  const [simuladoTargetCount, setSimuladoTargetCount] = useState(0);
  const [simuladoTargetArea, setSimuladoTargetArea] = useState<AreaOfKnowledge | null>(null);
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  const [lastExamScore, setLastExamScore] = useState<number | undefined>(undefined);
  const [lastExamBand, setLastExamBand] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const isFetchingRef = useRef(false);
  const simuladoModeRef = useRef(simuladoMode);
  const simuladoTargetAreaRef = useRef(simuladoTargetArea);
  const simuladoTargetCountRef = useRef(simuladoTargetCount);
  const currentExamIdRef = useRef(currentExamId);

  // Keep refs in sync for use inside callbacks and background loops
  useEffect(() => { simuladoModeRef.current = simuladoMode; }, [simuladoMode]);
  useEffect(() => { simuladoTargetAreaRef.current = simuladoTargetArea; }, [simuladoTargetArea]);
  useEffect(() => { simuladoTargetCountRef.current = simuladoTargetCount; }, [simuladoTargetCount]);
  useEffect(() => { currentExamIdRef.current = currentExamId; }, [currentExamId]);

  const handleTimeUp = useCallback(() => {
    finalizeWithPartial();
  }, []);

  const { timeRemaining, isTimeUp, startTimer, stopTimer, resetTimer } = useTimer(handleTimeUp);

  const fetchBatchWithRetry = useCallback(async (
    area: AreaOfKnowledge,
    count: number,
    excludeTopics: string[],
    examId?: string,
    maxAttempts: number = 3,
  ): Promise<Question[]> => {
    let lastErr: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await generateQuestionBatch(area, count, undefined, excludeTopics, false, true, examId);
      } catch (e: any) {
        lastErr = e;
        if (attempt < maxAttempts) {
          const backoff = 2000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }
    throw lastErr;
  }, []);

  // ==========================================
  // 🔄 MOTOR DE BUFFER EM SEGUNDO PLANO
  // ==========================================
  const fillSimuladoInBackground = useCallback(async (
    mode: 'FULL' | 'AREA',
    targetArea: AreaOfKnowledge | null,
    targetCount: number,
    initialQuestions: Question[],
    examId: string | null
  ) => {
    let missing = targetCount - initialQuestions.length;
    let currentExcludes = Array.from(new Set(initialQuestions.map(q => q.subject).filter(Boolean))) as string[];

    console.log(`[Buffer] Iniciando download silencioso das ${missing} questões restantes...`);

    while (missing > 0 && simuladoModeRef.current !== null) {
      const batchSize = Math.min(15, missing);
      
      try {
        const nextIndex = targetCount - missing;
        let areaToFetch = targetArea || AreaOfKnowledge.HUMANAS;
        
        if (mode === 'FULL') {
          if (nextIndex < 45) areaToFetch = AreaOfKnowledge.HUMANAS;
          else if (nextIndex < 90) areaToFetch = AreaOfKnowledge.LINGUAGENS;
          else if (nextIndex < 135) areaToFetch = AreaOfKnowledge.NATUREZA;
          else areaToFetch = AreaOfKnowledge.EXATAS;
        }

        const newBatch = await fetchBatchWithRetry(areaToFetch, batchSize, currentExcludes, examId ?? undefined);

        if (newBatch && newBatch.length > 0) {
          setQuestions(prev => [...prev, ...newBatch]);
          missing -= newBatch.length;
          
          newBatch.forEach(q => {
            if (q.subject) currentExcludes.push(q.subject);
          });
          currentExcludes = currentExcludes.slice(-20);
        }

        await new Promise(res => setTimeout(res, 3000)); 
      } catch (error) {
        console.warn("[Simulado Buffer] Falha no lote de fundo. Tentando de novo em 5s...");
        await new Promise(res => setTimeout(res, 5000));
      }
    }
    
    if (missing === 0) {
        console.log("✅ Buffer Concluído: Todas as questões foram carregadas na memória!");
    }
  }, [fetchBatchWithRetry]);

  const finalizeSimulado = useCallback(async (questionsToScore: Question[]) => {
    stopTimer();

    const responses = questionsToScore.map((q, i) => ({
      questionId: q.id,
      orderIndex: i,
      difficulty: DIFFICULTY_KEY[q.difficulty] || 'MEDIUM',
      correct: userAnswers[q.id] === q.correctIndex,
      userAnswer: userAnswers[q.id] ?? null,
    }));

    let finalScore = 300;
    let finalBand = 'Insuficiente';

    try {
      const examId = currentExamIdRef.current;
      if (examId) {
        const result = await apiRequest(`/exams/${examId}/finalize`, 'POST', { responses });
        finalScore = result.score ?? 300;
        finalBand = result.band ?? 'Insuficiente';
      }
    } catch (err) {
      console.error('[finalizeSimulado] Erro ao calcular nota no servidor:', err);
    }

    setLastExamScore(finalScore);
    setLastExamBand(finalBand);

    if (user?.id) {
      localStorage.setItem(`studr_last_mock_${user.id}`, new Date().toISOString());
    }

    fireGamificationEvent('FINISH_MOCK', {
      mockType: simuladoModeRef.current === 'FULL' ? 'MOCK_FULL' : 'MOCK_AREA',
      score: finalScore,
    });

    if (questionsToScore.length !== questions.length) {
      setQuestions(questionsToScore);
    }

    navigate(AppView.RESULTS);
  }, [userAnswers, questions.length, user?.id, fireGamificationEvent, navigate, stopTimer]);

  const startSimulado = useCallback(async (
      mode: 'FULL' | 'AREA', 
      targetArea?: AreaOfKnowledge, 
      options?: { towerQuestionsCount?: number }
  ) => {
    if (isFetchingRef.current) return;
    setLoading(true);
    isFetchingRef.current = true;

    setSimuladoMode(mode);
    setSimuladoTargetArea(targetArea || null);
    
    // INCREMENTO: Define a quantidade de questões do Prédio, ou usa os defaults do ENEM
    let targetCount = mode === 'FULL' ? 180 : 45;
    if (options?.towerQuestionsCount) {
        targetCount = options.towerQuestionsCount;
    }
    setSimuladoTargetCount(targetCount);

    let examId: string | null = null;
    try {
      const startResult = await apiRequest('/mock/start', 'POST', { mode, area: targetArea || null });
      examId = startResult.examId ?? null;
      setCurrentExamId(examId);
    } catch (e: any) {
      setLoading(false);
      isFetchingRef.current = false;
      if (e?.status === 403) {
        const msgs: Record<string, string> = {
          TRIAL_EXPIRED: 'Seu período de trial expirou. Assine o Premium para continuar.',
          WEEKLY_MOCK_LIMIT_REACHED: 'Trial permite 1 simulado por semana. Assine o Premium para simulados ilimitados.',
          MONTHLY_MOCK_LIMIT_REACHED: 'Seu plano permite 1 simulado por mês. O próximo estará disponível no início do mês.',
        };
        alert(msgs[e?.message || ''] || 'Limite do seu plano atingido. Considere fazer upgrade para Premium.');
        openPricing();
      }
      return;
    }

    try {
      let initialArea = mode === 'AREA' && targetArea ? targetArea : AreaOfKnowledge.HUMANAS;
      
      // INCREMENTO: Se a Torre pedir 5 questões, baixa só 5. Se pedir 120, baixa 15 primeiro.
      const initialBatchSize = Math.min(15, targetCount);
      
      const initialBatch = await fetchBatchWithRetry(initialArea, initialBatchSize, [], examId ?? undefined);

      setQuestions(initialBatch);
      setCurrentQuestionIndex(0);
      setUserAnswers({});

      const duration = mode === 'FULL' ? FULL_EXAM_DURATION : AREA_EXAM_DURATION;
      startTimer(duration);

      navigate(AppView.MOCK_EXAM);

      if (initialBatch.length < targetCount) {
          fillSimuladoInBackground(mode, targetArea || null, targetCount, initialBatch, examId);
      }

    } catch (e: any) {
      let msg = 'Erro ao gerar simulado. Tente novamente.';
      if (e?.status === 429) msg = 'Muitos simulados sendo gerados agora. Aguarde um instante e tente novamente.';
      alert(msg);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [navigate, openPricing, startTimer, fetchBatchWithRetry, fillSimuladoInBackground]);

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    if (isTimeUp) return;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    fireGamificationEvent('ANSWER_QUESTION', {
      correct: optionIndex === currentQ.correctIndex,
      subject: currentQ.subject,
      difficulty: currentQ.difficulty,
    });

    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));

    const examId = currentExamIdRef.current;
    if (examId) {
      apiRequest(`/exams/${examId}/questions/${currentQuestionIndex}/answer`, 'PUT', { userAnswer: optionIndex })
        .catch(err => console.warn('[answer] Failed to record:', err?.message));
    }
  }, [isTimeUp, questions, currentQuestionIndex, fireGamificationEvent]);

  const handleNext = useCallback(async () => {
    const targetCount = simuladoTargetCountRef.current;
    const isFinished = (currentQuestionIndex + 1 >= targetCount) || isTimeUp;

    if (isFinished) {
      await finalizeSimulado(questions);
      return;
    }

    const isLastLoaded = currentQuestionIndex === questions.length - 1;
    if (isLastLoaded) {
      openFetchError();
      return;
    }
    
    setCurrentQuestionIndex(prev => prev + 1);
  }, [currentQuestionIndex, questions, isTimeUp, finalizeSimulado, openFetchError]);

  const handlePrevious = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  }, []);

  const cancelMock = useCallback(() => {
    stopTimer();
    resetTimer();
    isFetchingRef.current = false;
    setSimuladoMode(null);
    setLoading(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    navigate(AppView.HOME);
  }, [stopTimer, resetTimer, navigate]);

  const retryFetchNext = useCallback(async () => {
    setFetchErrorRetrying(true);
    try {
      await new Promise(res => setTimeout(res, 2000));
      if (currentQuestionIndex < questions.length - 1) {
        closeFetchError();
        setCurrentQuestionIndex(prev => prev + 1);
      }
    } finally {
      setFetchErrorRetrying(false);
    }
  }, [currentQuestionIndex, questions.length, closeFetchError, setFetchErrorRetrying]);

  const finalizeWithPartial = useCallback(() => {
    closeFetchError();
    const answeredCount = currentQuestionIndex + 1;
    finalizeSimulado(questions.slice(0, answeredCount));
  }, [closeFetchError, currentQuestionIndex, questions, finalizeSimulado]);

  const examDuration = simuladoMode === 'FULL' ? FULL_EXAM_DURATION : AREA_EXAM_DURATION;

  return (
    <MockContext.Provider value={{
      questions, userAnswers, currentQuestionIndex,
      simuladoMode, simuladoTargetCount, simuladoTargetArea,
      currentExamId, lastExamScore, lastExamBand,
      timeRemaining, isTimeUp, loading,
      startSimulado, handleAnswerSelect, handleNext, handlePrevious,
      cancelMock, retryFetchNext, finalizeWithPartial,
      formatTime, examDuration,
    }}>
      {children}
    </MockContext.Provider>
  );
}

export function useMock() {
  const ctx = useContext(MockContext);
  if (!ctx) throw new Error('useMock must be used inside MockProvider');
  return ctx;
}