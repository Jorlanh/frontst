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
    <div className="max-w-4xl mx-auto p-4 space-y-6 animate-fade-in pb-20">
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
      {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

      {!loading && !error && exams.length === 0 && (
        <Card className="p-8 text-center text-slate-500 dark:text-slate-400 border-dashed border-2">
          <div className="text-4xl mb-3">📋</div>
          <p className="font-bold text-lg text-slate-700 dark:text-slate-300">Nenhum simulado finalizado ainda.</p>
          <p className="text-sm mt-1">Faça seu primeiro simulado oficial para ver o histórico aqui.</p>
        </Card>
      )}

      <div className="space-y-4">
        {!loading && exams.map(exam => {
          // 🔥 TRATAMENTO RÍGIDO DE DADOS NULOS/INCOMPLETOS
          const hasScore = exam.score !== null && exam.score !== undefined && exam.score > 0;
          const displayScore = hasScore ? Math.round(exam.score!) : '---';
          const displayBand = exam.band || 'Pendente';
          const bandColor = exam.band ? (BAND_COLOR[exam.band] || 'yellow') : 'yellow';
          const isFullIncomplete = exam.type === 'MOCK_FULL' && exam._count.questions > 0 && exam._count.questions < 180;

          return (
            <Card
              key={exam.id}
              className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer border border-slate-100 dark:border-slate-800 hover:-translate-y-0.5 duration-200"
              onClick={() => onReview(exam.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-slate-800 dark:text-slate-100 text-sm">
                    {TYPE_LABEL[exam.type] || exam.type}
                  </span>
                  {exam.area && exam.area !== 'MIXED' && (
                    <Badge color="blue" className="text-[9px] shadow-sm">{exam.area}</Badge>
                  )}
                  {isFullIncomplete && (
                    <Badge color="red" className="text-[9px] shadow-sm">Incompleto</Badge>
                  )}
                </div>
                
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2 flex-wrap">
                  <span>{formatDate(exam.finalizedAt)}</span>
                  
                  {exam.timeSpentSec != null && exam.timeSpentSec > 0 && (
                    <>
                      <span className="opacity-50">•</span>
                      <span>{formatTime(exam.timeSpentSec)}</span>
                    </>
                  )}
                  
                  {exam._count?.questions > 0 ? (
                    <>
                      <span className="opacity-50">•</span>
                      <span className={isFullIncomplete ? 'text-rose-500 dark:text-rose-400 font-bold' : ''}>
                        {exam._count.questions} questões
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="opacity-50">•</span>
                      <span className="text-red-400 font-bold">Erro de salvamento</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                <div className="text-left sm:text-right flex flex-col items-start sm:items-end justify-center">
                  <div className={`text-2xl md:text-3xl tracking-tighter font-black ${hasScore ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                    {displayScore}
                  </div>
                  <Badge color={bandColor} className="text-[9px] mt-1 shadow-sm uppercase tracking-widest">
                    {displayBand}
                  </Badge>
                </div>
                <span className="text-slate-300 dark:text-slate-600 text-2xl mb-1 group-hover:translate-x-1 transition-transform">›</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ExamHistoryView;