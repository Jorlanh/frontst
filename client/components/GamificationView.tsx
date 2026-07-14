import React, { useState, useEffect } from 'react';
import { fetchGamificationState, ServerGamificationState, GamProgress, GamBadge } from '../services/gamification';
import { apiRequest } from '../services/apiService';
import { Card, Button, LoadingSpinner } from './UIComponents';
import { AreaOfKnowledge } from '../types';

interface GamificationViewProps {
  onBack: () => void;
  // 🔥 Ajustado: Aceita areaId e subTopic opcionalmente, e a flag isReviewMode
  onReviewErrors: (areaId?: string, subTopic?: string, isReviewMode?: boolean) => void;
  isLoading?: boolean;
}

// ─── Constants (Mapeamento hierárquico) ───────────────────────────────────────
const HIERARCHICAL_SUBJECTS: Record<string, Record<string, string[]>> = {
  "LINGUAGENS": {
    "Português": ["Gramática", "Interpretação de Texto", "Morfologia", "Sintaxe", "Semântica"],
    "Literatura": ["Quinhentismo", "Barroco", "Arcadismo", "Romantismo", "Realismo", "Modernismo", "Contemporânea"],
    "Inglês": ["Reading Comprehension", "Vocabulary", "Grammar"],
    "Espanhol": ["Comprensión Lectora", "Vocabulario", "Gramática"],
    "Artes": ["Artes Visuais", "Música", "Teatro", "História da Arte"],
    "Educação Física": ["Esportes", "Práticas Corporais", "Saúde"]
  },
  "HUMANAS": {
    "História": ["Brasil Colônia", "Brasil Império", "Brasil República", "Idade Antiga", "Idade Média", "Idade Moderna", "Idade Contemporânea", "Guerra Fria"],
    "Geografia": ["Geopolítica", "Geografia Física", "Geografia Agrária", "Geografia Urbana", "Cartografia", "Meio Ambiente"],
    "Filosofia": ["Filosofia Antiga", "Filosofia Medieval", "Filosofia Moderna", "Filosofia Contemporânea", "Ética"],
    "Sociologia": ["Sociologia Clássica", "Sociologia Brasileira", "Cultura", "Trabalho", "Movimentos Sociais"]
  },
  "NATUREZA": {
    "Física": ["Mecânica", "Termologia", "Óptica", "Ondulatória", "Eletromagnetismo", "Física Moderna"],
    "Química": ["Química Geral", "Físico-Química", "Química Orgânica", "Meio Ambiente"],
    "Biologia": ["Ecologia", "Citologia", "Genética", "Botânica", "Zoologia", "Fisiologia Humana"]
  },
  "EXATAS": {
    "Matemática": ["Matemática Básica", "Geometria Plana", "Geometria Espacial", "Funções", "Estatística", "Probabilidade", "Trigonometria", "Matemática Financeira"]
  }
};

// ─── League helpers ───────────────────────────────────────────────────────────
const LEAGUE_LABEL: Record<string, string> = {
  BRONZE:  'Bronze',
  SILVER:  'Prata',
  GOLD:    'Ouro',
  DIAMOND: 'Diamante',
};

const LEAGUE_COLOR: Record<string, string> = {
  BRONZE:  'from-amber-700  to-amber-500',
  SILVER:  'from-slate-500  to-slate-400',
  GOLD:    'from-yellow-500 to-yellow-400',
  DIAMOND: 'from-cyan-500   to-blue-400',
};

const LEAGUE_ICON: Record<string, string> = {
  BRONZE:  '🥉',
  SILVER:  '🥈',
  GOLD:    '🥇',
  DIAMOND: '💎',
};

const CATEGORY_LABEL: Record<string, string> = {
  PROGRESS: 'Progresso', SUBJECT: 'Matéria', ESSAY: 'Redação',
  MOCK: 'Simulado', HABIT: 'Hábito',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface RankingEntry {
  rank: number;
  name: string;
  weeklyXp: number;
  level: number;
  isMe: boolean;
}

interface RankingData {
  league: string;
  leagueLabel: string;
  myPosition: number;
  totalInLeague: number;
  entries: RankingEntry[];
}

// ─── Component ────────────────────────────────────────────────────────────────
const GamificationView: React.FC<GamificationViewProps> = ({ onBack, onReviewErrors, isLoading = false }) => {
  const [activeTab, setActiveTab] = useState<'PROGRESS' | 'RANKING'>('PROGRESS');

  // Gamification state
  const [state, setState] = useState<ServerGamificationState | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Ranking state
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [errorRanking, setErrorRanking] = useState<string | null>(null);

  // Controle do Acordeão de Matérias
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects(prev => ({
      ...prev,
      [subjectName]: !prev[subjectName]
    }));
  };

  useEffect(() => {
    fetchGamificationState()
      .then(setState)
      .catch(() => setErrorState('Não foi possível carregar os dados de progresso.'))
      .finally(() => setLoadingState(false));

    apiRequest('/ranking', 'GET')
      .then((data: RankingData) => setRanking(data))
      .catch(() => setErrorRanking('Não foi possível carregar o ranking.'))
      .finally(() => setLoadingRanking(false));
  }, []);

  // ─── Ranking Tab ─────────────────────────────────────────────────────────────
  const renderRanking = () => {
    if (loadingRanking) return <LoadingSpinner />;
    if (errorRanking)   return <p className="text-red-500 text-sm">{errorRanking}</p>;
    if (!ranking)       return null;

    const league = ranking.league;

    return (
      <div className="space-y-4 animate-fade-in">
        {/* League banner */}
        <div className={`bg-gradient-to-r ${LEAGUE_COLOR[league] ?? 'from-slate-600 to-slate-500'} text-white p-6 rounded-xl shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium uppercase tracking-wider mb-1">Liga atual</p>
              <h3 className="text-2xl font-extrabold flex items-center gap-2">
                {LEAGUE_ICON[league]} Liga {LEAGUE_LABEL[league] ?? league}
              </h3>
              <p className="text-white/70 text-sm mt-1">
                {ranking.totalInLeague} alunos • sua posição: <strong className="text-white">#{ranking.myPosition}</strong>
              </p>
            </div>
            <div className="text-6xl opacity-30">{LEAGUE_ICON[league]}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-800 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            <div className="col-span-2 text-center">#</div>
            <div className="col-span-6">Estudante</div>
            <div className="col-span-2 text-center">XP Semanal</div>
            <div className="col-span-2 text-center">Nível</div>
          </div>
          {ranking.entries.map((entry) => (
            <div
              key={`${entry.rank}-${entry.name}`}
              className={`grid grid-cols-12 gap-2 p-4 items-center border-b border-gray-100 dark:border-slate-800 last:border-0 transition-colors
                ${entry.isMe
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 ring-2 ring-inset ring-yellow-400'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <div className="col-span-2 flex justify-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                  ${entry.rank === 1 ? 'bg-yellow-400 text-yellow-900'
                  : entry.rank === 2 ? 'bg-gray-300 text-gray-800'
                  : entry.rank === 3 ? 'bg-orange-300 text-orange-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-gray-500'}`}>
                  {entry.rank}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {entry.name.charAt(0).toUpperCase()}
                </div>
                <span className={`font-bold text-sm ${entry.isMe ? 'text-enem-blue' : 'text-gray-800 dark:text-slate-100'}`}>
                  {entry.name}{entry.isMe && ' (Eu)'}
                </span>
              </div>
              <div className="col-span-2 text-center font-mono font-bold text-gray-700 dark:text-slate-300">
                {entry.weeklyXp}
              </div>
              <div className="col-span-2 text-center">
                <span className="inline-block bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-bold px-2 py-0.5 rounded-full">
                  Lv {entry.level}
                </span>
              </div>
            </div>
          ))}
          {ranking.entries.length === 0 && (
            <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
              Nenhum aluno na sua liga ainda. Seja o primeiro! 🚀
            </div>
          )}
        </div>

        <p className="text-xs text-center text-gray-400 dark:text-slate-500">
          Ranking baseado no XP semanal • Reset toda segunda-feira • Top 20% sobe de liga
        </p>
      </div>
    );
  };

  // ─── Progress Tab ─────────────────────────────────────────────────────────────
  const renderProgress = () => {
    if (loadingState) return <LoadingSpinner />;
    if (errorState)   return <p className="text-red-500 text-sm">{errorState}</p>;
    if (!state)       return null;

    const { xp, title, nextLevelXp, currentLevelXp, streak, badges, progress } = state;
    
    const progressPercent = nextLevelXp && nextLevelXp > currentLevelXp
      ? Math.min(100, Math.round(((xp.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100))
      : 100;

    // Normalizando os nomes das matérias (Resolve o problema do 0/0)
    const progressBySubject: Record<string, GamProgress> = {};
    for (const p of progress) {
      if (p.subject) {
         progressBySubject[p.subject.trim().toLowerCase()] = p;
      }
    }

    // Função auxiliar para calcular métricas de forma rigorosa
    const getStats = (subjectName: string, isParent = false) => {
      const normalizedKey = subjectName.trim().toLowerCase();
      
      if (!isParent) {
        return progressBySubject[normalizedKey] || { questionsAnswered: 0, questionsCorrect: 0 };
      }
      
      let answered = 0;
      let correct = 0;
      
      if (progressBySubject[normalizedKey]) {
        answered += progressBySubject[normalizedKey].questionsAnswered;
        correct += progressBySubject[normalizedKey].questionsCorrect;
      }

      for (const area of Object.keys(HIERARCHICAL_SUBJECTS)) {
        if (HIERARCHICAL_SUBJECTS[area][subjectName]) {
          for (const sub of HIERARCHICAL_SUBJECTS[area][subjectName]) {
            const subKey = sub.trim().toLowerCase();
            if (progressBySubject[subKey]) {
              answered += progressBySubject[subKey].questionsAnswered;
              correct += progressBySubject[subKey].questionsCorrect;
            }
          }
        }
      }
      return { questionsAnswered: answered, questionsCorrect: correct };
    };

    // Group badges by category
    const badgesByCategory: Record<string, GamBadge[]> = {};
    for (const b of badges) {
      if (!badgesByCategory[b.category]) badgesByCategory[b.category] = [];
      badgesByCategory[b.category].push(b);
    }

    return (
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left: Level + Streak */}
        <div className="md:col-span-1 space-y-6">
          {/* Level Card */}
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">🏆</div>
            <div className="relative z-10 text-center py-6">
              <div className="inline-block p-1 rounded-full bg-white/20 mb-4">
                <div className="w-24 h-24 rounded-full bg-white text-purple-700 flex items-center justify-center text-4xl font-extrabold shadow-lg">
                  {xp.level}
                </div>
              </div>
              <h2 className="text-xl font-bold">Nível {xp.level}</h2>
              <p className="text-purple-200 text-sm">{title}</p>
              <div className="mt-6 px-4">
                <div className="flex justify-between text-xs mb-1 opacity-90">
                  <span>{xp.totalXp} XP</span>
                  <span>{nextLevelXp ?? '—'} XP</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-3 backdrop-blur-sm">
                  <div
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                {nextLevelXp && <p className="text-xs mt-2 opacity-70">Faltam {nextLevelXp - xp.totalXp} XP</p>}
              </div>
            </div>
          </Card>

          {/* Streak Card */}
          <Card>
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-3 flex items-center gap-2">🔥 Sequência de Estudo</h3>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-extrabold text-orange-500">{streak.currentStreak}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Dias atual</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-slate-700 dark:text-slate-200">{streak.longestStreak}</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Recorde</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-500">{streak.multiplier.toFixed(1)}×</div>
                <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Multiplicador</div>
              </div>
            </div>
          </Card>

          {/* Badges earned */}
          {badges.length > 0 && (
            <Card>
              <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-3">🎖️ Conquistas ({badges.length})</h3>
              <div className="space-y-3">
                {Object.entries(badgesByCategory).map(([cat, catBadges]) => (
                  <div key={cat}>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{CATEGORY_LABEL[cat] || cat}</div>
                    <div className="flex flex-wrap gap-2">
                      {catBadges.map(b => (
                        <div key={b.key} title={b.description} className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 text-xs">
                          <span>{b.iconEmoji}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">{b.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Subject Progress Map Hierárquico */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Raio-X de Desempenho</h3>
                <span className="text-sm text-gray-500 dark:text-slate-400">Análise de acertos e mapeamento de erros.</span>
              </div>
              
              {/* BOTÃO MESTRE: Traz TODAS as questões erradas do banco de dados (isReviewMode = true) */}
              <Button 
                variant="primary" 
                onClick={() => onReviewErrors(undefined, undefined, true)} 
                className="text-sm shadow-md bg-red-600 hover:bg-red-700 text-white border-none"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Carregando...' : '🚀 Revisar Todos os Erros'}
              </Button>
            </div>
            
            <div className="space-y-6">
              {Object.keys(HIERARCHICAL_SUBJECTS).map((area) => (
                <div key={area} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <h4 className="font-bold text-enem-blue dark:text-blue-400 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">{area}</h4>
                  
                  <div className="flex flex-col gap-3">
                    {Object.keys(HIERARCHICAL_SUBJECTS[area]).map((parentSubject) => {
                      const parentStats = getStats(parentSubject, true);
                      const isExpanded = expandedSubjects[parentSubject];
                      const accuracy = parentStats.questionsAnswered > 0 ? Math.round((parentStats.questionsCorrect / parentStats.questionsAnswered) * 100) : 0;
                      const errors = parentStats.questionsAnswered - parentStats.questionsCorrect;
                      const barPct = Math.min(100, Math.round((parentStats.questionsCorrect / (parentStats.questionsAnswered || 1)) * 100));

                      return (
                        <div key={parentSubject} className="flex flex-col bg-white dark:bg-slate-900 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
                          
                          {/* PARENT ROW (Clicável para expandir) */}
                          <div 
                            onClick={() => toggleSubject(parentSubject)}
                            className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 w-1/3">
                              <span className="text-lg text-slate-400">{isExpanded ? '▼' : '▶'}</span>
                              <span className="font-bold text-gray-800 dark:text-slate-100 truncate" title={parentSubject}>{parentSubject}</span>
                            </div>
                            
                            <div className="w-1/3 hidden sm:flex items-center gap-2 px-4">
                              <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-2">
                                <div className={`h-2 rounded-full ${accuracy >= 70 ? 'bg-green-500' : accuracy >= 40 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{ width: `${barPct}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-gray-500 w-8 text-right">{accuracy}%</span>
                            </div>

                            <div className="flex flex-col items-end w-1/3 text-xs">
                              <span className="text-gray-500 dark:text-slate-400"><strong className="text-green-600 dark:text-green-400">{parentStats.questionsCorrect}</strong> certas</span>
                              <span className="text-gray-400 dark:text-slate-500"><strong className="text-red-500 dark:text-red-400">{errors}</strong> erradas</span>
                            </div>
                          </div>

                          {/* CHILDREN ROWS (Acordeão) */}
                          {isExpanded && (
                            <div className="bg-slate-50/50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800 divide-y divide-gray-100 dark:divide-slate-800">
                              {HIERARCHICAL_SUBJECTS[area][parentSubject].map((subTopic) => {
                                const subStats = getStats(subTopic, false);
                                const subAccuracy = subStats.questionsAnswered > 0 ? Math.round((subStats.questionsCorrect / subStats.questionsAnswered) * 100) : 0;
                                const subErrors = subStats.questionsAnswered - subStats.questionsCorrect;

                                return (
                                  <div key={subTopic} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 pl-10 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                    <div className="flex-1 w-full sm:w-auto mb-2 sm:mb-0">
                                      <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">{subTopic}</span>
                                      <div className="text-[10px] text-gray-500 dark:text-slate-500 flex gap-3 mt-1">
                                        <span>Total: {subStats.questionsAnswered}</span>
                                        <span className="text-green-600">✓ {subStats.questionsCorrect}</span>
                                        <span className={subErrors > 0 ? "text-red-500 font-bold" : "text-gray-400"}>✗ {subErrors}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                      <div className={`text-xs font-bold px-2 py-1 rounded-md ${subAccuracy >= 70 ? 'bg-green-100 text-green-700' : subAccuracy >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                        {subAccuracy}%
                                      </div>
                                      
                                      {/* APENAS O BOTÃO PRATICAR: Chama a IA para gerar novas perguntas (isReviewMode = false) */}
                                      <button 
                                        className="text-[11px] bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-enem-blue font-bold px-4 py-1.5 rounded-md hover:border-enem-blue transition-colors disabled:opacity-50"
                                        disabled={isLoading}
                                        onClick={() => {
                                           const areaMapped = area === "LINGUAGENS" ? "Linguagens" :
                                                              area === "HUMANAS" ? "Humanas" :
                                                              area === "NATUREZA" ? "Natureza" : "Exatas";
                                           
                                           // Passa isReviewMode = false, acionando a IA
                                           onReviewErrors(areaMapped, subTopic, false); 
                                        }}
                                      >
                                        Praticar Tópico
                                      </button>
                                      
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="text-sm">← Voltar</Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">🎮 Central de Conquistas</h1>
        </div>
        <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
          <button
            onClick={() => setActiveTab('PROGRESS')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'PROGRESS' ? 'bg-white dark:bg-slate-700 shadow text-enem-blue dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
          >
            Meu Progresso
          </button>
          <button
            onClick={() => setActiveTab('RANKING')}
            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'RANKING' ? 'bg-white dark:bg-slate-700 shadow text-enem-blue dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
          >
            🏆 Ranking da Liga
          </button>
        </div>
      </div>
      {activeTab === 'RANKING' ? renderRanking() : renderProgress()}
    </div>
  );
};

export default GamificationView;