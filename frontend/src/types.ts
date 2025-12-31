// Minimal global types for AI Study Pal frontend

export interface Subject {
  id: string;
  name: string;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface UserProgress {
  subjectId: string;
  completedTopics: string[];
  quizScores: Record<string, number>;
}
