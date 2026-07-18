import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiService';
import { Button, Card, Badge, LoadingSpinner } from './UIComponents';

interface ExamQuestion {
  id: string;
  orderIndex: number;
  questionJson: any;
  subject: string;
  difficulty: string;
  userAnswer: number | null;
  correctAnswer: number;
  isCorrect: boolean;
  answeredAt: string | null;
}

interface ExamDetail {
  id: string;
  type: string;
  area: string | null;
  score: number | null;
  band: string | null;
  timeSpentSec: number | null;
  finalizedAt: string;
  questions: ExamQuestion[];
}

const DIFFICULTY_LABEL: Record<string, string> = {
  EASY: 'Fácil', MEDIUM: 'Média', HARD: 'Difícil',
};

const TYPE_LABEL: Record<string, string> = {
  MOCK_FULL: 'Simulado Completo', MOCK_AREA: 'Simulado por Área', PRACTICE: 'Prática', LEGACY: 'Simulado',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

interface Props {
  examId: string;
  onBack: () => void;
}

const ExamReviewView: React.FC<Props> = ({ examId, onBack }) => {
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'wrong' | 'right' | 'essay'>('all');

  useEffect(() => {
    setLoading(true);
    apiRequest(`/exams/${examId}`)
      .then(setExam)
      .catch(() => setError('Não foi possível carregar o simulado.'))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center mt-20">
      <LoadingSpinner size="lg" />
      <p className="mt-4 font-bold text-slate-400 animate-pulse tracking-widest uppercase text-sm">Buscando Prova...</p>
    </div>
  );

  if (error || !exam) return (
    <div className="max-w-4xl mx-auto p-4">
      <Button onClick={onBack} variant="outline" className="text-sm mb-6">← Voltar</Button>
      <p className="text-red-500 font-bold">{error || 'Simulado não encontrado.'}</p>
    </div>
  );

  // 🔥 ORDENAÇÃO E SEPARAÇÃO DE DADOS (Blindagem Matemática)
  const sortedQuestions = [...exam.questions].sort((a, b) => a.orderIndex - b.orderIndex);
  const standardQs = sortedQuestions.filter(q => !q.questionJson?.isEssay);
  const hasEssay = sortedQuestions.some(q => q.questionJson?.isEssay);

  const answered = standardQs.filter(q => q.userAnswer !== null);
  const correct = answered.filter(q => q.isCorrect).length;
  const accuracy = standardQs.length > 0 ? ((correct / standardQs.length) * 100).toFixed(1) : '0.0';
  
  // 🔥 CORREÇÃO: Mostra 0 se a nota for exatamente 0. Só mostra --- se for nulo.
  const displayScore = (exam.score !== null && exam.score !== undefined) ? Math.round(exam.score) : '---';
  const displayBand = exam.band || 'Pendente';

  const filtered = sortedQuestions.filter(q => {
    const isEssay = q.questionJson?.isEssay;
    if (filter === 'wrong') return !isEssay && q.userAnswer !== null && !q.isCorrect;
    if (filter === 'right') return !isEssay && q.isCorrect;
    if (filter === 'essay') return isEssay;
    return true; // 'all'
  });

  const LABELS = ['A', 'B', 'C', 'D', 'E'];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" className="text-sm border-slate-200 dark:border-slate-800 dark:text-slate-400">
          ← Histórico
        </Button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Revisão — {TYPE_LABEL[exam.type] || exam.type}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
            {exam.finalizedAt ? formatDate(exam.finalizedAt) : ''}
          </p>
        </div>
      </div>

      {/* Stats Bar (Isolada da Redação) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-6 text-center bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-center items-center">
          <div className="text-3xl md:text-4xl font-black tracking-tighter text-white">{displayScore}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Nota TRI</div>
        </Card>
        <Card className="p-6 text-center bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-center items-center">
          <div className={`text-xl md:text-2xl font-black tracking-tighter uppercase ${displayBand === 'Excelente' || displayBand === 'Elite' ? 'text-green-400' : displayBand === 'Insuficiente' ? 'text-red-400' : 'text-blue-400'}`}>
            {displayBand}
          </div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Faixa</div>
        </Card>
        <Card className="p-6 text-center bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-center items-center">
          <div className="text-3xl md:text-4xl font-black tracking-tighter text-white">{correct}/{standardQs.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Acertos</div>
        </Card>
        <Card className="p-6 text-center bg-[#0B1120] border border-slate-800 shadow-xl flex flex-col justify-center items-center">
          <div className="text-3xl md:text-4xl font-black tracking-tighter text-white">{accuracy}%</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-bold">Precisão</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
          Todas ({standardQs.length + (hasEssay ? 1 : 0)})
        </button>
        <button onClick={() => setFilter('wrong')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${filter === 'wrong' ? 'bg-red-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
          Erros ({standardQs.filter(q => q.userAnswer !== null && !q.isCorrect).length})
        </button>
        <button onClick={() => setFilter('right')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${filter === 'right' ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
          Acertos ({correct})
        </button>
        {hasEssay && (
          <button onClick={() => setFilter('essay')} className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${filter === 'essay' ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
            Redação (1)
          </button>
        )}
      </div>

      {/* Question List */}
      <div className="space-y-6">
        {filtered.length === 0 && (
          <Card className="p-8 text-center text-slate-400 font-bold bg-slate-50 dark:bg-slate-900/50">
            Nenhuma questão encontrada para este filtro.
          </Card>
        )}

        {filtered.map(q => {
          const qData = q.questionJson || {};
          
          // 🔥 RENDERIZAÇÃO DA REDAÇÃO (No meio da prova ou isolada)
          if (qData.isEssay) {
            return (
              <Card key={q.id} className="p-6 md:p-8 bg-pink-50/50 dark:bg-pink-950/10 border-pink-200 dark:border-pink-900/30 shadow-sm animate-fade-in my-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 pb-4 border-b border-pink-200 dark:border-pink-900/30">
                  <div>
                    <Badge color="pink" className="mb-3 px-3 py-1 text-[10px]">📝 REDAÇÃO OFICIAL</Badge>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">{qData.stem || 'Seu Texto'}</h3>
                  </div>
                  <div className="text-left sm:text-right bg-white dark:bg-pink-950/40 p-4 rounded-2xl border border-pink-100 dark:border-pink-900/50">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Nota Estimada TRI</div>
                    <div className="text-3xl font-black text-pink-600 dark:text-pink-400">{qData.score || '---'}</div>
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 p-6 md:p-8 rounded-2xl text-slate-700 dark:text-slate-300 font-serif text-base md:text-lg leading-[2.2] whitespace-pre-wrap italic border-l-4 border-l-pink-500 shadow-inner relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-full pointer-events-none opacity-[0.03] dark:opacity-5">
                    {Array.from({length: 40}).map((_, i) => (
                      <div key={i} className="h-[2.2em] border-b border-slate-400"></div>
                    ))}
                  </div>
                  <div className="relative z-10 pl-2">
                    {qData.userText || "Nenhum texto foi redigido nesta prova."}
                  </div>
                </div>
              </Card>
            );
          }

          // RENDERIZAÇÃO DE QUESTÕES OBJETIVAS
          const answered = q.userAnswer !== null;
          return (
            <Card
              key={q.id}
              className={`p-6 md:p-8 border-l-4 ${
                !answered ? 'border-l-slate-300 dark:border-l-slate-700' :
                q.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <span className="text-lg font-black text-slate-800 dark:text-white uppercase shrink-0 mt-0.5">
                  Questão {q.orderIndex + 1}
                </span>
                
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge color={q.difficulty === 'EASY' ? 'green' : q.difficulty === 'HARD' ? 'red' : 'yellow'} className="text-[10px]">
                    {DIFFICULTY_LABEL[q.difficulty] || q.difficulty}
                  </Badge>
                  <span 
                    className="truncate max-w-[140px] sm:max-w-[250px] md:max-w-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
                    title={q.subject}
                  >
                    {q.subject}
                  </span>
                  {!answered && <Badge color="yellow" className="text-[10px]">Não respondida</Badge>}
                  {answered && q.isCorrect && <Badge color="green" className="text-[10px]">Correta</Badge>}
                  {answered && !q.isCorrect && <Badge color="red" className="text-[10px]">Errada</Badge>}
                </div>
              </div>

              {qData.context && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-sm text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700/50">
                  {qData.context}
                </div>
              )}
              <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 mb-6 font-medium leading-relaxed">{qData.stem}</p>

              {Array.isArray(qData.options) && (
                <div className="space-y-2">
                  {qData.options.map((opt: string, idx: number) => {
                    const isCorrectOpt = idx === q.correctAnswer;
                    const isUserOpt = idx === q.userAnswer;
                    let cls = 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                    if (isCorrectOpt) cls = 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 font-bold ring-1 ring-green-500 shadow-sm';
                    if (isUserOpt && !isCorrectOpt) cls = 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700 line-through opacity-80 font-bold';
                    return (
                      <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${cls}`}>
                        <div className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-black/5 dark:bg-white/10 text-xs font-black mt-0.5">
                          {LABELS[idx]}
                        </div>
                        <span className="leading-relaxed text-sm">{opt}</span>
                        {isCorrectOpt && <span className="ml-auto shrink-0 font-bold text-green-600 dark:text-green-400 text-xl">✓</span>}
                        {isUserOpt && !isCorrectOpt && <span className="ml-auto shrink-0 font-bold text-red-600 dark:text-red-400 text-xl">✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {qData.explanation && (
                <details className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl p-4">
                  <summary className="text-[10px] font-black text-yellow-700 dark:text-yellow-500 cursor-pointer uppercase tracking-widest flex items-center gap-2 outline-none select-none">
                    <span className="text-lg">💡</span> Ver explicação detalhada
                  </summary>
                  <p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-300/90 mt-4 leading-relaxed border-t border-yellow-200/50 dark:border-yellow-800/50 pt-4">
                    {qData.explanation}
                  </p>
                </details>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExamReviewView;