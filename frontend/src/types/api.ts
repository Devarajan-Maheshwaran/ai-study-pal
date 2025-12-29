export interface DashboardStats { userId: string; name?: string; totalSubjects: number; totalQuizzesTaken: number; averageScore: number; streakDays?: number; }
export interface Subject { id: string; name: string; }
export interface NotesToMcqsRequest { subjectId: string; notesText: string; numQuestions: number; difficulty: "easy" | "medium" | "hard"; }
export interface McqOption { id: string; text: string; }
export interface McqQuestion { id: string; question: string; options: McqOption[]; correctOptionId?: string; explanation?: string; }
export interface NotesToMcqsResponse { subjectId: string; questions: McqQuestion[]; }
export interface AdaptiveQuizRequestQuery { userId: string; subjectId: string; }
export interface AdaptiveQuizQuestion extends McqQuestion { topic?: string; difficulty: "easy" | "medium" | "hard"; }
export interface AdaptiveQuizResponse { quizId: string; subjectId: string; questions: AdaptiveQuizQuestion[]; }
export interface SubmitQuizAnswer { questionId: string; selectedOptionId: string; }
export interface SubmitQuizRequest { quizId: string; userId: string; answers: SubmitQuizAnswer[]; }
export interface SubmitQuizResultQuestionFeedback { questionId: string; correct: boolean; correctOptionId: string; explanation?: string; }
export interface SubmitQuizResponse { quizId: string; userId: string; score: number; totalQuestions: number; feedback: SubmitQuizResultQuestionFeedback[]; nextRecommendedDifficulty?: "easy" | "medium" | "hard"; }
export interface RevisionSummaryRequest { subjectId: string; text: string; style?: "concise" | "detailed" | "bullet"; }
export interface RevisionSummaryResponse { subjectId: string; summary: string; keyPoints?: string[]; suggestedQuestions?: string[]; }
export interface ResourceItem { id: string; title: string; url: string; type: "video" | "article" | "book" | "paper" | "other"; difficulty?: "beginner" | "intermediate" | "advanced"; estimatedMinutes?: number; }
export interface ResourcesResponse { subjectId: string; resources: ResourceItem[]; }
export interface StudyScheduleDownloadParams { subjectId: string; hours: number; }
export type CsvText = string;