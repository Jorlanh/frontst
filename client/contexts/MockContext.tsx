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
const AREA_DURATION = 5400;  // 1h 30m em segundos

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

// 🔥 EDITAL OFICIAL ENEM - ESTRUTURA MILIMÉTRICA (TOTAL: 180 QUESTÕES EXATAS)
const MOCK_BLUEPRINT = {
    DAY1: [
        // LINGUAGENS (45) - Língua Estrangeira sempre é a primeira
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'FOREIGN_LANG', count: 5 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Interpretação de texto', count: 21 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Literatura (Modernismo, Contemporânea, etc.)', count: 5 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Artes', count: 5 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Gramática e Variação Linguística', count: 3 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Educação Física', count: 2 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Figuras de Linguagem', count: 2 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Tecnologias da Informação e Comunicação', count: 1 },
        { area: AreaOfKnowledge.LINGUAGENS, topic: 'Funções da Linguagem', count: 1 },
        
        // HUMANAS (45)
        { area: AreaOfKnowledge.HUMANAS, topic: 'História: Brasil Colônia, Império, República, Era Vargas e Ditadura Militar', count: 8 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'História: Geral, Antiguidade Clássica, Feudalismo, Revolução Industrial e Guerras Mundiais', count: 6 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Geografia: Meio Ambiente, Globalização, Urbanização e Geopolítica', count: 9 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Geografia: Agropecuária, Demografia, Clima, Relevo, Hidrografia e Cartografia', count: 6 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Filosofia: Antiga, Iluminismo, Moderna, Contratualismo e Ética', count: 8 },
        { area: AreaOfKnowledge.HUMANAS, topic: 'Sociologia: Cultura, Movimentos Sociais, Cidadania, Direitos Humanos, Marx, Durkheim e Weber', count: 8 }
    ],
    DAY2: [
        // NATUREZA (45)
        { area: AreaOfKnowledge.NATUREZA, topic: 'Biologia: Ecologia, Fisiologia Humana e Genética', count: 9 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Biologia: Citologia, Evolução, Botânica, Zoologia e Biotecnologia', count: 6 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Química: Orgânica, Estequiometria, Soluções e Termoquímica', count: 9 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Química: Eletroquímica, pH, Ligações Químicas, Cinética e Equilíbrio', count: 6 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Física: Mecânica e Eletricidade', count: 8 },
        { area: AreaOfKnowledge.NATUREZA, topic: 'Física: Termologia, Óptica, Ondulatória e Hidrostática', count: 7 },
        
        // MATEMÁTICA (45)
        { area: AreaOfKnowledge.EXATAS, topic: 'Matemática Básica: Estatística, Porcentagem e Financeira', count: 9 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Matemática Básica: Razão, Proporção, Regra de Três e Escalas', count: 7 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Geometria: Plana, Espacial e Analítica', count: 13 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Álgebra e Probabilidade: Probabilidade, Combinatória e Sequências (PA/PG)', count: 6 },
        { area: AreaOfKnowledge.EXATAS, topic: 'Funções: 1º e 2º Grau, Exponencial, Logarítmica, Matrizes e Sistemas Lineares', count: 10 }
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
    if (examPhaseRef.current === 'DAY1' || examPhaseRef.current === 'REDACAO_INTERVAL') {
      setExamPhase('REDACAO_INTERVAL');
    } else {
      finalizeWithPartial();
    }
  }, []);

  const { timeRemaining, startTimer, stopTimer, resetTimer } = useTimer(handleTimeUp);

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

  // 🔥 MÁQUINA DE PREENCHIMENTO INTELIGENTE (Fila Dinâmica Garantida e Blindada)
  const fillSimuladoInBackground = useCallback(async (
    queue: any[],
    initialBatch: Question[],
    examId: string | null,
    lang: string
  ) => {
    if (!examId) return;

    let currentExcludes = initialBatch.map(q => q.subject).filter(Boolean) as string[];

    while (queue.length > 0) {
        if (simuladoModeRef.current === null) break;

        const currentBlock = queue[0];
        // Respeita o limite do backend de 5 em 5 para não quebrar a IA
        const fetchCount = Math.min(currentBlock.count, 5);

        let topic = currentBlock.topic;
        if (topic === 'FOREIGN_LANG') {
            // 🔥 Adicionado "Inglês:" e "Espanhol:" na string para FORÇAR o Regex do backend a achar a língua
            topic = lang === 'Inglês' 
                ? "Inglês: Reading comprehension in English" 
                : "Espanhol: Comprensión lectora en español";
        }

        try {
            const newBatch = await fetchBatchWithRetry(
                currentBlock.area, 
                fetchCount, 
                topic, 
                currentExcludes, 
                examId
            );
            
            if (newBatch && newBatch.length > 0) {
                setQuestions(prev => [...prev, ...newBatch]);
                
                // DECREMENTA APENAS O QUE A IA REALMENTE ENTREGOU (Garante a contagem exata)
                currentBlock.count -= newBatch.length;
                currentBlock.retries = 0; // Reset de erros após sucesso
                
                newBatch.forEach(q => { if (q.subject) currentExcludes.push(q.subject); });
                currentExcludes = currentExcludes.slice(-20);
            } else {
                // Fallback se a IA retornar Vazio válido sem erro
                currentBlock.count -= fetchCount; 
            }

            // Se o bloco foi preenchido por completo, remove da fila e passa pra próxima matéria
            if (currentBlock.count <= 0) {
                queue.shift();
            }

            await new Promise(res => setTimeout(res, 2000));
        } catch (error) {
            console.error(`[Blueprint] Falha ao processar bloco ${topic}:`, error);
            currentBlock.retries = (currentBlock.retries || 0) + 1;
            
            // Dá 2 chances para a IA. Se falhar repetidamente, desconta pra não travar a prova
            if (currentBlock.retries >= 2) {
                currentBlock.count -= fetchCount;
                if (currentBlock.count <= 0) queue.shift();
            }
        }
    }
    console.log(`[Blueprint] Preenchimento da prova finalizado com sucesso.`);
  }, [fetchBatchWithRetry]);

  const finalizeSimulado = useCallback(async (questionsToScore: Question[]) => {
    stopTimer();

    const targetCount = simuladoTargetCountRef.current || 180;
    
    // 1. Clonamos as questões carregadas até o momento
    const finalQuestions = [...questionsToScore];

    // 🔥 PREENCHIMENTO COMPULSÓRIO NO FRONTEND (BLINDAGEM 180)
    // Se o aluno forçou o encerramento antes das 180 carregarem, nós preenchemos
    // o vazio com questões "Omitidas" para a matemática do INEP e da tela não quebrar.
    if (finalQuestions.length < targetCount) {
        const missing = targetCount - finalQuestions.length;
        for (let i = 0; i < missing; i++) {
            const idx = finalQuestions.length;
            let fallbackArea = 'MIXED';
            
            // Estima a área correta baseada no índice oficial do ENEM
            if (simuladoModeRef.current === 'FULL') {
                if (idx < 45) fallbackArea = 'Linguagens';
                else if (idx < 90) fallbackArea = 'Humanas';
                else if (idx < 135) fallbackArea = 'Natureza';
                else fallbackArea = 'Exatas';
            }

            finalQuestions.push({
                id: `pad-${Date.now()}-${idx}`,
                stem: '[Questão não carregada] O simulado foi finalizado (ou ocorreu queda de rede) antes desta questão ser gerada. Ela foi enviada em branco.',
                options: ['A', 'B', 'C', 'D', 'E'],
                correctIndex: 0,
                subject: 'Questão Omitida',
                area: fallbackArea as any,
                difficulty: 'MEDIUM' as any,
                explanation: 'A prova foi entregue antes da IA gerar esta questão. Ela não prejudica gravemente o seu TRI pois é detectada como falha de rede.'
            });
        }
    }

    // 2. Mapeia RIGOROSAMENTE as 180 questões exatas para o Payload do Backend
    const responses = finalQuestions.map((q, i) => ({
      questionId: q.id,
      orderIndex: i,
      difficulty: DIFFICULTY_KEY[q.difficulty] || 'MEDIUM',
      correct: userAnswers[q.id] === q.correctIndex,
      userAnswer: userAnswers[q.id] !== undefined ? userAnswers[q.id] : null,
      subject: q.subject || '',
      area: q.area || '',
      correctIndex: q.correctIndex ?? 0, 
      questionJson: q 
    }));

    let finalScore = 0;
    let finalBand = 'Em desenvolvimento';

    try {
      const examId = currentExamIdRef.current;
      if (examId) {
        const result = await apiRequest(`/exams/${examId}/finalize`, 'POST', { 
          responses, 
          redacaoScore: redacaoText.length > 50 ? 720 : 0,
          redacaoText: redacaoText // Enviando a redação perfeitamente
        });
        
        finalScore = result.score ?? 0;
        finalBand = result.band ?? 'Em desenvolvimento';
      }
    } catch (err) {
      console.error('[finalizeSimulado] Erro de rede ao calcular nota TRI:', err);
    }

    setLastExamScore(finalScore);
    setLastExamBand(finalBand);

    if (user?.id) localStorage.setItem(`studr_last_mock_${user.id}`, new Date().toISOString());

    fireGamificationEvent('FINISH_MOCK', { mockType: simuladoModeRef.current === 'FULL' ? 'MOCK_FULL' : 'MOCK_AREA', score: finalScore });

    // 🔥 ATUALIZA O ESTADO GLOBAL COM AS 180 QUESTÕES (Isso conserta o Gráfico e o PDF)
    setQuestions(finalQuestions);
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
        foreignLanguagePreference: lang === 'Espanhol' ? 'ESPANHOL' : 'INGLES'
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
      // 1. Gera a Fila de Renderização baseada no Blueprint ou na Área selecionada
      const blocks = mode === 'FULL' 
          ? [...MOCK_BLUEPRINT.DAY1, ...MOCK_BLUEPRINT.DAY2]
          : [{ area: targetArea || AreaOfKnowledge.HUMANAS, topic: 'Geral', count: targetCount }];
          
      // Deep clone para poder modificar o "count" na máquina de estados sem alterar o Blueprint original
      const queue = JSON.parse(JSON.stringify(blocks)); 
      
      // 2. Extrai o Primeiro Bloco para a carga imediata da tela inicial
      const firstBlock = queue[0];
      const initialBatchSize = Math.min(firstBlock.count, 5);
      
      let initialTopic = firstBlock.topic;
      if (initialTopic === 'FOREIGN_LANG') {
          // 🔥 Adicionado "Inglês:" e "Espanhol:" aqui também
          initialTopic = lang === 'Inglês' 
            ? "Inglês: Reading comprehension in English" 
            : "Espanhol: Comprensión lectora en español";
      }
      
      const initialBatch = await fetchBatchWithRetry(
          firstBlock.area as AreaOfKnowledge, 
          initialBatchSize, 
          initialTopic, 
          [], 
          examId ?? undefined
      );

      if (!initialBatch || initialBatch.length === 0) {
          throw new Error("Initial batch empty");
      }

      // 3. Atualiza a fila deduzindo exatamente o que a IA devolveu agora
      firstBlock.count -= initialBatch.length;
      if (firstBlock.count <= 0) {
          queue.shift(); // Remove bloco se já atendeu à meta
      }

      setQuestions(initialBatch);
      setCurrentQuestionIndex(0);
      setUserAnswers({});

      const duration = mode === 'FULL' ? DAY1_DURATION : AREA_DURATION;
      startTimer(duration);

      navigate(AppView.MOCK_EXAM);

      // 4. Inicia o preenchimento invisível com o restante da fila
      if (queue.length > 0) {
          fillSimuladoInBackground(queue, initialBatch, examId, lang);
      }

    } catch (e: any) {
      alert('Falha ao gerar o simulado no servidor. Tente de novo.');
      navigate(AppView.HOME);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [navigate, openPricing, startTimer, fetchBatchWithRetry, fillSimuladoInBackground]);

  const startDay2 = useCallback(() => {
    stopTimer(); 
    setExamPhase('DAY2');
    setIsTimeUp(false);
    startTimer(DAY2_DURATION); 
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
    // Impede voltar do dia 2 para o dia 1 na mesma sessão de prova
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