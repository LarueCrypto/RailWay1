import { useSuggestions, useGenerateFullGoal } from "@/hooks/use-stats";
import { useCreateHabit } from "@/hooks/use-habits";
import { useCreateGoal } from "@/hooks/use-goals";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Bot, ArrowRight, CheckCircle2, Target, Zap, ListChecks } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GenerationMode = "habits" | "goal";

export default function AiCoach() {
  const [context, setContext] = useState("");
  const [mode, setMode] = useState<GenerationMode>("habits");
  const [acceptedItems, setAcceptedItems] = useState<Set<number>>(new Set());
  const [goalAdded, setGoalAdded] = useState(false);
  
  const suggestMutation = useSuggestions();
  const fullGoalMutation = useGenerateFullGoal();
  const createHabitMutation = useCreateHabit();
  const createGoalMutation = useCreateGoal();

  const handleGenerate = () => {
    setAcceptedItems(new Set());
    setGoalAdded(false);
    
    if (mode === "habits") {
      suggestMutation.mutate({ context });
    } else {
      fullGoalMutation.mutate({ context });
    }
  };

  const handleAcceptHabit = (item: any, idx: number) => {
    createHabitMutation.mutate({
      name: item.title,
      description: item.description,
      category: 'learning',
      color: 'bg-primary'
    });
    setAcceptedItems(prev => new Set(Array.from(prev).concat(idx)));
  };

  const handleAddGoal = () => {
    const goal = fullGoalMutation.data?.goal;
    if (!goal) return;

    createGoalMutation.mutate({
      title: goal.title,
      description: goal.description,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      steps: goal.steps,
      difficulty: goal.difficulty,
      xpReward: goal.xpReward,
    } as any);
    setGoalAdded(true);
  };

  const isPending = suggestMutation.isPending || fullGoalMutation.isPending;
  const generatedGoal = fullGoalMutation.data?.goal;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold">AI Goal Coach</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Share your mission or intention, then choose to generate quick habits or a complete long-term goal with actionable steps.
          </p>
        </div>

        <div className="bg-card rounded-3xl p-2 shadow-sm border border-border/50">
          <Textarea 
            placeholder="e.g. I want to become fluent in Spanish and travel to Spain next year..." 
            className="border-0 focus-visible:ring-0 resize-none min-h-[100px] p-4 text-lg bg-transparent"
            value={context}
            onChange={e => setContext(e.target.value)}
            data-testid="input-mission-statement"
          />
          
          <div className="p-3 space-y-4">
            <div className="flex gap-2">
              <Button
                variant={mode === "habits" ? "default" : "outline"}
                className={cn(
                  "flex-1 rounded-xl",
                  mode === "habits" && "bg-gradient-to-r from-green-600 to-emerald-600"
                )}
                onClick={() => setMode("habits")}
                data-testid="button-mode-habits"
              >
                <Zap className="w-4 h-4 mr-2" />
                Quick Habits
              </Button>
              <Button
                variant={mode === "goal" ? "default" : "outline"}
                className={cn(
                  "flex-1 rounded-xl",
                  mode === "goal" && "bg-gradient-to-r from-indigo-600 to-purple-600"
                )}
                onClick={() => setMode("goal")}
                data-testid="button-mode-goal"
              >
                <Target className="w-4 h-4 mr-2" />
                Full Goal Plan
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button 
                size="lg" 
                onClick={handleGenerate} 
                disabled={isPending || !context.trim()}
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40"
                data-testid="button-generate"
              >
                {isPending ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {mode === "habits" ? "Generate Habits" : "Generate Goal Plan"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === "habits" && suggestMutation.data?.suggestions.map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-border/50 shadow-sm overflow-hidden">
                  <CardContent className="p-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="uppercase text-[10px] tracking-wider">
                          {suggestion.type}
                        </Badge>
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-0">
                          Lvl {suggestion.difficulty} Difficulty
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold font-display">{suggestion.title}</h3>
                      <p className="text-muted-foreground text-sm">{suggestion.description}</p>
                      <p className="text-xs text-indigo-500 font-medium italic">Why: {suggestion.reason}</p>
                    </div>
                    
                    <Button 
                      onClick={() => handleAcceptHabit(suggestion, idx)} 
                      className="shrink-0 rounded-xl"
                      variant={acceptedItems.has(idx) ? "secondary" : "outline"}
                      disabled={acceptedItems.has(idx)}
                      data-testid={`button-accept-habit-${idx}`}
                    >
                      {acceptedItems.has(idx) ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Added
                        </>
                      ) : (
                        <>
                          Accept Quest <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {mode === "goal" && generatedGoal && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="border-indigo-500/30 shadow-lg overflow-hidden bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-indigo-500 hover:bg-indigo-600">
                            Long-term Goal
                          </Badge>
                          <Badge variant="secondary" className={cn(
                            "border-0",
                            generatedGoal.difficulty === 1 && "bg-green-500/10 text-green-600",
                            generatedGoal.difficulty === 2 && "bg-yellow-500/10 text-yellow-600",
                            generatedGoal.difficulty === 3 && "bg-red-500/10 text-red-600"
                          )}>
                            {generatedGoal.difficulty === 1 ? "Easy" : generatedGoal.difficulty === 2 ? "Medium" : "Hard"}
                          </Badge>
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                            +{generatedGoal.xpReward} XP
                          </Badge>
                        </div>
                        <h2 className="text-2xl font-bold font-display">{generatedGoal.title}</h2>
                        <p className="text-muted-foreground">{generatedGoal.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <ListChecks className="w-4 h-4" />
                      <span>7 Steps to Success</span>
                    </div>
                    
                    <div className="space-y-3">
                      {generatedGoal.steps.map((step, idx) => (
                        <div 
                          key={step.id} 
                          className="bg-background/80 rounded-xl p-4 border border-border/50"
                          data-testid={`goal-step-${idx}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-indigo-600">{idx + 1}</span>
                            </div>
                            <div className="flex-1 space-y-1">
                              <p className="font-medium">{step.title}</p>
                              {step.suggestedHabit && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Zap className="w-3 h-3 text-amber-500" />
                                  Suggested habit: <span className="text-foreground font-medium">{step.suggestedHabit}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4 flex justify-center">
                      <Button
                        size="lg"
                        onClick={handleAddGoal}
                        disabled={goalAdded || createGoalMutation.isPending}
                        className={cn(
                          "rounded-xl shadow-lg transition-all",
                          goalAdded 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/25 hover:shadow-indigo-500/40"
                        )}
                        data-testid="button-add-goal"
                      >
                        {goalAdded ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Added to My Goals
                          </>
                        ) : createGoalMutation.isPending ? (
                          "Adding..."
                        ) : (
                          <>
                            <Target className="w-5 h-5 mr-2" />
                            Add to My Goals
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
