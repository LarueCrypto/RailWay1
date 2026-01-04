import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useSuggestGoalSteps, useAddGoalStep } from "@/hooks/use-goals";
import { useCreateHabit } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, Trash2, Sparkles, Check, ChevronDown, ChevronUp, Loader2, Star, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { type GoalStep, type Goal } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";

export default function Goals() {
  const { data: goals, isLoading } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();
  const suggestStepsMutation = useSuggestGoalSteps();
  const addStepMutation = useAddGoalStep();
  const createHabitMutation = useCreateHabit();
  
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [expandedGoal, setExpandedGoal] = useState<number | null>(null);
  const [newStepText, setNewStepText] = useState<Record<number, string>>({});
  const [newGoal, setNewGoal] = useState({ 
    title: "", 
    description: "", 
    deadline: "", 
    category: "personal"
  });
  const [editGoalData, setEditGoalData] = useState({ 
    title: "", 
    description: "", 
    deadline: ""
  });
  
  const difficultyLabels: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...newGoal,
      deadline: newGoal.deadline || null,
    }, {
      onSuccess: () => {
        setOpen(false);
        setNewGoal({ title: "", description: "", deadline: "", category: "personal" });
      }
    });
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    let formattedDeadline = "";
    if (goal.deadline) {
      try {
        formattedDeadline = format(new Date(goal.deadline), 'yyyy-MM-dd');
      } catch {
        formattedDeadline = "";
      }
    }
    setEditGoalData({
      title: goal.title,
      description: goal.description || "",
      deadline: formattedDeadline
    });
    setEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;
    
    updateMutation.mutate({
      id: editingGoal.id,
      title: editGoalData.title,
      description: editGoalData.description || null,
      deadline: editGoalData.deadline || null,
    }, {
      onSuccess: () => {
        setEditOpen(false);
        setEditingGoal(null);
      }
    });
  };

  const handleProgressChange = (id: number, val: number[]) => {
    updateMutation.mutate({ id, progress: val[0] });
  };

  const toggleStep = (goalId: number, stepId: string, steps: GoalStep[]) => {
    const updatedSteps = steps.map(s => 
      s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const progress = Math.round((completedCount / updatedSteps.length) * 100);
    const completed = progress === 100;
    
    updateMutation.mutate({ id: goalId, steps: updatedSteps, progress, completed });
  };

  const addCustomStep = (goalId: number) => {
    const text = newStepText[goalId]?.trim();
    if (!text || addStepMutation.isPending) return;
    
    addStepMutation.mutate({ goalId, title: text });
    setNewStepText(prev => ({ ...prev, [goalId]: "" }));
  };

  const deleteStep = (goalId: number, stepId: string, steps: GoalStep[]) => {
    const updatedSteps = steps.filter(s => s.id !== stepId);
    const completedCount = updatedSteps.filter(s => s.completed).length;
    const progress = updatedSteps.length > 0 
      ? Math.round((completedCount / updatedSteps.length) * 100) 
      : 0;
    const completed = updatedSteps.length > 0 && progress === 100;
    
    updateMutation.mutate({ id: goalId, steps: updatedSteps, progress, completed });
  };

  const addHabitFromStep = (habitName: string) => {
    createHabitMutation.mutate({
      name: habitName,
      category: "personal",
      color: "bg-purple-500"
    });
  };

  const activeGoals = (goals?.filter(g => !g.completed && (g.progress || 0) < 100) || [])
    .sort((a, b) => Number(b.priority ?? false) - Number(a.priority ?? false));
  const completedGoals = goals?.filter(g => g.completed || g.progress === 100) || [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold luminescent">Long-term Goals</h1>
            <p className="text-muted-foreground mt-1">Big achievements require persistence.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20" data-testid="button-add-goal">
                <Plus className="w-5 h-5 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Set New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Goal Title</Label>
                  <Input 
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g. Run a Marathon" 
                    className="rounded-xl"
                    data-testid="input-goal-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea 
                    value={newGoal.description}
                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="Add details about your goal..." 
                    className="rounded-xl resize-none"
                    rows={3}
                    data-testid="input-goal-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input 
                    type="date"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                    className="rounded-xl"
                    data-testid="input-goal-deadline"
                  />
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">AI-Assigned Difficulty:</span> The difficulty and XP reward will be automatically determined based on your goal.
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>Easy goals earn 1,000 XP</li>
                    <li>Medium goals earn 2,000 XP</li>
                    <li>Hard goals earn 3,000 XP</li>
                  </ul>
                </div>
                <Button type="submit" className="w-full rounded-xl" disabled={createMutation.isPending} data-testid="button-create-goal">
                  {createMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Goals */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-muted-foreground">Active Goals ({activeGoals.length})</h2>
              
              {activeGoals.length === 0 ? (
                <div className="text-center py-12 bg-card/50 rounded-3xl border border-dashed border-muted-foreground/20">
                  <p className="text-muted-foreground">No active goals. Set one to start your journey!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {activeGoals.map((goal) => {
                    const steps: GoalStep[] = Array.isArray(goal.steps) ? goal.steps : [];
                    const isExpanded = expandedGoal === goal.id;
                    
                    return (
                      <Collapsible 
                        key={goal.id} 
                        open={isExpanded}
                        onOpenChange={() => setExpandedGoal(isExpanded ? null : goal.id)}
                      >
                        <motion.div 
                          layout
                          className={cn(
                            "bg-card rounded-2xl p-6 border shadow-sm relative group",
                            goal.priority 
                              ? "border-yellow-400/50 shadow-yellow-100/30" 
                              : "border-border/50"
                          )}
                          data-testid={`card-goal-${goal.id}`}
                        >
                          <div className="flex justify-between items-start mb-4 gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold font-display luminescent">{goal.title}</h3>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 flex-wrap">
                                <CalendarIcon className="w-4 h-4" />
                                <span>Target: {goal.deadline ? format(new Date(goal.deadline), 'MMM do, yyyy') : 'No deadline'}</span>
                                <span className={cn(
                                  "px-2 py-0.5 rounded-full text-xs font-semibold",
                                  (goal.difficulty || 1) === 1 && "bg-green-500/20 text-green-600 dark:text-green-400",
                                  (goal.difficulty || 1) === 2 && "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
                                  (goal.difficulty || 1) === 3 && "bg-red-500/20 text-red-600 dark:text-red-400"
                                )}>
                                  {difficultyLabels[goal.difficulty || 1]} - {(goal.xpReward || 1000).toLocaleString()} XP
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="rounded-lg"
                                onClick={() => suggestStepsMutation.mutate(goal.id)}
                                disabled={suggestStepsMutation.isPending}
                                data-testid={`button-suggest-steps-${goal.id}`}
                              >
                                {suggestStepsMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    AI Steps
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => openEditDialog(goal)}
                                data-testid={`button-edit-goal-${goal.id}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => updateMutation.mutate({ id: goal.id, priority: !goal.priority })}
                                className={cn(
                                  "transition-colors",
                                  goal.priority ? "text-yellow-400" : "text-muted-foreground/30"
                                )}
                                data-testid={`button-priority-goal-${goal.id}`}
                              >
                                <Star className="w-4 h-4" fill={goal.priority ? "currentColor" : "none"} />
                              </Button>
                              
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive"
                                onClick={() => deleteMutation.mutate(goal.id)}
                                data-testid={`button-delete-goal-${goal.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                              <span>Progress</span>
                              <span className={goal.progress === 100 ? "text-green-500 luminescent-bright" : "luminescent"}>{goal.progress || 0}%</span>
                            </div>
                            <Slider 
                              value={[goal.progress || 0]} 
                              max={100} 
                              step={5}
                              onValueCommit={(val) => handleProgressChange(goal.id, val)}
                              className="py-2"
                              data-testid={`slider-progress-${goal.id}`}
                            />
                          </div>

                          {/* Steps Section */}
                          <div className="mt-4">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-between rounded-lg" data-testid={`button-toggle-steps-${goal.id}`}>
                                <span className="text-sm font-medium">
                                  {steps.length > 0 
                                    ? `Steps (${steps.filter(s => s.completed).length}/${steps.length} completed)`
                                    : "Steps (Add your roadmap)"}
                                </span>
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </Button>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <AnimatePresence>
                                <motion.div 
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="mt-3 space-y-2"
                                >
                                  {steps.map((step, idx) => (
                                    <div 
                                      key={step.id} 
                                      className={cn(
                                        "flex items-start gap-3 p-3 rounded-xl border transition-all group/step",
                                        step.completed 
                                          ? "bg-primary/5 border-primary/20" 
                                          : "bg-muted/30 border-border/30"
                                      )}
                                      data-testid={`step-${goal.id}-${idx}`}
                                    >
                                      <button
                                        onClick={() => toggleStep(goal.id, step.id, steps)}
                                        className={cn(
                                          "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all",
                                          step.completed 
                                            ? "bg-primary text-primary-foreground" 
                                            : "border-2 border-muted-foreground/30"
                                        )}
                                        data-testid={`button-toggle-step-${goal.id}-${idx}`}
                                      >
                                        {step.completed && <Check className="w-4 h-4" />}
                                      </button>
                                      
                                      <div className="flex-1 min-w-0">
                                        <p className={cn(
                                          "text-sm font-medium",
                                          step.completed && "line-through text-muted-foreground"
                                        )}>
                                          {step.title}
                                        </p>
                                        
                                        {step.suggestedHabit && !step.completed && (
                                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                                            <span className="text-xs text-muted-foreground">Suggested habit:</span>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="h-6 text-xs rounded-full"
                                              onClick={() => addHabitFromStep(step.suggestedHabit!)}
                                              disabled={createHabitMutation.isPending}
                                              data-testid={`button-add-habit-${goal.id}-${idx}`}
                                            >
                                              <Plus className="w-3 h-3 mr-1" />
                                              {step.suggestedHabit}
                                            </Button>
                                          </div>
                                        )}
                                      </div>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover/step:opacity-100 transition-opacity text-destructive"
                                        onClick={() => deleteStep(goal.id, step.id, steps)}
                                        data-testid={`button-delete-step-${goal.id}-${idx}`}
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ))}
                                  
                                  {/* Add Custom Step */}
                                  <div className="flex gap-2 mt-3">
                                    <Input
                                      placeholder="Add a step..."
                                      value={newStepText[goal.id] || ""}
                                      onChange={(e) => setNewStepText(prev => ({ ...prev, [goal.id]: e.target.value }))}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          e.preventDefault();
                                          addCustomStep(goal.id);
                                        }
                                      }}
                                      className="flex-1 h-9 rounded-lg text-sm"
                                      data-testid={`input-add-step-${goal.id}`}
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => addCustomStep(goal.id)}
                                      disabled={!newStepText[goal.id]?.trim() || addStepMutation.isPending}
                                      data-testid={`button-add-step-${goal.id}`}
                                    >
                                      {addStepMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <Plus className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </div>
                                </motion.div>
                              </AnimatePresence>
                            </CollapsibleContent>
                          </div>

                          {goal.progress === 100 && (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute -top-3 -right-3 bg-green-500 text-white p-2 rounded-full shadow-lg"
                            >
                              <Check className="w-6 h-6" />
                            </motion.div>
                          )}
                        </motion.div>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-muted-foreground">Completed ({completedGoals.length})</h2>
                <div className="grid gap-4">
                  {completedGoals.map((goal) => (
                    <div 
                      key={goal.id} 
                      className="bg-card/50 rounded-2xl p-4 border border-border/30 opacity-60"
                      data-testid={`card-completed-goal-${goal.id}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="bg-green-500 text-white p-1.5 rounded-full flex-shrink-0">
                            <Check className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold line-through truncate">{goal.title}</h3>
                            <span className="text-xs text-muted-foreground">+{(goal.xpReward || 1000).toLocaleString()} XP earned</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openEditDialog(goal)}
                            data-testid={`button-edit-completed-goal-${goal.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(goal.id)}
                            data-testid={`button-delete-completed-goal-${goal.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Edit Goal</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Goal Title</Label>
                <Input 
                  required
                  value={editGoalData.title}
                  onChange={e => setEditGoalData({...editGoalData, title: e.target.value})}
                  placeholder="e.g. Run a Marathon" 
                  className="rounded-xl"
                  data-testid="input-edit-goal-title"
                />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea 
                  value={editGoalData.description}
                  onChange={e => setEditGoalData({...editGoalData, description: e.target.value})}
                  placeholder="Add details about your goal..." 
                  className="rounded-xl resize-none"
                  rows={3}
                  data-testid="input-edit-goal-description"
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input 
                  type="date"
                  value={editGoalData.deadline}
                  onChange={e => setEditGoalData({...editGoalData, deadline: e.target.value})}
                  className="rounded-xl"
                  data-testid="input-edit-goal-deadline"
                />
              </div>
              {editingGoal && (
                <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Current Difficulty:</span> {difficultyLabels[editingGoal.difficulty || 2]} ({(editingGoal.xpReward || 2000).toLocaleString()} XP)
                  <p className="text-xs mt-1 opacity-70">Difficulty is set by AI at creation and cannot be changed.</p>
                </div>
              )}
              <Button type="submit" className="w-full rounded-xl" disabled={updateMutation.isPending} data-testid="button-save-goal">
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
