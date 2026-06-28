import React, { useState, useRef } from 'react';
import { STUDY_GUIDE_SUBJECTS, SUBJECT_TOPICS } from '../constants';
import { generateStudyMap } from '../services/aiClientService';
import { Button, Card, LoadingSpinner } from './UIComponents';

interface StudyGuideViewProps {
  onBack: () => void;
}

const StudyMapView: React.FC<StudyGuideViewProps> = ({ onBack }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mobile: track if we're showing the map or the selector
  const [showMapOnMobile, setShowMapOnMobile] = useState(false);

  // Track the current generation request to avoid race conditions
  const requestCounterRef = useRef(0);

  const handleGenerate = async (subject: string, topic?: string) => {
    const currentRequestId = ++requestCounterRef.current;

    setSelectedSubject(subject);
    setSelectedTopic(topic || null);
    setLoading(true);
    setRoadmapData(null);
    setError(null);

    try {
      // Usamos "as any" para ignorar o MindmapData antigo do types.ts e aceitar o Roadmap novo
      const result = (await generateStudyMap(subject, topic)) as any;

      if (currentRequestId !== requestCounterRef.current) {
        console.log("Ignorando resultado de requisição antiga.");
        return;
      }

      if (result && result.roadmap) {
        setRoadmapData(result);
      } else {
        throw new Error("Formato de trilha inválido recebido.");
      }
    } catch (e) {
      if (currentRequestId === requestCounterRef.current) {
        console.error("Erro ao gerar trilha:", e);
        setError("Ocorreu um erro ao gerar a trilha. Tente novamente.");
        setRoadmapData(null);
      }
    } finally {
      if (currentRequestId === requestCounterRef.current) {
        setLoading(false);
      }
    }
  };

  const handleGenerateMobile = async (subject: string, topic?: string) => {
    setShowMapOnMobile(true);
    await handleGenerate(subject, topic);
  };

  const handleDownloadPDF = () => {
    if (!roadmapData || !selectedSubject) return;

    let htmlSteps = '';
    roadmapData.roadmap.forEach((step: any, idx: number) => {
      const subs = step.subtopics ? step.subtopics.map((s: string) => `<li style="margin-bottom: 4px;">&#10003; ${s}</li>`).join('') : '';
      
      let priorityColor = '#3b82f6'; // blue default
      if (step.importance === 'ALTA') priorityColor = '#ef4444'; // red
      else if (step.importance === 'MEDIA') priorityColor = '#f59e0b'; // amber
      else if (step.importance === 'BAIXA') priorityColor = '#10b981'; // green

      htmlSteps += `
        <div style="margin-bottom: 30px; padding: 20px; border-left: 5px solid ${priorityColor}; background: #f8fafc; border-radius: 0 8px 8px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #1e293b; font-size: 18px;">Passo ${step.step || idx + 1}: ${step.title}</h3>
            <span style="font-size: 11px; font-weight: bold; background: #e2e8f0; color: #475569; padding: 4px 8px; border-radius: 4px; text-transform: uppercase;">Prioridade: ${step.importance || 'MÉDIA'}</span>
          </div>
          <p style="margin: 0 0 15px 0; color: #475569; font-size: 14px; line-height: 1.5;">${step.description}</p>
          ${subs ? `
            <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <strong style="font-size: 12px; color: #64748b; text-transform: uppercase;">O que focar:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 0; list-style: none; font-size: 14px; color: #334155;">
                ${subs}
              </ul>
            </div>
          ` : ''}
        </div>
      `;
    });

    const htmlContent = `
      <html>
        <head>
          <title>Roadmap de Estudos ENEM - ${selectedSubject}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            h1 { color: #004aad; margin: 0 0 10px 0; }
            h2 { color: #1e293b; font-weight: 500; font-size: 20px; margin: 0; }
            .overview { background: #fffbeb; padding: 20px; border-radius: 10px; border: 1px solid #fef3c7; margin-bottom: 40px; font-style: italic; color: #92400e; text-align: center; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              .page-break { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Studr - Roadmap de Aprovação</h1>
            <h2>${roadmapData.title || `${selectedSubject} ${selectedTopic ? `- ${selectedTopic}` : ''}`}</h2>
          </div>

          <div class="overview">
            "${roadmapData.overview || 'Siga a ordem dos passos abaixo para dominar este assunto para o ENEM.'}"
          </div>

          ${htmlSteps}

          <div class="footer">Gerado via Inteligência Artificial pelo Studr</div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-4 animate-fade-in flex flex-col" style={{ height: 'calc(100dvh - 1rem)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3 sm:mb-4 flex-shrink-0">
        <Button
          variant="outline"
          onClick={() => {
            if (showMapOnMobile && window.innerWidth < 1024) {
              setShowMapOnMobile(false);
            } else {
              onBack();
            }
          }}
          className="text-sm whitespace-nowrap"
        >
          ← {showMapOnMobile && typeof window !== 'undefined' && window.innerWidth < 1024 ? 'Matérias' : 'Voltar'}
        </Button>
        <div className="overflow-hidden">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-800 dark:text-slate-100 truncate">🛤️ Roadmap de Estudos</h1>
          <p className="text-gray-500 dark:text-slate-400 text-xs sm:text-sm hidden sm:block">Trilha passo a passo gerada por IA para gabaritar.</p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-3 sm:gap-4 flex-1 min-h-0">

        {/* Subject Selection Sidebar — always visible on lg+; hidden on mobile when map is showing */}
        <div className={`lg:col-span-1 overflow-y-auto pr-1 flex-shrink-0 ${showMapOnMobile ? 'hidden lg:block' : 'block'}`}>
          <Card className="h-fit">
            <h3 className="font-bold text-gray-700 dark:text-slate-200 mb-3 uppercase text-xs tracking-wider">
              {selectedSubject ? (
                <button
                  onClick={() => { setSelectedSubject(null); setSelectedTopic(null); setRoadmapData(null); setError(null); setShowMapOnMobile(false); }}
                  className="text-enem-blue hover:underline flex items-center gap-1"
                >
                  ← Voltar às Matérias
                </button>
              ) : 'Matérias Disponíveis'}
            </h3>

            <div className="space-y-1 pr-1 custom-scrollbar">
              {!selectedSubject ? (
                STUDY_GUIDE_SUBJECTS.map(subject => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className="w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs font-semibold border bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:border-gray-200 dark:hover:border-slate-600"
                  >
                    <div className="flex justify-between items-center">
                      <span>{subject}</span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500">▶</span>
                    </div>
                  </button>
                ))
              ) : (
                <>
                  <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <p className="text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300 mb-1">Matéria Selecionada</p>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{selectedSubject}</p>
                  </div>

                  <button
                    onClick={() => handleGenerateMobile(selectedSubject)}
                    disabled={loading}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs font-bold border mb-3
                      ${!selectedTopic && roadmapData
                        ? 'bg-enem-blue text-white border-enem-blue shadow-md'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                      }`}
                  >
                    ✨ Trilha Geral ({selectedSubject})
                  </button>

                  <p className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-2 px-1">Tópicos Específicos</p>

                  {SUBJECT_TOPICS[selectedSubject]?.map(topic => (
                    <button
                      key={topic}
                      onClick={() => handleGenerateMobile(selectedSubject, topic)}
                      disabled={loading}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-xs font-semibold border mb-1
                        ${selectedTopic === topic
                          ? 'bg-enem-blue text-white border-enem-blue shadow-md'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 border-gray-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:border-gray-200 dark:hover:border-slate-600'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{topic}</span>
                        {selectedTopic === topic && loading && <span className="animate-spin text-[10px]">⏳</span>}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </Card>
        </div>

        {/* Content Area — on mobile, only visible when showMapOnMobile OR no subject selected */}
        <div className={`lg:col-span-3 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative
          ${!showMapOnMobile && selectedSubject ? 'hidden lg:flex' : 'flex flex-1'}`}
        >
          {!selectedSubject ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 p-6">
              <span className="text-6xl mb-4">🛤️</span>
              <p className="text-lg text-center dark:text-slate-500">Selecione uma matéria ao lado para gerar sua trilha de estudos.</p>
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <LoadingSpinner />
                  <h3 className="mt-6 text-xl font-bold text-enem-blue animate-pulse">Estruturando sua Trilha...</h3>
                  <p className="text-gray-500 mt-2 text-center max-w-xs px-4">Analisando a Matriz do ENEM para montar o passo a passo perfeito.</p>
                </div>
              ) : error ? (
                <div className="h-full flex flex-col items-center justify-center text-red-400 p-6">
                  <p className="text-center">{error}</p>
                  <Button onClick={() => handleGenerateMobile(selectedSubject, selectedTopic || undefined)} className="mt-4">Tentar Novamente</Button>
                </div>
              ) : roadmapData ? (
                <div className="flex flex-col h-full animate-fade-in">
                  
                  {/* Toolbar */}
                  <div className="flex-shrink-0 flex justify-between items-center bg-white dark:bg-slate-900 p-2 sm:p-4 border-b border-gray-100 dark:border-slate-800 z-10 shadow-sm">
                    <div className="min-w-0 pr-2">
                      <h2 className="text-sm sm:text-base font-black text-gray-800 dark:text-slate-100 truncate">{roadmapData.title || selectedTopic || selectedSubject}</h2>
                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 truncate max-w-sm">{roadmapData.overview}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <Button onClick={handleDownloadPDF} variant="primary" className="text-[10px] sm:text-xs h-8 sm:h-9 px-3 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white border-0">
                        <span>🖨️</span> <span className="hidden sm:inline">Exportar PDF</span>
                      </Button>
                    </div>
                  </div>

                  {/* Vertical Timeline / Roadmap */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
                    <div className="max-w-2xl mx-auto">
                      
                      <div className="relative border-l-[3px] border-blue-200 dark:border-blue-900/50 ml-5 sm:ml-8 space-y-8 sm:space-y-12 pb-8">
                        {roadmapData.roadmap?.map((step: any, idx: number) => (
                          <div key={idx} className="relative pl-8 sm:pl-12 group">
                            
                            {/* Ponto na Linha do Tempo */}
                            <div className="absolute -left-[20px] sm:-left-[24px] top-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-enem-blue to-blue-600 text-white rounded-full flex items-center justify-center font-black text-lg shadow-lg border-4 border-[#f8fafc] dark:border-slate-950 transition-transform group-hover:scale-110">
                              {step.step || idx + 1}
                            </div>
                            
                            {/* Card do Módulo */}
                            <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                              
                              <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-tight">{step.title}</h3>
                                {step.importance && (
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
                                    step.importance === 'ALTA' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50' :
                                    step.importance === 'MEDIA' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50' :
                                    'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50'
                                  }`}>
                                    {step.importance}
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                                {step.description}
                              </p>
                              
                              {step.subtopics && step.subtopics.length > 0 && (
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tópicos Essenciais:</h4>
                                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {step.subtopics.map((sub: string, subIdx: number) => (
                                      <li key={subIdx} className="flex items-start gap-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
                                        <span className="text-enem-blue mt-0.5">✓</span> 
                                        <span className="leading-snug">{sub}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Flag de Chegada */}
                      <div className="mt-4 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                        <span className="text-4xl mb-2 block">🎯</span>
                        <h3 className="font-black text-blue-800 dark:text-blue-400 text-lg">Trilha Concluída</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-500 mt-1">Agora é só seguir o mapa para a aprovação.</p>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6">
                  <span className="text-5xl mb-4">✨</span>
                  <p className="text-base text-center">Escolha um tópico ou clique em "Gerar Geral" para começar.</p>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudyMapView;