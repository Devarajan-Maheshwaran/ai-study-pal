import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { 
  type GenerateMcqsRequest, 
  type AnswerMcqRequest, 
  type AnswerMcqResponse,
  type SummarizeRequest,
  type StudyTipsRequest,
  type GetResourcesRequest
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_USER_ID = "default_user";

// User Helpers
export function useUserId() {
  const stored = localStorage.getItem("ai_study_pal_userid");
  if (!stored) {
    localStorage.setItem("ai_study_pal_userid", DEFAULT_USER_ID);
    return DEFAULT_USER_ID;
  }
  return stored;
}

export function useSetUserId() {
  const queryClient = useQueryClient();
  return (id: string) => {
    localStorage.setItem("ai_study_pal_userid", id);
    queryClient.invalidateQueries();
  };
}

// Learning Path
export function useLearningPath() {
  const userId = useUserId();
  return useQuery({
    queryKey: [api.learningPath.get.path, userId],
    queryFn: async () => {
      const url = buildUrl(api.learningPath.get.path) + `?user_id=${encodeURIComponent(userId)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch learning path");
      return api.learningPath.get.responses[200].parse(await res.json());
    },
  });
}

// MCQs
export function useGenerateMcqs() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: GenerateMcqsRequest) => {
      const res = await fetch(api.mcqs.generate.path, {
        method: api.mcqs.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate MCQs");
      return api.mcqs.generate.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useAnswerMcq() {
  return useMutation({
    mutationFn: async (data: AnswerMcqRequest) => {
      const res = await fetch(api.mcqs.answer.path, {
        method: api.mcqs.answer.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit answer");
      return api.mcqs.answer.responses[200].parse(await res.json());
    },
  });
}

// Study Tools
export function useSummarize() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: SummarizeRequest) => {
      const res = await fetch(api.summarize.create.path, {
        method: api.summarize.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to summarize");
      return api.summarize.create.responses[200].parse(await res.json());
    },
    onError: () => {
      toast({ title: "Error", description: "Could not generate summary", variant: "destructive" });
    },
  });
}

export function useStudyTips() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: StudyTipsRequest) => {
      const res = await fetch(api.studyTips.create.path, {
        method: api.studyTips.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to get tips");
      return api.studyTips.create.responses[200].parse(await res.json());
    },
    onError: () => {
      toast({ title: "Error", description: "Could not generate tips", variant: "destructive" });
    },
  });
}

export function useResources() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: GetResourcesRequest) => {
      const res = await fetch(api.resources.get.path, {
        method: api.resources.get.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to fetch resources");
      return api.resources.get.responses[200].parse(await res.json());
    },
    onError: () => {
      toast({ title: "Error", description: "Could not find resources", variant: "destructive" });
    },
  });
}
