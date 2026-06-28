
export enum AppView {
  LANDING,
  AFFILIATE,
  PRICING,
  TERMS,
  PRIVACY,
  HOME,
  PRACTICE,
  MOCK_EXAM,
  RESULTS,
  ESSAY,
  ESSAY_BANK,
  STUDY_GUIDE,
  GAMIFICATION,
  AFFILIATE_APPLICATION,
  AFFILIATE_SUCCESS,
  AUTH,
  AFFILIATE_DASHBOARD,
  ADMIN_PANEL,
  UPGRADE,
  EXAM_HISTORY,
  EXAM_REVIEW,
  TOWER,
}

export enum AreaOfKnowledge {
  NATUREZA = 'Ciências da Natureza',
  HUMANAS = 'Ciências Humanas',
  LINGUAGENS = 'Linguagens e Códigos',
  EXATAS = 'Exatas e Suas Tecnologias',
  MIXED = 'Todas as Áreas'
}

export enum Difficulty {
  EASY = 'Fácil',
  MEDIUM = 'Média',
  HARD = 'Difícil'
}

export interface Question {
  id: string;
  stem: string; // The main text/question
  context?: string; // Optional context text (common in ENEM)
  options: string[];
  correctIndex: number;
  subject: string;
  area: AreaOfKnowledge;
  difficulty: Difficulty;
  explanation: string;
}

export interface ExamSession {
  questions: Question[];
  userAnswers: Record<string, number>; // questionId -> selectedOptionIndex
  scoreTRI: number;
  startTime: number;
  completed: boolean;
}

export interface SisuPrediction {
  university: string;
  course: string;
  cutOffScore: number;
  chance: 'Alta' | 'Média' | 'Baixa';
  modality: string; // e.g. Ampla Concorrência
}

export interface StudyRecommendation {
  topic: string;
  area: AreaOfKnowledge;
  priority: 'Alta' | 'Média' | 'Baixa';
  reason: string;
}

export interface DashboardStats {
  totalQuestions: number;
  averageAccuracy: number;
  strongestArea: string;
  weakestArea: string;
}

export interface EssayTheme {
  title: string;
  motivatingTexts: string[];
}

export interface EssayCorrection {
  totalScore: number;
  competencies: {
    id: number;
    name: string;
    score: number; // 0, 40, 80, 120, 160, 200
    feedback: string;
  }[];
  generalFeedback: string;
  strengths: string[];
  weaknesses: string[];
}

export interface Grade1000Example {
  theme: string;
  motivatingTextsSummary: string;
  essayText: string;
  comments: {
    competencyId: number;
    competencyName: string;
    justification: string; // Why it got 200
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}


// --- MindMap Types ---
export interface MindmapNode {
  title: string;
  description: string;
  branches?: MindmapNode[];
}

export interface MindmapData {
  subject: string;
  centralNode: MindmapNode;
  highIncidenceInfo: string;
}
