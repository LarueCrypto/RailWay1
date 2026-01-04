import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, CheckSquare, Target, BarChart2, Sparkles, FileText, Award, BookOpen, Settings, Coins, Flame, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { getXpForLevel, getLevelTier, getRankTitle } from "@shared/gameplay";
import type { UserProfile, UserStats } from "@shared/schema";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/habits", label: "Habits", icon: CheckSquare },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/rewards", label: "Rewards", icon: Award },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/coach", label: "AI Coach", icon: Sparkles, highlight: true },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const [location] = useLocation();
  
  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });
  
  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const level = stats?.level ?? 1;
  const currentXp = stats?.currentXp ?? 0;
  const xpForCurrentLevel = getXpForLevel(level);
  const xpProgress = Math.min((currentXp / xpForCurrentLevel) * 100, 100);
  const rankTitle = getRankTitle(level);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/50 nav-safe-bottom md:relative md:border-t-0 md:border-r md:w-64 md:min-h-[100dvh] md:bg-card md:flex md:flex-col md:p-4">
      <div className="hidden md:block mb-6">
        <div className="rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-yellow-500/20">
                {level}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-yellow-500 flex items-center justify-center">
                <Flame className="w-3 h-3 text-yellow-500" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-bold text-base truncate" data-testid="text-user-name">
                {profile?.displayName || "Hunter"}
              </h3>
              <p className="text-xs text-yellow-500 font-medium">{rankTitle}</p>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">XP Progress</span>
              <span className="text-yellow-500 font-medium">
                {currentXp.toLocaleString()} / {xpForCurrentLevel.toLocaleString()}
              </span>
            </div>
            <Progress value={xpProgress} className="h-2 bg-muted" />
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-yellow-500/10">
            <div className="flex items-center gap-1">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{stats?.currentGold?.toLocaleString() || 0}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Total: {stats?.totalXp?.toLocaleString() || 0} XP
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-around items-center h-14 md:flex-col md:h-auto md:space-y-1 md:items-stretch md:flex-1 overflow-x-auto scroll-touch-hide">
        {items.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col md:flex-row items-center justify-center md:justify-start gap-0.5 md:gap-3 min-w-[44px] min-h-[44px] p-1.5 md:px-4 md:py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary md:bg-primary/10 font-medium" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                item.highlight && !isActive && "text-accent hover:text-accent hover:bg-accent/10"
              )}
              data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", item.highlight ? "text-accent" : "")} />
              <span className="text-[9px] md:text-sm leading-tight truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
