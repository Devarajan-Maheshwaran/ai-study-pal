// API client for Flask backend integration
// Uses VITE_API_BASE_URL from .env

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
const API_BASE = (import.meta as ImportMeta).env.VITE_API_BASE_URL || 'http://127.0.0.1:5000/api';

export interface SubjectListResponse {
  subjects: string[];
}

export interface SummarizeResponse {
  summary: string;
  tips: string[];
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
  topic: string;
}

export interface MCQResponse {
  questions: MCQ[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  topic: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface QuizSubmitResponse {
  accuracy: number;
  feedback: string;
  suggestions: string[];
}

export interface Resource {
  title: string;
  url: string;
  type: string;
}

export interface ResourceResponse {
  resources: Resource[];
}

export interface ProgressResponse {
  averageAccuracy: number;
  totalQuizAttempts: number;
  subjectStats: Array<{
    subjectName: string;
    accuracy: number;
    quizAttempts: number;
    color?: string;
  }>;
}

export const api = {
  async getSubjects(): Promise<SubjectListResponse> {
    const res = await fetch(`${API_BASE}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    return res.json();
  },

  async summarize(payload: { subject: string; notes?: string; youtube_url?: string; pdf?: File }): Promise<SummarizeResponse> {
    let res;
    if (payload.pdf) {
      const form = new FormData();
      form.append('subject', payload.subject);
      form.append('pdf', payload.pdf);
      res = await fetch(`${API_BASE}/summarize`, { method: 'POST', body: form });
    } else {
      res = await fetch(`${API_BASE}/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: payload.subject, notes: payload.notes, youtube_url: payload.youtube_url })
      });
    }
    if (!res.ok) throw new Error('Failed to summarize');
    return res.json();
  },

  async generateMCQs(payload: { subject: string; notes?: string; youtube_url?: string; pdf?: File; num_questions: number }): Promise<MCQResponse> {
    let res;
    if (payload.pdf) {
      const form = new FormData();
      form.append('subject', payload.subject);
      form.append('pdf', payload.pdf);
      form.append('num_questions', String(payload.num_questions));
      res = await fetch(`${API_BASE}/mcqs`, { method: 'POST', body: form });
    } else {
      res = await fetch(`${API_BASE}/mcqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: payload.subject, notes: payload.notes, youtube_url: payload.youtube_url, num_questions: payload.num_questions })
      });
    }
    if (!res.ok) throw new Error('Failed to generate MCQs');
    return res.json();
  },

  async getAdaptiveQuiz(payload: { subject: string; user_id: string }): Promise<QuizResponse> {
    const res = await fetch(`${API_BASE}/quiz/adaptive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to fetch quiz');
    return res.json();
  },

  async submitQuiz(payload: { subject: string; user_id: string; answers: { question_id: string; answer: number }[] }): Promise<QuizSubmitResponse> {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to submit quiz');
    return res.json();
  },

  async getResources(payload: { subject: string; notes?: string; youtube_url?: string; pdf?: File }): Promise<ResourceResponse> {
    let res;
    if (payload.pdf) {
      const form = new FormData();
      form.append('subject', payload.subject);
      form.append('pdf', payload.pdf);
      res = await fetch(`${API_BASE}/resources`, { method: 'POST', body: form });
    } else {
      res = await fetch(`${API_BASE}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: payload.subject, notes: payload.notes, youtube_url: payload.youtube_url })
      });
    }
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  },

  async getProgress(user_id: string): Promise<ProgressResponse> {
    const res = await fetch(`${API_BASE}/progress?user_id=${encodeURIComponent(user_id)}`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  },

  // Settings endpoints can be added here if present
};
