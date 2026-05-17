import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspacesApi, quizApi, contentApi } from '@/lib/api';

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn:  workspacesApi.list,
    staleTime: 30_000,
  });
}

export function useWorkspaceDetail(id: string) {
  return useQuery({
    queryKey: ['workspace', id],
    queryFn:  () => workspacesApi.get(id),
    enabled:  !!id,
    staleTime: 15_000,
  });
}

export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: workspacesApi.create,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['workspaces'] }),
  });
}

export function useIngestDocument(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => workspacesApi.ingest(workspaceId, form),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
      qc.invalidateQueries({ queryKey: ['topics', workspaceId] });
    },
  });
}

export function useTopics(workspaceId: string) {
  return useQuery({
    queryKey: ['topics', workspaceId],
    queryFn:  () => workspacesApi.topics(workspaceId),
    enabled:  !!workspaceId,
    staleTime: 30_000,
  });
}

export function useGenerateQuiz() {
  return useMutation({
    mutationFn: quizApi.generate,
  });
}

export function useSubmitQuiz() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizApi.submit,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['quiz-history', vars.workspace_id] });
      qc.invalidateQueries({ queryKey: ['progress', vars.workspace_id] });
      qc.invalidateQueries({ queryKey: ['weak-topics', vars.workspace_id] });
    },
  });
}

export function useQuizHistory(workspaceId: string) {
  return useQuery({
    queryKey: ['quiz-history', workspaceId],
    queryFn:  () => quizApi.history(workspaceId),
    enabled:  !!workspaceId,
    staleTime: 10_000,
  });
}

export function useProgress(workspaceId: string) {
  return useQuery({
    queryKey: ['progress', workspaceId],
    queryFn:  () => contentApi.progress(workspaceId),
    enabled:  !!workspaceId,
    staleTime: 20_000,
  });
}

export function useExamPrediction(workspaceId: string) {
  return useQuery({
    queryKey: ['exam-prediction', workspaceId],
    queryFn:  () => contentApi.examPrediction(workspaceId),
    enabled:  !!workspaceId,
    staleTime: 30_000,
  });
}

export function useWeakTopics(workspaceId: string) {
  return useQuery({
    queryKey: ['weak-topics', workspaceId],
    queryFn:  () => contentApi.weakTopics(workspaceId),
    enabled:  !!workspaceId,
    staleTime: 20_000,
  });
}
