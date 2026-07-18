import React, { useState } from 'react';
import { CheckCircle, Settings } from 'lucide-react';
import { AppView, AreaOfKnowledge } from '../types';
import { useNavigation } from '../contexts/NavigationContext';
import { useUser } from '../contexts/UserContext';
import { useUI } from '../contexts/UIContext';
import { useGamification } from '../contexts/GamificationContext';
import { usePractice } from '../contexts/PracticeContext';
import { useMock } from '../contexts/MockContext';

// Views
import HomeView from '../components/HomeView';
import QuizScreen from '../components/QuizScreen';
import ResultsView from '../components/ResultsView';
import EssayView from '../components/EssayView';
import TowerEssayView from '../components/TowerEssayView';
import EssayModelBank from '../components/EssayModelBank';
import StudyMapView from '../components/StudyMapView';
import GamificationView from '../components/GamificationView';
import ExamHistoryView from '../components/ExamHistoryView';
import ExamReviewView from '../components/ExamReviewView';
import TowerView from '../components/TowerView';
import AdminShell from '../components/AdminShell'; 
import LandingPage from '../components/LandingPageV3';
import AffiliateLandingPage from '../components/AffiliateLandingPage';
import AffiliateApplicationView from '../components/AffiliateApplicationView';
import AffiliateDashboardView from '../components/AffiliateDashboardView';
import AuthView from '../components/AuthView';
import PricingPage from '../components/PricingPage';
import TermsOfUse from '../components/TermsOfUse';
import PrivacyPolicy from '../components/PrivacyPolicy';
import ChatBot from '../components/ChatBot';
import Logo from '../components/Logo';
import { Button, Card, LoadingSpinner, Modal } from '../components/UIComponents';

const APP_URL = 'https://app.studr.com.br';

export function AppRouter() {
  const { view, navigate } = useNavigation();
  const {
    user, isRestoring,
    authInitialMode, setAuthInitialMode,
    intendedView, setIntendedView,
    affiliateData, trialActive,
    handleLoginSuccess, handleLogout, handleSessionExpiredConfirm,
  } = useUser();
  const {
    theme, toggleTheme,
    isChatOpen, setChatOpen,
    isPricingModalOpen, closePricing,
    notification, dismissNotification,
    sessionExpired,
    fetchErrorOpen, fetchErrorRetrying,
    closeFetchError,
  } = useUI();
  const { navLevel, navXpPercent, fireGamificationEvent } = useGamification();
  const practice = usePractice();
  const mock = useMock();

  const {
    startPractice,
    selectedArea,
    activeSessionTopic,
    retryFetchNext: practiceRetry,
    finalizeWithPartial: practiceFinalizePartial,
    loading: practiceLoading,
    loadingContext,
  } = practice;

  const {
    simuladoMode,
    simuladoTargetArea,
    lastExamScore,
    lastExamBand,
    questions: mockQuestions,
    userAnswers: mockAnswers,
    timeRemaining,
    isTimeUp,
    formatTime,
    examDuration,
    startSimulado,
    retryFetchNext: mockRetry,
    finalizeWithPartial: mockFinalizePartial,
    cancelMock,
  } = mock;

  const isRootDomain = !window.location.hostname.startsWith('app.') &&
    window.location.hostname !== 'localhost' &&
    !window.location.hostname.includes('railway.app');

  const [currentReviewExamId, setCurrentReviewExamId] = React.useState<string | null>(null);
  const isMock = view === AppView.MOCK_EXAM;

  // =====================================
  // ESTADOS PARA O MODAL DE CONFIGURAÇÃO / SENHA
  // =====================================
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  // =====================================
  // FUNÇÃO DE TROCA DE SENHA (ROBUSTA)
  // =====================================
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }
    if (newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    setPwdLoading(true);
    setPwdMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('studr_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      
      const response = await fetch(`${baseUrl}/users/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao alterar a senha.');
      }

      if (data.token) {
        localStorage.setItem('studr_token', data.token);
      }

      setPwdMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setIsSettingsOpen(false);
        setPwdMessage({ type: '', text: '' });
      }, 2000);

    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.message });
    } finally {
      setPwdLoading(false);
    }
  };

  // ─── Full-page views (no app shell) ─────────────────────────────────────────

  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <LoadingSpinner />
      </div>
    );
  }

  if (view === AppView.LANDING) {
    return (
      <LandingPage
        onStart={() => {
          if (isRootDomain) { window.location.href = `${APP_URL}?mode=register`; return; }
          setAuthInitialMode('REGISTER');
          navigate(AppView.AUTH);
        }}
        onRegister={() => {
          if (isRootDomain) { window.location.href = `${APP_URL}?mode=register`; return; }
          setAuthInitialMode('REGISTER');
          navigate(AppView.AUTH);
        }}
        onLogin={() => {
          if (isRootDomain) { window.location.href = APP_URL; return; }
          setAuthInitialMode('LOGIN');
          navigate(AppView.AUTH);
        }}
        onPricing={() => navigate(AppView.PRICING)}
        onAffiliate={() => navigate(AppView.AFFILIATE)}
        onTerms={() => navigate(AppView.TERMS)}
        onPrivacy={() => navigate(AppView.PRIVACY)}
      />
    );
  }

  if (view === AppView.AUTH) {
    return (
      <AuthView
        initialMode={authInitialMode}
        isPricingPath={intendedView === AppView.PRICING}
        onLoginSuccess={handleLoginSuccess}
        onBack={() => navigate(AppView.LANDING)}
      />
    );
  }

  if (view === AppView.AFFILIATE_DASHBOARD && user) {
    return <AffiliateDashboardView user={user} onLogout={handleLogout} />;
  }

  if (view === AppView.ADMIN_PANEL && user?.role === 'ADMIN') {
    return <AdminShell onBack={() => navigate(AppView.HOME)} />;
  }

  if (view === AppView.TERMS) {
    return <TermsOfUse onBack={() => navigate(AppView.LANDING)} />;
  }

  if (view === AppView.PRIVACY) {
    return <PrivacyPolicy onBack={() => navigate(AppView.LANDING)} />;
  }

  if (view === AppView.AFFILIATE) {
    return (
      <AffiliateLandingPage
        onBack={() => navigate(AppView.LANDING)}
        onApply={() => navigate(AppView.AFFILIATE_APPLICATION)}
        onLogin={() => navigate(AppView.AUTH)}
      />
    );
  }

  if (view === AppView.AFFILIATE_APPLICATION) {
    return (
      <AffiliateApplicationView
        onBack={() => navigate(AppView.AFFILIATE)}
        onSuccess={() => navigate(AppView.AFFILIATE_SUCCESS)}
      />
    );
  }

  if (view === AppView.AFFILIATE_SUCCESS) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6 animate-fade-in">
          <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-bold text-white">Candidatura Enviada!</h1>
          <p className="text-gray-400 leading-relaxed">
            Sua solicitação foi recebida com sucesso. Nossa equipe analisará seu perfil e entraremos em contato via e-mail em até 48 horas.
          </p>
          <Button onClick={() => navigate(AppView.LANDING)} className="bg-white text-slate-950 hover:bg-gray-200 px-8 py-3 rounded-xl font-bold">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  if (view === AppView.PRICING) {
    return (
      <PricingPage
        onBack={() => navigate(AppView.LANDING)}
        affiliateData={affiliateData}
        onSubscribe={() => {
          if (isRootDomain) { window.location.href = `${APP_URL}?mode=register`; return; }
          setAuthInitialMode('REGISTER');
          navigate(AppView.AUTH);
        }}
      />
    );
  }

  // ─── App shell (authenticated) ───────────────────────────────────────────────

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 pb-10 relative transition-colors duration-300 ${theme}`}>
      {/* Global Header */}
      <header className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-40 px-6 h-16 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
        <div
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(user ? AppView.HOME : AppView.LANDING)}
        >
          <Logo className="h-8" />
        </div>

        <nav className="flex-1 px-8 hidden md:flex items-center gap-6" />

        {/* XP Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-gray-200 dark:border-slate-700">
          <span className="text-xs font-bold text-gray-600 dark:text-slate-400">Nível {navLevel}</span>
          <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-400" style={{ width: `${navXpPercent}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {user && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Configurações da Conta"
            >
              <Settings size={20} />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Alternar tema"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 font-medium text-sm flex items-center gap-2 transition-colors px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <span className="hidden sm:inline">Sair</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
          </button>
        </div>
      </header>

      {/* Admin banner */}
      {user?.role === 'ADMIN' && view === AppView.HOME && (
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 text-white px-6 py-2 flex justify-between items-center shadow-lg border-b border-purple-800/30">
          <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            Modo Administrativo
          </div>
          <Button
            onClick={() => navigate(AppView.ADMIN_PANEL)}
            className="bg-white/10 hover:bg-white/20 text-white text-[10px] py-1 px-4 border border-white/20 rounded-lg font-black uppercase transition-all"
          >
            Acessar Central Admin
          </Button>
        </div>
      )}

      {/* Expired trial overlay */}
      {!user?.isPremium && !trialActive && user?.role === 'STUDENT' && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 text-center animate-fade-in">
          <Card className="max-w-md w-full p-10 border-2 border-enem-blue shadow-[0_0_50px_rgba(0,74,173,0.3)] bg-white dark:bg-slate-900 border-t-8">
            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 transform -rotate-12">
              <span className="text-4xl text-enem-blue">⏱️</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">Seu teste gratuito expirou!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Você aproveitou seus 7 dias de trial. Para continuar tendo acesso à <strong>IA que mais aprova no Brasil</strong>, escolha um plano abaixo.
            </p>
            <div className="space-y-4">
              <Button
                onClick={() => {
                  localStorage.setItem('pricing_upgrade_only', 'true');
                  navigate(AppView.PRICING);
                }}
                className="w-full py-4 text-lg font-black bg-gradient-to-r from-enem-blue to-blue-600 hover:scale-[1.02] shadow-xl"
              >
                VER PLANOS DISPONÍVEIS
              </Button>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors uppercase font-bold tracking-widest"
              >
                Sair da conta
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Gamification notification toast */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-gray-800 text-white px-6 py-4 rounded-lg shadow-2xl animate-fade-in-up border-l-4 border-yellow-400 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <span className="font-semibold">{notification}</span>
          <button onClick={dismissNotification} aria-label="Fechar notificação" className="ml-2 text-white/70 hover:text-white text-lg leading-none px-1">×</button>
        </div>
      )}

      {/* Main content */}
      {view === AppView.HOME && <HomeView />}
      {(view === AppView.PRACTICE || view === AppView.MOCK_EXAM) && <QuizScreen />}
      
      {view === AppView.RESULTS && (
        <ResultsView
          questions={isMock ? mockQuestions : practice.questions}
          userAnswers={isMock ? mockAnswers : practice.userAnswers}
          finalScore={isMock ? (lastExamScore ?? 0) : practice.calculateScore()}
          onBackToHome={() => navigate(AppView.HOME)}
          scoreBand={isMock ? (lastExamBand ?? 'N/A') : 'N/A'}
          onNewMockExam={() => startSimulado(simuladoMode ?? 'FULL', simuladoTargetArea ?? undefined)}
          onPracticeMore={() => startPractice(selectedArea, activeSessionTopic || undefined, false)}
          timeElapsed={isMock ? formatTime(examDuration - timeRemaining) : 'Modo Prática'}
        />
      )}

      {view === AppView.EXAM_HISTORY && (
        <ExamHistoryView
          onBack={() => navigate(AppView.HOME)}
          onReview={(examId) => { setCurrentReviewExamId(examId); navigate(AppView.EXAM_REVIEW); }}
        />
      )}
      {view === AppView.EXAM_REVIEW && (
        <ExamReviewView examId={currentReviewExamId!} onBack={() => navigate(AppView.EXAM_HISTORY)} />
      )}
      
      {/* Renderização Condicional - Separando Jornada da Plataforma */}
      {view === AppView.ESSAY && (
         sessionStorage.getItem('studr_exam_mode') === 'TOWER' ? (
            <TowerEssayView />
         ) : (
            <EssayView
              onBack={() => navigate(AppView.HOME)}
              onSuccess={() => fireGamificationEvent('FINISH_ESSAY')}
            />
         )
      )}

      {view === AppView.ESSAY_BANK && <EssayModelBank onBack={() => navigate(AppView.HOME)} />}
      {view === AppView.STUDY_GUIDE && <StudyMapView onBack={() => navigate(AppView.HOME)} />}
      {view === AppView.GAMIFICATION && (
        <GamificationView 
          onBack={() => navigate(AppView.HOME)} 
          onReviewErrors={(areaId, subTopic) => {
            let mappedArea = AreaOfKnowledge.MIXED;
            
            if (areaId) {
                switch (areaId.toUpperCase()) {
                    case 'LINGUAGENS':
                        mappedArea = AreaOfKnowledge.LINGUAGENS;
                        break;
                    case 'HUMANAS':
                        mappedArea = AreaOfKnowledge.HUMANAS;
                        break;
                    case 'NATUREZA':
                        mappedArea = AreaOfKnowledge.NATUREZA;
                        break;
                    case 'EXATAS':
                        mappedArea = AreaOfKnowledge.EXATAS;
                        break;
                    default:
                        mappedArea = AreaOfKnowledge.MIXED;
                }
            }
            
            if (subTopic) {
                practice.startPractice(mappedArea, subTopic);
            } else {
                practice.startPractice(AreaOfKnowledge.MIXED);
            }
          }} 
        />
      )}
      
      {/* 🗼 TOWER VIEW CONECTADA AO GAME LOOP */}
      {view === AppView.TOWER && (
        <TowerView 
           onBack={() => navigate(AppView.HOME)} 
           onBattleStart={(floor) => {
              // REGRA ABSOLUTA: O 5º Andar é SEMPRE Redação (Chefão)
              const isEssayFloor = floor.floorNumber === 5 || floor.type === 'ESSAY';
              
              // Salva a configuração do andar na sessão
              sessionStorage.setItem('studr_current_tower_floor', JSON.stringify({
                 id: floor.id, targetScore: floor.targetScore, floorNumber: floor.floorNumber, type: isEssayFloor ? 'ESSAY' : floor.type
              }));

              if (isEssayFloor) {
                 sessionStorage.setItem('studr_exam_mode', 'TOWER'); 
                 navigate(AppView.ESSAY);
              } else {
                 sessionStorage.setItem('studr_exam_mode', 'TOWER');
                 startPractice(floor.area, floor.topic, false); 
              }
           }} 
        />
      )}

      {/* Global loading overlay (when generating from home) */}
      {practiceLoading && view === AppView.HOME && (loadingContext === 'GENERATING_PRACTICE' || loadingContext === 'GENERATING_EXAM') && (
        <div className="fixed inset-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <LoadingSpinner />
          <h3 className="mt-4 text-xl font-bold text-enem-blue dark:text-blue-400 animate-pulse">
            {loadingContext === 'GENERATING_EXAM' ? 'Montando simulado...' : 'Preparando...'}
          </h3>
          <p className="text-gray-500 mt-2 text-sm max-w-xs text-center">
            A IA está criando seu conteúdo personalizado.
          </p>
        </div>
      )}

      {/* ChatBot */}
      <ChatBot isOpen={isChatOpen} onToggle={setChatOpen} />

      {/* Pricing modal */}
      <Modal isOpen={isPricingModalOpen} onClose={closePricing} title="✨ Escolha seu Plano">
        <PricingPage
          isModal
          affiliateData={affiliateData}
          onBack={closePricing}
          onSubscribe={() => {
            closePricing();
            navigate(AppView.AUTH);
          }}
        />
      </Modal>

      {/* Fetch error modal */}
      <Modal isOpen={fetchErrorOpen} onClose={closeFetchError} title="⚠️ Conexão instável">
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Não conseguimos carregar a próxima questão agora.
          </p>
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Seu progresso está salvo — você pode tentar novamente em alguns segundos ou finalizar com o que já respondi.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              variant="primary"
              onClick={view === AppView.MOCK_EXAM ? mockRetry : practiceRetry}
              disabled={fetchErrorRetrying}
              className="w-full sm:flex-1"
            >
              {fetchErrorRetrying ? 'Tentando...' : 'Tentar novamente'}
            </Button>
            {view === AppView.MOCK_EXAM && (
              <Button variant="outline" onClick={mockFinalizePartial} disabled={fetchErrorRetrying} className="w-full sm:flex-1">
                Finalizar com o que já respondi
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Session expired modal */}
      <Modal isOpen={sessionExpired} onClose={handleSessionExpiredConfirm} title="Sessão expirada">
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Sua sessão expirou ou foi encerrada em outro dispositivo. Faça login novamente para continuar.
          </p>
          <Button onClick={handleSessionExpiredConfirm} className="w-full">Fazer login</Button>
        </div>
      </Modal>

      {/* Settings / Change Password Modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={() => { setIsSettingsOpen(false); setPwdMessage({ type: '', text: '' }); }} 
        title="Segurança"
      >
        <div className="p-4 md:p-6 space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Altere sua senha de acesso. A sua conta será desconectada de outros dispositivos por segurança.
          </p>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Senha Atual</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={e => setCurrentPassword(e.target.value)} 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Nova Senha</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                placeholder="Mínimo 6 caracteres"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Confirmar Nova Senha</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                required 
              />
            </div>

            {pwdMessage.text && (
              <div className={`p-3 rounded-xl text-sm font-bold mt-2 ${pwdMessage.type === 'error' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                {pwdMessage.text}
              </div>
            )}

            <Button type="submit" disabled={pwdLoading} className="h-12 w-full mt-2 font-black">
              {pwdLoading ? 'Salvando...' : 'Salvar Nova Senha'}
            </Button>
          </form>
        </div>
      </Modal>

    </div>
  );
}