/**
 * aiClientService
 * ---------------
 * Cliente HTTP para os endpoints /ai/* do backend. O provedor de IA é
 * resolvido no servidor (server/services/aiService.js), hoje OpenAI gpt-4o-mini.
 * Este arquivo NÃO fala com nenhum provedor de IA diretamente.
 */

import { Question, AreaOfKnowledge, SisuPrediction, StudyRecommendation, EssayTheme, EssayCorrection, ChatMessage, Grade1000Example, MindmapData } from "../types";
import { apiRequest } from "./apiService";

export const generateQuestionBatch = async (
  area: AreaOfKnowledge,
  count: number = 1,
  specificTopic?: string,
  excludeTopics: string[] = [],
  isReviewErrors: boolean = false,
  inMock: boolean = false,
  examId?: string
): Promise<Question[]> => {
  const data = await apiRequest('/ai/generate-questions', 'POST', { area, count, specificTopic, excludeTopics, isReviewErrors, inMock, examId });

  // Map and add unique IDs (Backend already generates them but we ensure client stability)
  return data.map((q: any) => ({
    ...q,
    id: q.id || Math.random().toString(36).substr(2, 9),
  }));
};

export const analyzeSisuChances = async (
  score: number,
  desiredCourse: string,
  preferredUniversity?: string
): Promise<SisuPrediction[]> => {
  return apiRequest('/ai/analyze-sisu', 'POST', { score, desiredCourse, preferredUniversity });
};

export const generateStudyPlan = async (
  results: { subject: string, correct: boolean }[]
): Promise<StudyRecommendation[]> => {
  return apiRequest('/ai/study-plan', 'POST', { results });
};

export const generateEssayTheme = async (): Promise<EssayTheme> => {
  return apiRequest('/ai/essay-theme', 'POST');
};

export const evaluateEssay = async (theme: string, essayText: string): Promise<EssayCorrection> => {
  return apiRequest('/ai/evaluate-essay', 'POST', { theme, essayText });
};

export const getGrade1000Example = async (theme: string): Promise<Grade1000Example> => {
  return apiRequest('/ai/grade-1000-example', 'POST', { theme });
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  const data = await apiRequest('/ai/chat', 'POST', { history, newMessage });
  return data.text || "Desculpe, não consegui processar sua resposta no momento.";
};

export const generateStudyMap = async (subject: string, topic?: string): Promise<MindmapData> => {
  return apiRequest('/ai/study-map', 'POST', { subject, topic });
};
