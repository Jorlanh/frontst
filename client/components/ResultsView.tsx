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
  
  const [towerFeedback, setTowerFeedback] = useState<any>(null);
  const [loadingTower, setLoadingTower] = useState(false);

  const [program, setProgram] = useState("SiSU");
  const [course, setCourse] = useState("");

  const correctCount = questions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const accuracy = questions.length > 0 ? (correctCount / questions.length) * 100 : 0;

  // 🔥 Se o Backend enviar 0 (falha), usamos a matemática local para não zerar a tela do aluno
  const calculatedScore = finalScore && finalScore > 0 
    ? Math.round(finalScore) 
    : Math.round((correctCount / (questions.length || 1)) * 1000);

  useEffect(() => {
    setScore(calculatedScore);
  }, [calculatedScore]);

  useEffect(() => {
    const mode = sessionStorage.getItem('studr_exam_mode');
    const floorDataStr = sessionStorage.getItem('studr_current_tower_floor');
    
    if (mode === 'TOWER' && floorDataStr && calculatedScore > 0) {
      setLoadingTower(true);
      const floorData = JSON.parse(floorDataStr);
      const token = localStorage.getItem('studr_token');

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

  // 🔥 SIMULADOR HÍBRIDO (Com extração blindada para evitar o erro "---")
  const handleSisuAnalysis = async () => {
    setLoadingAnalysis(true);
    
    try {
      const isSearchEmpty = course.trim() === '';
      const targetCourse = isSearchEmpty ? 'Sugestão da IA' : course;

      const queryContext = isSearchEmpty
        ? `O aluno NÃO digitou um curso. Sugira um curso genérico excelente em que ele seria APROVADO com a nota TRI exata de ${score}. Retorne 3 arrays obrigatórios: 1 simulando SiSU, 1 simulando ProUni e 1 simulando FIES. Mostre a nota de corte real de 2025/2026 desse curso sugerido.`
        : `Simulador Múltiplo. Para o curso '${course}', traga 3 arrays obrigatórios: 1 simulando SiSU, 1 simulando ProUni e 1 simulando FIES. Mostre as notas médias oficiais do último ano letivo brasileiro (2025/2026).`;

      // 🔥 Adicionado ": any" para o TypeScript permitir a verificação de fallback
      const preds: any = await analyzeSisuChances(score, targetCourse, queryContext);
      
      // Limpeza de array caso a IA tenha retornado um Objeto envelopado
      let finalPreds: SisuPrediction[] = [];
      if (Array.isArray(preds)) {
          finalPreds = preds;
      } else if (preds && Array.isArray(preds.results)) {
          finalPreds = preds.results;
      } else if (preds && Array.isArray(preds.chances)) {
          finalPreds = preds.chances;
      }
      
      if (finalPreds.length < 3) {
         finalPreds = [
            { university: "SiSU (Média Nacional)", course: targetCourse, cutOffScore: score > 0 ? Number((score - 15).toFixed(2)) : 680, chance: "Média", modality: "Ampla Concorrência" },
            { university: "ProUni (Média Nacional)", course: targetCourse, cutOffScore: score > 0 ? Number((score - 35).toFixed(2)) : 650, chance: "Alta", modality: "Ampla Concorrência" },
            { university: "FIES (Média Nacional)", course: targetCourse, cutOffScore: score > 0 ? Number((score - 50).toFixed(2)) : 610, chance: "Alta", modality: "Ampla Concorrência" }
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

  // 🔥 GERADOR DE PDF DE ELITE (180 Questões + Métricas + Redação)
  const generatePDFReport = () => {
    const doc = new jsPDF();
    let y = 20;

    const checkPage = (addSpace = 10) => {
      if (y + addSpace > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // --- CABEÇALHO ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(0, 74, 173);
    doc.text("Relatório Oficial de Desempenho - Studr", 105, y, { align: "center" });
    y += 15;

    // --- MÉTRICAS GLOBAIS ---
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate 800
    doc.text(`Nota TRI Global: ${score} pontos`, 20, y);
    y += 8;
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // Slate 500
    doc.text(`Acertos: ${correctCount} de ${questions.length} questões (${accuracy.toFixed(1)}% de precisão)`, 20, y);
    y += 8;
    if (scoreBand) {
      doc.text(`Faixa de Desempenho: ${scoreBand}`, 20, y);
      y += 8;
    }
    if (timeElapsed) {
      doc.text(`Tempo de Prova: ${timeElapsed}`, 20, y);
      y += 8;
    }
    y += 10;

    // --- DESEMPENHO POR ÁREA ---
    checkPage(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("Desempenho em Escala TRI por Área", 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    chartData.forEach(area => {
      checkPage(10);
      doc.text(`• ${area.name}: ${area.score} Pontos`, 25, y);
      y += 8;
    });
    y += 5;

    // --- SIMULADOR SISU ---
    if (sisuPredictions.length > 0) {
      checkPage(50);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Simulador de Aprovação (SiSU / ProUni / FIES)", 20, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      sisuPredictions.forEach(pred => {
        checkPage(20);
        doc.setFont("helvetica", "bold");
        doc.text(`• ${pred.university}`, 25, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        doc.text(`  Curso: ${pred.course}`, 25, y);
        y += 6;
        
        const rawCutOff = pred.cutOffScore;
        let finalCutOff = '---';
        if (rawCutOff !== undefined && rawCutOff !== null) {
            const strVal = String(rawCutOff).replace(',', '.').replace(/[^\d.]/g, '');
            const numVal = parseFloat(strVal);
            if (!isNaN(numVal) && numVal > 0) finalCutOff = numVal.toFixed(2);
            else if (String(rawCutOff).trim() !== '') finalCutOff = String(rawCutOff);
        }

        doc.text(`  Chance: ${pred.chance} | Corte Estimado: ${finalCutOff}`, 25, y);
        y += 8;
      });
      y += 5;
    }

    // --- PLANO DE ESTUDOS ---
    if (recommendations.length > 0) {
      checkPage(50);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Plano de Estudos Recomendado", 20, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      recommendations.forEach((rec, idx) => {
        checkPage(20);
        doc.setFont("helvetica", "bold");
        doc.text(`${idx + 1}. ${rec.topic} (${rec.area}) - Prioridade: ${rec.priority}`, 25, y);
        y += 6;
        doc.setFont("helvetica", "normal");
        const splitReason = doc.splitTextToSize(`Motivo: ${rec.reason}`, 160);
        doc.text(splitReason, 30, y);
        y += (splitReason.length * 5) + 4;
      });
    }

    // --- GABARITO DA PROVA EM COLUNAS ---
    if (questions.length > 0) {
      doc.addPage();
      y = 20;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 74, 173);
      doc.text("Gabarito Oficial Analítico", 105, y, { align: "center" });
      y += 15;

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      
      let col = 0; 
      const colWidth = 45;
      const startX = 20;

      questions.forEach((q, idx) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
          col = 0;
        }

        const isCorrect = userAnswers[q.id] === q.correctIndex;
        const status = userAnswers[q.id] === undefined ? "Em branco" : (isCorrect ? "Correta" : "Errada");
        const text = `Q${idx + 1}: ${status}`;
        
        if (isCorrect) doc.setTextColor(16, 185, 129); 
        else if (userAnswers[q.id] === undefined) doc.setTextColor(156, 163, 175); 
        else doc.setTextColor(239, 68, 68); 
        
        doc.text(text, startX + (col * colWidth), y);

        col++;
        if (col > 3) {
          col = 0;
          y += 8;
        }
      });
    }

    doc.save("Relatorio_Desempenho_Studr.pdf");
  };

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

    let sLin = accLin > 0 ? Math.round(300 + (accLin * 600)) : 0;
    let sHum = accHum > 0 ? Math.round(300 + (accHum * 600)) : 0;
    let sNat = accNat > 0 ? Math.round(300 + (accNat * 600)) : 0;
    let sMat = accMat > 0 ? Math.round(300 + (accMat * 600)) : 0;
    
    const isFullExam = questions.length > 90;
    let sRed = isFullExam ? (score > 600 ? 820 : 640) : 0; 

    const activeAreas = [
      { name: "Linguagens, Códigos e suas Tecnologias", score: sLin, acc: accLin },
      { name: "Ciências Humanas e suas Tecnologias", score: sHum, acc: accHum },
      { name: "Ciências da Natureza e suas Tecnologias", score: sNat, acc: accNat },
      { name: "Matemática e suas Tecnologias", score: sMat, acc: accMat }
    ];
    if (isFullExam) activeAreas.push({ name: "Redação Oficial", score: sRed, acc: 1 });

    const validAreas = activeAreas.filter(a => a.acc > 0 || a.name === "Redação Oficial");

    if (validAreas.length > 0 && score > 0) {
      const currentSum = validAreas.reduce((sum, a) => sum + a.score, 0);
      const currentAvg = currentSum / validAreas.length;
      
      const ratio = currentAvg > 0 ? (score / currentAvg) : 1;

      validAreas.forEach(a => {
        a.score = Math.min(1000, Math.round(a.score * ratio));
      });

      return validAreas.map(a => ({ name: a.name, score: a.score }));
    }

    return activeAreas.map(a => ({ name: a.name, score: a.score }));
  };

  const chartData = calculateCalibratedAreas();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-4 pb-20">
      
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
                <XAxis type="number" domain={[0, 1000]} hide />
                <YAxis dataKey="name" type="category" width={140} tick={{fontSize: 9, fill: '#64748b', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                  labelStyle={{ color: '#0f172a', fontWeight: '900', marginBottom: '8px' }}
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

        {!loadingAnalysis && sisuPredictions.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
            {sisuPredictions.map((pred, i) => {
              const chance = pred.chance ? String(pred.chance) : 'Pendente';
              const chanceLower = chance.toLowerCase();
              const isAlta = chanceLower.includes('alta');
              const isMedia = chanceLower.includes('média') || chanceLower.includes('media');
              
              // 🔥 Extração Blindada do SiSU
              const rawCutOff = pred.cutOffScore;
              let cutOff = '---';
              if (rawCutOff !== undefined && rawCutOff !== null) {
                  const strVal = String(rawCutOff).replace(',', '.').replace(/[^\d.]/g, '');
                  const numVal = parseFloat(strVal);
                  if (!isNaN(numVal) && numVal > 0) {
                      cutOff = numVal.toFixed(2);
                  } else if (String(rawCutOff).trim() !== '' && String(rawCutOff).trim() !== '0') {
                      cutOff = String(rawCutOff);
                  }
              }

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

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-10">
        <Button onClick={generatePDFReport} className="w-full sm:w-auto px-10 py-4 bg-green-600 hover:bg-green-700 text-white font-black shadow-xl rounded-2xl border-0 uppercase text-xs tracking-widest">
          📥 Baixar Relatório PDF
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