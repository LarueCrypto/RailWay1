import { useUserStats, useDailyMotivation, useAnalytics } from "@/hooks/use-stats";
import { useHabits } from "@/hooks/use-habits";
import { XpBar } from "@/components/XpBar";
import { HabitCard } from "@/components/HabitCard";
import { Zap, Trophy, Sparkles, Quote, CheckSquare } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-card p-responsive-lg rounded-2xl border border-border/50 shadow-sm flex items-center gap-3 md:gap-4">
      <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color} text-white shadow-md`}>
        <Icon className="w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs md:text-sm text-muted-foreground font-medium truncate">{label}</p>
        <p className="text-xl md:text-2xl font-bold font-display">{value}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: motivation, isLoading: motivationLoading } = useDailyMotivation();
  const { data: analytics } = useAnalytics();

  if (statsLoading || habitsLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto space-y-8">
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Show priority habits first, then others - up to 4 habits
  const priorityHabits = habits?.filter(h => h.priority) || [];
  const otherHabits = habits?.filter(h => !h.priority) || [];
  const topHabits = [...priorityHabits, ...otherHabits].slice(0, 4);
  const completedTodayCount = habits?.filter(h => h.completedToday).length || 0;
  
  return (
    <div className="min-h-[100dvh] bg-background pb-20 md:pb-8">
      <div className="max-w-5xl mx-auto p-responsive-lg md:p-8 space-y-6 md:space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-primary via-amber-500 to-accent text-white p-4 md:p-10 shadow-xl shadow-primary/30">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-4 max-w-lg">
              <h1 className="text-responsive-3xl md:text-5xl font-display font-extrabold tracking-tight">
                Keep going!
              </h1>
              <p className="text-primary-foreground/90 text-sm md:text-lg font-medium">
                You're making great progress today. Complete your daily quests to level up.
              </p>
            </div>
            
            <div className="w-full md:w-80 bg-black/20 backdrop-blur-md rounded-xl md:rounded-2xl p-3 md:p-4 border border-white/10">
              <XpBar 
                current={stats.currentXp || 0} 
                total={1000} 
                level={stats.level || 1} 
              />
            </div>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 md:w-48 h-24 md:h-48 bg-amber-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        </div>

        {/* Daily Motivation Widget */}
        {motivation && (
          <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-50/50 via-background to-amber-100/30 dark:from-amber-950/30 dark:via-background dark:to-amber-900/20" data-testid="card-daily-motivation">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Daily Wisdom</h3>
                <p className="text-xs text-muted-foreground">{motivation.tradition}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Quote className="absolute -top-2 -left-1 w-6 h-6 text-amber-500/30" />
                <p className="text-lg font-medium italic pl-6 text-foreground/90" data-testid="text-motivation-quote">
                  {motivation.quote}
                </p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-motivation-philosophy">
                {motivation.philosophy}
              </p>
              {motivation.habitContext && (
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-2 border-t border-amber-500/20" data-testid="text-motivation-context">
                  {motivation.habitContext}
                </p>
              )}
            </CardContent>
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          </Card>
        )}
        {motivationLoading && (
          <Skeleton className="h-40 w-full rounded-xl" />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard 
            icon={Zap} 
            label="Daily Streak" 
            value={`${analytics?.streakData?.currentStreak ?? 0} days`} 
            color="bg-orange-500" 
          />
          <StatCard 
            icon={CheckSquare}
            label="Completed Today" 
            value={`${completedTodayCount}/${habits?.length || 0}`} 
            color="bg-green-500" 
          />
          <StatCard 
            icon={Trophy} 
            label="Total XP" 
            value={stats.totalXp?.toLocaleString() || 0} 
            color="bg-purple-500" 
          />
        </div>

        {/* Priority Habits */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Priority Quests</h2>
            <span className="text-sm text-muted-foreground">{format(new Date(), 'EEEE, MMMM do')}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topHabits.map(habit => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
