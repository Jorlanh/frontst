import React, { useEffect, useState } from 'react';
import { apiRequest } from '../services/apiService';
import { Button, Card, Badge, LoadingSpinner } from './UIComponents';

interface ExamSummary {
  id: string;
  type: string;
  area: string | null;
  score: number | null;
  band: string | null;
  timeSpentSec: number | null;
  finalizedAt: string;
  _count: { questions: number };
}

const TYPE_LABEL: Record<string, string> = {
  MOCK_FULL: 'Simulado Completo',
  MOCK_AREA: 'Simulado por Área',
  PRACTICE: 'Prática Livre',
  LEGACY: 'Simulado',
};

const BAND_COLOR: Record<string, 'green' | 'blue' | 'yellow' | 'red'> = {
  Elite: 'green',
  Excelente: 'green',
  Forte: 'blue',
  Competitivo: 'blue',
  'Em desenvolvimento': 'yellow',
  Insuficiente: 'red',
};

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

interface Props {
  onBack: () => void;
  onReview: (examId: string) => void;
}

const ExamHistoryView: React.FC<Props> = ({ onBack, onReview }) => {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest('/exams')
      .then(setExams)
      .catch(() => setError('Não foi possível carregar o histórico.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" className="text-sm border-slate-200 dark:border-slate-800 dark:text-slate-400">
          ← Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Histórico de Simulados</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Todas as suas provas finalizadas.</p>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && !error && exams.length === 0 && (
        <Card className="p-8 text-center text-slate-500 dark:text-slate-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-semibold">Nenhum simulado finalizado ainda.</p>
          <p className="text-sm mt-1">Faça seu primeiro simulado para ver o histórico aqui.</p>
        </Card>
      )}

      {!loading && exams.map(exam => (
        <Card
          key={exam.id}
          className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onReview(exam.id)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                {TYPE_LABEL[exam.type] || exam.type}
              </span>
              {exam.area && exam.area !== 'MIXED' && (
                <Badge color="blue" className="text-[9px]">{exam.area}</Badge>
              )}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              {formatDate(exam.finalizedAt)}
              {exam.timeSpentSec ? ` · ${formatTime(exam.timeSpentSec)}` : ''}
              {exam._count.questions > 0 ? ` · ${exam._count.questions}q` : ''}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {exam.score != null && (
              <div className="text-right">
                <div className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{exam.score}</div>
                {exam.band && (
                  <Badge color={BAND_COLOR[exam.band] || 'yellow'} className="text-[9px]">{exam.band}</Badge>
                )}
              </div>
            )}
            <span className="text-slate-300 dark:text-slate-600 text-lg">›</span>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExamHistoryView;
