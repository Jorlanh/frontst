import React, { useState } from 'react';
import { AreaOfKnowledge, AppView } from '../types';
import { useUser } from '../contexts/UserContext';
import { useGamification } from '../contexts/GamificationContext';
import { usePractice } from '../contexts/PracticeContext';
import { useMock } from '../contexts/MockContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useUI } from '../contexts/UIContext';
import { Button, Badge } from './UIComponents';
import Logo from './Logo';
import { SUBJECT_AREAS, SPECIFIC_SUBJECTS } from '../constants';
import TowerRulesModal from './TowerRulesModal';

const BentoCard = ({
  children,
  className = '',
  locked = false,
  onLockedClick
}: any) => (
  <div
    onClick={locked ? onLockedClick : undefined}
    className={`relative overflow-hidden rounded-[30px] border transition-all duration-500 group
    ${
      locked ? 'cursor-pointer' : ''
    }
    border-slate-200/70 dark:border-slate-700/50
    bg-white dark:bg-[#0B1120]
    shadow-[0_10px_40px_rgba(0,0,0,0.06)]
    dark:shadow-[0_10px_40px_rgba(0,0,0,0.45)]
    hover:-translate-y-1 hover:shadow-[0_15px_60px_rgba(59,130,246,0.15)]
    ${className}`}
  >
    {/* Glow */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
      <div className="absolute -top-24 -right-24 w-52 h-52 bg-blue-500/10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-purple-500/10 blur-3xl rounded-full" />
    </div>

    {/* Grid Effect */}
    <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] bg-[linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)] bg-[size:30px_30px]" />

    {/* EFEITO VITRINE (OVERLAY DE BLOQUEIO ALINHADO) */}
    {locked && (
      <div className="absolute inset-0 z-30 flex flex-col items-center justify-center transition-all duration-300 px-4">
        <div className="flex flex-col items-center text-center transform transition-transform duration-300 group-hover:scale-105 w-full">
          <div className="mb-2">
            <span className="text-4xl drop-shadow-md">🔒</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-slate-800 dark:text-white drop-shadow-md leading-tight whitespace-normal">
            Conteúdo Premium
          </h3>
          <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-300 mt-1 drop-shadow-sm">
            Clique para desbloquear
          </p>
        </div>
      </div>
    )}

    {/* CONTEÚDO REAL DO CARD (Menos borrado e mais visível) */}
    <div
      className={`relative z-10 h-full p-6 flex flex-col transition-all duration-500 ${
        locked ? 'opacity-70 blur-[2px] pointer-events-none select-none' : ''
      }`}
    >
      {children}
    </div>
  </div>
);

const ModuleTitle = ({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="min-w-[62px] min-h-[62px] rounded-2xl flex items-center justify-center text-3xl
    bg-gradient-to-br from-slate-100 to-white
    dark:from-slate-800 dark:to-slate-900
    border border-slate-200 dark:border-slate-700
    shadow-lg">
      {icon}
    </div>

    <div>
      <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
        {title}
      </h2>

      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
        {description}
      </p>
    </div>
  </div>
);

export default function HomeView() {
  const { user, isTrial } = useUser();
  const { navLevel, navXp } = useGamification();

  const {
    startPractice,
    loading: practiceLoading,
    specificTopicInput,
    setSpecificTopicInput
  } = usePractice();

  const { startSimulado, loading: mockLoading } = useMock();

  const { navigate, view } = useNavigation(); 
  const { openPricing, setChatOpen } = useUI();

  // 🔥 SINCRONIZAÇÃO DE PERMISSÕES COM O BACKEND
  const isAdmin = user?.role === 'ADMIN';
  const isSimuladoPlan = user?.subscriptionStatus === 'SIMULADO' || user?.subscriptionStatus === 'MOCK_ONLY';
  const hasFullAccess = isAdmin || (user?.isPremium && !isSimuladoPlan) || isTrial;
  
  // Controle de estado para o Modal das Regras da Torre
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const hasTakenMockThisMonth = () => {
    if (!user?.id) return false;

    const lastMock = localStorage.getItem(
      `studr_last_mock_${user.id}`
    );

    if (!lastMock) return false;

    const lastMockDate = new Date(lastMock);
    const now = new Date();

    return (
      lastMockDate.getMonth() === now.getMonth() &&
      lastMockDate.getFullYear() === now.getFullYear()
    );
  };

  const handleTowerBattleStart = (floor: any) => {
    sessionStorage.setItem('studr_exam_mode', 'TOWER');
    sessionStorage.setItem('studr_current_tower_floor', JSON.stringify(floor));

    if (floor.type === 'ESSAY') {
      navigate(AppView.ESSAY);
    } else {
      const qCount = floor.questionsCount || 5;
      startSimulado('AREA', floor.area || AreaOfKnowledge.MIXED, { towerQuestionsCount: qCount });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] dark:bg-[#020617]">

      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-200px] left-[-150px] w-[500px] h-[500px] bg-blue-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-[-200px] right-[-150px] w-[500px] h-[500px] bg-purple-500/10 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-10">

        {/* HERO */}
        <div className="relative overflow-hidden rounded-[38px] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 md:p-12 mb-8">

          {/* Hero Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 blur-3xl rounded-full" />

          <div className="relative z-10 flex flex-col items-center text-center">

            <Logo className="h-16 md:h-20 mb-8 transition-transform hover:scale-105" />

            <Badge
              color="blue"
              className="mb-5 px-4 py-1.5 rounded-full"
            >
              Plataforma Inteligente TRI
            </Badge>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-tight max-w-5xl">
              O Seu Futuro
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500">
                Aprovado.
              </span>
            </h1>

            <p className="mt-6 max-w-3xl text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed">
              A única plataforma inteligente que calibra seus estudos com a verdadeira Teoria de Resposta ao Item (TRI).
            </p>

            {isSimuladoPlan && (
              <Badge
                color="yellow"
                className="mt-6 px-5 py-2 rounded-full"
              >
                ✨ Assinante Simulado Mensal
              </Badge>
            )}
          </div>
        </div>

        {/* MODULE GRID */}
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* ========================================= */}
          {/* 0 - PAINEL ADMIN (VISÍVEL APENAS PARA VOCÊ) */}
          {/* ========================================= */}
          {isAdmin && (
            <BentoCard className="md:col-span-12 min-h-[120px] border-red-500/30 dark:border-red-500/30 bg-red-50/50 dark:bg-red-950/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 h-full">
                <div className="flex items-center gap-4 w-full">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-2xl shadow-lg shadow-red-500/30 flex-shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-red-600 dark:text-red-400 tracking-tight uppercase">Central Admin Studr</h2>
                    <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">Você está logado como Administrador. Acesse as estatísticas e gerencie a plataforma.</p>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(AppView.ADMIN_PANEL)} 
                  className="w-full md:w-auto h-12 px-8 rounded-2xl font-black bg-gradient-to-r from-red-600 to-orange-600 shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:scale-105 transition-transform whitespace-nowrap"
                >
                  ⚙️ Acessar Painel
                </Button>
              </div>
            </BentoCard>
          )}

      {/* ========================================= */}
      {/* 1 - PRÁTICA INFINITA (CARRO CHEFE) */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-12 min-h-[300px]"
        locked={!hasFullAccess}
        onLockedClick={openPricing}
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 blur-3xl rounded-full" />

        <div className="flex flex-col lg:flex-row gap-8 h-full justify-between">
          
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/30">
                ♾️
              </div>

              <div>
                <span className="text-xs uppercase tracking-[4px] text-blue-500 font-bold">
                  Inteligência Artificial
                </span>

                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-none mt-1">
                  Prática Infinita
                </h1>
              </div>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed">
              Gere listas infinitas com IA adaptativa, dificuldade dinâmica e foco total no seu desempenho TRI.
            </p>

            <div className="mt-7 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Digite um assunto..."
                value={specificTopicInput}
                onChange={(e) => setSpecificTopicInput(e.target.value)}
                className="
                flex-1
                h-14
                px-5
                rounded-2xl
                border
                border-slate-200 dark:border-slate-700
                bg-white/70 dark:bg-slate-900/70
                backdrop-blur-xl
                text-sm
                outline-none
                focus:ring-2
                focus:ring-blue-500
                shadow-inner
              "
              />

              <Button
                onClick={() =>
                  startPractice(
                    AreaOfKnowledge.MIXED,
                    specificTopicInput
                  )
                }
                disabled={!specificTopicInput}
                className="
                h-14
                px-8
                rounded-2xl
                font-black
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                hover:scale-[1.02]
                shadow-[0_10px_30px_rgba(59,130,246,0.35)]
              "
              >
                🚀 Gerar Questões
              </Button>
            </div>
          </div>

          {/* Right */}
          <div className="lg:w-[320px]">
            <div className="grid grid-cols-2 gap-2">
              {SPECIFIC_SUBJECTS.map((subject) => (
                <button
                  key={subject.name}
                  disabled={practiceLoading}
                  onClick={() => startPractice(subject.area, subject.name)}
                  className="
                    p-3
                    rounded-2xl
                    text-xs
                    font-bold
                    border
                    border-slate-200 dark:border-slate-700
                    bg-white/60 dark:bg-slate-800/60
                    backdrop-blur-xl
                    hover:border-blue-400
                    hover:-translate-y-1
                    transition-all
                  "
                >
                  {subject.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BentoCard>

      {/* ========================================= */}
      {/* 2 - SIMULADO */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-8 min-h-[260px]"
        locked={!(hasFullAccess || isSimuladoPlan)}
        onLockedClick={openPricing}
      >
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-2xl shadow-lg">
              ⏱️
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Simulado Oficial
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Experiência real com 180 questões e cálculo TRI avançado.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Badge color="blue">ENEM</Badge>
            <button 
              onClick={() => navigate(AppView.EXAM_HISTORY)}
              className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              📜 Ver Histórico
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
          {SUBJECT_AREAS.map((area) => (
            <button
              key={area.id}
              disabled={
                mockLoading ||
                (isSimuladoPlan && hasTakenMockThisMonth())
              }
              onClick={() =>
                startSimulado('AREA', area.id)
              }
              className="
              h-12
              rounded-xl
              border
              border-slate-200 dark:border-slate-700
              bg-slate-50 dark:bg-slate-800
              text-xs
              font-bold
              hover:border-blue-400
              transition-all
            "
            >
              {area.name}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <Button
            onClick={() => startSimulado('FULL')}
            disabled={
              mockLoading ||
              (isSimuladoPlan && hasTakenMockThisMonth())
            }
            className="
            flex-1
            h-14
            rounded-2xl
            font-black
            bg-gradient-to-r
            from-blue-600
            to-indigo-500
          "
          >
            {mockLoading
              ? 'Calibrando IA...'
              : '🏆 Iniciar Simulado Completo'}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate(AppView.EXAM_HISTORY)}
            className="h-14 px-6 rounded-2xl border-2 font-bold md:w-auto w-full"
          >
            Análises Anteriores
          </Button>
        </div>
      </BentoCard>

      {/* ========================================= */}
      {/* 3 - TUTOR IA */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-4 min-h-[260px]"
        locked={!hasFullAccess}
        onLockedClick={openPricing}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg">
              🤖
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Tutor IA
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Tire dúvidas em segundos.
              </p>
            </div>
          </div>

          <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 p-4 flex items-center justify-center">
            <p className="text-sm text-center text-slate-600 dark:text-slate-300">
              IA treinada para exatas, humanas e redação.
            </p>
          </div>

          <Button
            onClick={() => setChatOpen(true)}
            className="
            mt-4
            h-14
            rounded-2xl
            font-black
            bg-gradient-to-r
            from-violet-600
            to-fuchsia-500
          "
          >
            Abrir Tutor
          </Button>
        </div>
      </BentoCard>

      {/* ========================================= */}
      {/* 4 - REDAÇÃO */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-4 min-h-[240px]"
        locked={!hasFullAccess}
        onLockedClick={openPricing}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-2xl shadow-lg">
            📝
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Redação IA
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Correção automática nota 1000.
            </p>
          </div>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <Button
            onClick={() => navigate(AppView.ESSAY)}
            className="
            h-12
            rounded-2xl
            font-black
            bg-gradient-to-r
            from-pink-500
            to-rose-500
          "
          >
            Nova Redação
          </Button>

          <Button
            onClick={() =>
              navigate(AppView.ESSAY_BANK)
            }
            variant="outline"
            className="h-12 rounded-2xl font-bold"
          >
            Modelos Nota 1000
          </Button>
        </div>
      </BentoCard>

      {/* ========================================= */}
      {/* 5 - JORNADA */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-4 min-h-[240px]"
        locked={!hasFullAccess}
        onLockedClick={openPricing}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
              🗼
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Jornada TRI
              </h2>

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Suba níveis e enfrente desafios.
              </p>
            </div>
          </div>
        </div>
        
        {/* 🔥 NOVO BOTÃO DE REGRAS - CLARO E EXPLÍCITO */}
        <button 
          onClick={(e) => {
              e.stopPropagation(); // Evita ativar o BentoCard bloqueado
              setIsRulesModalOpen(true);
          }}
          className="text-xs font-black text-cyan-600 hover:text-cyan-500 flex items-center gap-2 mb-4 mr-auto border border-cyan-500/30 bg-cyan-50 dark:bg-cyan-950/30 px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5"
        >
          📜 LER REGRAS DA JORNADA
        </button>

        <Button
          onClick={() => navigate(AppView.TOWER)}
          className="
          mt-auto
          h-12
          rounded-2xl
          font-black
          bg-gradient-to-r
          from-cyan-500
          to-blue-600
        "
        >
          ⚔️ Iniciar Jornada
        </Button>
      </BentoCard>

      {/* RENDERIZAÇÃO DO COMPONENTE DO MODAL */}
      <TowerRulesModal 
        isOpen={isRulesModalOpen} 
        onClose={() => setIsRulesModalOpen(false)} 
      />

      {/* ========================================= */}
      {/* 6 - NÍVEL */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-2 min-h-[240px]"
        locked={!hasFullAccess}
        onLockedClick={openPricing}
      >
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-3xl shadow-xl mb-5">
            🎮
          </div>

          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-500">
            {navLevel}
          </span>

          <span className="text-xs tracking-[3px] uppercase text-slate-500 mt-2">
            {navXp} XP
          </span>

          <Button
            onClick={() =>
              navigate(AppView.GAMIFICATION)
            }
            variant="outline"
            className="mt-5 w-full rounded-2xl"
          >
            Ranking
          </Button>
        </div>
      </BentoCard>

      {/* ========================================= */}
      {/* 7 - MAPA MENTAL */}
      {/* ========================================= */}
      <BentoCard
        className="md:col-span-2 min-h-[240px]"
        locked={!hasFullAccess}
        onLockedClick={openPricing}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-3xl shadow-xl mb-5">
            🗺️
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Mapas
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-5">
            Revisão visual inteligente.
          </p>

          <Button
            onClick={() =>
              navigate(AppView.STUDY_GUIDE)
            }
            className="
            w-full
            rounded-2xl
            bg-gradient-to-r
            from-emerald-500
            to-teal-500
          "
          >
            Abrir
          </Button>
        </div>
      </BentoCard>
    </div>
      </div>
    </div>
  );
}