// API configuration and types for AI Study Pal
const API_BASE = "/"; // proxy sends this to http://127.0.0.1:5000

// Type definitions
export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface NotesToMcqsRequest {
  source_type: "text" | "url" | "youtube" | "pdf";
  subject: string;
  notes?: string;
  url?: string;
  youtube_url?: string;
  max_questions: number;
}

export interface NotesToMcqsResponse {
  questions: MCQ[];
}

export interface AdaptiveQuizResponse {
  questions: MCQ[];
}

export interface SubmitQuizRequest {
  user_id: string;
  subject: string;
  answers: Array<{ question_id: string; correct: boolean }>;
}

export interface SubmitQuizResponse {
  correct: number;
  total: number;
  accuracy: number;
  feedback: string;
}

export interface RevisionSummaryRequest {
  text: string;
  subject: string;
  max_sentences: number;
}

export interface RevisionSummaryResponse {
  summary: string;
  tips?: string[];
}

export interface ResourcesResponse {
  resources: Array<{
    subject: string;
    title: string;
    url: string;
    description: string;
  }>;
}

export interface SubjectsResponse {
  subjects: string[];
}



export interface HealthResponse {
  status: string;
}

async function request<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(API_BASE + path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text() as T; // for CSV download
}

// NEW: CSV download helper (returns plain text CSV)
async function downloadSchedule(subject: string, hours: number): Promise<string> {
  const params = new URLSearchParams({
    subject,
    hours: String(hours),
  }).toString();

  const res = await fetch(`${API_BASE}api/study-schedule?${params}`);
  if (!res.ok) throw new Error(`GET study-schedule failed: ${res.status}`);
  return res.text(); // backend returns CSV
}

export const api = {
  health: (): Promise<HealthResponse> => request<HealthResponse>("health"),
  subjects: (): Promise<SubjectsResponse> => request<SubjectsResponse>("api/subjects"),
  dashboard: (userId: string): Promise<DashboardData> =>
    request<DashboardData>(`api/dashboard?user_id=${encodeURIComponent(userId)}`),
  notesToMcqs: (body: NotesToMcqsRequest): Promise<NotesToMcqsResponse> =>
    request<NotesToMcqsResponse>("api/notes-to-mcqs", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adaptiveQuiz: (userId: string, subject: string): Promise<AdaptiveQuizResponse> =>
    request<AdaptiveQuizResponse>(
      `api/adaptive-quiz?user_id=${encodeURIComponent(
        userId
      )}&subject=${encodeURIComponent(subject)}`
    ),
  submitQuiz: (body: SubmitQuizRequest): Promise<SubmitQuizResponse> =>
    request<SubmitQuizResponse>("api/quiz/submit", { method: "POST", body: JSON.stringify(body) }),
  revisionSummary: (body: RevisionSummaryRequest): Promise<RevisionSummaryResponse> =>
    request<RevisionSummaryResponse>("api/revision-summary", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  resources: (subject: string, limit = 5): Promise<ResourcesResponse> =>
    request<ResourcesResponse>(
      `api/resources?subject=${encodeURIComponent(
        subject
      )}&limit=${limit}`
    ),
  studySchedule: async (subject: string, hours: number): Promise<string> => {
    const res = await fetch(
      `/api/study-schedule?subject=${encodeURIComponent(
        subject
      )}&hours=${hours}`
    );
    if (!res.ok) throw new Error("schedule download failed");
    return res.text(); // CSV string
  },
};

export { downloadSchedule }; // named export so SettingsPage.tsx import works

// User ID management
export function getUserId(): string {
  let userId = localStorage.getItem("study_pal_user_id");
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("study_pal_user_id", userId);
  }
  return userId;
}

export function setUserId(userId: string): void {
  localStorage.setItem("study_pal_user_id", userId);
}
