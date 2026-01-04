import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type CreateHabitRequest, type UpdateHabitRequest, type HabitWithStats } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export function useHabits() {
  return useQuery({
    queryKey: [api.habits.list.path],
    queryFn: async () => {
      const res = await fetch(api.habits.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch habits");
      return api.habits.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateHabitRequest) => {
      const res = await fetch(api.habits.create.path, {
        method: api.habits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.habits.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create habit");
      }
      return api.habits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.list.path] });
      toast({ title: "Habit Created!", description: "Let's start tracking." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & UpdateHabitRequest) => {
      const url = buildUrl(api.habits.update.path, { id });
      const res = await fetch(url, {
        method: api.habits.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update habit");
      return api.habits.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.list.path] });
      toast({ title: "Habit Updated" });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.habits.delete.path, { id });
      const res = await fetch(url, { method: api.habits.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete habit");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.list.path] });
      toast({ title: "Habit Deleted", variant: "default" });
    },
  });
}

export function useToggleHabit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, date, completed }: { id: number; date: string; completed: boolean }) => {
      const url = buildUrl(api.habits.toggle.path, { id });
      const res = await fetch(url, {
        method: api.habits.toggle.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, completed }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle habit");
      return api.habits.toggle.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.habits.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.stats.get.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      
      if (data.leveledUp && data.newLevel) {
        // Big level-up celebration!
        const duration = 3000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: ['#fbbf24', '#f59e0b', '#d97706', '#8b5cf6', '#ec4899']
          });
          confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: ['#fbbf24', '#f59e0b', '#d97706', '#8b5cf6', '#ec4899']
          });
          if (Date.now() < end) requestAnimationFrame(frame);
        };
        frame();
        
        toast({ 
          title: `Level Up! You're now Level ${data.newLevel}!`, 
          description: "Amazing progress! Keep pushing forward!",
          className: "bg-gradient-to-r from-yellow-500 to-amber-500 text-yellow-950 border-none",
          duration: 5000,
        });
      } else if (data.xpGained > 0) {
        toast({ 
          title: `+${data.xpGained} XP!`, 
          description: "Great job keeping up with your habits!",
          className: "bg-primary text-primary-foreground border-none"
        });
      }
      
      if (data.unlockedAchievement) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#fbbf24', '#f59e0b', '#10b981']
          });
          toast({
            title: `Achievement Unlocked: ${data.unlockedAchievement.title}!`,
            description: data.unlockedAchievement.description,
            className: "bg-gradient-to-r from-green-500 to-emerald-500 text-green-950 border-none",
            duration: 5000,
          });
        }, data.leveledUp ? 3500 : 1000);
      }
    },
  });
}
