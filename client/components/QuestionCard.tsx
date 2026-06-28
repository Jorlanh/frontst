import React from 'react';
import { Question, Difficulty } from '../types';
import { Badge, Card } from './UIComponents';

interface QuestionCardProps {
  question: Question;
  selectedOption: number | null;
  onSelect: (index: number) => void;
  showFeedback: boolean;
  disabled?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedOption, onSelect, showFeedback, disabled }) => {

  const getOptionStyle = (index: number) => {
    if (showFeedback) {
      if (index === question.correctIndex) return "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-900 dark:text-green-300";
      if (index === selectedOption && index !== question.correctIndex) return "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-900 dark:text-red-300";
      return "opacity-50 border-gray-200 dark:border-slate-800 text-gray-500 dark:text-slate-500";
    }
    if (selectedOption === index) return "bg-blue-50 dark:bg-blue-900/40 border-enem-blue text-blue-900 dark:text-blue-200 ring-2 ring-blue-400/20";
    if (disabled) return "bg-gray-50 dark:bg-slate-900/50 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed opacity-60";
    return "bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 hover:border-enem-blue dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-gray-800 dark:text-slate-200 shadow-sm";
  };

  const getLetter = (i: number) => String.fromCharCode(65 + i);

  return (
    <div className="max-w-3xl mx-auto mb-8 animate-fade-in group">
      <Card className="mb-4 border-slate-200/60 dark:border-slate-800/60 backdrop-blur-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-2">
            <Badge color="blue">{question.area}</Badge>
            {/* 🔥 Lógica traduzida mantendo a cor original */}
            <Badge color={question.difficulty === Difficulty.HARD ? 'red' : question.difficulty === Difficulty.MEDIUM ? 'yellow' : 'green'}>
              {question.difficulty === Difficulty.HARD ? 'Difícil' : 
               question.difficulty === Difficulty.MEDIUM ? 'Médio' : 
               'Fácil'}
            </Badge>
          </div>
          <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">ID: {question.id}</span>
        </div>

        {question.context && (
          <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/80 rounded-lg border-l-4 border-gray-300 dark:border-slate-700 italic text-gray-700 dark:text-slate-300 leading-relaxed text-sm md:text-base transition-colors">
            {question.context}
          </div>
        )}

        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-6 leading-snug">
          {question.stem}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              disabled={showFeedback || disabled}
              onClick={() => onSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex gap-4 items-center group/btn ${getOptionStyle(idx)}`}
            >
              <span className="font-bold shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 text-xs transition-colors group-hover/btn:bg-enem-blue group-hover/btn:text-white">
                {getLetter(idx)}
              </span>
              <span className="text-sm md:text-base flex-1">{option}</span>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className="mt-8 p-5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/30 text-yellow-900 dark:text-yellow-200 animate-fade-in-up">
            <h4 className="font-bold flex items-center gap-2 mb-2">
              <span className="text-xl">💡</span> Explicação Detalhada
            </h4>
            <p className="text-sm leading-relaxed opacity-90">{question.explanation}</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QuestionCard;