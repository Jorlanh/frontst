import React, { createContext, useContext, useState, useRef, useEffect, useCallback, PropsWithChildren } from 'react';
import { AreaOfKnowledge, Question, AppView } from '../types';
import { generateQuestionBatch } from '../services/aiClientService';
import { apiRequest } from '../services/apiService';
import { useNavigation } from './NavigationContext';
import { useUI } from './UIContext';
import { useGamification } from './GamificationContext';
import { useUser } from './UserContext';
import { useTimer, formatTime } from '../hooks/useTimer';

const DAY1_DURATION = 19800; // 5h 30m em segundos
const DAY2_DURATION = 18000; // 5h 00m em segundos
const AREA_DURATION = 5400;  // 1h 30m em segundos

export type ExamPhase = 'DAY1' | 'REDACAO_INTERVAL' | 'DAY2' | 'FINISHED';

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
  examPhase: ExamPhase;
  redacaoText: string;
  setRedacaoText: (v: string) => void;
  selectedLanguage: 'Inglês' | 'Espanhol';
  startSimulado: (mode: 'FULL' | 'AREA', targetArea?: AreaOfKnowledge, options?: { language?: 'Inglês' | 'Espanhol'; towerQuestionsCount?: number }) => Promise<void>;
  startDay2: () => void;
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
  'FÁCIL': 'EASY', 'FACIL': 'EASY', 'EASY': 'EASY',
  'MÉDIA': 'MEDIUM', 'MEDIA': 'MEDIUM', 'MEDIUM': 'MEDIUM',
  'DIFÍCIL': 'HARD', 'DIFICIL': 'HARD', 'HARD': 'HARD'
};

const ENEM_SYLLABUS = {
  LANGUAGES: "Língua Portuguesa e Literatura: Interpretação de texto, figuras de linguagem, movimentos literários (Modernismo e Literatura Contemporânea), funções da linguagem e variação linguística. Artes, Educação Física e Tecnologias da Informação.",
  HUMANITIES: "História: Brasil Colônia, Império e República, Ditadura Militar, Era Vargas, História Geral. Geografia física, impactos ambientais, globalização, urbanização, geopolítica. Filosofia e Sociologia clássica e cidadania.",
  NATURE: "Biologia: Ecologia, Genética, Evolução, Fisiologia Humana e Citologia. Química: Química Orgânica, Estequiometria, Soluções, Termoquímica, Eletroquímica. Física: Mecânica, Termodinâmica, Óptica, Ondulatória e Eletricidade.",
  MATH: "Matemática Básica: Razão e proporção, regra de três, porcentagem, estatística (média, moda, mediana). Geometria Plana e Espacial. Funções de 1º e 2º grau, combinatória e probabilidade."
};

const MOCK_BLUEPRINT = {
    DAY1: [
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Interpretação de texto', count: 28 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Literatura: Modernismo e Literatura Contemporânea', count: 6 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'FOREIGN_LANG', count: 5 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Artes e Educação Física', count: 4 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Gramática, Variação Linguística e Tecnologias da Informação', count: 2 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'História: Brasil Colônia, Império, República, Era Vargas, Ditadura, Geral e Antiguidade', count: 14 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Geografia: Meio ambiente, Globalização, Urbanização, Geopolítica, Agropecuária, Demografia, Clima, Relevo, Hidrografia e Cartografia', count: 14 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Filosofia: Antiga, Iluminismo, Moderna e Ética', count: 8 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Sociologia: Cultura, Movimentos Sociais, Cidadania, Direitos Humanos, Marx, Durkheim e Weber', count: 9 }
    ],
    DAY2: [
        { area: AreaOfKnowledge.NATUREZA, topic: 'Biologia: Ecologia, Fisiologia Humana, Genética, Citologia, Evolução, Botânica, Zoologia e Biotecnologia', count: 15 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Química: Orgânica, Estequiometria, Soluções, Termoquímica, Eletroquímica, pH, Ligações, Cinética e Equilíbrio', count: 15 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Física: Mecânica, Eletricidade, Termologia, Óptica, Ondulatória e Hidrostática', count: 15 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Matemática Básica: Estatística, Porcentagem, Financeira, Razão, Proporção e Escalas', count: 16 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Geometria: Plana, Espacial e Analítica', count: 13 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Funções, Álgebra, Probabilidade, Combinatória, Matrizes e Sequências', count: 16 }
    ]
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
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [examPhase, setExamPhase] = useState<ExamPhase>('DAY1');
  const [redacaoText, setRedacaoText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'Inglês' | 'Espanhol'>('Inglês');

  const isFetchingRef = useRef(false);
  const simuladoModeRef = useRef(simuladoMode);
  const simuladoTargetAreaRef = useRef(simuladoTargetArea);
  const simuladoTargetCountRef = useRef(simuladoTargetCount);
  const currentExamIdRef = useRef(currentExamId);
  const examPhaseRef = useRef(examPhase);

  useEffect(() => { simuladoModeRef.current = simuladoMode; }, [simuladoMode]);
  useEffect(() => { simuladoTargetAreaRef.current = simuladoTargetArea; }, [simuladoTargetArea]);
  useEffect(() => { simuladoTargetCountRef.current = simuladoTargetCount; }, [simuladoTargetCount]);
  useEffect(() => { currentExamIdRef.current = currentExamId; }, [currentExamId]);
  useEffect(() => { examPhaseRef.current = examPhase; }, [examPhase]);

  const handleTimeUp = useCallback(() => {
    setIsTimeUp(true);
    // Se o tempo acabar no Dia 1 ou na Redação, arrasta o aluno para o Redação Interval para ele visualizar e ir pro Dia 2
    if (examPhaseRef.current === 'DAY1' || examPhaseRef.current === 'REDACAO_INTERVAL') {
      setExamPhase('REDACAO_INTERVAL');
    } else {
      finalizeWithPartial();
    }
  }, []);

  const { timeRemaining, startTimer, stopTimer, resetTimer } = useTimer(handleTimeUp);

  const determineAreaAndSyllabus = (index: number, mode: 'FULL' | 'AREA', targetArea: AreaOfKnowledge | null, lang: 'Inglês' | 'Espanhol') => {
  if (mode === 'AREA') {
    let syllabus = '';
    if (targetArea === AreaOfKnowledge.LINGUAGENS) syllabus = ENEM_SYLLABUS.LANGUAGES;
    if (targetArea === AreaOfKnowledge.HUMANAS) syllabus = ENEM_SYLLABUS.HUMANITIES;
    if (targetArea === AreaOfKnowledge.NATUREZA) syllabus = ENEM_SYLLABUS.NATURE;
    if (targetArea === AreaOfKnowledge.EXATAS) syllabus = ENEM_SYLLABUS.MATH;
    return { areaToFetch: targetArea || AreaOfKnowledge.LINGUAGENS, syllabus };
  }

  // --- DIA 1: LINGUAGENS (0-44) ---
  if (index < 6) {
      const langTopic = lang === 'Inglês' ? "Reading comprehension in English" : "Comprensión lectora en español";
      return { areaToFetch: AreaOfKnowledge.LINGUAGENS, syllabus: `Língua Estrangeira (${langTopic})` };
  }
  if (index < 33) return { areaToFetch: AreaOfKnowledge.LINGUAGENS, syllabus: "Interpretação de texto, Figuras de linguagem, Funções da linguagem" };
  if (index < 39) return { areaToFetch: AreaOfKnowledge.LINGUAGENS, syllabus: "Literatura: Modernismo e Literatura Contemporânea" };
  if (index < 42) return { areaToFetch: AreaOfKnowledge.LINGUAGENS, syllabus: "Artes e Educação Física" };
  if (index < 45) return { areaToFetch: AreaOfKnowledge.LINGUAGENS, syllabus: "Gramática, Variação Linguística e Tecnologia da Informação" };

  // --- DIA 1: HUMANAS (45-89) ---
  if (index < 57) return { areaToFetch: AreaOfKnowledge.HUMANAS, syllabus: "História: Brasil Colônia, Império, República, Era Vargas, Ditadura, História Geral e Antiguidade" };
  if (index < 72) return { areaToFetch: AreaOfKnowledge.HUMANAS, syllabus: "Geografia: Meio ambiente, Globalização, Urbanização, Geopolítica e Agropecuária" };
  if (index < 80) return { areaToFetch: AreaOfKnowledge.HUMANAS, syllabus: "Filosofia: Antiga, Iluminismo, Moderna e Ética" };
  if (index < 90) return { areaToFetch: AreaOfKnowledge.HUMANAS, syllabus: "Sociologia: Cultura, Movimentos Sociais, Marx, Durkheim e Weber" };

  // --- DIA 2: NATUREZA (90-134) ---
  if (index < 105) return { areaToFetch: AreaOfKnowledge.NATUREZA, syllabus: "Biologia: Ecologia, Fisiologia, Genética, Citologia e Botânica" };
  if (index < 120) return { areaToFetch: AreaOfKnowledge.NATUREZA, syllabus: "Química: Orgânica, Estequiometria, Soluções, Termoquímica, Eletroquímica" };
  if (index < 135) return { areaToFetch: AreaOfKnowledge.NATUREZA, syllabus: "Física: Mecânica, Eletricidade, Termologia, Óptica e Ondulatória" };

  // --- DIA 2: MATEMÁTICA (135-179) ---
  if (index < 151) return { areaToFetch: AreaOfKnowledge.EXATAS, syllabus: "Matemática Básica: Estatística, Porcentagem, Financeira, Razão e Proporção" };
  if (index < 164) return { areaToFetch: AreaOfKnowledge.EXATAS, syllabus: "Geometria: Plana, Espacial e Analítica" };
  return { areaToFetch: AreaOfKnowledge.EXATAS, syllabus: "Funções, Álgebra, Probabilidade e Sequências" };
};

  const fetchBatchWithRetry = useCallback(async (
    area: AreaOfKnowledge,
    count: number,
    topic: string | undefined,
    excludeTopics: string[],
    examId?: string,
    maxAttempts: number = 3,
  ): Promise<Question[]> => {
    let lastErr: any;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await generateQuestionBatch(area, count, topic, excludeTopics, false, true, examId);
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

  const fillSimuladoInBackground = useCallback(async (
    mode: 'FULL' | 'AREA',
    targetArea: AreaOfKnowledge | null,
    targetCount: number,
    initialQuestions: Question[],
    examId: string | null,
    lang: 'Inglês' | 'Espanhol'
) => {
    if (!examId) return;

    console.log(`[Blueprint] Iniciando processamento do simulado ${examId}...`);

    // Se for modo FULL, usamos o Blueprint. Se for AREA, usamos a lógica original.
    const blocks = mode === 'FULL' 
        ? [...MOCK_BLUEPRINT.DAY1, ...MOCK_BLUEPRINT.DAY2]
        : [{ area: targetArea || AreaOfKnowledge.HUMANAS, topic: 'Geral', count: targetCount }];

    let currentExcludes: string[] = initialQuestions.map(q => q.subject).filter(Boolean) as string[];

    for (const item of blocks) {
        // Verifica se o simulado ainda está ativo
        if (simuladoModeRef.current === null) break;

        let topic = item.topic;
        // Aplica a lógica do idioma apenas se for o bloco de língua estrangeira
        if (topic === 'FOREIGN_LANG') {
            topic = lang === 'Inglês' 
                ? "Reading comprehension in English" 
                : "Comprensión lectora en español";
        }

        try {
            // Busca o bloco completo conforme o peso definido no Blueprint
            const newBatch = await fetchBatchWithRetry(
                item.area as AreaOfKnowledge, 
                item.count, 
                topic, 
                currentExcludes, 
                examId
            );
            
            if (newBatch && newBatch.length > 0) {
                setQuestions(prev => [...prev, ...newBatch]);
                
                // Atualiza lista de exclusão para evitar repetição
                newBatch.forEach(q => { if (q.subject) currentExcludes.push(q.subject); });
                currentExcludes = currentExcludes.slice(-20);
            }

            // Pequena pausa entre blocos para não sobrecarregar a IA
            await new Promise(res => setTimeout(res, 2000));
            
        } catch (error) {
            console.error(`[Blueprint] Falha ao processar bloco ${item.topic}:`, error);
            // Continua para o próximo bloco mesmo se um falhar
        }
    }
    console.log(`[Blueprint] Preenchimento finalizado.`);
}, [fetchBatchWithRetry]);

  const finalizeSimulado = useCallback(async (questionsToScore: Question[]) => {
    stopTimer();

    // Envia rigorosamente as respostas completas indexadas para evitar notas e gráficos zerados
    const responses = questionsToScore.map((q, i) => ({
      questionId: q.id,
      orderIndex: i,
      difficulty: DIFFICULTY_KEY[q.difficulty] || 'MEDIUM',
      correct: userAnswers[q.id] === q.correctIndex,
      userAnswer: userAnswers[q.id] !== undefined ? userAnswers[q.id] : null,
      subject: q.subject || '',
      area: q.area || ''
    }));

    let finalScore = 400;
    let finalBand = 'Em desenvolvimento';

    try {
      const examId = currentExamIdRef.current;
      if (examId) {
        const result = await apiRequest(`/exams/${examId}/finalize`, 'POST', { 
          responses, 
          redacaoScore: redacaoText.length > 50 ? 720 : 0 
        });
        finalScore = result.score ?? 400;
        finalBand = result.band ?? 'Em desenvolvimento';
      }
    } catch (err) {
      console.error('[finalizeSimulado] Erro de rede ao calcular nota TRI:', err);
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

    setQuestions(questionsToScore);
    setExamPhase('FINISHED');
    navigate(AppView.RESULTS);
  }, [userAnswers, user?.id, redacaoText, fireGamificationEvent, navigate, stopTimer]);

  const startSimulado = useCallback(async (
      mode: 'FULL' | 'AREA', 
      targetArea?: AreaOfKnowledge, 
      options?: { language?: 'Inglês' | 'Espanhol'; towerQuestionsCount?: number }
  ) => {
    if (isFetchingRef.current) return;
    setLoading(true);
    isFetchingRef.current = true;

    const lang = options?.language || 'Inglês';
    setSelectedLanguage(lang);
    setSimuladoMode(mode);
    setSimuladoTargetArea(targetArea || null);
    setRedacaoText('');
    setExamPhase('DAY1');
    setIsTimeUp(false);

    let targetCount = mode === 'FULL' ? 180 : 45;
    if (options?.towerQuestionsCount) {
        targetCount = options.towerQuestionsCount;
    }
    setSimuladoTargetCount(targetCount);

    let examId: string | null = null;
    try {
      const startResult = await apiRequest('/mock/start', 'POST', { 
        mode, 
        area: targetArea || null,
        foreignLanguagePreference: lang === 'Espanhol' ? 'ESPANHOL' : 'INGLES' // 🔥 Sincroniza a escolha com o BD
      });
      examId = startResult.examId ?? null;
      setCurrentExamId(examId);
    } catch (e: any) {
      setLoading(false);
      isFetchingRef.current = false;
      openPricing();
      return;
    }

    try {
      const { areaToFetch, syllabus } = determineAreaAndSyllabus(0, mode, targetArea || null, lang);
      const initialBatchSize = Math.min(10, targetCount);
      
      const initialBatch = await fetchBatchWithRetry(areaToFetch, initialBatchSize, syllabus, [], examId ?? undefined);

      setQuestions(initialBatch);
      setCurrentQuestionIndex(0);
      setUserAnswers({});

      const duration = mode === 'FULL' ? DAY1_DURATION : AREA_DURATION;
      startTimer(duration);

      navigate(AppView.MOCK_EXAM);

      if (initialBatch.length < targetCount) {
          fillSimuladoInBackground(mode, targetArea || null, targetCount, initialBatch, examId, lang);
      }

    } catch (e: any) {
      alert('Falha ao gerar o simulado no servidor local do Railway. Tente de novo.');
      navigate(AppView.HOME);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [navigate, openPricing, startTimer, fetchBatchWithRetry, fillSimuladoInBackground]);

  const startDay2 = useCallback(() => {
    stopTimer(); // Garante o congelamento do tempo do Dia 1
    setExamPhase('DAY2');
    setIsTimeUp(false);
    startTimer(DAY2_DURATION); // Reseta o relógio para exatas 5 horas
    setCurrentQuestionIndex(90); // Vai para a primeira questão do Dia 2 (Natureza/Exatas)
  }, [startTimer, stopTimer]);

  const handleAnswerSelect = useCallback((optionIndex: number) => {
    if (isTimeUp) return;
    const currentQ = questions[currentQuestionIndex];
    if (!currentQ) return;

    setUserAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));

    const examId = currentExamIdRef.current;
    if (examId) {
      apiRequest(`/exams/${examId}/questions/${currentQuestionIndex}/answer`, 'PUT', { userAnswer: optionIndex })
        .catch(err => console.warn('[answer] Failed to record:', err?.message));
    }
  }, [isTimeUp, questions, currentQuestionIndex]);

  const handleNext = useCallback(async () => {
    const targetCount = simuladoTargetCountRef.current;
    
    // 🔥 Trava RÍGIDA de transição do ENEM 180 questões:
    // A redação e as 90 questões dividem o mesmo tempo de 5h30. Não paramos o cronômetro aqui.
    if (simuladoModeRef.current === 'FULL' && currentQuestionIndex === 89 && examPhaseRef.current === 'DAY1') {
      setExamPhase('REDACAO_INTERVAL');
      return;
    }

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
    // Impede voltar do dia 2 para o dia 1 na mesma sessão de navegação de prova
    if (simuladoModeRef.current === 'FULL' && currentQuestionIndex === 90 && examPhaseRef.current === 'DAY2') {
      return; 
    }
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  }, [currentQuestionIndex]);

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
      await new Promise(res => setTimeout(res, 1500));
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
    finalizeSimulado(questions);
  }, [closeFetchError, questions, finalizeSimulado]);

  const examDuration = simuladoMode === 'FULL' 
    ? (examPhase === 'DAY2' ? DAY2_DURATION : DAY1_DURATION) 
    : AREA_DURATION;

  return (
    <MockContext.Provider value={{
      questions, userAnswers, currentQuestionIndex,
      simuladoMode, simuladoTargetCount, simuladoTargetArea,
      currentExamId, lastExamScore, lastExamBand,
      timeRemaining, isTimeUp, loading, examPhase, redacaoText, setRedacaoText, selectedLanguage,
      startSimulado, startDay2, handleAnswerSelect, handleNext, handlePrevious,
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