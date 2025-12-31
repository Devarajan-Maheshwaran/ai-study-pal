import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { 
  Subject, Note, Question, QuizAttempt, StudyPlan, Summary, Resource, AppState, DashboardStats, SubjectStats 
} from '@/types/study';

interface AppStateContextType extends AppState {
  // Subject actions
  addSubject: (name: string) => Subject;
  deleteSubject: (id: string) => void;
  setCurrentSubject: (id: string | null) => void;
  getCurrentSubject: () => Subject | null;
  
  // Note actions
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Note;
  deleteNote: (id: string) => void;
  getNotesBySubject: (subjectId: string) => Note[];
  
  // Question actions
  addQuestions: (questions: Omit<Question, 'id'>[]) => Question[];
  getQuestionsBySubject: (subjectId: string) => Question[];
  
  // Quiz actions
  recordQuizAttempt: (attempt: Omit<QuizAttempt, 'id' | 'completedAt'>) => QuizAttempt;
  getQuizAttemptsBySubject: (subjectId: string) => QuizAttempt[];
  
  // Study plan actions
  addStudyPlan: (plan: Omit<StudyPlan, 'id' | 'createdAt'>) => StudyPlan;
  getStudyPlansBySubject: (subjectId: string) => StudyPlan[];
  
  // Summary actions
  addSummary: (summary: Omit<Summary, 'id' | 'createdAt'>) => Summary;
  getSummariesBySubject: (subjectId: string) => Summary[];
  
  // Resource actions
  addResource: (resource: Omit<Resource, 'id'>) => Resource;
  getResourcesBySubject: (subjectId: string) => Resource[];
  
  // Dashboard
  getDashboardStats: () => DashboardStats;
  
  // Reset
  resetAll: () => void;
}

const SUBJECT_COLORS = [
  'hsl(175, 65%, 40%)',   // teal
  'hsl(15, 85%, 55%)',    // coral
  'hsl(260, 60%, 55%)',   // purple
  'hsl(45, 90%, 50%)',    // yellow
  'hsl(200, 70%, 50%)',   // blue
  'hsl(340, 70%, 55%)',   // pink
  'hsl(150, 60%, 45%)',   // green
  'hsl(30, 85%, 55%)',    // orange
];

const generateId = () => Math.random().toString(36).substring(2, 11);

const initialState: AppState = {
  subjects: [],
  notes: [],
  questions: [],
  quizAttempts: [],
  studyPlans: [],
  summaries: [],
  resources: [],
  currentSubjectId: null,
};

const AppStateContext = createContext<AppStateContextType | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);

  // Subject actions
  const addSubject = useCallback((name: string): Subject => {
    const subject: Subject = {
      id: generateId(),
      name,
      color: SUBJECT_COLORS[state.subjects.length % SUBJECT_COLORS.length],
      createdAt: new Date(),
    };
    setState(prev => ({
      ...prev,
      subjects: [...prev.subjects, subject],
      currentSubjectId: subject.id,
    }));
    return subject;
  }, [state.subjects.length]);

  const deleteSubject = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      notes: prev.notes.filter(n => n.subjectId !== id),
      questions: prev.questions.filter(q => q.subjectId !== id),
      quizAttempts: prev.quizAttempts.filter(a => a.subjectId !== id),
      studyPlans: prev.studyPlans.filter(p => p.subjectId !== id),
      summaries: prev.summaries.filter(s => s.subjectId !== id),
      resources: prev.resources.filter(r => r.subjectId !== id),
      currentSubjectId: prev.currentSubjectId === id ? null : prev.currentSubjectId,
    }));
  }, []);

  const setCurrentSubject = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, currentSubjectId: id }));
  }, []);

  const getCurrentSubject = useCallback((): Subject | null => {
    return state.subjects.find(s => s.id === state.currentSubjectId) || null;
  }, [state.subjects, state.currentSubjectId]);

  // Note actions
  const addNote = useCallback((noteData: Omit<Note, 'id' | 'createdAt'>): Note => {
    const note: Note = {
      ...noteData,
      id: generateId(),
      createdAt: new Date(),
    };
    setState(prev => ({ ...prev, notes: [...prev.notes, note] }));
    return note;
  }, []);

  const deleteNote = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id),
      questions: prev.questions.filter(q => q.noteId !== id),
    }));
  }, []);

  const getNotesBySubject = useCallback((subjectId: string): Note[] => {
    return state.notes.filter(n => n.subjectId === subjectId);
  }, [state.notes]);

  // Question actions
  const addQuestions = useCallback((questionsData: Omit<Question, 'id'>[]): Question[] => {
    const newQuestions = questionsData.map(q => ({
      ...q,
      id: generateId(),
    }));
    setState(prev => ({ ...prev, questions: [...prev.questions, ...newQuestions] }));
    return newQuestions;
  }, []);

  const getQuestionsBySubject = useCallback((subjectId: string): Question[] => {
    return state.questions.filter(q => q.subjectId === subjectId);
  }, [state.questions]);

  // Quiz actions
  const recordQuizAttempt = useCallback((attemptData: Omit<QuizAttempt, 'id' | 'completedAt'>): QuizAttempt => {
    const attempt: QuizAttempt = {
      ...attemptData,
      id: generateId(),
      completedAt: new Date(),
    };
    setState(prev => ({ ...prev, quizAttempts: [...prev.quizAttempts, attempt] }));
    return attempt;
  }, []);

  const getQuizAttemptsBySubject = useCallback((subjectId: string): QuizAttempt[] => {
    return state.quizAttempts.filter(a => a.subjectId === subjectId);
  }, [state.quizAttempts]);

  // Study plan actions
  const addStudyPlan = useCallback((planData: Omit<StudyPlan, 'id' | 'createdAt'>): StudyPlan => {
    const plan: StudyPlan = {
      ...planData,
      id: generateId(),
      createdAt: new Date(),
    };
    setState(prev => ({ ...prev, studyPlans: [...prev.studyPlans, plan] }));
    return plan;
  }, []);

  const getStudyPlansBySubject = useCallback((subjectId: string): StudyPlan[] => {
    return state.studyPlans.filter(p => p.subjectId === subjectId);
  }, [state.studyPlans]);

  // Summary actions
  const addSummary = useCallback((summaryData: Omit<Summary, 'id' | 'createdAt'>): Summary => {
    const summary: Summary = {
      ...summaryData,
      id: generateId(),
      createdAt: new Date(),
    };
    setState(prev => ({ ...prev, summaries: [...prev.summaries, summary] }));
    return summary;
  }, []);

  const getSummariesBySubject = useCallback((subjectId: string): Summary[] => {
    return state.summaries.filter(s => s.subjectId === subjectId);
  }, [state.summaries]);

  // Resource actions
  const addResource = useCallback((resourceData: Omit<Resource, 'id'>): Resource => {
    const resource: Resource = {
      ...resourceData,
      id: generateId(),
    };
    setState(prev => ({ ...prev, resources: [...prev.resources, resource] }));
    return resource;
  }, []);

  const getResourcesBySubject = useCallback((subjectId: string): Resource[] => {
    return state.resources.filter(r => r.subjectId === subjectId);
  }, [state.resources]);

  // Dashboard stats
  const getDashboardStats = useCallback((): DashboardStats => {
    const totalCorrectAnswers = state.quizAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalQuestions = state.quizAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    
    const subjectStats: SubjectStats[] = state.subjects.map(subject => {
      const attempts = state.quizAttempts.filter(a => a.subjectId === subject.id);
      const correctAnswers = attempts.reduce((sum, a) => sum + a.score, 0);
      const totalQs = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
      
      return {
        subjectId: subject.id,
        subjectName: subject.name,
        quizAttempts: attempts.length,
        correctAnswers,
        totalQuestions: totalQs,
        accuracy: totalQs > 0 ? Math.round((correctAnswers / totalQs) * 100) : 0,
      };
    });

    return {
      totalSubjects: state.subjects.length,
      totalNotes: state.notes.length,
      totalQuizAttempts: state.quizAttempts.length,
      totalCorrectAnswers,
      averageAccuracy: totalQuestions > 0 ? Math.round((totalCorrectAnswers / totalQuestions) * 100) : 0,
      subjectStats,
    };
  }, [state]);

  // Reset
  const resetAll = useCallback(() => {
    setState(initialState);
  }, []);

  const value: AppStateContextType = {
    ...state,
    addSubject,
    deleteSubject,
    setCurrentSubject,
    getCurrentSubject,
    addNote,
    deleteNote,
    getNotesBySubject,
    addQuestions,
    getQuestionsBySubject,
    recordQuizAttempt,
    getQuizAttemptsBySubject,
    addStudyPlan,
    getStudyPlansBySubject,
    addSummary,
    getSummariesBySubject,
    addResource,
    getResourcesBySubject,
    getDashboardStats,
    resetAll,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
};
