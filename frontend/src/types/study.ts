// Core data types for the study app

export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  subjectId: string;
  title: string;
  content: string;
  source: 'text' | 'pdf' | 'url' | 'youtube';
  sourceUrl?: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  subjectId: string;
  noteId?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic?: string;
}

export interface QuizAttempt {
  id: string;
  subjectId: string;
  questions: Question[];
  answers: number[];
  score: number;
  totalQuestions: number;
  accuracy: number;
  completedAt: Date;
}

export interface StudySession {
  time: string;
  activity: string;
  duration: string;
  type: 'study' | 'break' | 'review';
}

export interface StudyPlan {
  id: string;
  subjectId: string;
  subject: string;
  totalHours: number;
  scenario: string;
  sessions: StudySession[];
  tips: string[];
  createdAt: Date;
}

export interface Summary {
  id: string;
  subjectId: string;
  noteId: string;
  originalText: string;
  summary: string;
  keyTerms: string[];
  createdAt: Date;
}

export interface Resource {
  id: string;
  subjectId: string;
  title: string;
  url: string;
  type: 'web' | 'youtube' | 'article';
  description?: string;
}

export interface DashboardStats {
  totalSubjects: number;
  totalNotes: number;
  totalQuizAttempts: number;
  totalCorrectAnswers: number;
  averageAccuracy: number;
  subjectStats: SubjectStats[];
}

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  quizAttempts: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
}

export interface AppState {
  subjects: Subject[];
  notes: Note[];
  questions: Question[];
  quizAttempts: QuizAttempt[];
  studyPlans: StudyPlan[];
  summaries: Summary[];
  resources: Resource[];
  currentSubjectId: string | null;
}
