import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { workspacesApi, quizApi, contentApi, flashcardsApi, copilotApi, plannerApi } from '@/lib/api';

export const useWorkspaces       = ()         => useQuery({ queryKey: ['workspaces'],      queryFn: workspacesApi.list,           staleTime: 30_000 });
export const useWorkspaceDetail  = (id: string) => useQuery({ queryKey: ['workspace', id],  queryFn: () => workspacesApi.get(id),  enabled: !!id, staleTime: 15_000 });
export const useWorkspaceRawText = (id: string) => useQuery({ queryKey: ['rawtext', id],    queryFn: () => workspacesApi.rawText(id), enabled: !!id, staleTime: 60_000 });
export const useProgress         = (id: string) => useQuery({ queryKey: ['progress', id],  queryFn: () => contentApi.progress(id),       enabled: !!id, staleTime: 20_000 });
export const useExamPrediction   = (id: string) => useQuery({ queryKey: ['exam-pred', id], queryFn: () => contentApi.examPrediction(id), enabled: !!id, staleTime: 30_000 });
export const useWeakTopics       = (id: string) => useQuery({ queryKey: ['weak', id],      queryFn: () => contentApi.weakTopics(id),     enabled: !!id, staleTime: 20_000 });
export const useQuizHistory      = (id: string) => useQuery({ queryKey: ['qhist', id],     queryFn: () => quizApi.history(id),           enabled: !!id, staleTime: 10_000 });
export const useTopics           = (id: string) => useQuery({ queryKey: ['topics', id],    queryFn: () => workspacesApi.topics(id),      enabled: !!id, staleTime: 30_000 });
export const useFlashcards       = (id: string) => useQuery({ queryKey: ['flashcards', id],queryFn: () => flashcardsApi.list(id),        enabled: !!id, staleTime: 10_000 });

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workspacesApi.create,
    onSuccess: (ws) => { qc.invalidateQueries({ queryKey: ['workspaces'] }); toast.success(`Workspace "${ws.name}" created`); },
    onError:   (e: Error) => toast.error(e.message),
  });
}

export function useIngestDocument(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (f: FormData) => workspacesApi.ingest(wsId, f),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['workspace', wsId] });
      qc.invalidateQueries({ queryKey: ['topics', wsId] });
      qc.invalidateQueries({ queryKey: ['rawtext', wsId] });
      toast.success(`Ingested "${res.title}" — ${res.chunk_count} chunks, ${res.topics.length} topics`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateQuiz() {
  return useMutation({
    mutationFn: quizApi.generate,
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizApi.submit,
    onSuccess: (res, v) => {
      qc.invalidateQueries({ queryKey: ['qhist', v.workspace_id] });
      qc.invalidateQueries({ queryKey: ['progress', v.workspace_id] });
      qc.invalidateQueries({ queryKey: ['weak', v.workspace_id] });
      toast.success(`Quiz submitted — ${res.accuracy}% accuracy`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateFlashcards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ wsId, text }: { wsId: string; text: string }) => flashcardsApi.generate(wsId, text),
    onSuccess: (res, v) => { qc.invalidateQueries({ queryKey: ['flashcards', v.wsId] }); toast.success(`${res.generated} flashcards generated`); },
    onError:   (e: Error) => toast.error(e.message),
  });
}

export function useReviewFlashcard(wsId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, quality }: { cardId: string; quality: number }) => flashcardsApi.review(cardId, quality),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['flashcards', wsId] }),
    onError:   (e: Error) => toast.error(e.message),
  });
}

export function useCopilotChat()    { return useMutation({ mutationFn: copilotApi.chat }); }
export function usePlannerPreview() {
  return useMutation({
    mutationFn: ({ wsId, hours, subject }: { wsId: string; hours: number; subject: string }) =>
      plannerApi.preview(wsId, hours, subject),
    onSuccess: (res) => toast.success(`Schedule generated — ${res.schedule.length} topics`),
    onError:   (e: Error) => toast.error(e.message),
  });
}
