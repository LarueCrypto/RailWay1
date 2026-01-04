import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateGoalRequest, type UpdateGoalRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useGoals() {
  return useQuery({
    queryKey: [api.goals.list.path],
    queryFn: async () => {
      const res = await fetch(api.goals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch goals");
      return api.goals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateGoalRequest) => {
      const res = await fetch(api.goals.create.path, {
        method: api.goals.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create goal");
      return api.goals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      toast({ title: "Goal Set!", description: "Go get it!" });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateGoalRequest) => {
      const url = buildUrl(api.goals.update.path, { id });
      const res = await fetch(url, {
        method: api.goals.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return api.goals.update.responses[200].parse(await res.json());
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      // If we just completed it (100% progress), update stats
      if (variables.progress === 100) {
        queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
        toast({ 
          title: "Goal Completed!", 
          description: `+${data.xpReward} XP Awarded!`,
          className: "bg-accent text-accent-foreground border-none"
        });
      } else {
        toast({ title: "Progress Updated" });
      }
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.goals.delete.path, { id });
      const res = await fetch(url, { method: api.goals.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete goal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      toast({ title: "Goal Removed" });
    },
  });
}

export function useSuggestGoalSteps() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (goalId: number) => {
      const res = await fetch(`/api/goals/${goalId}/suggest-steps`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate steps");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      toast({ title: "Steps Generated!", description: "AI has created a roadmap for your goal." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not generate steps. Try again.", variant: "destructive" });
    },
  });
}

export function useAddGoalStep() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ goalId, title }: { goalId: number; title: string }) => {
      const res = await fetch(`/api/goals/${goalId}/steps`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add step");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.goals.list.path] });
      if (data.step?.suggestedHabit) {
        toast({ title: "Step Added!", description: `Suggested habit: ${data.step.suggestedHabit}` });
      } else {
        toast({ title: "Step Added!" });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Could not add step. Try again.", variant: "destructive" });
    },
  });
}
