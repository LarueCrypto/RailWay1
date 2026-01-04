import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAnalytics, useUserStats } from "@/hooks/use-stats";
import { useGoals } from "@/hooks/use-goals";
import { useHabits } from "@/hooks/use-habits";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, TrendingDown, Flame, Target, Award, Lightbulb, Flag, Calendar, Zap, Trophy, Star, FileText, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { differenceInDays } from "date-fns";
import type { Note } from "@shared/schema";

const tierColors = {
  critical: { bg: "bg-red-500/20", text: "text-red-600 dark:text-red-400", border: "border-red-500/50" },
  "needs-work": { bg: "bg-yellow-500/20", text: "text-yellow-600 dark:text-yellow-400", border: "border-yellow-500/50" },
  good: { bg: "bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/50" },
  excellent: { bg: "bg-green-500/20", text: "text-green-600 dark:text-green-400", border: "border-green-500/50" },
};

const categoryColors = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function Analytics() {
  const { data, isLoading } = useAnalytics();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: stats, isLoading: statsLoading } = useUserStats();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: notes, isLoading: notesLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
  });
  const [timeframe, setTimeframe] = useState("weekly");

  if (isLoading || goalsLoading || statsLoading || habitsLoading || notesLoading) {
    return (
      <div className="min-h-screen bg-background pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getChartData = () => {
    switch (timeframe) {
      case "daily": return data.dailyData || [];
      case "weekly": return data.weeklyData || [];
      case "monthly": return data.monthlyData || [];
      case "yearly": return data.yearlyData || [];
      default: return data.weeklyData || [];
    }
  };

  const chartData = getChartData();
  const growthValue = parseFloat(data.overallGrowth);
  const isPositiveGrowth = growthValue >= 0;
  const weeklyProgressNum = parseFloat(data.weeklyProgress);
  const overallCompletionNum = parseFloat(data.overallCompletion);

  const getCurrentHabitStats = () => {
    if (!data.habitStatsByTimeframe) return data.habitStats || [];
    switch (timeframe) {
      case "daily": return data.habitStatsByTimeframe.daily || [];
      case "weekly": return data.habitStatsByTimeframe.weekly || [];
      case "monthly": return data.habitStatsByTimeframe.monthly || [];
      case "yearly": return data.habitStatsByTimeframe.yearly || [];
      default: return data.habitStatsByTimeframe.weekly || [];
    }
  };

  const currentHabitStats = getCurrentHabitStats();
  const habitsNeedingAttention = currentHabitStats.filter(h => h.tier === 'critical' || h.tier === 'needs-work');
  const excellentHabits = currentHabitStats.filter(h => h.tier === 'excellent');

  const timeframeLabelMap: Record<string, string> = {
    daily: "Today",
    weekly: "Last 7 Days",
    monthly: "Last 30 Days",
    yearly: "Last 365 Days"
  };
  const timeframeLabel = timeframeLabelMap[timeframe] || "Last 7 Days";

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-display font-bold luminescent" data-testid="text-analytics-title">Performance Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your progress and identify areas for improvement</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="p-3 md:p-4" data-testid="card-weekly-progress">
            <div className="flex items-start gap-2 md:gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4 md:w-5 md:h-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Weekly Progress</p>
                <p className="text-lg md:text-2xl font-bold">{data.weeklyProgress}%</p>
              </div>
            </div>
            <Progress value={weeklyProgressNum} className="h-1.5 md:h-2" />
            <p className={cn("text-[10px] md:text-xs mt-1.5 md:mt-2 truncate", weeklyProgressNum < 50 ? "text-red-500" : "text-muted-foreground")}>
              {weeklyProgressNum < 50 ? "Needs work" : weeklyProgressNum < 75 ? "Good" : "Excellent!"}
            </p>
          </Card>

          <Card className="p-3 md:p-4" data-testid="card-growth">
            <div className="flex items-start gap-2 md:gap-3 mb-2">
              <div className={cn("w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0", isPositiveGrowth ? "bg-green-500/20" : "bg-red-500/20")}>
                {isPositiveGrowth ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600" /> : <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Week/Week</p>
                <p className={cn("text-lg md:text-2xl font-bold", isPositiveGrowth ? "text-green-600" : "text-red-600")}>
                  {isPositiveGrowth ? "+" : ""}{data.overallGrowth}%
                </p>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">vs last week</p>
          </Card>

          <Card className="p-3 md:p-4" data-testid="card-streak">
            <div className="flex items-start gap-2 md:gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Streak</p>
                <p className="text-lg md:text-2xl font-bold">{data.streakData?.currentStreak || 0}d</p>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
              Best: {data.streakData?.longestStreak || 0}d
            </p>
          </Card>

          <Card className="p-3 md:p-4" data-testid="card-total-completions">
            <div className="flex items-start gap-2 md:gap-3 mb-2">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">Completions</p>
                <p className="text-lg md:text-2xl font-bold">{data.streakData?.totalCompletions?.toLocaleString() || 0}</p>
              </div>
            </div>
            <p className="text-[10px] md:text-xs text-muted-foreground">All time</p>
          </Card>
        </div>

        {stats && (() => {
          const currentLevel = stats.level || 1;
          const totalXp = stats.totalXp || 0;
          // Calculate XP thresholds: Level 1→2: 1000 XP, Level 2→3: 1500 XP, etc.
          // XP for level N = 1000 + (N-1) * 500
          const xpForCurrentLevel = currentLevel === 1 ? 0 : Array.from({ length: currentLevel - 1 }, (_, i) => 1000 + i * 500).reduce((a, b) => a + b, 0);
          const xpForNextLevel = 1000 + (currentLevel - 1) * 500;
          const currentLevelXp = totalXp - xpForCurrentLevel;
          const progressPercent = xpForNextLevel > 0 ? Math.min((currentLevelXp / xpForNextLevel) * 100, 100) : 0;
          
          return (
            <Card className="p-4 md:p-6" data-testid="card-level-progress">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-base md:text-lg">Level Progress</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg">
                      <span className="text-2xl md:text-3xl font-bold text-black">{currentLevel}</span>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Current Level</p>
                      <p className="text-lg font-bold">{totalXp.toLocaleString()} XP total</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Progress to Level {currentLevel + 1}</span>
                    <span className="text-sm font-medium">
                      {currentLevelXp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                    </span>
                  </div>
                  <Progress 
                    value={progressPercent} 
                    className="h-3"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>Level {currentLevel} starts at {xpForCurrentLevel.toLocaleString()} XP</span>
                    <span>{(xpForNextLevel - currentLevelXp).toLocaleString()} XP needed</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })()}

        <Card className="p-4 md:p-6" data-testid="card-consolidated-overview">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-base md:text-lg">Consolidated Overview</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Active Habits</p>
                <p className="text-lg font-bold">{habits?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Flag className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Active Goals</p>
                <p className="text-lg font-bold">{goals?.filter(g => !g.completed).length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <FileText className="w-5 h-5 text-purple-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Notes</p>
                <p className="text-lg font-bold">{notes?.length || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="w-5 h-5 text-yellow-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">Potential XP</p>
                <p className="text-lg font-bold">{(goals?.filter(g => !g.completed) || []).reduce((acc, g) => acc + (g.xpReward || 1000), 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6" data-testid="card-consistency-chart">
            <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
              <h3 className="font-semibold text-lg">Consistency Trend</h3>
              <Tabs value={timeframe} onValueChange={setTimeframe}>
                <TabsList className="h-9">
                  <TabsTrigger value="daily" className="text-xs px-3">Daily</TabsTrigger>
                  <TabsTrigger value="weekly" className="text-xs px-3">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
                  <TabsTrigger value="yearly" className="text-xs px-3">Yearly</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                    formatter={(value: number) => [`${value}%`, 'Completion Rate']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPv)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 md:p-6" data-testid="card-category-breakdown">
            <h3 className="font-semibold text-base md:text-lg mb-4">Category Performance</h3>
            {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              <div className="space-y-4">
                {data.categoryBreakdown.map((cat, idx) => (
                  <div key={cat.category} className="space-y-2">
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className="capitalize truncate">{cat.category}</span>
                      <span className={cn(
                        "font-medium shrink-0",
                        cat.completionRate < 50 ? "text-red-500" : cat.completionRate < 75 ? "text-yellow-500" : "text-green-500"
                      )}>
                        {cat.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${cat.completionRate}%`,
                          backgroundColor: categoryColors[idx % categoryColors.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">No category data yet</p>
            )}
          </Card>
        </div>

        {goals && goals.length > 0 && (
          <Card className="p-4 md:p-6" data-testid="card-goals-progress">
            <div className="flex items-center gap-2 mb-4">
              <Flag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-base md:text-lg">Long-Term Goals Progress</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.filter(g => !g.completed).map((goal) => {
                const stepsCompleted = goal.steps?.filter(s => s.completed).length || 0;
                const totalSteps = goal.steps?.length || 0;
                const stepProgress = totalSteps > 0 ? Math.round((stepsCompleted / totalSteps) * 100) : goal.progress;
                const daysRemaining = goal.deadline ? differenceInDays(new Date(goal.deadline), new Date()) : null;
                const isOverdue = daysRemaining !== null && daysRemaining < 0;
                const difficultyLabel = goal.difficulty === 1 ? "Normal" : goal.difficulty === 2 ? "Medium" : "Hard";
                const xpReward = goal.difficulty === 1 ? 1000 : goal.difficulty === 2 ? 2000 : 3000;
                
                return (
                  <div 
                    key={goal.id}
                    className={cn(
                      "p-4 rounded-xl border transition-all",
                      isOverdue ? "border-red-500/50 bg-red-500/5" : "border-border bg-muted/30"
                    )}
                    data-testid={`card-goal-progress-${goal.id}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <h4 className="font-medium text-sm truncate flex-1">{goal.title}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {difficultyLabel}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={stepProgress} className="h-2 flex-1" />
                      <span className="text-sm font-bold min-w-[3rem] text-right">{stepProgress}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-3 flex-wrap">
                        {totalSteps > 0 && (
                          <span>{stepsCompleted}/{totalSteps} steps</span>
                        )}
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-500" />
                          {xpReward} XP
                        </span>
                      </div>
                      {daysRemaining !== null && (
                        <span className={cn(
                          "flex items-center gap-1",
                          isOverdue ? "text-red-500" : daysRemaining <= 7 ? "text-yellow-500" : ""
                        )}>
                          <Calendar className="w-3 h-3" />
                          {isOverdue ? `${Math.abs(daysRemaining)}d overdue` : `${daysRemaining}d left`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {goals.filter(g => g.completed).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-green-500" />
                  Completed Goals
                </h4>
                <div className="flex flex-wrap gap-2">
                  {goals.filter(g => g.completed).map((goal) => {
                    const xpReward = goal.difficulty === 1 ? 1000 : goal.difficulty === 2 ? 2000 : 3000;
                    return (
                      <Badge 
                        key={goal.id} 
                        variant="outline" 
                        className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50"
                      >
                        {goal.title} (+{xpReward} XP)
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
            
            {goals.filter(g => !g.completed).length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-4">
                All goals completed! Set new goals to keep progressing.
              </p>
            )}
          </Card>
        )}

        {habitsNeedingAttention.length > 0 && (
          <Card className="p-4 md:p-6 border-red-500/30 bg-red-500/5" data-testid="card-needs-attention">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-base md:text-lg">Habits Needing Attention ({timeframeLabel})</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These habits have completion rates below 50% for {timeframeLabel.toLowerCase()}.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habitsNeedingAttention.map((habit) => (
                <div 
                  key={habit.id} 
                  className={cn("p-4 rounded-xl border", tierColors[habit.tier].bg, tierColors[habit.tier].border)}
                  data-testid={`card-habit-attention-${habit.id}`}
                >
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <h4 className="font-medium truncate">{habit.name}</h4>
                    <Badge variant="outline" className={tierColors[habit.tier].text}>
                      {habit.tierLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Progress value={habit.completionRate} className="h-2 flex-1" />
                    <span className={cn("text-sm font-medium", tierColors[habit.tier].text)}>
                      {habit.completionRate}%
                    </span>
                  </div>
                  {habit.suggestion && (
                    <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-yellow-500" />
                      <p>{habit.suggestion}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {currentHabitStats && currentHabitStats.length > 0 && (
          <Card className="p-4 md:p-6" data-testid="card-all-habits">
            <h3 className="font-semibold text-base md:text-lg mb-4">All Habit Performance ({timeframeLabel})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentHabitStats.map((habit) => (
                <div 
                  key={habit.id}
                  className={cn("p-4 rounded-xl border transition-all", tierColors[habit.tier].bg, tierColors[habit.tier].border)}
                  data-testid={`card-habit-stat-${habit.id}`}
                >
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <h4 className="font-medium truncate text-sm">{habit.name}</h4>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs shrink-0", tierColors[habit.tier].text)}
                    >
                      {habit.tierLabel}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={habit.completionRate} className="h-2 flex-1" />
                    <span className={cn("text-sm font-bold min-w-[3rem] text-right", tierColors[habit.tier].text)}>
                      {habit.completionRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium text-sm mb-3">Progress Tiers</h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-xs text-muted-foreground">Critical (0-24%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-xs text-muted-foreground">Needs Work (25-49%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-muted-foreground">Good (50-74%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Excellent (75-100%)</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {excellentHabits.length > 0 && (
          <Card className="p-4 md:p-6 border-green-500/30 bg-green-500/5" data-testid="card-excellent-habits">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-base md:text-lg">Excellent Performance ({timeframeLabel})</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              These habits are performing exceptionally well for {timeframeLabel.toLowerCase()}.
            </p>
            <div className="flex flex-wrap gap-2">
              {excellentHabits.map((habit) => (
                <Badge key={habit.id} variant="outline" className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/50">
                  {habit.name} - {habit.completionRate}%
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
