import React, { useEffect, useState, useRef } from 'react';
import { Button, LoadingSpinner, Badge } from './UIComponents';
import { Sword, Lock, Star, Target, TrendingUp, RotateCcw } from 'lucide-react';
import { getTowerQuestionCount } from './QuizScreen'; 
import { apiRequest } from '../services/apiService'; // 🚨 IMPORTAÇÃO DO SERVIÇO OFICIAL

interface TowerViewProps { onBack: () => void; onBattleStart: (floor: any) => void; }

const DISTRICTS = [
    { name: "Distrito Inicial", end: 9, color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20", glow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]" },
    { name: "Cidade Base", end: 24, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20", glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]" },
    { name: "Zona Intermediária", end: 44, color: "text-purple-400", bg: "bg-purple-500/5", border: "border-purple-500/20", glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]" },
    { name: "Cidade Elite", end: 69, color: "text-fuchsia-400", bg: "bg-fuchsia-500/5", border: "border-fuchsia-500/20", glow: "shadow-[0_0_20px_rgba(232,121,249,0.15)]" },
    { name: "Complexo Nacional", end: 89, color: "text-slate-200", bg: "bg-slate-800/40", border: "border-slate-600/50", glow: "shadow-[0_0_20px_rgba(148,163,184,0.1)]" },
    { name: "Torre Suprema", end: 99, color: "text-yellow-400", bg: "bg-black/90", border: "border-yellow-500/40", glow: "shadow-[0_0_30px_rgba(234,179,8,0.2)]" },
    { name: "Torre dos 1000 Pontos", end: 100, color: "text-red-500", bg: "bg-gradient-to-b from-red-950/40 to-black", border: "border-red-500/50", glow: "shadow-[0_0_40px_rgba(239,68,68,0.3)]" }
];

function getDistrict(bNum: number) { 
    return DISTRICTS.find(dist => bNum <= dist.end) || DISTRICTS[0]; 
}

function calculateTargetScoreForBuilding(buildingNum: number) {
    const baseScore = 400;
    const maxScore = 950;
    const increment = (maxScore - baseScore) / 100;
    return Math.floor(baseScore + (buildingNum * increment));
}

export default function TowerView({ onBack, onBattleStart }: TowerViewProps) {
    const [tower, setTower] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [battlingId, setBattlingId] = useState<string | null>(null);
    const currentBuildingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        sessionStorage.removeItem('studr_exam_mode');
        sessionStorage.removeItem('studr_current_tower_floor');
        
        const fetchTower = async () => {
            try {
                const data = await apiRequest(`/tower/state?t=${Date.now()}`, 'GET');
                setTower(data);
            } catch (err) { 
                console.error("Erro ao buscar estado da torre:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchTower();
    }, []);

    useEffect(() => {
        if (!loading && tower) {
            window.scrollTo(0, 0);
            const timer = setTimeout(() => { currentBuildingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 800);
            return () => clearTimeout(timer);
        }
    }, [loading, tower]);

    const handleBattle = async (floorData: any) => {
        setBattlingId(floorData.id);
        const enrichedFloorData = { ...floorData, questionsCount: getTowerQuestionCount(floorData.building) };
        setTimeout(() => { onBattleStart(enrichedFloorData); }, 800);
    };

    if (loading) return <div className="flex justify-center items-center h-[60vh]"><LoadingSpinner size="md" /></div>;

    const highestBuilding = tower?.currentBuilding || 1;
    const currentFloorNum = tower?.currentFloor || 1;
    const dbFloors = tower?.floors || [];
    const ALL_BUILDINGS = Array.from({ length: 100 }, (_, i) => 100 - i);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in pb-32 min-h-screen bg-slate-50 dark:bg-[#0B0F19] selection:bg-cyan-500/30 font-sans">
            
            {/* STICKY HEADER - ELITE GLASSMORPHISM */}
            <div className="flex justify-between items-center mb-16 sticky top-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl z-50 p-4 md:p-6 rounded-3xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 border border-white/40 dark:border-slate-700/50 transition-all">
                <Button variant="outline" onClick={onBack} className="rounded-xl border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all font-bold text-slate-700 dark:text-slate-300">
                    ← Base Central
                </Button>
                
                <div className="text-center hidden md:block flex-1">
                    <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-[0.4em] block mb-1 opacity-80">Localização Atual</span>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 tracking-tighter">
                        PRÉDIO {highestBuilding}
                    </h1>
                </div>

                <div className="flex items-center gap-3 bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-inner">
                    <Star size={18} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                    <span className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">Jornada TRI</span>
                </div>
            </div>

            <div className="flex flex-col gap-16 relative">
                {/* PROGRESSION LINE - GLOWING EFFECT */}
                <div className="absolute w-1.5 h-[98%] bg-gradient-to-b from-transparent via-cyan-500/20 dark:via-cyan-500/10 to-transparent left-14 md:left-[200px] top-10 z-0 rounded-full blur-[1px]"></div>
                <div className="absolute w-0.5 h-[98%] bg-gradient-to-b from-transparent via-cyan-400 dark:via-cyan-600 to-transparent left-[58px] md:left-[202px] top-10 z-0"></div>

                {ALL_BUILDINGS.map((bId) => {
                    const isBuildingUnlocked = bId <= highestBuilding;
                    const isBuildingCurrent = bId === highestBuilding;
                    const district = getDistrict(bId);
                    const qCount = getTowerQuestionCount(bId);
                    const isLastOfDistrict = DISTRICTS.some(d => d.end === bId);
                    const targetScore = calculateTargetScoreForBuilding(bId);

                    const buildingFloors = dbFloors.filter((f: any) => f.building === bId);
                    const completedInBldg = buildingFloors.filter((f: any) => f.isCompleted);
                    const avgScore = completedInBldg.length > 0 
                        ? Math.round(completedInBldg.reduce((acc: number, f: any) => acc + (f.highScore || 0), 0) / completedInBldg.length)
                        : null;

                    return (
                        <React.Fragment key={bId}>
                            {isLastOfDistrict && bId !== 100 && (
                                <div className={`w-full py-10 my-6 text-center rounded-[2rem] border backdrop-blur-sm ${district.bg} ${district.border} ${district.glow} z-10 transition-all duration-700`}>
                                    <h2 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter ${district.color} drop-shadow-md`}>{district.name}</h2>
                                    <Badge color="blue" className="mt-4 opacity-80 uppercase text-[11px] tracking-[0.3em] font-bold px-4 py-1.5">Setor Registrado</Badge>
                                </div>
                            )}

                            {bId === 100 && (
                                <div className="w-full py-16 mb-12 text-center rounded-[3rem] bg-gradient-to-b from-red-950/40 to-black border-y-4 border-red-600/50 shadow-[0_0_80px_rgba(239,68,68,0.25)] z-10 backdrop-blur-xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-overlay"></div>
                                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] relative z-10">Torre dos 1000 Pontos</h2>
                                    <p className="text-red-300 font-black uppercase tracking-[0.4em] mt-4 text-sm relative z-10">O Julgamento Final • Simulado ENEM Completo</p>
                                </div>
                            )}

                            <div ref={isBuildingCurrent ? currentBuildingRef : null} 
                                 className={`relative flex flex-col md:flex-row items-start md:items-stretch gap-10 ${!isBuildingUnlocked ? 'opacity-30 grayscale-[50%] scale-[0.98] pointer-events-none' : 'z-20'}`}>
                                
                                {/* BUILDING CARD */}
                                <div className={`w-44 md:w-52 flex-shrink-0 flex flex-col p-6 rounded-[2rem] border transition-all duration-500
                                    ${isBuildingCurrent 
                                        ? 'bg-slate-900 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.25)] scale-105' 
                                        : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/20 dark:shadow-none hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                    
                                    <div className="flex flex-col items-center text-center mb-6">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-1 ${isBuildingCurrent ? 'text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                            Edifício
                                        </span>
                                        <span className={`text-6xl font-black tracking-tighter ${isBuildingCurrent ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-slate-700 dark:text-slate-400'}`}>
                                            {bId}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mt-auto">
                                        <div className={`flex flex-col gap-1 p-3.5 rounded-xl border ${isBuildingCurrent ? 'bg-cyan-950/30 border-cyan-800/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}>
                                            <div className="flex items-center gap-2 opacity-90">
                                                <Target size={12} className={isBuildingCurrent ? 'text-cyan-400' : 'text-slate-500'} />
                                                <span className={`text-[9px] font-black uppercase tracking-wider ${isBuildingCurrent ? 'text-cyan-400' : 'text-slate-500'}`}>Meta TRI</span>
                                            </div>
                                            <span className={`text-sm font-black ${isBuildingCurrent ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{targetScore}</span>
                                        </div>

                                        {avgScore !== null && (
                                            <div className={`flex flex-col gap-1 p-3.5 rounded-xl border transition-colors
                                                ${avgScore >= targetScore ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                                                <div className="flex items-center gap-2 opacity-90">
                                                    <TrendingUp size={12} className={avgScore >= targetScore ? 'text-emerald-500' : 'text-amber-500'} />
                                                    <span className={`text-[9px] font-black uppercase tracking-wider ${avgScore >= targetScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>Sua Média</span>
                                                </div>
                                                <span className={`text-sm font-black ${avgScore >= targetScore ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>{avgScore}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                                        <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{qCount} Questões</span>
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isBuildingCurrent ? 'bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                                    </div>
                                </div>

                                {/* FLOOR LIST / REPLAY MODULE */}
                                <div className="flex-1 flex flex-wrap items-center gap-5 md:gap-7 pl-12 md:pl-0">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const fNum = i + 1;
                                        const dbF = dbFloors.find((f: any) => f.building === bId && f.floorNumber === fNum);
                                        
                                        const isDone = dbF?.isCompleted || (bId < highestBuilding || (bId === highestBuilding && fNum < currentFloorNum));
                                        const isActive = bId === highestBuilding && fNum === currentFloorNum;
                                        const isLocked = !isDone && !isActive;

                                        const floorPayload = dbF || {
                                            id: `mock-${bId}-${fNum}`,
                                            building: bId,
                                            floorNumber: fNum,
                                            targetScore: targetScore,
                                            isBoss: fNum === 5,
                                            area: 'Todas as Áreas',
                                            topic: `Treino Geral do Andar ${fNum}`
                                        };

                                        return (
                                            <div key={fNum} className="flex flex-col items-center group">
                                                <button
                                                    onClick={() => (isActive || isDone) && handleBattle(floorPayload)}
                                                    disabled={isLocked || battlingId === floorPayload.id}
                                                    title={isDone ? "Refazer Operação" : ""}
                                                    className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] flex flex-col items-center justify-center font-black transition-all duration-300 relative outline-none
                                                        ${isDone ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500/80 text-emerald-600 dark:text-emerald-400 shadow-[0_8px_20px_rgba(16,185,129,0.15)] hover:border-emerald-400 hover:shadow-[0_12px_25px_rgba(16,185,129,0.25)] hover:-translate-y-1.5 cursor-pointer' : 
                                                          isActive ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white shadow-[0_15px_30px_rgba(6,182,212,0.4)] scale-110 -translate-y-2 cursor-pointer border border-cyan-300/50' : 
                                                          'bg-slate-200/80 dark:bg-slate-900/80 text-slate-500 dark:text-slate-500 border-2 border-slate-300/80 dark:border-slate-800 cursor-not-allowed shadow-inner'}`}
                                                >
                                                    {battlingId === floorPayload.id ? <LoadingSpinner size="sm" /> : 
                                                     isLocked ? <Lock size={20} className="text-slate-400 dark:text-slate-600" /> : 
                                                     floorPayload.isBoss ? <Sword size={26} className={isActive ? 'animate-pulse' : ''} /> : <span className="text-2xl">{fNum}</span>}
                                                    
                                                    {isDone && !battlingId && (
                                                        <div className="absolute -top-2.5 -right-2.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800/50 p-1.5 rounded-full text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md transform scale-75 group-hover:scale-100">
                                                            <RotateCcw size={14} strokeWidth={2.5} />
                                                        </div>
                                                    )}

                                                    {isDone && dbF?.stars > 0 && (
                                                        <div className="absolute -bottom-3 flex gap-1 bg-slate-900/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-700/50 shadow-lg">
                                                            {Array(dbF.stars).fill(0).map((_, idx) => (
                                                                <Star key={idx} size={10} className="fill-yellow-400 text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </button>
                                                
                                                {isDone && dbF?.highScore !== undefined && (
                                                    <span className="mt-5 text-[10px] font-black text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        {dbF.highScore} PTS
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}

                <div className="mt-24 flex flex-col items-center opacity-40">
                    <div className="w-1.5 h-16 bg-gradient-to-b from-cyan-500/50 to-transparent rounded-full mb-2"></div>
                    <div className="bg-slate-200 dark:bg-slate-800/80 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                        Ponto de Origem
                    </div>
                </div>
            </div>
        </div>
    );
}