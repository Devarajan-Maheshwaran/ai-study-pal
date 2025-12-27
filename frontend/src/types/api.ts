export interface DashboardData {
  topics_studied: number;
  total_attempts: number;
  correct_answers: number;
  avg_accuracy: number;
  per_subject: Array<{
    subject: string;
    attempts: number;
    correct: number;
    avg_accuracy: number;
  }>;
}
