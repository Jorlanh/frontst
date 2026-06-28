import React, { useState, useEffect } from 'react';
import { fetchGamificationState, ServerGamificationState, GamProgress, GamBadge } from '../services/gamification';
import { apiRequest } from '../services/apiService';
import { Card, Button, LoadingSpinner } from './UIComponents';
import { GAMIFICATION_SUBJECTS } from '../constants';
import { AreaOfKnowledge } from '../types';

interface GamificationViewProps {
  onBack: () => void;
  onReviewErrors: () => void;
  isLoading?: boolean;
}

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
  const [activeTab, setActiveTab] = useState<'PROGRESS' | 'RANKING'>('RANKING');

  // Gamification state
  const [state, setState] = useState<ServerGamificationState | null>(null);
  const [loadingState, setLoadingState] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  // Ranking state
  const [ranking, setRanking] = useState<RankingData | null>(null);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [errorRanking, setErrorRanking] = useState<string | null>(null);

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

    // Build subject lookup
    const progressBySubject: Record<string, GamProgress> = {};
    for (const p of progress) progressBySubject[p.subject] = p;

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

        {/* Right: Subject Progress Map */}
        <div className="md:col-span-2">
          <Card className="h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100">Mapa de Progresso ENEM</h3>
              <span className="text-sm text-gray-500 dark:text-slate-400">Questões certas por matéria</span>
            </div>
            <div className="space-y-8">
              {(Object.keys(GAMIFICATION_SUBJECTS) as Array<keyof typeof GAMIFICATION_SUBJECTS>).map((area) => (
                <div key={area} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <h4 className="font-bold text-enem-blue dark:text-blue-400 mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">{area}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {GAMIFICATION_SUBJECTS[area].map((subject) => {
                      const stats = progressBySubject[subject] || { questionsAnswered: 0, questionsCorrect: 0 };
                      const accuracy = stats.questionsAnswered > 0 ? Math.round((stats.questionsCorrect / stats.questionsAnswered) * 100) : 0;
                      const GOAL = 50;
                      const barPct = Math.min(100, Math.round((stats.questionsCorrect / GOAL) * 100));
                      return (
                        <div key={subject} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-gray-700 dark:text-slate-200 text-sm truncate pr-2" title={subject}>{subject}</span>
                          </div>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-800 dark:text-slate-100">{accuracy}%</span>
                            <span className="text-xs text-gray-400 dark:text-slate-500 mb-1">acerto</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mb-2">
                            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${barPct}%` }}></div>
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-slate-500">
                            {stats.questionsAnswered} respondidas • {stats.questionsCorrect} certas
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Missed review shortcut */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={onReviewErrors}
                className="text-sm"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Gerando questões...' : '🚀 Revisar Erros Agora'}
              </Button>
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
