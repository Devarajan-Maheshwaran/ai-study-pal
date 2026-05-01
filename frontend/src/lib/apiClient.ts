const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

export interface SubjectListResponse { subjects: string[]; }
export interface SummarizeResponse { summary: string; tips: string[]; keywords: string[]; }
export interface MCQ { id: string; question: string; stem?: string; options: string[]; answer: string; difficulty: string; topic: string; subject: string; }
export interface MCQResponse { questions: MCQ[]; count: number; }
export interface QuizQuestion { id: string; question: string; stem?: string; options: string[]; answer: string; difficulty: string; topic: string; subject: string; }
export interface QuizResponse { questions: QuizQuestion[]; count: number; }
export interface KnowledgeInfo { ability: number; trend: string; attempts_in_subject: number; }
export interface ExamPrediction { predicted_score: number; readiness: string; confidence: number; }
export interface ConceptDifficulty { [topic: string]: { accuracy: number; difficulty_score: number; attempts: number; }; }
export interface QuizSubmitResponse {
  correct: number; total: number; accuracy: number;
  feedback: string; suggestions: string[]; weak_topics: string[];
  knowledge: KnowledgeInfo;
  exam_prediction: ExamPrediction;
  concept_difficulty: ConceptDifficulty;
}
export interface SubjectStat { subjectName: string; accuracy: number; quizAttempts: number; correctAnswers: number; totalQuestions: number; }
export interface ProgressResponse {
  averageAccuracy: number; totalQuizAttempts: number;
  subjectStats: SubjectStat[];
  knowledge: { [subject: string]: { ability: number; trend: string; attempts: number; }; };
  exam_predictions: { [subject: string]: { predicted_score: number; readiness: string; }; };
  concept_difficulty: { [subject: string]: { [topic: string]: number; }; };
  sessions_this_week: number;
}
export interface Resource { id: string; title: string; url: string; type: string; subject: string; description: string; }
export interface ResourceResponse { resources: Resource[]; }

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getSubjects: () => request<SubjectListResponse>('/subjects'),
  createSubject: (name: string) => request<{message:string;subject:string}>('/subjects', { method:'POST', body: JSON.stringify({name}) }),
  summarize: (payload: { text: string; subject?: string }) =>
    request<SummarizeResponse>('/summarize', { method:'POST', body: JSON.stringify(payload) }),
  generateMCQs: (payload: { text: string; subject?: string; num_questions?: number }) =>
    request<MCQResponse>('/mcqs', { method:'POST', body: JSON.stringify(payload) }),
  getAdaptiveQuiz: (payload: { text: string; subject?: string; num_questions?: number; difficulty?: string }) =>
    request<QuizResponse>('/quiz/adaptive', { method:'POST', body: JSON.stringify(payload) }),
  submitQuiz: (payload: { subject: string; user_id: string; answers: Array<{question_id:string;question:string;correct_answer:string;user_answer:string;topic:string;}> }) =>
    request<QuizSubmitResponse>('/quiz/submit', { method:'POST', body: JSON.stringify(payload) }),
  getProgress: (user_id: string) =>
    request<ProgressResponse>(`/progress?user_id=${encodeURIComponent(user_id)}`),
  getResources: (payload: { subject: string; topics?: string[]; accuracy?: number }) =>
    request<ResourceResponse>('/resources', { method:'POST', body: JSON.stringify(payload) }),
  getStudySchedule: (payload: { subject: string; hours: number; concept_difficulty?: Record<string,number> }) =>
    fetch(`${API_BASE}/study-schedule`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }),
  getDashboard: (user_id: string) =>
    request<{subjects:string[];total_quiz_attempts:number;average_accuracy:number}>(`/dashboard?user_id=${user_id}`),
};
