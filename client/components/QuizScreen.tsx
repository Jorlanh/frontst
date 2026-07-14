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
      }
  };

  const handlePrevious = isMock ? mock.handlePrevious : practice.handlePrevious;
  
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

  const currentQ = questions[currentQuestionIndex];
  const hasAnswered = userAnswers[currentQ?.id] !== undefined;
  const isLastLoaded = currentQuestionIndex === questions.length - 1;
  const isSimuladoOrTowerFinished = isMock 
      ? (currentQuestionIndex + 1 >= simuladoTargetCount || isTimeUp)
      : (isTowerMode && currentQuestionIndex + 1 >= towerTargetCount);

  const effectiveTargetCount = isMock ? simuladoTargetCount : (isTowerMode ? towerTargetCount : '∞');
  const sessionHeaderTitle = isMock ? 'Simulado ENEM' : (isTowerMode ? `Batalha: Prédio ${towerLevel}` : 'Modo Prática Infinita');

  // 🔥 MAPEAMENTO DE COR E TEXTO REAL DA DIFICULDADE
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
              {/* 🔥 EXIBIÇÃO DA ETANQUETA CORRIGIDA DE ACORDO COM O BANCO */}
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