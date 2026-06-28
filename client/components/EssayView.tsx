import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EssayTheme, EssayCorrection } from '../types';
import { generateEssayTheme, evaluateEssay } from '../services/aiClientService';
import { Button, Card, LoadingSpinner, Badge, FullPageLoader } from './UIComponents';
import { useTimer, calculateEssayTimeLimit, formatTime } from '../hooks/useTimer';

interface EssayViewProps {
  onBack: () => void;
  onSuccess?: () => void;
}

const EssayView: React.FC<EssayViewProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState<'SETUP' | 'WRITING' | 'RESULT'>('SETUP');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<EssayTheme | null>(null);
  const [essayText, setEssayText] = useState("");
  const [result, setResult] = useState<EssayCorrection | null>(null);
  const [example1000, setExample1000] = useState<any | null>(null);
  const [viewingExample, setViewingExample] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [writingStarted, setWritingStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- MOTOR DA BATALHA FINAL ---
  const essayTextRef = useRef(""); 
  const [towerLevel, setTowerLevel] = useState(1);
  const [isTowerMode, setIsTowerMode] = useState(false);

  const telemetry = useRef({ keystrokes: 0, pausesOver5s: 0, paragraphCount: 0 });
  const lastTypingTime = useRef<number>(Date.now());

  useEffect(() => {
    const towerFloorStr = sessionStorage.getItem('studr_current_tower_floor');
    if (towerFloorStr) {
      setIsTowerMode(true);
      setTowerLevel(JSON.parse(towerFloorStr).floorNumber || 1);
    }
  }, []);

  const timer = useTimer(() => {
    if (step === 'WRITING') {
      handleFinalSubmit(essayTextRef.current);
    }
  });

  const handleFinalSubmit = useCallback(async (forcedText?: string) => {
    const currentText = forcedText || essayTextRef.current;
    if (!theme || !currentText.trim()) return;

    setLoading(true);
    try {
      telemetry.current.paragraphCount = currentText.split(/\n\s*\n/).filter(p => p.trim() !== '').length;
      
      let performanceData = null;
      if (isTowerMode) {
        performanceData = {
          towerLevel,
          maxTime: timer.maxTime,
          timeSpentSeconds: timer.maxTime - timer.timeRemaining,
          telemetry: telemetry.current
        };
      }

      const correction = await (evaluateEssay as any)(theme.title, currentText, performanceData);
      setResult(correction);
      timer.stopTimer();
      setStep('RESULT');
      if (onSuccess) onSuccess();
    } catch (e) {
      alert("Erro ao corrigir redação.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [theme, towerLevel, isTowerMode, onSuccess, timer]);
  // -----------------------------

  // Start timer only when user clicks "Iniciar Redação", stop on RESULT
  useEffect(() => {
    if (writingStarted && step === 'WRITING') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else if (step !== 'WRITING') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [writingStarted, step]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayText(e.target.value);
    essayTextRef.current = e.target.value;
  };

  const handleKeyDown = () => {
    telemetry.current.keystrokes += 1;
    const now = Date.now();
    if (now - lastTypingTime.current > 5000) {
      telemetry.current.pausesOver5s += 1;
    }
    lastTypingTime.current = now;
  };

  const handleStartWriting = () => {
    setWritingStarted(true);
    setElapsedSeconds(0);
    const limit = isTowerMode ? calculateEssayTimeLimit(towerLevel) : 3600;
    timer.startTimer(limit);
    lastTypingTime.current = Date.now();
  };

  const formatElapsed = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleGenerateTheme = async () => {
    setLoading(true);
    try {
      const newTheme = await generateEssayTheme();
      setTheme(newTheme);
      setEssayText("");
      essayTextRef.current = "";
      setWritingStarted(false);
      timer.resetTimer();
      setStep('WRITING');
    } catch (e) {
      alert("Erro ao gerar tema. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!theme || !essayText.trim()) return;
    if (!canSubmit) {
      alert(`Sua redação precisa ter no mínimo ${MIN_PALAVRAS} palavras e pelo menos ${MIN_LINHAS} linhas estimadas. Atualmente: ${wordCount} palavras (~${estimatedLines} linhas).`);
      return;
    }

    setLoading(true);
    try {
      handleFinalSubmit();
      return;
    } catch (e) {
      alert("Erro ao corrigir redação.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleShowExample = async () => {
    if (!theme) return;
    setLoading(true);
    try {
      const { getGrade1000Example } = await import('../services/aiClientService');
      const example = await getGrade1000Example(theme.title);
      setExample1000(example);
      setViewingExample(true);
    } catch (e) {
      alert("Erro ao carregar exemplo.");
    } finally {
      setLoading(false);
    }
  };

  const APPROX_WORDS_PER_LINE = 10; // folha ENEM ~10 palavras por linha manuscrita
  const MIN_PALAVRAS = 80;
  const MIN_LINHAS = 7;
  const MAX_LINHAS = 30;

  const wordCount = essayText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const estimatedLines = Math.ceil(wordCount / APPROX_WORDS_PER_LINE);
  const canSubmit = wordCount >= MIN_PALAVRAS && estimatedLines >= MIN_LINHAS;

  if (loading && step !== 'WRITING') {
    return (
      <FullPageLoader 
        text={step === 'SETUP' ? "A IA está elaborando um tema atual e relevante..." : "A IA está analisando cada parágrafo da sua redação..."} 
      />
    );
  }
  
  // Classes Dinâmicas de Tensão (Sistema HUD)
  let hudBorderClass = "border-slate-200 dark:border-slate-700";
  let hudTextClass = "text-slate-500 dark:text-slate-400";
  let textShadow = "";
  
  if (timer.isAlertPhase) {
    hudBorderClass = "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]";
    hudTextClass = "text-yellow-600 dark:text-yellow-500 font-bold";
  } else if (timer.isCriticalPhase) {
    hudBorderClass = "border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse";
    hudTextClass = "text-red-600 dark:text-red-500 font-black animate-pulse";
  } else if (timer.isFinalBattle) {
    hudBorderClass = "border-red-600 bg-red-950/10 shadow-[0_0_50px_rgba(239,68,68,0.5)]";
    hudTextClass = "text-red-600 text-lg font-black animate-ping";
    textShadow = "drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] text-red-50";
  }

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="text-sm px-4 py-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">← Voltar</Button>
          <h1 className="text-xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span className="text-enem-blue">📝</span> Corretor de Redação IA
          </h1>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <Badge color="blue">Padrão ENEM {new Date().getFullYear()}</Badge>
          <Badge color="green">Tecnologia STUDR Pro</Badge>
        </div>
      </div>

      {step === 'SETUP' && (
        <div className="grid md:grid-cols-2 gap-8 items-center min-h-[50vh] animate-fade-in">
          <div className="space-y-6">
            <h2 className="text-4xl font-extrabold text-enem-blue dark:text-blue-400">Rumo à <br/>Nota 1000</h2>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              Gere um tema inédito no padrão ENEM, escreva sua redação e receba uma correção técnica detalhada baseada nas 5 competências oficiais.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/20">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300 font-medium">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">1</span>
                  Temas alinhados à realidade brasileira
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300 font-medium">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">2</span>
                  Análise gramatical e estrutural profunda
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-slate-300 font-medium">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">3</span>
                  Feedback pedagógico personalizado
                </li>
              </ul>
            </div>
            <Button onClick={handleGenerateTheme} className="w-full md:w-auto py-4 px-10 text-lg shadow-xl hover:scale-105 transition-transform">
              🚀 Gerar Tema e Começar
            </Button>
          </div>
          <div className="hidden md:flex justify-center">
             <div className="text-[10rem] drop-shadow-2xl animate-bounce-slow">✍️</div>
          </div>
        </div>
      )}

      {step === 'WRITING' && theme && (
        <div className="grid lg:grid-cols-12 gap-8 lg:items-start animate-fade-in">
          {/* Sidebar: Theme & Motivating Texts (Left on Desktop) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            <div className="bg-gradient-to-br from-enem-blue to-blue-800 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/10 border border-blue-400/20">
              <h3 className="text-[10px] font-black uppercase mb-3 tracking-[0.2em] opacity-80 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                Tema Proposto
              </h3>
              <p className="text-lg font-extrabold leading-tight">{theme.title}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Textos Motivadores</h4>
                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{theme.motivatingTexts.length} fragmentos</span>
              </div>
              
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                {theme.motivatingTexts.map((text, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80 text-sm text-slate-600 dark:text-slate-300 shadow-sm leading-relaxed relative group hover:border-enem-blue/30 transition-all">
                    <span className="absolute -left-2 top-4 w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-enem-blue group-hover:text-white transition-colors">{i + 1}</span>
                    <div className="pl-4">{text}</div>
                  </div>
                ))}
              </div>
              
              {!writingStarted && (
                <Button onClick={handleStartWriting} variant="primary" className="w-full py-3 text-sm font-black uppercase tracking-wider shadow-lg">
                  ✍️ Iniciar Redação
                </Button>
              )}
              <div className="flex gap-2">
                <Button onClick={handleGenerateTheme} variant="outline" className="flex-1 py-2.5 text-xs font-bold border-amber-200 dark:border-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20" loading={loading}>
                  🔄 Novo Tema
                </Button>
                <Button onClick={handleShowExample} variant="outline" className="flex-1 py-2.5 text-xs font-bold border-blue-100 dark:border-blue-900/30 text-enem-blue dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  💡 Modelo 1000
                </Button>
              </div>
            </div>
          </div>

          {/* Main: Writing Area (Right on Desktop) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Toolbar */}
            <div className={`bg-slate-50 dark:bg-slate-800/80 rounded-t-2xl border border-b-0 p-4 flex justify-between items-center text-xs font-bold shadow-sm transition-colors ${hudBorderClass} ${hudTextClass}`}>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border dark:border-slate-700">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="uppercase tracking-tighter">Folha Oficial Ativa</span>
                </div>
                <div className="hidden sm:flex items-center gap-3 opacity-60">
                   <span>Foco Total: ON</span>
                   <span className="h-4 w-px bg-slate-200 dark:bg-slate-700"></span>
                   <span>⏱ {formatTime(timer.timeRemaining)}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <span className={wordCount < MIN_PALAVRAS ? 'text-amber-500' : 'text-green-500'}>{wordCount} / {MIN_PALAVRAS} palavras</span>
                <span className={`bg-slate-200/50 dark:bg-slate-700 px-2 py-0.5 rounded ${estimatedLines >= MIN_LINHAS ? 'text-green-500' : ''}`}>~{estimatedLines} linhas</span>
              </div>
            </div>

            {/* Simulated Sheet Area */}
            <div className="relative group">
               {/* Left margin bar (essay sheet style) */}
               <div className="absolute left-0 top-0 bottom-0 w-3 bg-red-400/20 dark:bg-red-500/10 pointer-events-none z-10 rounded-bl-2xl"></div>

               <textarea
                className={`w-full flex-1 min-h-[70vh] pl-8 pr-8 py-8 border rounded-b-2xl focus:ring-8 focus:outline-none resize-none font-serif text-lg md:text-xl leading-[2.1] text-slate-800 dark:text-slate-100 shadow-2xl transition-all custom-scrollbar ${hudBorderClass} ${textShadow} ${writingStarted ? (timer.isFinalBattle ? 'bg-red-950/40 focus:ring-red-500/20' : 'bg-white dark:bg-slate-900 focus:ring-enem-blue/5') : 'bg-slate-50 dark:bg-slate-800/50 cursor-not-allowed opacity-60'}`}
                placeholder={writingStarted ? "Inicie sua introdução respeitando o tema e a estrutura argumentativa (Introdução, Desenvolvimento 1 e 2, Conclusão)..." : "Clique em \"Iniciar Redação\" para começar a escrever..."}
                value={essayText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                disabled={!writingStarted || timer.isTimeUp || loading}
                autoFocus={writingStarted}
              />
            </div>

            {/* 🚨 Painel de Validação e Envio 🚨 */}
            {writingStarted && (
              <div className="mt-6 flex flex-col md:flex-row gap-4 items-end justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                 
                 <div className="flex flex-col gap-1 w-full md:w-auto">
                    {/* Caso o aluno não atenda aos requisitos (Abaixo do mínimo ou Estourou o Máximo) */}
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
                              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Pronto para Enviar</p>
                              <p className="text-[10px] text-slate-400 font-medium">Limites oficiais do INEP respeitados.</p>
                           </div>
                        </div>
                    )}
                 </div>

                 {/* O botão também travará se as linhas estimadas forem maiores que MAX_LINHAS */}
                 <Button 
                    onClick={handleSubmit} 
                    disabled={!canSubmit || estimatedLines > MAX_LINHAS || loading} 
                    className={`w-full md:w-auto py-4 px-8 font-black uppercase tracking-widest shadow-xl transition-all ${(canSubmit && estimatedLines <= MAX_LINHAS) ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 text-white' : 'bg-slate-300 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed opacity-80'}`}
                 >
                    {loading ? 'Corrigindo IA...' : 'Enviar Redação'}
                 </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'RESULT' && result && !viewingExample && (
        <div className="space-y-8 animate-fade-in pb-20">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Score Overview - Left Side */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-gradient-to-br from-enem-blue to-indigo-900 text-white rounded-3xl p-8 shadow-2xl shadow-blue-500/20 relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl"></div>
                
                <Badge color="yellow" className="mb-4 relative z-10 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">Nota Final Oficial</Badge>
                <div className="text-[7rem] font-black leading-none tracking-tighter relative z-10">{result.totalScore}</div>
                <div className="text-sm font-bold opacity-60 uppercase tracking-widest relative z-10">PONTOS</div>
                
                <div className="mt-8 w-full bg-white/10 rounded-2xl p-4 border border-white/10">
                   <div className="flex justify-between text-xs font-bold mb-2">
                      <span>Progresso para o 1000</span>
                      <span>{Math.round(result.totalScore / 10)}%</span>
                   </div>
                   <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400" style={{ width: `${result.totalScore / 10}%` }}></div>
                   </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-enem-blue"></span>
                   Feedback Rápido
                </h3>
                <div className="space-y-4">
                   <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-100 dark:border-green-900/20">
                      <div className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase mb-2">Destaque Positivo</div>
                      <p className="text-xs text-green-800 dark:text-green-300 font-medium leading-tight">{result.strengths[0]}</p>
                   </div>
                   <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                      <div className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase mb-2">Para Melhorar</div>
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-tight">{result.weaknesses[0]}</p>
                   </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis - Right Side */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
                   <span className="text-3xl">📊</span> Comentário do Especialista IA
                </h3>
                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-serif italic border-l-4 border-slate-100 dark:border-slate-800 pl-6">
                   "{result.generalFeedback}"
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">Análise Técnica por Competência</h4>
                <div className="grid gap-4">
                  {result.competencies.map((comp) => (
                    <div key={comp.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-enem-blue/20 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-5">
                           <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-[10px] shadow-inner transition-colors
                             ${comp.score >= 160 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : comp.score >= 120 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}
                           `}>
                              <span className="opacity-60">C{comp.id}</span>
                              <span className="text-2xl">{comp.score}</span>
                           </div>
                           <div>
                             <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg group-hover:text-enem-blue transition-colors">{comp.name}</h4>
                             <p className="text-xs text-slate-400 font-medium uppercase tracking-tighter mt-1">{comp.score >= 160 ? 'Nível Excelente' : comp.score >= 120 ? 'Nível Bom' : 'Nível em Desenvolvimento'}</p>
                           </div>
                        </div>
                        <div className="hidden sm:block">
                           <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-6">
                              <div className={`h-full transition-all duration-1000 ${comp.score >= 160 ? 'bg-green-500' : comp.score >= 120 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${(comp.score / 200) * 100}%` }}></div>
                           </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100/50 dark:border-slate-800/50">
                        {comp.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-12 border-t border-slate-100 dark:border-slate-800">
            <Button onClick={handleShowExample} variant="outline" className="px-10 py-4 border-enem-blue text-enem-blue dark:text-blue-400 font-bold text-sm">
               📖 Ver Modelo Nota 1000
            </Button>
            <Button onClick={() => {
              setStep('SETUP');
              setTheme(null);
              setEssayText("");
              setResult(null);
              setExample1000(null);
              setViewingExample(false);
            }} variant="primary" className="px-12 py-4 font-black tracking-widest uppercase">
              ✍️ Praticar Novo Tema
            </Button>
          </div>
        </div>
      )}

      {viewingExample && example1000 && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
          <div className="flex justify-between items-center border-b dark:border-slate-800 pb-6">
             <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Modelo de Redação Nota 1000</h3>
                <p className="text-sm text-slate-500 dark:text-slate-500">Analise a estrutura vencedora para o tema: <span className="font-bold text-enem-blue">"{theme?.title}"</span></p>
             </div>
             <Button variant="outline" size="sm" onClick={() => setViewingExample(false)} className="px-6 border-slate-200 dark:border-slate-800">Voltar para Análise</Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
             <div className="lg:col-span-7">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                   {/* Paper Texture Overlay */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                   
                   <div className="font-serif text-lg md:text-xl text-slate-800 dark:text-slate-200 p-8 md:p-12 leading-[2.2] whitespace-pre-wrap select-none italic relative z-10 border-l-[3rem] md:border-l-[4rem] border-slate-50 dark:border-slate-800/50">
                      {/* Simulated Lines for Example */}
                      <div className="absolute left-[-3rem] md:left-[-4rem] top-0 bottom-0 w-full pointer-events-none opacity-10">
                         {Array.from({length: 40}).map((_, i) => (
                            <div key={i} className="h-[2.2em] border-b border-slate-400"></div>
                         ))}
                      </div>
                      {example1000.essayText}
                   </div>
                </div>
             </div>

             <div className="lg:col-span-5 space-y-6">
                <h4 className="font-black text-slate-400 dark:text-slate-500 uppercase text-[10px] tracking-[0.2em] px-2 flex items-center gap-2">
                   <span className="text-lg">🔍</span>
                   Por que esta redação tirou 1000?
                </h4>
                
                <div className="space-y-4">
                   {/* Fallback de array para garantir que sempre mostre as 5 competências */}
                   {(example1000.comments?.length === 5 ? example1000.comments : Array(5).fill({})).map((comment: any, idx: number) => {
                      const compId = (idx + 1);
                      // Dicionário Oficial do ENEM
                      const competenciasDesc: any = {
                          1: { name: "Domínio da Norma Padrão", desc: "Demonstrar domínio da modalidade escrita formal da Língua Portuguesa." },
                          2: { name: "Compreensão e Repertório", desc: "Compreender a proposta e aplicar conceitos das várias áreas de conhecimento." },
                          3: { name: "Organização e Argumentação", desc: "Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista." },
                          4: { name: "Coesão e Conectivos", desc: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a argumentação." },
                          5: { name: "Proposta de Intervenção", desc: "Elaborar proposta de intervenção para o problema respeitando os direitos humanos." }
                      };
                      
                      const compData = competenciasDesc[compId];
                      const justificativa = comment.justification || comment.feedback || `O texto atende perfeitamente aos requisitos da Competência ${compId}, garantindo a nota máxima.`;

                      return (
                         <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                   <span className="font-black text-enem-blue dark:text-blue-400 uppercase text-[10px] block tracking-widest">
                                     Competência {compId}
                                   </span>
                                   <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-1 leading-tight">{compData.name}</h5>
                                </div>
                                <Badge color="green" className="text-[10px] bg-green-100 text-green-700 whitespace-nowrap border-green-200">200 pts</Badge>
                            </div>
                            
                            <p className="text-[11px] text-slate-400 mb-3 italic leading-relaxed">{compData.desc}</p>
                            
                            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                               <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                 {justificativa}
                               </p>
                            </div>
                         </div>
                      );
                   })}
                </div>
                
                <div className="p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800/30 text-center">
                   <p className="text-xs text-blue-700 dark:text-blue-300 font-bold leading-relaxed uppercase tracking-widest">
                      Utilize este modelo como referência de estrutura.
                   </p>
                </div>
             </div>
          </div>

          <div className="flex justify-center pt-8">
             <Button onClick={() => setViewingExample(false)} variant="primary" className="px-16 py-4 font-black uppercase tracking-widest shadow-xl shadow-enem-blue/20">
                Entendido, voltar para minha nota
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EssayView;