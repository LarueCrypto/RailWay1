import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navigation } from "@/components/Navigation";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Habits from "@/pages/Habits";
import Goals from "@/pages/Goals";
import Analytics from "@/pages/Analytics";
import AiCoach from "@/pages/AiCoach";
import Notes from "@/pages/Notes";
import Rewards from "@/pages/Rewards";
import PhilosophyLibrary from "@/pages/PhilosophyLibrary";
import Onboarding from "@/pages/Onboarding";
import Settings from "@/pages/Settings";
import Shop from "@/pages/Shop";
import type { UserProfile } from "@shared/schema";

function Router() {
  const [location] = useLocation();
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile?.onboardingCompleted && location !== "/onboarding") {
    return <Redirect to="/onboarding" />;
  }

  if (location === "/onboarding") {
    return <Onboarding />;
  }

  return (
    <div className="app-container flex min-h-[100dvh] bg-background text-foreground font-sans antialiased">
      <Navigation />
      <main className="flex-1 w-full md:ml-0 overflow-x-hidden scroll-touch-hide">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/habits" component={Habits} />
          <Route path="/goals" component={Goals} />
          <Route path="/notes" component={Notes} />
          <Route path="/rewards" component={Rewards} />
          <Route path="/shop" component={Shop} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/coach" component={AiCoach} />
          <Route path="/library" component={PhilosophyLibrary} />
          <Route path="/settings" component={Settings} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
