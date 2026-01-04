import { useState } from "react";
import { useHabits, useCreateHabit } from "@/hooks/use-habits";
import { HabitCard } from "@/components/HabitCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ListTodo, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHabitSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrequencySelector, FrequencyBadge } from "@/components/FrequencySelector";

const formSchema = insertHabitSchema.pick({
  name: true,
  category: true,
  priority: true,
  color: true,
  frequency: true,
  frequencyDays: true,
  customInterval: true,
  reminderTime: true,
  reminderEnabled: true,
});

export default function Habits() {
  const { data: habits, isLoading } = useHabits();
  const [open, setOpen] = useState(false);
  const createMutation = useCreateHabit();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "health",
      priority: false,
      color: "bg-blue-500",
      frequency: "daily",
      frequencyDays: [],
      customInterval: 1,
      reminderTime: "09:00",
      reminderEnabled: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createMutation.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  }

  const activeHabits = habits?.filter(h => !h.completedToday) || [];
  const completedHabits = habits?.filter(h => h.completedToday) || [];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Daily Quests</h1>
            <p className="text-muted-foreground mt-1">Consistency is the key to victory.</p>
          </div>
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-xl shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5 mr-2" />
                New Quest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-2xl">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">Create New Habit</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Habit Name</Label>
                        <FormControl>
                          <Input placeholder="e.g. Read 10 pages" {...field} className="rounded-xl" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Category</Label>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="rounded-xl" data-testid="select-category">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="health">Health</SelectItem>
                            <SelectItem value="fitness">Fitness</SelectItem>
                            <SelectItem value="learning">Learning</SelectItem>
                            <SelectItem value="mindfulness">Mindfulness</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-muted/50 rounded-xl p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">AI-Assigned Difficulty:</span> The difficulty and XP reward will be automatically determined based on your habit.
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>Easy habits earn 100 XP</li>
                      <li>Medium habits earn 200 XP</li>
                      <li>Hard habits earn 300 XP</li>
                    </ul>
                  </div>

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <Label>Priority Quest</Label>
                          <p className="text-sm text-muted-foreground">
                            Mark this as a high priority habit.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className="rounded-xl border p-4 space-y-3">
                    <Label className="text-base font-medium">Schedule & Reminders</Label>
                    <FrequencySelector
                      frequency={form.watch("frequency") || "daily"}
                      frequencyDays={form.watch("frequencyDays") || []}
                      customInterval={form.watch("customInterval") || 1}
                      reminderTime={form.watch("reminderTime") || "09:00"}
                      reminderEnabled={form.watch("reminderEnabled") ?? false}
                      onFrequencyChange={(val) => form.setValue("frequency", val)}
                      onFrequencyDaysChange={(val) => form.setValue("frequencyDays", val)}
                      onCustomIntervalChange={(val) => form.setValue("customInterval", val)}
                      onReminderTimeChange={(val) => form.setValue("reminderTime", val)}
                      onReminderEnabledChange={(val) => form.setValue("reminderEnabled", val)}
                      compact
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <Label>Theme Color</Label>
                        <div className="flex gap-2 mt-2">
                          {['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-cyan-500', 'bg-rose-500'].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => field.onChange(color)}
                              className={cn(
                                "w-8 h-8 rounded-full transition-all",
                                color.replace('bg-', 'bg-'),
                                field.value === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                              )}
                              style={{ backgroundColor: `var(--${color.replace('bg-', '')})` }} 
                            >
                              <div className={cn("w-full h-full rounded-full", color)} />
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full rounded-xl mt-4" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Quest"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-xl mb-6">
              <TabsTrigger value="active" className="rounded-lg">
                <ListTodo className="w-4 h-4 mr-2" />
                Active ({activeHabits.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="rounded-lg">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed ({completedHabits.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
              {activeHabits.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                  <p className="text-muted-foreground">All quests completed! Great job!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedHabits.map((habit) => (
                <HabitCard key={habit.id} habit={habit} />
              ))}
              {completedHabits.length === 0 && (
                <div className="text-center py-12 bg-muted/30 rounded-3xl border border-dashed border-muted-foreground/20">
                  <p className="text-muted-foreground">No completed quests yet today.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
