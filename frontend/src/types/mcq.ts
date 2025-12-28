// src/types/mcq.ts

// Shape of each MCQ from backend /api/notes-to-mcqs
export interface MCQ {
  id: number;
  stem: string;          // backend key 'stem'
  options: string[];
  answer: string;
  subject?: string;
  difficulty?: "easy" | "medium";
  topic?: string;
}

// Request body you send to backend
export interface NotesToMcqsRequest {
  source_type: "text" | "pdf" | "url" | "youtube";
  subject: string;
  notes?: string;
  max_questions: number;
  url?: string;
  youtube_url?: string;
}
