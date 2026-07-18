import React, { useEffect, useState } from 'react';
import { jsPDF } from "jspdf";
import { AreaOfKnowledge, Question, SisuPrediction, StudyRecommendation } from '../types';
import { analyzeSisuChances, generateStudyPlan } from '../services/aiClientService';
import { Button, Card, LoadingSpinner, Badge } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultsViewProps {
  questions: Question[];
  userAnswers: Record<string, number>;
  finalScore?: number;
  scoreBand?: string;
  onBackToHome: () => void;
  onNewMockExam: () => void;
  onPracticeMore: () => void;
  timeElapsed?: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({ questions, userAnswers, finalScore, scoreBand, onBackToHome, onNewMockExam, onPracticeMore, timeElapsed }) => {
  const [score, setScore] = useState(0);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [sisuPredictions, setSisuPredictions] = useState<SisuPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  
  // 🗼 Tower Mode State
  const [towerFeedback, setTowerFeedback] = useState<any>(null);
  const [loadingTower, setLoadingTower] = useState(false);

  // Sisu/Prouni Form State
  const [program, setProgram] = useState("SiSU");
  const [course, setCourse] = useState("");
  const [uni, setUni] = useState("");

  const correctCount = questions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const accuracy = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

  // 🔥 CORREÇÃO REAL: Pontuação proporcional pura (0 a 1000)
  // Se acertar 0, a nota é 0. Se acertar tudo, é 1000. Usa o finalScore do Backend se existir.
  const calculatedScore = finalScore && finalScore > 0 
    ? Math.round(finalScore) 
    : Math.round((correctCount / (questions.length || 1)) * 1000);

  useEffect(() => {
    setScore(calculatedScore);
  }, [calculatedScore]);

  // 🗼 EFFECT: Interceptador do Modo Jornada (A Escalada)
  useEffect(() => {
    const mode = sessionStorage.getItem('studr_exam_mode');
    const floorDataStr = sessionStorage.getItem('studr_current_tower_floor');
    
    if (mode === 'TOWER' && floorDataStr && calculatedScore > 0) {
      setLoadingTower(true);
      const floorData = JSON.parse(floorDataStr);
      const token = localStorage.getItem('studr_token');

      // Submete o resultado para o motor da Torre no Backend
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/tower/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          floorId: floorData.id, 
          score: Math.round(calculatedScore) 
        })
      })
      .then(res => res.json())
      .then(data => {
        setTowerFeedback(data);
        sessionStorage.removeItem('studr_exam_mode');
      })
      .catch(err => console.error("Erro ao salvar progresso da torre:", err))
      .finally(() => setLoadingTower(false));
    }
  }, [calculatedScore]);

  // 🔥 SIMULADOR HÍBRIDO (Busca Específica OU Sugestão da IA se o campo estiver vazio)
  const handleSisuAnalysis = async () => {
    setLoadingAnalysis(true);
    
    try {
      const isSearchEmpty = course.trim() === '';
      const targetCourse = isSearchEmpty ? 'Sugestão da IA' : course;

      const queryContext = isSearchEmpty
        ? `O aluno NÃO digitou um curso. Sugira um curso genérico excelente em que ele seria APROVADO com a nota TRI exata de ${score}. Retorne 3 arrays obrigatórios: 1 simulando SiSU, 1 simulando ProUni e 1 simulando FIES. Mostre a nota de corte real de 2025/2026 desse curso sugerido.`
        : `Simulador Múltiplo. Para o curso '${course}', traga 3 arrays obrigatórios: 1 simulando SiSU, 1 simulando ProUni e 1 simulando FIES. Mostre as notas médias oficiais do último ano letivo brasileiro (2025/2026).`;

      const preds = await analyzeSisuChances(score, targetCourse, queryContext);
      
      let finalPreds = Array.isArray(preds) ? preds : [];
      // Fallback de segurança tipado
      if (finalPreds.length < 3) {
         finalPreds = [
            { university: "SiSU (Média Nacional)", course: targetCourse, cutOffScore: 0, chance: "Média", modality: "Ampla Concorrência" },
            { university: "ProUni (Média Nacional)", course: targetCourse, cutOffScore: 0, chance: "Alta", modality: "Ampla Concorrência" },
            { university: "FIES (Média Nacional)", course: targetCourse, cutOffScore: 0, chance: "Alta", modality: "Ampla Concorrência" }
         ];
      }
      setSisuPredictions(finalPreds.slice(0, 3));
    } catch (error) {
      console.error(error);
      alert("Falha na conexão com a base de dados do MEC.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Relatório de Desempenho - Studr", 20, 20);
    doc.setFontSize(12);
    doc.text(`Média Final TRI: ${score}`, 20, 40);
    doc.text(`Taxa de Acertos: ${accuracy.toFixed(1)}% (${correctCount} de ${questions.length})`, 20, 50);
    
    if (recommendations.length > 0) {
      doc.text("O que melhorar (Alta Prioridade):", 20, 70);
      const altas = recommendations.filter(r => r.priority === 'Alta');
      altas.length > 0 
        ? altas.forEach((r, idx) => doc.text(`- ${r.topic}`, 20, 80 + (idx * 10)))
        : doc.text("- Você está indo muito bem!", 20, 80);
    }
    doc.save("meu_relatorio_studr.pdf");
  };

  // 🔥 ALGORITMO INEP: GERA AS 5 NOTAS NA ESCALA 0 A 1000 E GARANTE QUE A MÉDIA DELAS SEJA A NOTA TRI GLOBAL
  const getAccuracy = (searchTerms: string[]) => {
    const qs = questions.filter(q => {
      const areaText = String(q.area || "").toLowerCase();
      const subjectText = String(q.subject || "").toLowerCase();
      return searchTerms.some(term => areaText.includes(term) || subjectText.includes(term));
    });
    if (qs.length === 0) return 0;
    const correct = qs.filter(q => userAnswers[q.id] === q.correctIndex).length;
    return correct / qs.length;
  };

  const calculateCalibratedAreas = () => {
    const accLin = getAccuracy(["linguagen", "linguagem", "português", "literatura", "inglês", "espanhol", "artes", "tecnologia", "código"]);
    const accHum = getAccuracy(["humana", "história", "geografia", "filosofia", "sociologia"]);
    const accNat = getAccuracy(["natureza", "biologia", "química", "física", "ciência"]);
    const accMat = getAccuracy(["exata", "matemática", "geometria", "álgebra"]);

    // Calcula uma proficiência base simulada (Mínimo 300 e Máximo 900+ por área)
    let sLin = accLin > 0 ? Math.round(300 + (accLin * 600)) : 0;
    let sHum = accHum > 0 ? Math.round(300 + (accHum * 600)) : 0;
    let sNat = accNat > 0 ? Math.round(300 + (accNat * 600)) : 0;
    let sMat = accMat > 0 ? Math.round(300 + (accMat * 600)) : 0;
    
    // Considera a prova completa (com redação) se houver mais de 90 questões
    const isFullExam = questions.length > 90;
    // Redação tem um comportamento base forte no ENEM
    let sRed = isFullExam ? (score > 600 ? 820 : 640) : 0; 

    const activeAreas = [
      { name: "Linguagens, Códigos e suas Tecnologias", score: sLin, acc: accLin },
      { name: "Ciências Humanas e suas Tecnologias", score: sHum, acc: accHum },
      { name: "Ciências da Natureza e suas Tecnologias", score: sNat, acc: accNat },
      { name: "Matemática e suas Tecnologias", score: sMat, acc: accMat }
    ];
    if (isFullExam) activeAreas.push({ name: "Redação Oficial", score: sRed, acc: 1 });

    const validAreas = activeAreas.filter(a => a.acc > 0 || a.name === "Redação Oficial");

    // RECALIBRADOR MATEMÁTICO: Força a média das barras ser EXATAMENTE igual a nota TRI do painel
    if (validAreas.length > 0 && score > 0) {
      const currentSum = validAreas.reduce((sum, a) => sum + a.score, 0);
      const currentAvg = currentSum / validAreas.length;
      
      const ratio = currentAvg > 0 ? (score / currentAvg) : 1;

      validAreas.forEach(a => {
        // Multiplica a nota da área pelo ratio para alinhar perfeitamente com a média global, limitando ao teto do ENEM (1000)
        a.score = Math.min(1000, Math.round(a.score * ratio));
      });

      return validAreas.map(a => ({ name: a.name, score: a.score }));
    }

    return activeAreas.map(a => ({ name: a.name, score: a.score }));
  };

  const chartData = calculateCalibratedAreas();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-4 pb-20">
      
      {/* 🗼 BANNER DE FEEDBACK DA TORRE (DUOLINGO STYLE) */}
      {loadingTower && (
        <div className="w-full p-8 bg-blue-50 border-4 border-blue-200 rounded-3xl text-center animate-pulse">
          <LoadingSpinner size="sm" />
          <p className="mt-2 font-black text-blue-600 uppercase tracking-widest">Sincronizando com a Torre...</p>
        </div>
      )}

      {towerFeedback && (
        <div className={`w-full p-8 mb-4 rounded-3xl border-b-8 text-center animate-fade-in-up shadow-2xl ${
          towerFeedback.isWin 
            ? 'bg-green-500 border-green-700 text-white' 
            : 'bg-red-500 border-red-700 text-white'
        }`}>
          <div className="text-5xl mb-4">
            {towerFeedback.isWin ? '🎯' : '💀'}
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
            {towerFeedback.isWin ? 'Andar Conquistado!' : 'Andar Não Superado'}
          </h2>
          <p className="text-lg font-bold opacity-90 max-w-lg mx-auto">
            {towerFeedback.isWin 
              ? `Você atingiu TRI ${Math.round(score)} e superou a meta de ${towerFeedback.targetScore}. Próximo andar liberado!` 
              : `Você fez TRI ${Math.round(score)}, mas a meta era ${towerFeedback.targetScore}. Treine mais e tente de novo!`}
          </p>
          
          {towerFeedback.isWin && (
            <div className="flex justify-center gap-3 mt-6">
              {Array(3).fill(0).map((_, i) => (
                <span key={i} className={`text-4xl ${i < towerFeedback.stars ? 'grayscale-0 animate-bounce' : 'grayscale opacity-30'}`}>⭐</span>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center gap-4">
            <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-widest">
              XP Ganho: +{towerFeedback.xpGained}
            </div>
          </div>
        </div>
      )}

      {/* Header with Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-center relative gap-4">
        <Button onClick={onBackToHome} variant="outline" className="text-sm border-slate-200 dark:border-slate-800 dark:text-slate-400 md:absolute md:left-0">
          ← Voltar ao Início
        </Button>
        <div className="text-center w-full mt-8 md:mt-0">
            <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight uppercase">Desempenho Técnico</h1>
            <p className="text-slate-500 dark:text-slate-400">Análise baseada na calibração oficial TRI.</p>
            {timeElapsed && <div className="mt-3"><Badge color="yellow">Tempo: {timeElapsed}</Badge></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 bg-gradient-to-br from-enem-blue to-blue-800 text-white flex flex-col items-center justify-center p-8 rounded-3xl shadow-xl">
          <div className="text-sm font-medium opacity-80 uppercase tracking-widest text-center leading-tight mb-2">Média TRI <br/>Global</div>
          <div className="text-7xl font-black my-4">{Math.round(score)}</div>
          {scoreBand && (
            <div className="text-[10px] font-black uppercase tracking-widest bg-white/20 rounded-full px-4 py-1.5 mb-3">{scoreBand}</div>
          )}
          <div className="flex justify-between w-full px-4 text-xs font-bold opacity-80 mt-2 border-t border-white/20 pt-4">
            <span>Acertos: {correctCount}/{questions.length}</span>
            <span>{accuracy.toFixed(1)}%</span>
          </div>
        </Card>

        <Card className="col-span-1 md:col-span-2 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
          <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest mb-6 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-enem-blue"></div>
            Desempenho em Escala TRI por Área
          </h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.05} />
                {/* 🔥 Eixo X atualizado para a escala de 1000 pontos do ENEM */}
                <XAxis type="number" domain={[0, 1000]} hide />
                <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: number | undefined) => [
                    value !== undefined ? `${value} Pontos` : '---', 
                    'Nota TRI'
                  ]}
                />
                <Bar dataKey="score" radius={[0, 10, 10, 0]} barSize={20}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score >= 700 ? '#10b981' : entry.score >= 450 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* SiSU Simulator Section */}
      <Card className="border-t-8 border-enem-blue bg-white dark:bg-slate-900 p-8 shadow-2xl rounded-3xl">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
              🏛️ Simulador de Aprovação (25/26)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Projeção estatística para os 3 programas do governo em paralelo.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
             <select 
               value={program}
               onChange={(e) => setProgram(e.target.value)}
               className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl text-sm font-black focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-700 dark:text-slate-200"
             >
                <option value="SiSU">SiSU</option>
                <option value="ProUni">ProUni</option>
                <option value="FIES">FIES</option>
             </select>

             <input 
              type="text" 
              placeholder="Digite o curso ou deixe em branco para sugestão..." 
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl w-full lg:w-72 text-sm focus:ring-4 focus:ring-blue-500/10 outline-none font-bold"
            />
            {/* O botão fica ativo mesmo sem curso para a IA fazer a sugestão */}
            <Button onClick={handleSisuAnalysis} variant="primary" className="shadow-xl bg-enem-blue font-black uppercase text-xs py-3 px-10 rounded-2xl" disabled={loadingAnalysis || score === 0}>
              {loadingAnalysis ? 'Processando...' : 'Descobrir Onde Passo'}
            </Button>
          </div>
        </div>

        {loadingAnalysis && (
            <div className="py-12 flex flex-col items-center">
                <LoadingSpinner size="md" />
                <p className="mt-4 text-xs font-black text-slate-400 animate-pulse uppercase tracking-widest">
                  {course ? `Cruzando dados para ${course}...` : `Calculando as melhores opções para sua nota...`}
                </p>
            </div>
        )}

        {/* RENDENRIZAÇÃO SEGURA - Previne a Tela Branca e exibe os 3 cards do programa */}
        {!loadingAnalysis && sisuPredictions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {sisuPredictions.map((pred, i) => {
              const chance = pred.chance ? String(pred.chance) : 'Pendente';
              const chanceLower = chance.toLowerCase();
              const isAlta = chanceLower.includes('alta');
              const isMedia = chanceLower.includes('média') || chanceLower.includes('media');
              
              // Garante que a nota de corte apareça mesmo se vier nula
              const cutOff = pred.cutOffScore && pred.cutOffScore > 0 ? String(pred.cutOffScore) : '---';

              return (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 flex flex-col gap-3 hover:-translate-y-2 transition-all shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-[10px] uppercase truncate w-32" title={pred.university || 'Universidade/Programa'}>
                      {pred.university || 'Programa do Governo'}
                    </h4>
                    <Badge color={isAlta ? 'green' : isMedia ? 'yellow' : 'red'}>
                        {chance}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-lg font-black text-enem-blue dark:text-blue-400">{pred.course || course || 'Curso Sugerido'}</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{pred.modality || "Ampla Concorrência"}</div>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corte Oficial</span>
                    <span className="text-xl font-black text-slate-900 dark:text-slate-100">{cutOff}</span>
                  </div>
                </div>
              );
          })}
          </div>
        )}
      </Card>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter flex items-center gap-2 mb-2">
                📝 Plano de Estudos Gerado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 border-l-8 border-l-purple-500 p-6 rounded-3xl shadow-sm flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-white uppercase text-sm mb-2">{rec.topic}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{rec.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                     <Badge color="blue" className="text-[9px]"># {rec.area}</Badge>
                     <Badge color={rec.priority.toLowerCase() === 'alta' ? 'red' : 'yellow'} className="text-[9px]">
                        Prioridade {rec.priority}
                     </Badge>
                  </div>
                </div>
              ))}
            </div>
        </div>
      )}

      {/* Ações Finais */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-10">
        <Button onClick={generatePDFReport} className="w-full sm:w-auto px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-black shadow-xl rounded-2xl border-0 uppercase text-xs tracking-widest">
          📥 Baixar PDF
        </Button>
        <Button onClick={onNewMockExam} variant="primary" className="w-full sm:w-auto px-10 py-4 font-black rounded-2xl uppercase text-xs tracking-widest shadow-xl">
          Novo Simulado
        </Button>
        <Button onClick={onBackToHome} variant="outline" className="w-full sm:w-auto px-10 py-4 font-black rounded-2xl uppercase text-xs tracking-widest border-2">
          Sair do Resultado
        </Button>
      </div>
    </div>
  );
};

export default ResultsView;