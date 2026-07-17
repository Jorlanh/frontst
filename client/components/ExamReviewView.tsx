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
  // 🔥 Adicionado suporte para Redação
  redacaoText?: string;
  redacaoScore?: number;
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
  const [filter, setFilter] = useState<'all' | 'wrong' | 'right'>('all');

  useEffect(() => {
    setLoading(true);
    apiRequest(`/exams/${examId}`)
      .then(setExam)
      .catch(() => setError('Não foi possível carregar o simulado.'))
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) return (
    <div className="max-w-4xl mx-auto p-4">
      <Button onClick={onBack} variant="outline" className="text-sm mb-6">← Voltar</Button>
      <LoadingSpinner />
    </div>
  );

  if (error || !exam) return (
    <div className="max-w-4xl mx-auto p-4">
      <Button onClick={onBack} variant="outline" className="text-sm mb-6">← Voltar</Button>
      <p className="text-red-500">{error || 'Simulado não encontrado.'}</p>
    </div>
  );

  const answered = exam.questions.filter(q => q.userAnswer !== null);
  const correct = answered.filter(q => q.isCorrect).length;
  const accuracy = answered.length > 0 ? ((correct / answered.length) * 100).toFixed(1) : '—';

  const filtered = exam.questions.filter(q => {
    if (filter === 'wrong') return q.userAnswer !== null && !q.isCorrect;
    if (filter === 'right') return q.isCorrect;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" className="text-sm border-slate-200 dark:border-slate-800 dark:text-slate-400">
          ← Histórico
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
            Revisão — {TYPE_LABEL[exam.type] || exam.type}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {exam.finalizedAt ? formatDate(exam.finalizedAt) : ''}
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{exam.score ?? '—'}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Nota TRI</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{exam.band ?? '—'}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Faixa</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{correct}/{answered.length}</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Acertos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{accuracy}%</div>
          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Precisão</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'wrong', 'right'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              filter === f
                ? 'bg-enem-blue text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {f === 'all' ? `Todas (${exam.questions.length})` : f === 'wrong' ? `Erros (${exam.questions.filter(q => q.userAnswer !== null && !q.isCorrect).length})` : `Acertos (${correct})`}
          </button>
        ))}
      </div>

      {/* 🔥 Bloco Renderizador da Redação (Aparece se houver texto salvo e o filtro for "all") */}
      {exam.redacaoText && filter === 'all' && (
        <div className="w-full bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 shadow-sm animate-fade-in">
           <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                 <span className="text-enem-blue">✍️</span> Caderno de Redação
              </h3>
              <div className="flex items-center gap-2">
                 <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest hidden sm:block">Nota Oficial:</span>
                 <Badge color="green" className="text-sm font-black shadow-sm px-4 py-1 border border-green-200 dark:border-green-800">
                   {exam.redacaoScore || 0} pts
                 </Badge>
              </div>
           </div>
           
           {/* Folha pautada simulada para leitura */}
           <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl text-slate-700 dark:text-slate-300 font-serif text-base md:text-lg leading-[2.2] whitespace-pre-wrap italic border-l-4 border-l-enem-blue shadow-inner relative overflow-hidden">
              {/* Efeito de linhas na folha */}
              <div className="absolute left-0 top-0 bottom-0 w-full pointer-events-none opacity-[0.03] dark:opacity-5">
                 {Array.from({length: 40}).map((_, i) => (
                    <div key={i} className="h-[2.2em] border-b border-slate-400"></div>
                 ))}
              </div>
              
              <div className="relative z-10 pl-2">
                 {exam.redacaoText}
              </div>
           </div>
        </div>
      )}

      {/* Question List */}
      <div className="space-y-4">
        {filtered.map((q, i) => {
          const qData = q.questionJson || {};
          const answered = q.userAnswer !== null;
          return (
            <Card
              key={q.id}
              className={`p-5 border-l-4 ${
                !answered ? 'border-l-slate-300 dark:border-l-slate-700' :
                q.isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}
            >
              {/* Question header */}
              <div className="flex justify-between items-start mb-3 gap-4">
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0 mt-0.5">
                  Q{q.orderIndex + 1}
                </span>
                
                {/* 🔥 CORREÇÃO DO VAZAMENTO: Flex-wrap e limitação de largura no assunto (truncate) */}
                <div className="flex flex-wrap justify-end gap-2">
                  <Badge color={q.difficulty === 'EASY' ? 'green' : q.difficulty === 'HARD' ? 'red' : 'yellow'} className="text-[9px]">
                    {DIFFICULTY_LABEL[q.difficulty] || q.difficulty}
                  </Badge>
                  
                  {/* Etiqueta de assunto com truncate e title para hover */}
                  <span 
                    className="truncate max-w-[140px] sm:max-w-[250px] md:max-w-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
                    title={q.subject}
                  >
                    {q.subject}
                  </span>
                  
                  {!answered && <Badge color="yellow" className="text-[9px]">Não respondida</Badge>}
                  {answered && q.isCorrect && <Badge color="green" className="text-[9px]">Correta</Badge>}
                  {answered && !q.isCorrect && <Badge color="red" className="text-[9px]">Errada</Badge>}
                </div>
              </div>

              {/* Stem */}
              {qData.context && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 italic">
                  {qData.context}
                </p>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-4 font-medium leading-relaxed">{qData.stem}</p>

              {/* Options */}
              {Array.isArray(qData.options) && (
                <div className="space-y-1.5">
                  {qData.options.map((opt: string, idx: number) => {
                    const isCorrectOpt = idx === q.correctAnswer;
                    const isUserOpt = idx === q.userAnswer;
                    let cls = 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                    if (isCorrectOpt) cls = 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 font-semibold';
                    if (isUserOpt && !isCorrectOpt) cls = 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700 line-through opacity-80';
                    return (
                      <div key={idx} className={`flex gap-3 text-xs p-3 rounded-xl border transition-colors ${cls}`}>
                        <span className="font-bold shrink-0">{String.fromCharCode(65 + idx)}.</span>
                        <span className="leading-relaxed">{opt}</span>
                        {isCorrectOpt && <span className="ml-auto shrink-0 font-bold text-green-600 dark:text-green-400">✓</span>}
                        {isUserOpt && !isCorrectOpt && <span className="ml-auto shrink-0 font-bold text-red-600 dark:text-red-400">✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {qData.explanation && (
                <details className="mt-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl p-3">
                  <summary className="text-[10px] font-black text-yellow-700 dark:text-yellow-500 cursor-pointer uppercase tracking-widest flex items-center gap-2 outline-none">
                    <span className="text-base">💡</span> Ver explicação detalhada
                  </summary>
                  <p className="text-xs text-yellow-800 dark:text-yellow-300/80 mt-3 leading-relaxed border-t border-yellow-200/50 dark:border-yellow-800/50 pt-3">
                    {qData.explanation}
                  </p>
                </details>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center text-slate-400 font-bold">Nenhuma questão encontrada para este filtro.</Card>
      )}
    </div>
  );
};

export default ExamReviewView;