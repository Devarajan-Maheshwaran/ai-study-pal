import { AdaptiveQuizRequestQuery, AdaptiveQuizResponse, CsvText, DashboardStats, NotesToMcqsRequest, NotesToMcqsResponse, ResourcesResponse, RevisionSummaryRequest, RevisionSummaryResponse, StudyScheduleDownloadParams, Subject, SubmitQuizRequest, SubmitQuizResponse } from "../types/api";
const API_BASE = "/api";
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const data = await response.json();
      if (typeof data === "object" && data !== null && "message" in data) { const m = (data as { message?: string }).message; if (typeof m === "string" && m.trim().length > 0) { message = m; } }
    } catch {}
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}
export async function getDashboard(userId: string): Promise<DashboardStats> { const url = `${API_BASE}/dashboard?userId=${encodeURIComponent(userId)}`; const res = await fetch(url); return handleResponse<DashboardStats>(res); }
export async function getSubjects(): Promise<Subject[]> { const res = await fetch(`${API_BASE}/subjects`); return handleResponse<Subject[]>(res); }
export async function notesToMcqs(payload: NotesToMcqsRequest): Promise<NotesToMcqsResponse> { const res = await fetch(`${API_BASE}/notes-to-mcqs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); return handleResponse<NotesToMcqsResponse>(res); }
export async function getAdaptiveQuiz(userId: AdaptiveQuizRequestQuery["userId"], subjectId: AdaptiveQuizRequestQuery["subjectId"]): Promise<AdaptiveQuizResponse> { const url = `${API_BASE}/adaptive-quiz?userId=${encodeURIComponent(userId)}&subject=${encodeURIComponent(subjectId)}`; const res = await fetch(url); return handleResponse<AdaptiveQuizResponse>(res); }
export async function submitQuiz(body: SubmitQuizRequest): Promise<SubmitQuizResponse> { const res = await fetch(`${API_BASE}/adaptive-quiz/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return handleResponse<SubmitQuizResponse>(res); }
export async function getRevisionSummary(body: RevisionSummaryRequest): Promise<RevisionSummaryResponse> { const res = await fetch(`${API_BASE}/revision-summary`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); return handleResponse<RevisionSummaryResponse>(res); }
export async function getResources(subjectId: string, limit: number): Promise<ResourcesResponse> { const url = `${API_BASE}/resources?subject=${encodeURIComponent(subjectId)}&limit=${encodeURIComponent(String(limit))}`; const res = await fetch(url); return handleResponse<ResourcesResponse>(res); }
export async function downloadSchedule(params: StudyScheduleDownloadParams): Promise<CsvText> { const res = await fetch(`${API_BASE}/study-schedule/download?subject=${encodeURIComponent(params.subjectId)}&hours=${encodeURIComponent(String(params.hours))}`); if (!res.ok) { throw new Error(`Failed to download schedule (${res.status})`); } return res.text(); }