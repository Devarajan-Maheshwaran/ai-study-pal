const API_BASE = '/api'

export interface MCQ {
  id: string
  question: string
  options: string[]
  answer: string
  difficulty: string
  topic: string
}

export interface DashboardData {
  topics_studied: number
  total_attempts: number
  correct_answers: number
  avg_accuracy: number
  per_subject: Array<{
    subject: string
    attempts: number
    correct: number
    avg_accuracy: number
  }>
}

export interface QuizResult {
  correct: number
  total: number
  accuracy: number
  feedback: string
}

export interface RevisionResponse {
  summary: string
  tips: string[]
}

export interface Resource {
  title: string
  url: string
  type: string
}

export const api = {
  getSubjects: async (): Promise<{ subjects: string[] }> => {
    const res = await fetch(`${API_BASE}/subjects`)
    return res.json()
  },

  getDashboard: async (userId: string): Promise<DashboardData> => {
    const res = await fetch(`${API_BASE}/dashboard?user_id=${userId}`)
    return res.json()
  },

  notesToMcqs: async (data: {
    source_type: string
    subject: string
    notes?: string
    url?: string
    youtube_url?: string
    max_questions: number
  }): Promise<{ questions: MCQ[] }> => {
    const res = await fetch(`${API_BASE}/notes-to-mcqs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  getAdaptiveQuiz: async (userId: string, subject: string): Promise<MCQ[]> => {
    const res = await fetch(`${API_BASE}/adaptive-quiz?user_id=${userId}&subject=${subject}`)
    const data = await res.json()
    return data.questions || []
  },

  submitQuiz: async (data: {
    user_id: string
    subject: string
    answers: Array<{ question_id: string; correct: boolean }>
  }): Promise<QuizResult> => {
    const res = await fetch(`${API_BASE}/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  getRevisionSummary: async (data: {
    text: string
    subject: string
    max_sentences: number
  }): Promise<RevisionResponse> => {
    const res = await fetch(`${API_BASE}/revision-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.json()
  },

  getResources: async (subject: string, limit = 10): Promise<{ resources: Resource[] }> => {
    const res = await fetch(`${API_BASE}/resources?subject=${subject}&limit=${limit}`)
    return res.json()
  },

  downloadSchedule: async (subject: string, hours: number): Promise<string> => {
    const res = await fetch(`${API_BASE}/study-schedule?subject=${subject}&hours=${hours}`)
    return res.text()
  },

  createSubject: async (name: string): Promise<{ subjects: string[] }> => {
    const res = await fetch(`${API_BASE}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })
    return res.json()
  }
}
