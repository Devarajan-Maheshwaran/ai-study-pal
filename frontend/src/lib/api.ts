// Central API layer — all backend calls go through here
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...((options.headers as Record<string,string>) || {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { method: 'POST', body: formData });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Health ────────────────────────────────────────────────────────────
export const checkHealth = () =>
  request<{ status: string; timestamp: string }>('/health'.replace('/api', ''));

// ── Parse content ─────────────────────────────────────────────────────
export interface ParseResult {
  text: string;
  word_count: number;
  keywords: string[];
}

export function parseText(content: string): Promise<ParseResult> {
  const fd = new FormData();
  fd.append('source', 'text');
  fd.append('content', content);
  return requestForm('/parse', fd);
}

export function parsePDF(file: File): Promise<ParseResult> {
  const fd = new FormData();
  fd.append('source', 'pdf');
  fd.append('file', file);
  return requestForm('/parse', fd);
}

export function parseYouTube(url: string): Promise<ParseResult> {
  const fd = new FormData();
  fd.append('source', 'youtube');
  fd.append('url', url);
  return requestForm('/parse', fd);
}

export function parseURL(url: string): Promise<ParseResult> {
  const fd = new FormData();
  fd.append('source', 'url');
  fd.append('url', url);
  return requestForm('/parse', fd);
}

// ── Summarize ─────────────────────────────────────────────────────────
export interface SummaryResult {
  summary: string;
  tips: string[];
  keywords: string[];
}

export function summarize(text: string, subject = 'General'): Promise<SummaryResult> {
  return request('/summarize', {
    method: 'POST',
    body: JSON.stringify({ text, subject }),
  });
}

// ── MCQ ───────────────────────────────────────────────────────────────
export interface MCQQuestion {
  id: string;
  question: string;
  stem: string;
  options: string[];
  answer: string;
  difficulty: string;
  subject: string;
  topic: string;
}

export function generateMCQs(
  text: string,
  subject = 'General',
  num_questions = 5
): Promise<{ questions: MCQQuestion[]; count: number }> {
  return request('/mcqs', {
    method: 'POST',
    body: JSON.stringify({ text, subject, num_questions }),
  });
}

// ── Adaptive Quiz ─────────────────────────────────────────────────────
export function generateAdaptiveQuiz(
  text: string,
  subject = 'General',
  num_questions = 10,
  difficulty = 'easy'
): Promise<{ questions: MCQQuestion[]; count: number }> {
  return request('/quiz/adaptive', {
    method: 'POST',
    body: JSON.stringify({ text, subject, num_questions, difficulty }),
  });
}

// ── Submit Quiz ───────────────────────────────────────────────────────
export interface AnswerPayload {
  question_id: string;
  user_answer: string;
  correct_answer: string;
  topic?: string;
}

export interface QuizResult {
  correct: number;
  total: number;
  accuracy: number;
  feedback: string;
  suggestions: string[];
  weak_topics: string[];
  knowledge: { ability: number; trend: string; attempts_in_subject: number };
  exam_prediction: { predicted_score: number; readiness: string; confidence: number };
  concept_difficulty: Record<string, { accuracy: number; difficulty_score: number; attempts: number }>;
}

export function submitQuiz(
  subject: string,
  answers: AnswerPayload[],
  user_id = 'default'
): Promise<QuizResult> {
  return request('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ subject, answers, user_id }),
  });
}

// ── Progress ──────────────────────────────────────────────────────────
export interface ProgressResult {
  averageAccuracy: number;
  totalQuizAttempts: number;
  subjectStats: Array<{
    subjectName: string;
    accuracy: number;
    quizAttempts: number;
    correctAnswers: number;
    totalQuestions: number;
  }>;
  knowledge: Record<string, { ability: number; trend: string; attempts: number }>;
  exam_predictions: Record<string, { predicted_score: number; readiness: string }>;
  concept_difficulty: Record<string, Record<string, number>>;
  sessions_this_week: number;
}

export function getProgress(user_id = 'default'): Promise<ProgressResult> {
  return request(`/progress?user_id=${user_id}`);
}

// ── Resources ─────────────────────────────────────────────────────────
export interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
  description: string;
}

export function getResources(
  subject: string,
  topics: string[] = [],
  accuracy = 0.5
): Promise<{ resources: Resource[] }> {
  return request('/resources', {
    method: 'POST',
    body: JSON.stringify({ subject, topics, accuracy }),
  });
}

// ── Study Schedule ────────────────────────────────────────────────────
export async function downloadStudySchedule(
  subject: string,
  hours: number,
  concept_difficulty: Record<string, number> = {}
): Promise<void> {
  const url = `${BASE_URL}/study-schedule`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, hours, concept_difficulty }),
  });
  if (!res.ok) throw new Error('Failed to generate schedule');
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${subject}_study_schedule.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ── Copilot ───────────────────────────────────────────────────────────
export interface CopilotPayload {
  message: string;
  subject?: string;
  weak_topics?: string[];
  last_score?: number;
  recent_summary?: string;
}

export function askCopilot(payload: CopilotPayload): Promise<{ response: string; context_used: boolean }> {
  return request('/copilot', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
