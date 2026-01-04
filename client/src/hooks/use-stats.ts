import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type SuggestionRequest } from "@shared/schema";

export function useUserStats() {
  return useQuery({
    queryKey: [api.stats.get.path],
    queryFn: async () => {
      const res = await fetch(api.stats.get.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.stats.get.responses[200].parse(await res.json());
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: [api.stats.analytics.path],
    queryFn: async () => {
      const res = await fetch(api.stats.analytics.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.stats.analytics.responses[200].parse(await res.json());
    },
  });
}

export function useSuggestions() {
  return useMutation({
    mutationFn: async (data: SuggestionRequest) => {
      const res = await fetch(api.suggestions.generate.path, {
        method: api.suggestions.generate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate suggestions");
      return api.suggestions.generate.responses[200].parse(await res.json());
    },
  });
}

export function useGenerateFullGoal() {
  return useMutation({
    mutationFn: async (data: { context: string }) => {
      const res = await fetch(api.suggestions.generateFullGoal.path, {
        method: api.suggestions.generateFullGoal.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate full goal");
      return api.suggestions.generateFullGoal.responses[200].parse(await res.json());
    },
  });
}

export type DailyMotivation = {
  id?: number;
  date: string;
  quote: string;
  philosophy: string;
  tradition: string;
  habitContext?: string | null;
};

export function useDailyMotivation() {
  return useQuery<DailyMotivation>({
    queryKey: ['/api/motivation/today'],
    queryFn: async () => {
      const res = await fetch('/api/motivation/today', { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch motivation");
      return await res.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since it only changes daily
  });
}
