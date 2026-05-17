import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, quizApi, contentApi, flashcardsApi, copilotApi, plannerApi } from '@/lib/api';

export function useWorkspaces()         { return useQuery({ queryKey: ['workspaces'],        queryFn: workspacesApi.list,         staleTime: 30_000 }); }
export function useWorkspaceDetail(id: string) { return useQuery({ queryKey: ['workspace', id],    queryFn: () => workspacesApi.get(id), enabled: !!id, staleTime: 15_000 }); }
export function useProgress(id: string)        { return useQuery({ queryKey: ['progress', id],     queryFn: () => contentApi.progress(id),       enabled: !!id, staleTime: 20_000 }); }
export function useExamPrediction(id: string)  { return useQuery({ queryKey: ['exam-pred', id],    queryFn: () => contentApi.examPrediction(id), enabled: !!id, staleTime: 30_000 }); }
export function useWeakTopics(id: string)      { return useQuery({ queryKey: ['weak', id],         queryFn: () => contentApi.weakTopics(id),     enabled: !!id, staleTime: 20_000 }); }
export function useQuizHistory(id: string)     { return useQuery({ queryKey: ['qhist', id],        queryFn: () => quizApi.history(id),           enabled: !!id, staleTime: 10_000 }); }
export function useTopics(id: string)          { return useQuery({ queryKey: ['topics', id],       queryFn: () => workspacesApi.topics(id),      enabled: !!id, staleTime: 30_000 }); }
export function useFlashcards(id: string)      { return useQuery({ queryKey: ['flashcards', id],   queryFn: () => flashcardsApi.list(id),        enabled: !!id, staleTime: 10_000 }); }

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: workspacesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['workspaces'] }) });
}
export function useIngestDocument(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (f: FormData) => workspacesApi.ingest(wsId, f),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['workspace', wsId] }); qc.invalidateQueries({ queryKey: ['topics', wsId] }); },
  });
}
export function useGenerateQuiz() { return useMutation({ mutationFn: quizApi.generate }); }
export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizApi.submit,
    onSuccess: (_r, v) => {
      qc.invalidateQueries({ queryKey: ['qhist', v.workspace_id] });
      qc.invalidateQueries({ queryKey: ['progress', v.workspace_id] });
      qc.invalidateQueries({ queryKey: ['weak', v.workspace_id] });
    },
  });
}
export function useGenerateFlashcards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ wsId, text }: { wsId: string; text: string }) => flashcardsApi.generate(wsId, text),
    onSuccess: (_r, v) => qc.invalidateQueries({ queryKey: ['flashcards', v.wsId] }),
  });
}
export function useReviewFlashcard(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, quality }: { cardId: string; quality: number }) => flashcardsApi.review(cardId, quality),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flashcards', wsId] }),
  });
}
export function useCopilotChat() { return useMutation({ mutationFn: copilotApi.chat }); }
export function usePlannerPreview() { return useMutation({ mutationFn: ({ wsId, hours, subject }: { wsId: string; hours: number; subject: string }) => plannerApi.preview(wsId, hours, subject) }); }
