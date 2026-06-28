import React, { createContext, useContext, useState, useRef, useEffect, useCallback, PropsWithChildren } from 'react';
import { AreaOfKnowledge, Question, AppView } from '../types';
import { generateQuestionBatch } from '../services/aiClientService';
import { apiRequest } from '../services/apiService';
import { useNavigation } from './NavigationContext';
import { useUI } from './UIContext';
import { useGamification } from './GamificationContext';

export type LoadingContext = 'IDLE' | 'GENERATING_PRACTICE' | 'GENERATING_EXAM' | 'FINISHING_EXAM';

interface PracticeContextValue {
  questions: Question[];
  userAnswers: Record<string, number>;
  currentQuestionIndex: number;
  selectedArea: AreaOfKnowledge;
  activeSessionTopic: string;
  isReviewSession: boolean;
  specificTopicInput: string;
  setSpecificTopicInput: (v: string) => void;
  loading: boolean;
  loadingStep: number;
  loadingContext: LoadingContext;
  startPractice: (area: AreaOfKnowledge, topic?: string, isReview?: boolean) => Promise<void>;
  handleAnswerSelect: (optionIndex: number) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => void;
  cancelPractice: (skipNavigation?: boolean) => void;
  retryFetchNext: () => Promise<void>;
  finalizeWithPartial: (skipNavigation?: boolean) => void;
  // Adicionado para o resumo final na ResultsView
  calculateScore: () => number; 
}

export const PRACTICE_LOADING_STEPS = [
  'Analisando conteúdos atualizados...',
  'Gerando plano de estudos...',
  'Calibrando questões...',
  'Gerando exercícios...',
  'Quase pronto...',
];

const getTowerQuestionCount = (level: number): number => {
  if (level <= 5) return level + 4; 
  if (level < 15) return 12;        
  if (level < 20) return 15;
  if (level < 25) return 18;
  if (level < 30) return 22;
  if (level < 35) return 25;        
  if (level < 40) return 30;
  if (level < 45) return 35;
  if (level < 50) return 40;        
  if (level < 60) return 45;
  if (level < 70) return 60;        
  if (level < 80) return 75;
  if (level < 90) return 90;
  if (level < 100) return 120;
  return 180;                       
};

const PracticeContext = createContext<PracticeContextValue | null>(null);

export function PracticeProvider({ children }: PropsWithChildren) {
  const { navigate, view } = useNavigation();
  const { openPricing, openFetchError, closeFetchError, setFetchErrorRetrying } = useUI();
  const { fireGamificationEvent } = useGamification();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedArea, setSelectedArea] = useState<AreaOfKnowledge>(AreaOfKnowledge.MIXED);
  const [activeSessionTopic, setActiveSessionTopic] = useState('');
  const [isReviewSession, setIsReviewSession] = useState(false);
  const [specificTopicInput, setSpecificTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingContext, setLoadingContext] = useState<LoadingContext>('IDLE');

  const isFetchingRef = useRef(false);
  const fetchPromiseRef = useRef<Promise<number> | null>(null);

  // Cálculo de acertos para a ResultsView
  const calculateScore = useCallback(() => {
    let hits = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] !== undefined && userAnswers[q.id] === q.correctIndex) {
        hits++;
      }
    });
    return hits;
  }, [questions, userAnswers]);

  useEffect(() => {
    if (view === AppView.HOME) {
      setLoading(false);
      setLoadingStep(0);
      setLoadingContext('IDLE');
      isFetchingRef.current = false;
    }
  }, [view]);

  useEffect(() => {
    if (view === AppView.PRACTICE) {
      loadMoreInBackground();
    }
  }, [currentQuestionIndex, questions.length, view]);

  const fetchBatchWithRetry = useCallback(async (
    area: AreaOfKnowledge,
    count: number,
    topic: string | undefined,
    excludeTopics: string[],
    isReview: boolean = false,
    maxAttempts: number = 3,
  ): Promise<Question[]> => {
    let lastErr: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await generateQuestionBatch(area, count, topic, excludeTopics, isReview);
      } catch (e: any) {
        lastErr = e;
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, attempt - 1)));
        }
      }
    }
    throw lastErr;
  }, []);

  const loadMoreInBackground = useCallback((): Promise<number> => {
    if (isFetchingRef.current && fetchPromiseRef.current) return fetchPromiseRef.current;
    
    const isTowerMode = sessionStorage.getItem('studr_exam_mode') === 'TOWER';
    let fetchTargetAmount = 5; 

    if (isTowerMode) {
       const floorStr = sessionStorage.getItem('studr_current_tower_floor');
       if (floorStr) {
           const floor = JSON.parse(floorStr);
           const absoluteLimit = getTowerQuestionCount(floor.floorNumber || 1);
           if (questions.length >= absoluteLimit) return Promise.resolve(0); 
           fetchTargetAmount = Math.min(5, absoluteLimit - questions.length);
       }
    }

    const remaining = questions.length - currentQuestionIndex;
    if (remaining > 2) return Promise.resolve(0); 

    isFetchingRef.current = true;
    const promise = (async () => {
      try {
        const currentSubjects = questions.map(q => q.subject).filter(Boolean) as string[];
        const excludeTopics = Array.from(new Set(currentSubjects)).slice(-10);
        
        const newBatch = await fetchBatchWithRetry(selectedArea, fetchTargetAmount, activeSessionTopic || undefined, excludeTopics, isReviewSession);
        
        setQuestions(prev => [...prev, ...newBatch]);
        return newBatch.length;
      } catch {
        return 0;
      } finally {
        isFetchingRef.current = false;
        fetchPromiseRef.current = null;
      }
    })();
    fetchPromiseRef.current = promise;
    return promise;
  }, [questions, currentQuestionIndex, selectedArea, activeSessionTopic, isReviewSession, fetchBatchWithRetry]);

  const startPractice = useCallback(async (area: AreaOfKnowledge, topic?: string, isReview: boolean = false) => {
    if (isFetchingRef.current) return;
    setLoading(true);
    setLoadingStep(0);
    setLoadingContext('GENERATING_PRACTICE');
    isFetchingRef.current = true;
    setSelectedArea(area);
    setIsReviewSession(isReview);
    setActiveSessionTopic(topic || '');
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setQuestions([]);

    try {
      await apiRequest('/practice/start', 'POST');
    } catch (e: any) {
      setLoading(false);
      setLoadingContext('IDLE');
      isFetchingRef.current = false;
      openPricing();
      return;
    }

    navigate(AppView.PRACTICE);

    const stepInterval = setInterval(() => {
      setLoadingStep(prev => Math.min(prev + 1, PRACTICE_LOADING_STEPS.length - 1));
    }, 3000);

    try {
      const initialBatch = await generateQuestionBatch(area, 5, topic, [], isReview);
      setQuestions(initialBatch);
      setCurrentQuestionIndex(0);
      setUserAnswers({});
    } catch (e: any) {
      alert('Erro ao iniciar prática.');
      navigate(AppView.HOME);
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep(0);
      isFetchingRef.current = false;
    }
  }, [navigate, openPricing]);

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ || userAnswers[currentQ.id] !== undefined) return; 

    const isCorrect = optionIndex === currentQ.correctIndex;
    fireGamificationEvent(isReviewSession ? 'REVIEW_ERROR' : 'ANSWER_QUESTION', {
      correct: isCorrect,
      subject: currentQ.subject,
      difficulty: currentQ.difficulty,
    });

    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));
  }, [questions, currentQuestionIndex, userAnswers, isReviewSession, fireGamificationEvent]);

  const handleNext = useCallback(async () => {
    const isLastLoaded = currentQuestionIndex === questions.length - 1;
    if (isLastLoaded) {
      setLoading(true);
      const added = await loadMoreInBackground();
      setLoading(false);
      if (added <= 0 && sessionStorage.getItem('studr_exam_mode') !== 'TOWER') {
          openFetchError();
          return;
      }
    }
    setCurrentQuestionIndex(prev => prev + 1);
  }, [currentQuestionIndex, questions.length, loadMoreInBackground, openFetchError]);

  const handlePrevious = useCallback(() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1)), []);

  const cancelPractice = useCallback((skipNavigation: boolean = false) => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    if (!skipNavigation) navigate(AppView.HOME);
  }, [navigate]);

  const retryFetchNext = useCallback(async () => {
    setFetchErrorRetrying(true);
    const added = await loadMoreInBackground();
    if (added > 0) { closeFetchError(); setCurrentQuestionIndex(prev => prev + 1); }
    setFetchErrorRetrying(false);
  }, [loadMoreInBackground, closeFetchError, setFetchErrorRetrying]);

  const finalizeWithPartial = useCallback((skipNavigation: boolean = false) => {
    closeFetchError();
    // Se skipNavigation for true, a gente NÃO navega, permitindo que 
    // o QuizScreen decida para onde ir (no caso, para AppView.RESULTS)
    if (!skipNavigation) {
        navigate(AppView.HOME);
    }
  }, [closeFetchError, navigate]);

  return (
    <PracticeContext.Provider value={{
      questions, userAnswers, currentQuestionIndex,
      selectedArea, activeSessionTopic, isReviewSession,
      specificTopicInput, setSpecificTopicInput,
      loading, loadingStep, loadingContext,
      startPractice, handleAnswerSelect, handleNext, handlePrevious,
      cancelPractice, retryFetchNext, finalizeWithPartial,
      calculateScore
    }}>
      {children}
    </PracticeContext.Provider>
  );
}

export function usePractice() {
  const ctx = useContext(PracticeContext);
  if (!ctx) throw new Error('usePractice must be used inside PracticeProvider');
  return ctx;
}