import React, { useState } from 'react';
import { ESSAY_MODEL_THEMES } from '../constants';
import { getGrade1000Example } from '../services/aiClientService';
import { Grade1000Example } from '../types';
import { Button, LoadingSpinner, Badge } from './UIComponents';

interface EssayModelBankProps {
  onBack: () => void;
}

const EssayModelBank: React.FC<EssayModelBankProps> = ({ onBack }) => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [data, setData] = useState<Grade1000Example | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectTheme = async (theme: string) => {
    setSelectedTheme(theme);
    setLoading(true);
    setData(null);
    try {
      const result = await getGrade1000Example(theme);
      setData(result);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar exemplo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="text-sm">← Voltar</Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">📝 Banco de Redações Nota 1000</h1>
          <p className="text-gray-500 dark:text-slate-400">Exemplos perfeitos, gerados e comentados por IA.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* List of Themes */}
        <div className="lg:col-span-1 h-[80vh] overflow-y-auto custom-scrollbar pr-2">
          <h3 className="font-bold text-gray-700 dark:text-slate-300 mb-4 sticky top-0 bg-slate-50 dark:bg-slate-950 py-2 z-10 border-b dark:border-slate-800 transition-colors">Temas Disponíveis</h3>
          <div className="space-y-2">
            {ESSAY_MODEL_THEMES.map((theme, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectTheme(theme)}
                className={`w-full text-left p-3 rounded-lg border text-sm transition-all
                  ${selectedTheme === theme 
                    ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-300 dark:border-pink-800 shadow-sm text-pink-900 dark:text-pink-300' 
                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:border-pink-200 dark:hover:border-pink-900 hover:shadow-sm text-gray-600 dark:text-slate-400'
                  }`}
              >
                <div className="line-clamp-2 font-medium">{theme}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Display */}
        <div className="lg:col-span-2">
          {!selectedTheme ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 bg-white dark:bg-slate-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-800 p-8 text-center min-h-[400px] transition-colors">
              <span className="text-6xl mb-4">✨</span>
              <p className="text-lg">Selecione um tema ao lado para ver uma redação modelo.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden min-h-[600px] transition-colors">
              {loading ? (
                 <div className="h-full flex flex-col items-center justify-center p-12">
                   <LoadingSpinner />
                   <h3 className="mt-4 text-xl font-bold text-pink-600 animate-pulse">Escrevendo Redação...</h3>
                   <p className="text-gray-500 mt-2 text-center max-w-xs">A IA está elaborando um texto perfeito e analisando cada competência.</p>
                 </div>
              ) : data ? (
                <div className="flex flex-col h-full">
                  {/* Essay Header */}
                  <div className="bg-pink-50 dark:bg-pink-900/10 p-6 border-b border-pink-100 dark:border-pink-900/30">
                    <h2 className="text-xl font-bold text-pink-900 dark:text-pink-400 mb-2">{data.theme}</h2>
                    <div className="bg-white/60 dark:bg-pink-950/40 p-3 rounded text-sm text-pink-800 dark:text-pink-300 italic">
                      <strong>Contexto dos Textos Motivadores:</strong> {data.motivatingTextsSummary}
                    </div>
                  </div>

                  {/* Tabs / Toggle (Simplified to scrolling for now) */}
                  <div className="p-0 space-y-0 overflow-y-auto max-h-[75vh] custom-scrollbar">
                    
                    {/* The Essay */}
                    <div className="relative group">
                       <div className="bg-slate-50 dark:bg-slate-800/80 px-8 py-3 border-b dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Exemplo de Redação Nota 1000
                       </div>
                       
                       <div className="relative">
                          {/* Paper Texture Overlay */}
                          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]"></div>
                          
                          <div className="font-serif text-lg md:text-xl text-slate-800 dark:text-slate-200 p-8 md:p-12 leading-[2.2] whitespace-pre-wrap select-none italic relative z-10 border-l-[3.5rem] border-slate-50 dark:border-slate-800/50">
                              {/* Simulated Lines */}
                               <div className="absolute left-[-3.5rem] top-0 bottom-0 w-full pointer-events-none opacity-10">
                                  {Array.from({length: 40}).map((_, i) => (
                                     <div key={i} className="h-[2.2em] border-b border-slate-400 dark:border-slate-600 flex items-center pl-4 text-[9px] font-mono text-slate-600 dark:text-slate-400">{(i+1).toString().padStart(2, '0')}</div>
                                  ))}
                               </div>
                              {data.essayText}
                          </div>
                       </div>
                    </div>

                    {/* Analysis Section com o Dicionário MEC embutido */}
                    <div className="p-8 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-800">
                      <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2">
                        🔍 Por que esta redação tirou 1000?
                      </h3>
                      <div className="grid gap-4">
                        {(data.comments?.length === 5 ? data.comments : Array(5).fill({})).map((comment: any, idx: number) => {
                           const compId = (idx + 1);
                           // Dicionário Oficial do ENEM
                           const competenciasDesc: any = {
                               1: { name: "Domínio da Norma Padrão", desc: "Demonstrar domínio da modalidade escrita formal da Língua Portuguesa." },
                               2: { name: "Compreensão e Repertório", desc: "Compreender a proposta e aplicar conceitos das várias áreas de conhecimento." },
                               3: { name: "Organização e Argumentação", desc: "Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista." },
                               4: { name: "Coesão e Conectivos", desc: "Demonstrar conhecimento dos mecanismos linguísticos necessários para a argumentação." },
                               5: { name: "Proposta de Intervenção", desc: "Elaborar proposta de intervenção para o problema respeitando os direitos humanos." }
                           };
                           
                           const compData = competenciasDesc[compId];
                           const justificativa = comment.justification || comment.feedback || `O texto atende perfeitamente aos requisitos da Competência ${compId}, garantindo a nota máxima.`;

                           return (
                            <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:scale-[1.02] transition-transform">
                               <div className="flex justify-between items-start mb-2">
                                 <div>
                                   <div className="font-black text-enem-blue dark:text-blue-400 text-[10px] uppercase tracking-widest mb-1">
                                     Competência {compId}
                                   </div>
                                   <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{compData.name}</h5>
                                 </div>
                                 <Badge color="green" className="text-[10px] bg-green-100 text-green-700 whitespace-nowrap border-green-200">200 pts</Badge>
                               </div>
                               
                               <p className="text-[11px] text-slate-400 mb-3 italic leading-relaxed">{compData.desc}</p>
                               
                               <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                   {justificativa}
                                 </p>
                               </div>
                             </div>
                           );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-red-500">Erro ao carregar dados.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EssayModelBank;