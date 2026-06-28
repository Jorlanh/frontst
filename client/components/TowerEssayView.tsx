import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView, EssayTheme, EssayCorrection } from '../types';
import { generateEssayTheme, evaluateEssay } from '../services/aiClientService';
import { Button, Badge, FullPageLoader } from './UIComponents';
import { useTimer, calculateEssayTimeLimit, formatTime } from '../hooks/useTimer';
import { useNavigation } from '../contexts/NavigationContext';
import { apiRequest } from '../services/apiService';
import { Sword, Target, Award, Clock, Activity, Flag } from 'lucide-react';

export default function TowerEssayView() {
  const { navigate } = useNavigation();
  
  const [step, setStep] = useState<'LOADING' | 'WRITING' | 'RESULT'>('LOADING');
  const [theme, setTheme] = useState<EssayTheme | null>(null);
  const [essayText, setEssayText] = useState("");
  const [result, setResult] = useState<EssayCorrection | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const essayTextRef = useRef(""); 
  const telemetry = useRef({ keystrokes: 0, pausesOver5s: 0, paragraphCount: 0 });
  const lastTypingTime = useRef<number>(Date.now());

  const [towerLevel, setTowerLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(500);

  // 1. INIT BOSS FIGHT
  useEffect(() => {
    const floorStr = sessionStorage.getItem('studr_current_tower_floor');
    if (floorStr) {
      const floor = JSON.parse(floorStr);
      setTowerLevel(floor.floorNumber || 1);
      setTargetScore(floor.targetScore || 500);
    }

    const startBossFight = async () => {
      setStep('LOADING');
      try {
        const newTheme = await generateEssayTheme();
        setTheme(newTheme);
      } catch (e) {
        console.error("Erro na IA ao gerar tema:", e);
        setTheme({ 
          title: "Os desafios da implementação tecnológica na educação pública brasileira", 
          motivatingTexts: [
            "A disparidade de infraestrutura no Brasil agrava a exclusão digital em escolas públicas.", 
            "Especialistas apontam que tecnologia sem pedagogia não resolve o problema da evasão escolar."
          ] 
        });
      }
      setStep('WRITING');
      lastTypingTime.current = Date.now();
    };

    startBossFight();
  }, []);

  // 2. TIMING ENGINE
  const timer = useTimer(() => {
    if (step === 'WRITING') {
      handleEvaluate(essayTextRef.current);
    }
  });

  useEffect(() => {
    if (step === 'WRITING') {
      const limit = calculateEssayTimeLimit(towerLevel);
      timer.startTimer(limit);
    }
    return () => timer.stopTimer();
  }, [step, towerLevel]);

  // 3. ELITE AI EVALUATION
  const handleEvaluate = useCallback(async (forcedText?: string) => {
    const currentText = forcedText || essayTextRef.current;
    if (!theme || !currentText.trim()) return;

    setIsEvaluating(true);
    try {
      telemetry.current.paragraphCount = currentText.split(/\n\s*\n/).filter(p => p.trim() !== '').length;
      
      const performanceData = {
        towerLevel,
        maxTime: timer.maxTime,
        timeSpentSeconds: timer.maxTime - timer.timeRemaining,
        telemetry: telemetry.current
      };

      // @ts-expect-error bypass TS cache
      const correction = await evaluateEssay(theme.title, currentText, performanceData);
      setResult(correction);
      timer.stopTimer();
      setStep('RESULT');
    } catch (e) {
      alert("Falha na interface de comunicação. Tente submeter novamente.");
      console.error(e);
    } finally {
      setIsEvaluating(false);
    }
  }, [theme, towerLevel, timer]);

  // 4. SAVE & CLAIM (API)
  const handleClaimBuilding = async () => {
    if (!result) return;
    setIsSaving(true);
    try {
      const floorStr = sessionStorage.getItem('studr_current_tower_floor');
      if (floorStr) {
        const floor = JSON.parse(floorStr);
        const isWin = result.totalScore >= targetScore;
        let earnedStars = 0;
        
        if (isWin) {
           earnedStars = result.totalScore >= targetScore * 1.5 ? 3 : result.totalScore >= targetScore * 1.2 ? 2 : 1;
           if(earnedStars > 3) earnedStars = 3;
        }

        await apiRequest('/tower/submit', 'POST', { 
            floorId: floor.id, 
            score: result.totalScore,
            stars: earnedStars 
        });
      }
      
      sessionStorage.removeItem('studr_exam_mode');
      sessionStorage.removeItem('studr_tower_essay_theme');
      navigate(AppView.TOWER);
    } catch (err) {
      console.error("Erro ao salvar progresso:", err);
      alert("Falha ao sincronizar com a base. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    sessionStorage.removeItem('studr_exam_mode');
    sessionStorage.removeItem('studr_tower_essay_theme');
    navigate(AppView.TOWER);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEssayText(e.target.value);
    essayTextRef.current = e.target.value;
  };

  const handleKeyDown = () => {
    telemetry.current.keystrokes += 1;
    const now = Date.now();
    if (now - lastTypingTime.current > 5000) telemetry.current.pausesOver5s += 1;
    lastTypingTime.current = now;
  };

  // UI Helpers
  const wordCount = essayText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const estimatedLines = Math.ceil(wordCount / 10);
  const canSubmit = wordCount >= 80 && estimatedLines >= 7;

  if (step === 'LOADING') {
    return <FullPageLoader text={`Sintetizando protocolo do Chefão (Prédio ${towerLevel}). Iniciando ambiente hostil...`} />;
  }

  if (isEvaluating) {
    return <FullPageLoader text="IA de Elite processando heurísticas da sua tese. Analisando coesão e métricas..." />;
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 ${timer.isFinalBattle ? 'bg-red-950/10' : 'bg-[#0B0F19]'}`}>
      <div className={`max-w-[1400px] mx-auto p-4 sm:p-8 animate-fade-in`}>
        
        {/* COMBAT HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-xl">
          <Button variant="outline" onClick={handleCancel} className="text-xs px-5 py-2.5 border-slate-700 text-slate-400 hover:text-red-400 hover:border-red-900 hover:bg-red-950/30 transition-all font-bold tracking-wider uppercase">
            <Flag size={14} className="mr-2 inline" /> Abortar Missão
          </Button>
          
          <div className="flex items-center gap-4 bg-slate-950/80 px-6 py-3 rounded-xl border border-slate-800 shadow-inner">
            <Sword className="text-purple-500 animate-pulse" size={20} />
            <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Confronto Direto</span>
                <span className="text-sm font-black text-white tracking-wider">PRÉDIO {towerLevel}</span>
            </div>
            <div className="h-8 w-px bg-slate-800 mx-2"></div>
            <div className="flex flex-col items-end">
                <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Meta de Sobrevivência</span>
                <span className="text-sm font-black text-cyan-400">{targetScore} PTS</span>
            </div>
          </div>
        </div>

        {step === 'WRITING' && theme && (
          <div className="grid lg:grid-cols-12 gap-8 lg:items-start animate-fade-in pb-10">
            
            {/* SIDEBAR - THEME & CONTEXT */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-7 rounded-3xl text-white shadow-2xl border border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
                <h3 className="text-[10px] font-black uppercase mb-4 tracking-[0.3em] flex items-center gap-2 text-purple-400 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                  Diretriz Principal
                </h3>
                <p className="text-xl md:text-2xl font-extrabold leading-snug tracking-tight relative z-10 text-slate-100">{theme.title}</p>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 pl-2">
                   <Activity size={12} /> Dados de Apoio
                </h4>
                <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-3 custom-scrollbar">
                  {theme.motivatingTexts.map((text, i) => (
                    <div key={i} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 text-sm text-slate-300 shadow-lg leading-relaxed relative hover:border-slate-700 transition-colors">
                      <span className="absolute -left-3 -top-3 w-8 h-8 rounded-xl bg-gradient-to-br from-purple-900 to-slate-900 border border-purple-500/30 flex items-center justify-center text-xs font-black text-purple-300 shadow-lg">{i + 1}</span>
                      <div className="pl-2">{text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* MAIN EDITOR AREA */}
            <div className="lg:col-span-8 flex flex-col h-[80vh] min-h-[600px]">
              
              {/* EDITOR HUD */}
              <div className={`rounded-t-3xl p-5 flex flex-wrap justify-between items-center text-sm font-bold shadow-2xl transition-colors border-x border-t ${timer.isFinalBattle ? 'bg-red-950/40 border-red-900/50 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                <div className="flex items-center gap-5">
                  <span className="uppercase tracking-[0.2em] text-[10px] bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <Clock size={12} className={timer.isFinalBattle ? 'text-red-500' : 'text-purple-500'} />
                    Tempo Crítico
                  </span>
                  <span className={`text-2xl font-mono tracking-tight ${timer.isFinalBattle ? 'animate-pulse text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'text-white'}`}>
                    {formatTime(timer.timeRemaining)}
                  </span>
                </div>
                
                <div className="flex gap-4 text-[11px] uppercase tracking-widest bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800/50">
                  <div className="flex flex-col items-center">
                      <span className={wordCount < 80 ? 'text-amber-500' : 'text-emerald-500'}>{wordCount} / 80</span>
                      <span className="text-[8px] text-slate-600">Palavras</span>
                  </div>
                  <div className="w-px bg-slate-800"></div>
                  <div className="flex flex-col items-center">
                      <span className={estimatedLines >= 7 && estimatedLines <= 30 ? 'text-emerald-500' : 'text-amber-500'}>~{estimatedLines}</span>
                      <span className="text-[8px] text-slate-600">Linhas</span>
                  </div>
                </div>
              </div>

              {/* TEXTAREA IDE STYLE */}
              <textarea
                className={`w-full flex-1 p-8 md:p-10 border-x border-b rounded-b-3xl focus:outline-none resize-none font-serif text-lg md:text-xl leading-[2.2] shadow-2xl transition-all custom-scrollbar 
                  ${timer.isFinalBattle 
                    ? 'bg-red-950/10 focus:ring-1 focus:ring-red-900 border-red-900/50 text-red-100 placeholder-red-900/50' 
                    : 'bg-[#0F1523] focus:ring-1 focus:ring-purple-900/50 border-slate-800 text-slate-200 placeholder-slate-700'}`}
                placeholder="Inicie a inserção de dados. Formate sua tese de defesa..."
                value={essayText}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                disabled={timer.isTimeUp}
                autoFocus
              />

              <div className="mt-8 flex justify-end">
                 <Button 
                    onClick={() => handleEvaluate()} 
                    disabled={!canSubmit || estimatedLines > 30} 
                    className={`py-5 px-12 font-black uppercase tracking-[0.2em] shadow-2xl transition-all text-sm rounded-2xl
                      ${(canSubmit && estimatedLines <= 30) 
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-purple-900/50 text-white border border-purple-400/30 hover:-translate-y-1' 
                        : 'bg-slate-800/80 text-slate-300 cursor-not-allowed border-2 border-slate-700 shadow-inner'}`}
                 >
                    <Target size={16} className="mr-2 inline" /> Submeter Relatório Final
                 </Button>
              </div>
            </div>
          </div>
        )}

        {/* BATTLE RESULT SCREEN */}
        {step === 'RESULT' && result && (
          <div className="space-y-10 animate-fade-in pb-20 max-w-4xl mx-auto mt-8">
            <div className="text-center space-y-4">
                <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Avaliação do Sistema Central</h2>
                <h1 className="text-4xl md:text-5xl font-black uppercase text-white tracking-tighter">Veredito do Chefão</h1>
            </div>
            
            <div className={`p-12 rounded-[3rem] border shadow-2xl relative overflow-hidden backdrop-blur-xl ${result.totalScore >= targetScore ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
               <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[100px] opacity-20 ${result.totalScore >= targetScore ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
               
               <div className="flex flex-col items-center justify-center text-center relative z-10">
                   <div className={`text-[10rem] md:text-[12rem] font-black leading-none drop-shadow-2xl tracking-tighter ${result.totalScore >= targetScore ? 'text-white' : 'text-slate-300'}`}>
                       {result.totalScore}
                   </div>
                   
                   <div className="mt-8 flex flex-col items-center gap-4">
                       <Badge color={result.totalScore >= targetScore ? 'green' : 'red'} className="text-sm px-8 py-3 uppercase tracking-widest font-black shadow-xl">
                          {result.totalScore >= targetScore ? "🏆 Setor Dominado" : "💀 Avaliação Falhou"}
                       </Badge>
                       <p className="text-slate-400 font-mono text-xs uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">Meta do Prédio: {targetScore} PTS</p>
                   </div>
               </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-8 md:p-10 shadow-2xl backdrop-blur-md">
               <div className="flex items-center gap-3 mb-6">
                   <Award className="text-purple-500" size={24} />
                   <h3 className="text-xl font-black text-white uppercase tracking-wider">Análise Tática</h3>
               </div>
               
               <p className="text-slate-300 text-lg leading-relaxed italic border-l-4 border-purple-500/50 pl-6 py-2 bg-slate-800/30 rounded-r-2xl mb-8">
                   "{result.generalFeedback}"
               </p>
               
               <div className="grid md:grid-cols-2 gap-4">
                   <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/30 transition-colors">
                       <p className="text-[10px] text-emerald-500 uppercase font-black tracking-widest mb-2 flex items-center gap-2">
                           <Activity size={12} /> Ponto Forte Primário
                       </p>
                       <p className="text-sm text-slate-200 font-medium leading-relaxed">{result.strengths[0]}</p>
                   </div>
                   {/* Fallback box for UI symmetry */}
                   <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-center opacity-50">
                       <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Aguardando telemetria adicional...</p>
                   </div>
               </div>
            </div>

            <Button 
                onClick={handleClaimBuilding} 
                loading={isSaving}
                className={`w-full py-7 text-xl md:text-2xl font-black tracking-[0.2em] uppercase shadow-2xl rounded-2xl transition-all ${result.totalScore >= targetScore ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50 hover:-translate-y-1' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'}`}
            >
                {result.totalScore >= targetScore ? 'Confirmar Domínio' : 'Retorno à Base (Derrota)'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}