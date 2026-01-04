import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Zap, Flame, Trophy, Star, Crown, Award, Shield, Target, Medal, 
  BookOpen, Sparkles, Lock, Sword, Brain, Heart, Eye, Coins, Search,
  Filter, ArrowUpDown, CheckCircle, RotateCcw, Layers, Calendar, Sunrise,
  Moon, TrendingUp, Activity, Clock, Timer, Dumbbell, Scale, CalendarDays,
  Bell, Palette, FileText, Power, ListChecks, Mountain, Link as LinkIcon, Rocket,
  Hourglass, ListPlus, Grid, User, PenTool, Upload, Library as LibraryIcon,
  MessageSquare, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Achievement, UserStats, UserProfile } from "@shared/schema";
import { getRankForLevel, STAT_METADATA, ACHIEVEMENT_TIER_COLORS } from "@shared/gameplay";

const iconMap: Record<string, any> = {
  Zap, Flame, Trophy, Star, Crown, Award, Shield, Target, Medal, BookOpen, Sparkles,
  Sword, Brain, Heart, Eye, Check: CheckCircle, RotateCcw, Layers, Calendar, Sunrise,
  Moon, TrendingUp, Activity, Clock, CheckCircle, Timer, Dumbbell, Scale, CalendarDays,
  Bell, Palette, FileText, Power, ListChecks, Mountain, Link: LinkIcon, Rocket,
  Hourglass, ListPlus, Grid, User, UserCircle: User, PenTool, Upload, Library: LibraryIcon,
  GraduationCap: BookOpen, Briefcase: Target, ArrowUpRight: TrendingUp, Repeat: RotateCcw,
  LogIn: User, MessageSquare
};

const statIconMap: Record<string, any> = {
  Sword, Brain, Heart, Zap, Eye, Flame
};

type FilterType = "all" | "unlocked" | "locked" | "bronze" | "silver" | "gold" | "platinum" | "legendary";
type SortType = "recent" | "rarity" | "xp" | "alphabetical";

const TIER_ORDER = ["bronze", "silver", "gold", "platinum", "legendary", "mythic"];

function StatBar({ 
  stat, 
  value, 
  index 
}: { 
  stat: keyof typeof STAT_METADATA; 
  value: number; 
  index: number;
}) {
  const meta = STAT_METADATA[stat];
  const Icon = statIconMap[meta.icon] || Zap;
  const percentage = Math.min(100, value);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-6 h-6 rounded flex items-center justify-center", meta.bgColor)}>
            <Icon className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-sm">{meta.label}</span>
        </div>
        <span className={cn("font-bold text-lg font-display", meta.color)}>{value}</span>
      </div>
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
          className={cn("h-full rounded-full", meta.bgColor)}
        />
      </div>
    </motion.div>
  );
}

function AchievementCard({ 
  achievement, 
  index, 
  onClick 
}: { 
  achievement: Achievement; 
  index: number;
  onClick: () => void;
}) {
  const Icon = iconMap[achievement.icon] || Star;
  const isUnlocked = !!achievement.unlockedAt;
  const tier = achievement.tier || "bronze";
  const tierColors = ACHIEVEMENT_TIER_COLORS[tier as keyof typeof ACHIEVEMENT_TIER_COLORS] || ACHIEVEMENT_TIER_COLORS.bronze;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
      layout
    >
      <Card 
        className={cn(
          "p-3 h-full flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover-elevate",
          isUnlocked 
            ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-700/50" 
            : "opacity-60 grayscale hover:opacity-80 hover:grayscale-0"
        )}
        onClick={onClick}
        data-testid={`card-achievement-${achievement.id}`}
      >
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mb-2 relative",
          isUnlocked 
            ? cn("bg-gradient-to-br shadow-lg", tierColors.bg)
            : "bg-muted"
        )}>
          {isUnlocked ? (
            <Icon className="w-5 h-5 text-white" />
          ) : (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
          {isUnlocked && achievement.specialPower && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-yellow-900" />
            </div>
          )}
        </div>
        
        <h3 className={cn(
          "font-display font-bold text-xs mb-1 line-clamp-1",
          isUnlocked ? "text-foreground" : "text-muted-foreground"
        )}>
          {achievement.title}
        </h3>
        
        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2 leading-tight">
          {achievement.description}
        </p>
        
        <div className="mt-auto flex items-center gap-1 flex-wrap justify-center">
          <Badge 
            variant="secondary" 
            className={cn("text-[10px] px-1.5 py-0", tierColors.bg, tierColors.text)}
          >
            {tier}
          </Badge>
          <Badge 
            variant={isUnlocked ? "default" : "secondary"} 
            className={cn(
              "text-[10px] px-1.5 py-0",
              isUnlocked && "bg-yellow-500 hover:bg-yellow-600 text-yellow-950"
            )}
          >
            +{achievement.xpReward} XP
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
}

function AchievementDetailModal({ 
  achievement, 
  onClose 
}: { 
  achievement: Achievement | null; 
  onClose: () => void;
}) {
  if (!achievement) return null;
  
  const Icon = iconMap[achievement.icon] || Star;
  const isUnlocked = !!achievement.unlockedAt;
  const tier = achievement.tier || "bronze";
  const tierColors = ACHIEVEMENT_TIER_COLORS[tier as keyof typeof ACHIEVEMENT_TIER_COLORS] || ACHIEVEMENT_TIER_COLORS.bronze;

  return (
    <Dialog open={!!achievement} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center",
              isUnlocked ? cn("bg-gradient-to-br", tierColors.bg) : "bg-muted"
            )}>
              {isUnlocked ? (
                <Icon className="w-5 h-5 text-white" />
              ) : (
                <Lock className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <span>{achievement.title}</span>
              <Badge className={cn("ml-2 text-xs", tierColors.bg, tierColors.text)}>
                {tier}
              </Badge>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">{achievement.description}</p>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              +{achievement.xpReward} XP
            </Badge>
            {achievement.goldReward && achievement.goldReward > 0 && (
              <Badge variant="outline" className="gap-1">
                <Coins className="w-3 h-3 text-yellow-500" />
                +{achievement.goldReward} Gold
              </Badge>
            )}
          </div>
          
          {achievement.statBonus && (
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-sm font-medium mb-1">Stat Bonus</p>
              <p className="text-sm text-muted-foreground">
                +{(achievement.statBonus as any).amount} {(achievement.statBonus as any).stat}
              </p>
            </div>
          )}
          
          {achievement.specialPower && (
            <div className="p-3 rounded-lg bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm font-medium mb-1 flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-600" />
                Special Power
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {achievement.specialPower}
              </p>
            </div>
          )}
          
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
          
          {!isUnlocked && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Complete the requirements to unlock this achievement
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LevelMilestone({ level, currentLevel }: { level: number; currentLevel: number }) {
  const achieved = currentLevel >= level;
  const milestones: Record<number, { title: string; reward: string }> = {
    5: { title: "Rising Star", reward: "Unlocks custom themes" },
    10: { title: "Seasoned Adventurer", reward: "Bonus XP multiplier" },
    25: { title: "Elite Champion", reward: "Priority suggestions" },
    50: { title: "Legendary Hero", reward: "Exclusive badge" },
    75: { title: "Mythic Master", reward: "Gold profile border" },
    100: { title: "Ultimate Legend", reward: "All features unlocked" },
  };

  const milestone = milestones[level];
  if (!milestone) return null;

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-xl transition-all",
      achieved 
        ? "bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30" 
        : "bg-muted/50"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
        achieved 
          ? "bg-yellow-500 text-yellow-950" 
          : "bg-muted text-muted-foreground"
      )}>
        {level}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-semibold text-sm truncate",
          achieved ? "text-foreground" : "text-muted-foreground"
        )}>
          {milestone.title}
        </h4>
        <p className="text-xs text-muted-foreground truncate">{milestone.reward}</p>
      </div>
      {achieved && (
        <Badge className="bg-green-500 hover:bg-green-600 shrink-0">Done</Badge>
      )}
    </div>
  );
}

export default function Rewards() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const { data: stats } = useQuery<UserStats>({
    queryKey: ["/api/stats"],
  });

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
  });

  const currentLevel = stats?.level || 1;
  const currentXp = stats?.currentXp || 0;
  const totalXp = stats?.totalXp || 0;
  const xpToNextLevel = 500 + currentLevel * 500;
  const progressPercent = Math.round((currentXp / xpToNextLevel) * 100);
  const rank = getRankForLevel(currentLevel);

  const filteredAndSortedAchievements = useMemo(() => {
    let result = [...achievements];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(query) || 
        a.description.toLowerCase().includes(query)
      );
    }
    
    switch (filter) {
      case "unlocked":
        result = result.filter(a => !!a.unlockedAt);
        break;
      case "locked":
        result = result.filter(a => !a.unlockedAt);
        break;
      case "bronze":
      case "silver":
      case "gold":
      case "platinum":
      case "legendary":
        result = result.filter(a => a.tier === filter);
        break;
    }
    
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => {
          if (a.unlockedAt && b.unlockedAt) {
            return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
          }
          if (a.unlockedAt) return -1;
          if (b.unlockedAt) return 1;
          return 0;
        });
        break;
      case "rarity":
        result.sort((a, b) => {
          const aIndex = TIER_ORDER.indexOf(a.tier || "bronze");
          const bIndex = TIER_ORDER.indexOf(b.tier || "bronze");
          return bIndex - aIndex;
        });
        break;
      case "xp":
        result.sort((a, b) => (b.xpReward || 0) - (a.xpReward || 0));
        break;
      case "alphabetical":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    
    return result;
  }, [achievements, filter, sortBy, searchQuery]);

  const unlockedCount = achievements.filter(a => a.unlockedAt).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const achievementXp = achievements.filter(a => a.unlockedAt).reduce((sum, a) => sum + (a.xpReward || 0), 0);

  const tierCounts = useMemo(() => {
    const counts: Record<string, { unlocked: number; total: number }> = {};
    TIER_ORDER.forEach(tier => {
      counts[tier] = { unlocked: 0, total: 0 };
    });
    achievements.forEach(a => {
      const tier = a.tier || "bronze";
      if (counts[tier]) {
        counts[tier].total++;
        if (a.unlockedAt) counts[tier].unlocked++;
      }
    });
    return counts;
  }, [achievements]);

  const playerStats = {
    strength: stats?.strength || 0,
    intelligence: stats?.intelligence || 0,
    vitality: stats?.vitality || 0,
    agility: stats?.agility || 0,
    sense: stats?.sense || 0,
    willpower: stats?.willpower || 0,
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Player Status</h1>
          <p className="text-muted-foreground mt-1">Your progression and achievements</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{unlockedCount}</p>
                <p className="text-sm text-muted-foreground">/ {totalCount} Unlocked</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{achievementXp.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Achievement XP</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold font-display">{completionPercent}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-white border-slate-700">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-primary/30">
                  <span className="text-2xl font-display font-bold text-white">
                    {currentLevel}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg">{profile?.displayName || "Hunter"}</h3>
                <Badge className={cn("mt-1 border-0", rank.color.replace('text-', 'bg-').replace('-400', '-500/20'), rank.color)}>
                  {rank.title}
                </Badge>
                
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">XP Progress</span>
                    <span>{currentXp} / {xpToNextLevel}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
                
                <div className="mt-4 flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-lg">{(stats?.currentGold || 0).toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3">Tier Progress</h3>
              <div className="space-y-2">
                {TIER_ORDER.map(tier => {
                  const colors = ACHIEVEMENT_TIER_COLORS[tier as keyof typeof ACHIEVEMENT_TIER_COLORS];
                  const data = tierCounts[tier];
                  return (
                    <div key={tier} className="flex items-center gap-2">
                      <Badge className={cn("text-xs capitalize w-16 justify-center", colors.bg, colors.text)}>
                        {tier}
                      </Badge>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full", colors.bg)}
                          style={{ width: `${data.total > 0 ? (data.unlocked / data.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-12 text-right">
                        {data.unlocked}/{data.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Sword className="w-4 h-4 text-primary" />
                Player Stats
              </h3>
              <div className="space-y-3">
                {(Object.keys(STAT_METADATA) as Array<keyof typeof STAT_METADATA>).map((stat, idx) => (
                  <StatBar key={stat} stat={stat} value={playerStats[stat]} index={idx} />
                ))}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-3 flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h2 className="text-lg font-display font-bold flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Achievements
                  </h2>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-40"
                        data-testid="input-achievement-search"
                      />
                    </div>
                    
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortType)}>
                      <SelectTrigger className="w-36" data-testid="select-achievement-sort">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="rarity">Rarity</SelectItem>
                        <SelectItem value="xp">XP Reward</SelectItem>
                        <SelectItem value="alphabetical">A-Z</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  {[
                    { key: "all", label: `All (${totalCount})` },
                    { key: "unlocked", label: `Unlocked (${unlockedCount})` },
                    { key: "locked", label: `Locked (${totalCount - unlockedCount})` },
                    { key: "legendary", label: "Legendary" },
                    { key: "platinum", label: "Platinum" },
                  ].map(({ key, label }) => (
                    <Button
                      key={key}
                      size="sm"
                      variant={filter === key ? "default" : "outline"}
                      onClick={() => setFilter(key as FilterType)}
                      data-testid={`button-filter-${key}`}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
              
              <ScrollArea className="flex-1 p-4" style={{ height: "calc(100vh - 450px)", minHeight: "400px" }}>
                <AnimatePresence mode="popLayout">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredAndSortedAchievements.map((achievement, index) => (
                      <AchievementCard 
                        key={achievement.id} 
                        achievement={achievement} 
                        index={index}
                        onClick={() => setSelectedAchievement(achievement)}
                      />
                    ))}
                  </div>
                </AnimatePresence>
                
                {filteredAndSortedAchievements.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No achievements found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                )}
              </ScrollArea>
              
              <div className="p-3 border-t bg-muted/30 text-sm text-muted-foreground shrink-0">
                Viewing {filteredAndSortedAchievements.length} of {totalCount} achievements
              </div>
            </Card>
          </div>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Level Milestones
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[5, 10, 25, 50, 75, 100].map(level => (
              <LevelMilestone key={level} level={level} currentLevel={currentLevel} />
            ))}
          </div>
        </Card>
      </div>

      <AchievementDetailModal 
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}
