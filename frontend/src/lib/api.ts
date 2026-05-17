/**
 * Centralised API client.
 * All fetch calls go through here so base URL is configured once.
 * Phase 2: wired to real Flask backend.
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

async function req<T>(method: string, path: string, body?: unknown, isForm = false): Promise<T> {
  const headers: Record<string, string> = {};
  let bodyPayload: BodyInit | undefined;

  if (body) {
    if (isForm) {
      bodyPayload = body as FormData;
    } else {
      headers['Content-Type'] = 'application/json';
      bodyPayload = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE}${path}`, { method, headers, body: bodyPayload });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                      => req<T>('GET',    path),
  post:   <T>(path: string, body: unknown)       => req<T>('POST',   path, body),
  del:    <T>(path: string)                      => req<T>('DELETE', path),
  form:   <T>(path: string, form: FormData)      => req<T>('POST',   path, form, true),
};

// ── Typed helpers ─────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  subject: string;
  exam_date: string | null;
  created_at: string;
}

export interface Topic {
  id: string;
  name: string;
  mastery_score: number;
  difficulty_score: number;
}

export interface Document {
  id: string;
  title: string;
  source_type: string;
  word_count: number;
  uploaded_at: string;
}

export interface WorkspaceDetail extends Workspace {
  topics: Topic[];
  documents: Document[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  difficulty: string;
  topic: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  score: number;
  correct: number;
  total: number;
  time_taken: number | null;
  ml_feedback: Record<string, unknown> | null;
  submitted_at: string;
}

export interface IngestResult {
  document_id: string;
  title: string;
  source_type: string;
  word_count: number;
  chunk_count: number;
  topics: string[];
  summary: string;
  tips: string[];
}

export interface ProgressData {
  average_accuracy: number;
  total_attempts: number;
  score_trend: { attempt: number; score: number; submitted_at: string }[];
  sessions_this_week: number;
}

export interface ExamPrediction {
  predicted_score: number | null;
  readiness: string;
  confidence: number;
}

export interface WeakTopic {
  name: string;
  mastery: number;
  difficulty: number;
}

// Workspace
export const workspacesApi = {
  list:   ()              => api.get<Workspace[]>('/api/workspaces'),
  get:    (id: string)    => api.get<WorkspaceDetail>(`/api/workspaces/${id}`),
  create: (data: { name: string; subject?: string; exam_date?: string }) =>
    api.post<Workspace>('/api/workspaces', data),
  delete: (id: string)    => api.del<{ deleted: string }>(`/api/workspaces/${id}`),
  ingest: (id: string, form: FormData) =>
    api.form<IngestResult>(`/api/workspaces/${id}/ingest`, form),
  topics: (id: string)    => api.get<Topic[]>(`/api/workspaces/${id}/topics`),
};

// Quiz
export const quizApi = {
  generate: (data: { workspace_id: string; topic?: string; text: string; num_questions?: number; difficulty?: string }) =>
    api.post<{ quiz_id: string; questions: QuizQuestion[]; count: number }>('/api/quiz/generate', data),
  submit: (data: { quiz_id: string; workspace_id: string; answers: unknown[]; time_taken?: number; subject?: string }) =>
    api.post<Record<string, unknown>>('/api/quiz/submit', data),
  history: (wsId: string) => api.get<QuizAttempt[]>(`/api/quiz/history/${wsId}`),
};

// Content
export const contentApi = {
  summarize:      (text: string, subject?: string) => api.post<{ summary: string; tips: string[]; keywords: string[] }>('/api/summarize', { text, subject }),
  keywords:       (text: string)                   => api.post<{ keywords: string[] }>('/api/keywords', { text }),
  progress:       (wsId: string)                   => api.get<ProgressData>(`/api/progress/${wsId}`),
  examPrediction: (wsId: string)                   => api.get<ExamPrediction>(`/api/exam-prediction/${wsId}`),
  weakTopics:     (wsId: string)                   => api.get<WeakTopic[]>(`/api/weak-topics/${wsId}`),
  resources:      (subject: string, topics: string[], accuracy: number) =>
    api.post<{ resources: unknown[] }>('/api/resources', { subject, topics, accuracy }),
};
