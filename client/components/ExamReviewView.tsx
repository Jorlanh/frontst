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
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
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
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
                  Q{q.orderIndex + 1}
                </span>
                <div className="flex gap-2 shrink-0">
                  <Badge color={q.difficulty === 'EASY' ? 'green' : q.difficulty === 'HARD' ? 'red' : 'yellow'} className="text-[9px]">
                    {DIFFICULTY_LABEL[q.difficulty] || q.difficulty}
                  </Badge>
                  <Badge color="blue" className="text-[9px]">{q.subject}</Badge>
                  {!answered && <Badge color="yellow" className="text-[9px]">Não respondida</Badge>}
                  {answered && q.isCorrect && <Badge color="green" className="text-[9px]">Correta</Badge>}
                  {answered && !q.isCorrect && <Badge color="red" className="text-[9px]">Errada</Badge>}
                </div>
              </div>

              {/* Stem */}
              {qData.context && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded italic">
                  {qData.context}
                </p>
              )}
              <p className="text-sm text-slate-700 dark:text-slate-200 mb-3 font-medium">{qData.stem}</p>

              {/* Options */}
              {Array.isArray(qData.options) && (
                <div className="space-y-1.5">
                  {qData.options.map((opt: string, idx: number) => {
                    const isCorrectOpt = idx === q.correctAnswer;
                    const isUserOpt = idx === q.userAnswer;
                    let cls = 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
                    if (isCorrectOpt) cls = 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700 font-semibold';
                    if (isUserOpt && !isCorrectOpt) cls = 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700 line-through';
                    return (
                      <div key={idx} className={`flex gap-2 text-xs p-2 rounded border ${cls}`}>
                        <span className="font-bold shrink-0">{String.fromCharCode(65 + idx)}.</span>
                        <span>{opt}</span>
                        {isCorrectOpt && <span className="ml-auto shrink-0">✓</span>}
                        {isUserOpt && !isCorrectOpt && <span className="ml-auto shrink-0">✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Explanation */}
              {qData.explanation && (
                <details className="mt-3">
                  <summary className="text-[10px] font-bold text-enem-blue cursor-pointer uppercase tracking-widest">
                    Ver explicação
                  </summary>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{qData.explanation}</p>
                </details>
              )}
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center text-slate-400">Nenhuma questão encontrada para este filtro.</Card>
      )}
    </div>
  );
};

export default ExamReviewView;
