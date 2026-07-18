import React, { useState, useEffect } from 'react';
import { AppView } from '../types';
import { useNavigation } from '../contexts/NavigationContext';
import { usePractice, PRACTICE_LOADING_STEPS } from '../contexts/PracticeContext';
import { useMock } from '../contexts/MockContext';
import QuestionCard from './QuestionCard';
import { Button, Badge, LoadingSpinner } from './UIComponents';
import { apiRequest } from '../services/apiService';

export function getTowerQuestionCount(level: number): number {
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
}

export default function QuizScreen() {
  const { view, navigate } = useNavigation();
  const isMock = view === AppView.MOCK_EXAM;

  const practice = usePractice();
  const mock = useMock();

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isTowerMode, setIsTowerMode] = useState(false);
  const [towerLevel, setTowerLevel] = useState(1);
  const [towerTargetCount, setTowerTargetCount] = useState(5);

  // 🔥 ESTADO DE BLINDAGEM: Armazena o tema gerado na hora pela IA
  const [dynamicTheme, setDynamicTheme] = useState<{title: string, motivatingTexts: string[]} | null>(null);
  const [loadingTheme, setLoadingTheme] = useState(false);

  useEffect(() => {
    const mode = sessionStorage.getItem('studr_exam_mode');
    if (mode === 'TOWER' && !isMock) {
      setIsTowerMode(true);
      const floorStr = sessionStorage.getItem('studr_current_tower_floor');
      if (floorStr) {
        const floor = JSON.parse(floorStr);
        const level = floor.floorNumber || 1;
        setTowerLevel(level);
        setTowerTargetCount(getTowerQuestionCount(floor.building || 1));
      }
    }
  }, [isMock]);

  const questions = isMock ? mock.questions : practice.questions;
  const userAnswers = isMock ? mock.userAnswers : practice.userAnswers;
  const currentQuestionIndex = isMock ? mock.currentQuestionIndex : practice.currentQuestionIndex;
  const loading = isMock ? mock.loading : practice.loading;
  const handleAnswerSelect = isMock ? mock.handleAnswerSelect : practice.handleAnswerSelect;
  const examPhase = mock.examPhase;
  
  // 🔥 GATILHO DA IA: Busca o Tema Inédito ao entrar no Bloco da Redação
  useEffect(() => {
    if (isMock && examPhase === 'REDACAO_INTERVAL' && !dynamicTheme && !loadingTheme) {
      setLoadingTheme(true);
      apiRequest('/ai/essay-theme', 'POST')
        .then(data => {
          if (data && data.title) {
            setDynamicTheme(data);
          } else {
            throw new Error("Formato inválido retornado pela IA");
          }
        })
        .catch(err => {
          console.warn("[Redação] IA falhou ao gerar tema inédito. Usando Fallback de Segurança.", err);
          // Fallback para impedir a prova de quebrar caso o servidor caia
          setDynamicTheme({
            title: "A precarização do trabalho e o desafio da dignidade na era dos aplicativos no Brasil",
            motivatingTexts: [
              "Estudos recentes do IBGE indicam que milhões de brasileiros dependem de plataformas digitais para sua subsistência, atuando como entregadores, motoristas ou prestadores de serviços. Essa modalidade, muitas vezes celebrada pela flexibilidade, esconde uma ausência de direitos trabalhistas básicos, como férias remuneradas, 13º salário e acesso à Previdência Social, gerando grande insegurança.",
              "A Constituição Federal de 1988 estabelece a dignidade da pessoa humana como um dos fundamentos da República, um princípio que se estende ao campo do trabalho. Contudo, a lógica das plataformas digitais levanta questões sobre a autonomia do trabalhador e a garantia de condições mínimas para uma vida digna.",
              "Notícias frequentes revelam mobilizações de trabalhadores de aplicativos em diversas capitais brasileiras, que reivindicam melhores condições de trabalho, remuneração justa e o reconhecimento de um vínculo empregatício. A ausência de regulamentação clara perpetua um ciclo de vulnerabilidade econômica."
            ]
          });
        })
        .finally(() => setLoadingTheme(false));
    }
  }, [isMock, examPhase, dynamicTheme, loadingTheme]);

  const handleNext = async () => {
      const mockTarget = isMock ? mock.simuladoTargetCount : 0;
      const isMockFinished = isMock && (currentQuestionIndex + 1 >= mockTarget || mock.isTimeUp);
      const isTowerFinished = !isMock && isTowerMode && (currentQuestionIndex + 1 >= towerTargetCount);

      if (isMockFinished || isTowerFinished) {
          setIsFinalizing(true); 
          if (isMock) {
              await mock.handleNext(); 
          } else {
              try {
                  const floorStr = sessionStorage.getItem('studr_current_tower_floor');
                  
                  if (floorStr) {
                      const floor = JSON.parse(floorStr);
                      let correctAnswers = 0;
                      questions.forEach(q => {
                          if (userAnswers[q.id] === q.correctIndex) correctAnswers++;
                      });
                      
                      await apiRequest('/tower/submit', 'POST', { 
                          floorId: floor.id, 
                          hits: correctAnswers
                      });
                      
                      practice.finalizeWithPartial(true); 
                      sessionStorage.removeItem('studr_exam_mode'); 
                      navigate(AppView.TOWER);
                  } else {
                      practice.finalizeWithPartial(true); 
                      navigate(AppView.RESULTS);
                  }
              } catch (err) {
                  console.error("Erro ao salvar progresso:", err);
              }
          }
          setIsFinalizing(false); 
      } else {
          isMock ? await mock.handleNext() : await practice.handleNext();
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  const handlePrevious = () => {
      isMock ? mock.handlePrevious() : practice.handlePrevious();
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const cancelAction = () => {
    if (isTowerMode) {
      sessionStorage.removeItem('studr_exam_mode');
      practice.cancelPractice(true); 
      navigate(AppView.TOWER);
    } else {
      isMock ? mock.cancelMock() : practice.cancelPractice();
    }
  };

  const loadingStep = practice.loadingStep;
  const timeRemaining = mock.timeRemaining;
  const isTimeUp = mock.isTimeUp;
  const simuladoTargetCount = mock.simuladoTargetCount;
  const formatTimeFn = mock.formatTime;

  const getDifficultyColor = (diff: string) => {
    const d = String(diff).toUpperCase();
    if (d === 'EASY' || d === 'FÁCIL' || d === 'FACIL') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50';
    if (d === 'HARD' || d === 'DIFÍCIL' || d === 'DIFICIL') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50';
    return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50';
  };

  const getDifficultyLabel = (diff: string) => {
    const d = String(diff).toUpperCase();
    if (d === 'EASY' || d === 'FÁCIL' || d === 'FACIL') return 'Fácil';
    if (d === 'HARD' || d === 'DIFÍCIL' || d === 'DIFICIL') return 'Difícil';
    return 'Média';
  };

  // =========================================================================================
  // ✍️ TELA DE REDAÇÃO (DIA 1) 
  // =========================================================================================
  if (isMock && examPhase === 'REDACAO_INTERVAL') {
    // 🔥 Tela de Loading Exclusiva para a Redação
    if (loadingTheme || !dynamicTheme) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 animate-fade-in">
              <LoadingSpinner size="lg" />
              <h2 className="mt-8 text-xl sm:text-2xl font-black text-enem-blue dark:text-blue-400 uppercase tracking-widest text-center animate-pulse">
                A Banca Oficial está elaborando...
              </h2>
              <p className="text-sm text-slate-500 mt-2 text-center font-medium">
                Sintetizando fatos históricos, dados IBGE e notícias recentes para criar um tema inédito.
              </p>
            </div>
        );
    }

    const APPROX_WORDS_PER_LINE = 10;
    const MIN_PALAVRAS = 80;
    const MIN_LINHAS = 7;
    const MAX_LINHAS = 30;

    const wordCount = mock.redacaoText.trim().split(/\s+/).filter(w => w.length > 0).length;
    const estimatedLines = Math.ceil(wordCount / APPROX_WORDS_PER_LINE);
    const canSubmit = wordCount >= MIN_PALAVRAS && estimatedLines >= MIN_LINHAS;

    const maxTime = 19800; // 5h30m (base do Dia 1)
    const percentageLeft = maxTime > 0 ? (timeRemaining / maxTime) * 100 : 100;
    const isAlertPhase = percentageLeft <= 15 && percentageLeft > 5;
    const isCriticalPhase = percentageLeft <= 5 && timeRemaining > 60;
    const isFinalBattle = timeRemaining <= 60 && timeRemaining > 0 && maxTime > 0;

    let hudBorderClass = "border-slate-200 dark:border-slate-700";
    let hudTextClass = "text-slate-500 dark:text-slate-400";
    let textShadow = "";
    
    if (isAlertPhase) {
      hudBorderClass = "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
      hudTextClass = "text-yellow-600 dark:text-yellow-500 font-bold";
    } else if (isCriticalPhase) {
      hudBorderClass = "border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse";
      hudTextClass = "text-red-600 dark:text-red-500 font-black animate-pulse";
    } else if (isFinalBattle) {
      hudBorderClass = "border-red-600 bg-red-950/10 shadow-[0_0_50px_rgba(239,68,68,0.5)]";
      hudTextClass = "text-red-600 text-lg font-black animate-ping";
      textShadow = "drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] text-red-50";
    }

    const competences = [
      { id: 1, name: "Domínio da Norma Padrão", desc: "Demonstrar domínio da modalidade escrita formal da Língua Portuguesa." },
      { id: 2, name: "Compreensão e Repertório", desc: "Compreender a proposta e aplicar conceitos das várias áreas de conhecimento." },
      { id: 3, name: "Organização e Argumentação", desc: "Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista." },
      { id: 4, name: "Coesão e Conectivos", desc: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a argumentação." },
      { id: 5, name: "Proposta de Intervenção", desc: "Elaborar proposta de intervenção para o problema respeitando os direitos humanos." }
    ];

    // 🔥 TEMA DINÂMICO INJETADO
    const mockTheme = dynamicTheme.title;
    const motivatingTexts = dynamicTheme.motivatingTexts;

    const handleAdvanceToDay2 = () => {
      if (!canSubmit) {
        alert(`Atenção: Sua redação precisa ter no mínimo ${MIN_PALAVRAS} palavras e pelo menos ${MIN_LINHAS} linhas estimadas.`);
        return;
      }
      mock.startDay2();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className="max-w-7xl mx-auto p-3 sm:p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span className="text-enem-blue">📝</span> Redação Oficial ENEM (Dia 1)
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <Badge color="blue">Padrão ENEM 2026</Badge>
            <Badge color="green">Tecnologia STUDR Pro</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:items-start animate-fade-in">
          {/* Coluna da Esquerda: Tema e Textos Motivadores */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-gradient-to-br from-enem-blue to-blue-800 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/10 border border-blue-400/20">
              <h3 className="text-[10px] font-black uppercase mb-3 tracking-[0.2em] opacity-80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Tema Proposto
              </h3>
              <p className="text-lg font-extrabold leading-tight">{mockTheme}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Textos Motivadores</h4>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{motivatingTexts.length} fragmentos</span>
              </div>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {motivatingTexts.map((text, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-sm text-slate-600 dark:text-slate-300 shadow-sm leading-relaxed relative group hover:border-enem-blue/30 transition-all">
                    <span className="absolute -left-2 top-4 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-enem-blue group-hover:text-white transition-colors">{i + 1}</span>
                    <div className="pl-4">{text}</div>
                  </div>
                ))}
              </div>

              {/* Bloco Explicativo das 5 Competências INEP */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">As 5 Competências Avaliadas</h4>
                <div className="space-y-2">
                  {competences.map((comp) => (
                    <div key={comp.id} className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
                      <strong className="text-slate-700 dark:text-slate-300">Competência {comp.id}:</strong> {comp.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Coluna Principal: Área de Escrita */}
          <div className="lg:col-span-8 flex flex-col">
            <div className={`bg-slate-50 dark:bg-slate-800/80 rounded-t-2xl border border-b-0 p-4 flex justify-between items-center text-xs font-bold shadow-sm transition-colors ${hudBorderClass} ${hudTextClass}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="uppercase tracking-tighter">Folha Oficial Ativa</span>
                </div>
                <div className="hidden sm:flex items-center gap-3 opacity-60">
                   <span>Foco Total: ON</span>
                   <span className="h-4 w-px bg-slate-200 dark:bg-slate-700"></span>
                   <span className={isTimeUp ? 'text-red-500 font-black' : ''}>⏱ {formatTimeFn(timeRemaining)}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <span className={wordCount < MIN_PALAVRAS ? 'text-amber-500' : 'text-green-500'}>{wordCount} / {MIN_PALAVRAS} palavras</span>
                <span className={`bg-slate-200/50 dark:bg-slate-700 px-2 py-0.5 rounded ${estimatedLines >= MIN_LINHAS && estimatedLines <= MAX_LINHAS ? 'text-green-500' : 'text-amber-500'}`}>~{estimatedLines} linhas</span>
              </div>
            </div>

            <div className="relative group">
               <div className="absolute left-0 top-0 bottom-0 w-3 bg-red-400/20 dark:bg-red-500/10 pointer-events-none z-10 rounded-bl-2xl"></div>
               <textarea
                className={`w-full flex-1 min-h-[70vh] pl-8 pr-8 py-8 border rounded-b-2xl focus:ring-8 focus:outline-none resize-none font-serif text-lg md:text-xl leading-[2.1] text-slate-800 dark:text-slate-100 shadow-2xl transition-all custom-scrollbar ${hudBorderClass} ${textShadow} ${isTimeUp ? 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60' : 'bg-white dark:bg-slate-900 focus:ring-enem-blue/5'}`}
                placeholder="Inicie sua introdução respeitando a estrutura dissertativo-argumentativa..."
                value={mock.redacaoText}
                onChange={(e) => mock.setRedacaoText(e.target.value)}
                disabled={isTimeUp}
                autoFocus
              />
            </div>

            {/* Painel de Validação e Transição de Dia */}
            <div className="mt-6 flex flex-col md:flex-row gap-4 items-end justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="flex flex-col gap-1 w-full md:w-auto">
                  {(!canSubmit || estimatedLines > MAX_LINHAS) ? (
                      <>
                          {wordCount < MIN_PALAVRAS && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">⚠️ Faltam {MIN_PALAVRAS - wordCount} palavras para o mínimo exigido.</p>
                          )}
                          {estimatedLines < MIN_LINHAS && wordCount >= MIN_PALAVRAS && (
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">⚠️ O texto está muito curto. Escreva pelo menos {MIN_LINHAS} linhas.</p>
                          )}
                          {estimatedLines > MAX_LINHAS && (
                              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">❌ Atenção: Redação estourou as {MAX_LINHAS} linhas! Reduza seu texto.</p>
                          )}
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium">
                              Metas: Mín. {MIN_PALAVRAS} palavras ({wordCount}/{MIN_PALAVRAS}) | {MIN_LINHAS} a {MAX_LINHAS} linhas ({estimatedLines})
                          </p>
                      </>
                  ) : (
                      <div className="flex items-center gap-2">
                         <span className="text-xl">✅</span>
                         <div>
                            <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Estrutura Válida</p>
                            <p className="text-[10px] text-slate-400 font-medium">Limites oficiais do INEP respeitados.</p>
                         </div>
                      </div>
                  )}
               </div>

               <Button 
                  onClick={handleAdvanceToDay2} 
                  disabled={!canSubmit || estimatedLines > MAX_LINHAS} 
                  className={`w-full md:w-auto py-4 px-8 font-black uppercase tracking-widest shadow-xl transition-all ${(canSubmit && estimatedLines <= MAX_LINHAS) ? 'bg-enem-blue hover:scale-105 shadow-blue-500/30 text-white' : 'bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed opacity-80'}`}
               >
                  Iniciar Dia 2 (Exatas/Natureza) →
               </Button>
            </div>

            <div className="mt-4 text-center">
              <Button variant="outline" className="text-xs font-bold text-slate-500" onClick={mock.cancelMock}>
                Pausar Simulado e Sair
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================================
  // RENDERIZAÇÃO PADRÃO DAS QUESTÕES
  // =========================================================================================
  const currentQ = questions[currentQuestionIndex];
  const hasAnswered = userAnswers[currentQ?.id] !== undefined;
  const isLastLoaded = currentQuestionIndex === questions.length - 1;
  const isSimuladoOrTowerFinished = isMock 
      ? (currentQuestionIndex + 1 >= simuladoTargetCount || isTimeUp)
      : (isTowerMode && currentQuestionIndex + 1 >= towerTargetCount);

  const effectiveTargetCount = isMock ? simuladoTargetCount : (isTowerMode ? towerTargetCount : '∞');
  const sessionHeaderTitle = isMock ? (mock.simuladoMode === 'FULL' ? (examPhase === 'DAY1' ? 'ENEM Oficial - 1º Dia' : 'ENEM Oficial - 2º Dia') : 'Simulado por Área') : (isTowerMode ? `Batalha: Prédio ${towerLevel}` : 'Modo Prática Infinita');

  return (
    <div className="max-w-4xl mx-auto pt-6 px-4 pb-24">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 gap-4 transition-colors">
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={cancelAction}
            className="flex-1 md:flex-none text-sm px-4 py-2 border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            ← Cancelar
          </Button>

          {!isMock && (
            <Button
              variant="primary"
              onClick={() => {
                practice.finalizeWithPartial(true);
                navigate(AppView.RESULTS);
              }}
              className="flex-1 md:flex-none text-sm px-4 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Finalizar 📊
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-2 w-24 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-enem-blue dark:bg-blue-500 animate-shimmer" style={{ width: `${(currentQuestionIndex / (typeof effectiveTargetCount === 'number' ? effectiveTargetCount : 1)) * 100}%` }}></div>
          </div>
          <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Progresso</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-8 animate-fade-in relative">
        <div className="flex flex-col items-center">
          <div className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isTowerMode ? 'text-purple-500 animate-pulse' : 'text-gray-400 dark:text-slate-500'}`}>
            {sessionHeaderTitle}
          </div>
          {isMock && (
            <div className={`text-4xl font-mono font-bold tabular-nums tracking-tighter ${isTimeUp ? 'text-red-500 animate-pulse' : 'text-enem-blue dark:text-blue-400'}`}>
              {formatTimeFn(timeRemaining)}
            </div>
          )}
          {!isMock && loading && (
            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-enem-blue dark:text-blue-400 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              {isTowerMode ? 'GERANDO DESAFIOS DA TORRE...' : 'EXPANDINDO BANCO...'}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end">
          <div className="font-bold text-gray-700 dark:text-slate-200 text-lg">
            Questão <span className="text-enem-blue dark:text-blue-400">{currentQuestionIndex + 1}</span>{' '}
            <span className="text-gray-400 dark:text-slate-500 font-normal text-sm">
              / {effectiveTargetCount}
            </span>
          </div>
          {currentQ && (
            <div className="flex gap-2 mt-1 items-center">
              <Badge color={isTowerMode ? "purple" : "blue"} className="shadow-sm">
                {currentQ.area}
              </Badge>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${getDifficultyColor(currentQ.difficulty)}`}>
                 {getDifficultyLabel(currentQ.difficulty)}
              </span>
            </div>
          )}
        </div>
      </div>

      {loading && !currentQ ? (
        <div className="flex flex-col items-center justify-center p-12 w-full animate-fade-in">
          <LoadingSpinner size="md" />
          {questions.length === 0 ? (
            <div className="mt-6 text-center space-y-3">
              {PRACTICE_LOADING_STEPS.map((step, i) => (
                <p
                  key={i}
                  className={`text-sm font-medium transition-all duration-500 ${i <= loadingStep ? 'text-enem-blue dark:text-blue-400 opacity-100' : 'text-gray-300 dark:text-slate-700 opacity-50'} ${i === loadingStep ? 'animate-pulse scale-105' : ''}`}
                >
                  {i < loadingStep ? '✓' : i === loadingStep ? '⏳' : '○'} {step}
                </p>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-enem-blue dark:text-blue-400 font-medium animate-pulse">
              Recalibrando nível dos exercícios...
            </p>
          )}
        </div>
      ) : (
        currentQ && (
          <div className="pb-32">
            {isTimeUp && (
              <div className="mb-6 p-5 bg-red-100 dark:bg-red-900/20 border-red-500 dark:border-red-800 border-2 rounded-2xl text-red-900 dark:text-red-400 font-bold text-center animate-bounce shadow-lg">
                ⚠️ TEMPO ESGOTADO! <br />
                <span className="text-xs font-normal opacity-80 uppercase tracking-wider">
                  Você não pode mais responder, apenas finalizar a prova.
                </span>
              </div>
            )}
            <QuestionCard
              question={currentQ}
              selectedOption={userAnswers[currentQ.id] ?? null}
              onSelect={handleAnswerSelect}
              showFeedback={!isMock && hasAnswered}
              disabled={isTimeUp}
            />
          </div>
        )
      )}

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.3)] z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-auto flex justify-between md:justify-start gap-4 order-2 md:order-1">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 || isFinalizing}
              className={`w-1/2 md:w-auto border-gray-200 dark:border-slate-700 ${currentQuestionIndex === 0 ? 'invisible' : ''}`}
              variant="outline"
            >
              ← Anterior
            </Button>
            <div className="text-xs text-gray-500 dark:text-slate-500 hidden md:flex items-center gap-1 self-center">
              {(isMock || isTowerMode) && hasAnswered && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Salvo na nuvem
                </>
              )}
            </div>
          </div>

          {(isMock || isTowerMode) && typeof effectiveTargetCount === 'number' && (
            <div className="hidden md:block flex-1 mx-8 bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 order-1 md:order-2 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-lg ${isTowerMode ? 'bg-purple-600 shadow-purple-500/50' : 'bg-enem-blue dark:bg-blue-500 shadow-[0_0_8px_rgba(0,74,173,0.3)]'}`}
                style={{ width: `${(currentQuestionIndex / effectiveTargetCount) * 100}%` }}
              />
            </div>
          )}

          <Button
            onClick={handleNext}
            disabled={(isLastLoaded && loading) || isFinalizing}
            className={`w-full md:w-auto shadow-xl order-1 md:order-3 hover:scale-105 transition-transform ${isSimuladoOrTowerFinished && isTowerMode ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
            variant={isSimuladoOrTowerFinished && isTowerMode ? 'default' : 'primary'}
          >
            {isFinalizing ? (
              <div className="flex items-center gap-2 text-white">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processando...
              </div>
            ) : loading && isLastLoaded ? (
              <div className="flex items-center gap-2 text-white">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Expandindo...
              </div>
            ) : (
              isSimuladoOrTowerFinished 
                ? (isTowerMode ? 'Avançar Andar 🏆' : 'Finalizar Simulado') 
                : 'Próxima Questão →'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}