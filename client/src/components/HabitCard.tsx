import { useState } from "react";
import { type HabitWithStats } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Flame, Trophy, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { format } from "date-fns";
import { useToggleHabit, useDeleteHabit } from "@/hooks/use-habits";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface HabitCardProps {
  habit: HabitWithStats;
}

export function HabitCard({ habit }: HabitCardProps) {
  const toggleMutation = useToggleHabit();
  const deleteMutation = useDeleteHabit();
  const queryClient = useQueryClient();
  
  // Update priority mutation
  const updateMutation = useMutation({
    mutationFn: async (priority: boolean) => {
      await apiRequest("PUT", `/api/habits/${habit.id}`, { priority });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    }
  });

  // Difficulty stars/dots
  const difficultyDots = Array.from({ length: 3 }).map((_, i) => (
    <div 
      key={i} 
      className={cn(
        "w-1.5 h-1.5 rounded-full",
        i < habit.difficulty ? "bg-foreground/20" : "bg-foreground/5"
      )} 
    />
  ));

  const handleToggle = () => {
    const newState = !habit.completedToday;
    
    if (newState) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#8b5cf6', '#ec4899', '#3b82f6']
      });
    }

    toggleMutation.mutate({
      id: habit.id,
      date: format(new Date(), 'yyyy-MM-dd'),
      completed: newState
    });
  };

  const togglePriority = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateMutation.mutate(!habit.priority);
  };

  const completed = habit.completedToday;

  // Don't render if completed (unless we want to show completed items in a specific "Completed" section)
  // But for "Active Habits", we might want to hide them. 
  // However, removing them immediately might be jarring. 
  // Let's keep them but visually dimmed for now, as the parent component handles filtering if needed.

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300",
        "bg-card border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        completed && "bg-primary/5 border-primary/20 opacity-60",
        habit.priority && "border-yellow-400/50 shadow-yellow-100/50"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full uppercase tracking-wider",
              habit.color === 'bg-blue-500' && "bg-blue-100 text-blue-700",
              habit.color === 'bg-green-500' && "bg-green-100 text-green-700", 
              habit.color === 'bg-purple-500' && "bg-purple-100 text-purple-700",
              habit.color === 'bg-cyan-500' && "bg-cyan-100 text-cyan-700",
              !habit.color && "bg-gray-100 text-gray-700"
            )}>
              {habit.category}
            </span>
            <div className="flex gap-0.5">{difficultyDots}</div>
          </div>
          
          <h3 className={cn(
            "font-display font-semibold text-lg truncate transition-colors",
            completed ? "text-muted-foreground line-through decoration-primary/50" : "text-foreground"
          )}>
            {habit.name}
          </h3>
          
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-orange-500 font-medium bg-orange-50 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3 fill-orange-500" />
              <span>{habit.streak || 0} streak</span>
            </div>
            <div className="flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              <span>{habit.completionRate}% rate</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button 
            onClick={togglePriority}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:scale-110 active:scale-95",
              habit.priority ? "text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400"
            )}
            data-testid={`button-priority-habit-${habit.id}`}
          >
            <Star className="w-5 h-5" fill={habit.priority ? "currentColor" : "none"} />
          </button>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              deleteMutation.mutate(habit.id);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground/30 hover:text-destructive transition-colors hover:scale-110 active:scale-95"
            data-testid={`button-delete-habit-${habit.id}`}
          >
            <Trash2 className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              completed 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100" 
                : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 scale-95 hover:scale-100"
            )}
          >
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.div
                key="checked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Check className="w-6 h-6 stroke-[3]" />
              </motion.div>
            ) : (
              <motion.div
                key="unchecked"
                className="w-4 h-4 rounded-sm border-2 border-current opacity-50"
              />
            )}
          </AnimatePresence>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
