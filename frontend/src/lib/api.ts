// API configuration and types for AI Study Pal
const API_BASE = "http://localhost:5000/api";

// Types
export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
}

export interface GenerateMcqsRequest {
  text: string;
  topic: string | null;
  max_questions: number;
}

export interface GenerateMcqsResponse {
  mcqs: MCQ[];
}

export interface AnswerMcqRequest {
  user_id: string;
  mcq: MCQ;
  chosen_index: number;
}

export interface AnswerMcqResult {
  mcq_id: string;
  topic: string;
  difficulty: string;
  chosen_index: number;
  correct_index: number;
  correct: boolean;
}

export interface AnswerMcqFeedback {
  is_correct: boolean;
  message: string;
}

export interface AnswerMcqResponse {
  result: AnswerMcqResult;
  feedback: AnswerMcqFeedback;
}

export interface TopicStats {
  attempts: number;
  correct: number;
  easy: number;
  medium: number;
  hard: number;
  accuracy: number;
}

export interface NextStep {
  type: "review" | "quiz";
  topic: string;
  difficulty?: "easy" | "medium" | "hard";
  count?: number;
  resource?: string;
  reason?: string;
}

export interface LearningPathResponse {
  user_id: string;
  topic_stats: Record<string, TopicStats>;
  next_steps: NextStep[];
}

export interface SummarizeRequest {
  text: string;
  max_sentences: number;
}

export interface SummarizeResponse {
  summary: string;
}

export interface StudyTipsRequest {
  text: string;
  subject: string | null;
}

export interface StudyTipsResponse {
  subject: string;
  tips: string[];
}

export interface ResourceSuggestionsRequest {
  subject: string;
  top_n: number;
}

export interface Resource {
  subject: string;
  title: string;
  url: string;
  description: string;
}

export interface ResourceSuggestionsResponse {
  subject: string;
  resources: Resource[];
}

export interface PingResponse {
  status: string;
  services: Record<string, string>;
}

// API functions
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function ping(): Promise<PingResponse> {
  const response = await fetch(`${API_BASE}/ping`);
  return handleResponse<PingResponse>(response);
}

export async function generateMcqs(request: GenerateMcqsRequest): Promise<GenerateMcqsResponse> {
  const response = await fetch(`${API_BASE}/generate-mcqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<GenerateMcqsResponse>(response);
}

export async function answerMcq(request: AnswerMcqRequest): Promise<AnswerMcqResponse> {
  const response = await fetch(`${API_BASE}/answer-mcq`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<AnswerMcqResponse>(response);
}

export async function getLearningPath(userId: string): Promise<LearningPathResponse> {
  const response = await fetch(`${API_BASE}/learning-path?user_id=${encodeURIComponent(userId)}`);
  return handleResponse<LearningPathResponse>(response);
}

export async function summarize(request: SummarizeRequest): Promise<SummarizeResponse> {
  const response = await fetch(`${API_BASE}/summarize`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<SummarizeResponse>(response);
}

export async function getStudyTips(request: StudyTipsRequest): Promise<StudyTipsResponse> {
  const response = await fetch(`${API_BASE}/study-tips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<StudyTipsResponse>(response);
}

export async function getResourceSuggestions(request: ResourceSuggestionsRequest): Promise<ResourceSuggestionsResponse> {
  const response = await fetch(`${API_BASE}/resource-suggestions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleResponse<ResourceSuggestionsResponse>(response);
}

export async function downloadSchedule(subject: string, hours: number): Promise<void> {
  const response = await fetch(
    `${API_BASE}/download-schedule?subject=${encodeURIComponent(subject)}&hours=${hours}`
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${subject}_schedule.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

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
