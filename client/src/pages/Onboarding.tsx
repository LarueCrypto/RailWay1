import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Sword, Wand2, Eye, BookOpen, User, Check,
  ArrowRight, ArrowLeft, Sparkles, Crown,
  Moon, Sun, Book, Quote, Flame, Target, Heart,
  Briefcase, Palette, Brain, Dumbbell, Users, 
  Zap, Compass, MessageCircle, Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProfile } from "@shared/schema";

const AVATAR_STYLES = [
  { id: "warrior", name: "Warrior", icon: Sword, description: "Strength and discipline" },
  { id: "mage", name: "Mage", icon: Wand2, description: "Knowledge and wisdom" },
  { id: "rogue", name: "Rogue", icon: Eye, description: "Speed and adaptability" },
  { id: "sage", name: "Sage", icon: BookOpen, description: "Balance and insight" },
];

const PHILOSOPHY_TRADITIONS = [
  { id: "esoteric", name: "Esoteric/Hermetic", icon: Eye, description: "Ancient mystery traditions" },
  { id: "biblical", name: "Biblical", icon: Book, description: "Christian scripture wisdom" },
  { id: "quranic", name: "Quranic", icon: Quote, description: "Islamic spiritual guidance" },
  { id: "metaphysical", name: "Metaphysical", icon: Sparkles, description: "New Thought principles" },
  { id: "philosophy", name: "Ancient Philosophy", icon: BookOpen, description: "Greek and Roman wisdom" },
];

const FOCUS_AREAS = [
  { id: "health", name: "Health & Fitness", icon: Dumbbell, description: "Physical wellbeing" },
  { id: "career", name: "Career & Finance", icon: Briefcase, description: "Professional growth" },
  { id: "relationships", name: "Relationships", icon: Heart, description: "Connections with others" },
  { id: "creativity", name: "Creativity", icon: Palette, description: "Artistic expression" },
  { id: "mindfulness", name: "Mindfulness", icon: Brain, description: "Mental clarity" },
  { id: "learning", name: "Learning", icon: BookOpen, description: "Knowledge acquisition" },
];

const CHALLENGE_APPROACHES = [
  { id: "discipline", name: "Discipline", icon: Sword, description: "Consistent daily action" },
  { id: "strategy", name: "Strategy", icon: Compass, description: "Careful planning" },
  { id: "community", name: "Community", icon: Users, description: "Support from others" },
  { id: "reflection", name: "Reflection", icon: Lightbulb, description: "Self-analysis" },
  { id: "action", name: "Bold Action", icon: Zap, description: "Decisive moves" },
];

const GENDER_OPTIONS = [
  { id: "male", label: "Male" },
  { id: "female", label: "Female" },
  { id: "neutral", label: "Prefer not to say" },
];

interface MultiSelectCardProps {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  selected: boolean;
  onToggle: () => void;
  testId: string;
}

function MultiSelectCard({ id, name, icon: Icon, description, selected, onToggle, testId }: MultiSelectCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      data-testid={testId}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 w-full",
        selected 
          ? "border-yellow-500 bg-yellow-500/10" 
          : "border-border hover-elevate"
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-black" />
        </div>
      )}
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center mb-2",
        selected ? "bg-yellow-500/20" : "bg-muted"
      )}>
        <Icon className={cn("w-6 h-6", selected ? "text-yellow-500" : "text-muted-foreground")} />
      </div>
      <span className={cn("font-semibold text-sm", selected ? "text-yellow-500" : "")}>
        {name}
      </span>
      <span className="text-xs text-muted-foreground text-center mt-1">
        {description}
      </span>
    </button>
  );
}

export default function Onboarding() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: "",
    gender: "neutral",
    avatarStyle: "warrior",
    philosophyTraditions: [] as string[],
    focusAreas: [] as string[],
    challengeApproaches: [] as string[],
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  const handleComplete = async () => {
    await updateProfileMutation.mutateAsync({
      ...formData,
      philosophyTradition: formData.philosophyTraditions[0] || "esoteric",
      onboardingCompleted: true,
    });
    navigate("/");
  };

  const toggleArrayItem = (field: 'philosophyTraditions' | 'focusAreas' | 'challengeApproaches', id: string) => {
    const current = formData[field];
    if (current.includes(id)) {
      setFormData({ ...formData, [field]: current.filter(item => item !== id) });
    } else {
      setFormData({ ...formData, [field]: [...current, id] });
    }
  };

  const totalSteps = 5;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-yellow-500/30 bg-card/95">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                    <Crown className="w-10 h-10 text-yellow-500" />
                  </div>
                  <CardTitle className="text-3xl">Welcome, Warrior</CardTitle>
                  <CardDescription className="text-lg">
                    Every legend starts with a single step. You're about to embark on a journey 
                    of transformation—one habit, one goal, one day at a time.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="displayName">What should we call you?</Label>
                    <Input
                      id="displayName"
                      data-testid="input-display-name"
                      placeholder="Enter your name"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      className="text-lg h-12"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Gender (for personalized quotes)</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      className="flex flex-wrap gap-3"
                    >
                      {GENDER_OPTIONS.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value={option.id} 
                            id={option.id}
                            data-testid={`radio-gender-${option.id}`}
                          />
                          <Label htmlFor={option.id} className="cursor-pointer">{option.label}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    This will take about 3 minutes
                  </p>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={() => setStep(2)}
                      disabled={!formData.displayName.trim()}
                      data-testid="button-next-step-1"
                    >
                      Begin Your Journey <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-yellow-500/30 bg-card/95">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Target className="w-10 h-10 text-purple-400" />
                  </div>
                  <CardTitle className="text-2xl">What's Your Focus?</CardTitle>
                  <CardDescription>
                    Select all the areas you want to improve. Your AI coach will tailor suggestions accordingly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {FOCUS_AREAS.map((area) => (
                      <MultiSelectCard
                        key={area.id}
                        {...area}
                        selected={formData.focusAreas.includes(area.id)}
                        onToggle={() => toggleArrayItem('focusAreas', area.id)}
                        testId={`checkbox-focus-${area.id}`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Select at least one area to continue
                  </p>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)} data-testid="button-back-step-2">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      onClick={() => setStep(3)}
                      disabled={formData.focusAreas.length === 0}
                      data-testid="button-next-step-2"
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-yellow-500/30 bg-card/95">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                    <Sword className="w-10 h-10 text-orange-400" />
                  </div>
                  <CardTitle className="text-2xl">How Do You Face Challenges?</CardTitle>
                  <CardDescription>
                    Select all approaches that resonate with you. This helps personalize your journey.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CHALLENGE_APPROACHES.map((approach) => (
                      <MultiSelectCard
                        key={approach.id}
                        {...approach}
                        selected={formData.challengeApproaches.includes(approach.id)}
                        onToggle={() => toggleArrayItem('challengeApproaches', approach.id)}
                        testId={`checkbox-approach-${approach.id}`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Select at least one approach to continue
                  </p>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)} data-testid="button-back-step-3">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      onClick={() => setStep(4)}
                      disabled={formData.challengeApproaches.length === 0}
                      data-testid="button-next-step-3"
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-yellow-500/30 bg-card/95">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <Quote className="w-10 h-10 text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl">Choose Your Wisdom Sources</CardTitle>
                  <CardDescription>
                    Select all traditions you'd like to receive daily quotes from.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {PHILOSOPHY_TRADITIONS.map((tradition) => {
                      const Icon = tradition.icon;
                      const isSelected = formData.philosophyTraditions.includes(tradition.id);
                      return (
                        <button
                          key={tradition.id}
                          type="button"
                          onClick={() => toggleArrayItem('philosophyTraditions', tradition.id)}
                          data-testid={`checkbox-tradition-${tradition.id}`}
                          className={cn(
                            "relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 w-full text-left",
                            isSelected 
                              ? "border-yellow-500 bg-yellow-500/10" 
                              : "border-border hover-elevate"
                          )}
                        >
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-black" />
                            </div>
                          )}
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                            isSelected ? "bg-yellow-500/20" : "bg-muted"
                          )}>
                            <Icon className={cn("w-6 h-6", isSelected ? "text-yellow-500" : "text-muted-foreground")} />
                          </div>
                          <div>
                            <span className={cn("font-semibold block", isSelected ? "text-yellow-500" : "")}>
                              {tradition.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {tradition.description}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-sm text-muted-foreground text-center">
                    Select at least one tradition to continue
                  </p>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(3)} data-testid="button-back-step-4">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      onClick={() => setStep(5)}
                      disabled={formData.philosophyTraditions.length === 0}
                      data-testid="button-next-step-4"
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-yellow-500/30 bg-card/95">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                    <Flame className="w-10 h-10 text-yellow-500" />
                  </div>
                  <CardTitle className="text-2xl">Your Journey Begins</CardTitle>
                  <CardDescription>
                    You're ready to start your transformation, {formData.displayName}!
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{formData.displayName}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Target className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Focus Areas:</span>
                      <span className="font-medium flex-1">
                        {formData.focusAreas.map(id => 
                          FOCUS_AREAS.find(a => a.id === id)?.name
                        ).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Sword className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Approach:</span>
                      <span className="font-medium flex-1">
                        {formData.challengeApproaches.map(id => 
                          CHALLENGE_APPROACHES.find(a => a.id === id)?.name
                        ).join(", ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Quote className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">Wisdom:</span>
                      <span className="font-medium flex-1">
                        {formData.philosophyTraditions.map(id => 
                          PHILOSOPHY_TRADITIONS.find(t => t.id === id)?.name
                        ).join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Your AI coach will use these preferences to personalize suggestions.
                    You can change these anytime in settings.
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(4)} data-testid="button-back-step-5">
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>
                    <Button 
                      onClick={handleComplete}
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                      data-testid="button-start-journey"
                    >
                      {updateProfileMutation.isPending ? "Starting..." : "Start My Journey"} 
                      <Sparkles className="ml-2 w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i + 1 === step 
                  ? 'w-8 bg-yellow-500' 
                  : i + 1 < step 
                    ? 'w-2 bg-yellow-500/50' 
                    : 'w-2 bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
