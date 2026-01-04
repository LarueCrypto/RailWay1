// Rank titles based on level tiers
export const RANK_TIERS = [
  { minLevel: 1, maxLevel: 10, title: "Beginner", color: "text-gray-400" },
  { minLevel: 11, maxLevel: 25, title: "Novice Hunter", color: "text-green-400" },
  { minLevel: 26, maxLevel: 40, title: "Skilled Hunter", color: "text-blue-400" },
  { minLevel: 41, maxLevel: 60, title: "Elite Hunter", color: "text-purple-400" },
  { minLevel: 61, maxLevel: 80, title: "Master Hunter", color: "text-orange-400" },
  { minLevel: 81, maxLevel: 99, title: "S-Rank Hunter", color: "text-red-400" },
  { minLevel: 100, maxLevel: 999, title: "Shadow Monarch", color: "text-yellow-400" },
] as const;

export function getRankForLevel(level: number): { title: string; color: string } {
  const rank = RANK_TIERS.find(r => level >= r.minLevel && level <= r.maxLevel);
  return rank || { title: "Shadow Monarch", color: "text-yellow-400" };
}

export function getRankTitle(level: number): string {
  return getRankForLevel(level).title;
}

export function getLevelTier(level: number): string {
  return getRankForLevel(level).title;
}

// Progressive XP System: 5% compound increase per level
// Level 1 requires 1000 XP, Level 2 requires 1050 XP (1000 * 1.05), etc.
const BASE_XP = 1000;
const COMPOUND_RATE = 0.05;

export function getXpForLevel(level: number): number {
  if (level <= 1) return BASE_XP;
  return Math.floor(BASE_XP * Math.pow(1 + COMPOUND_RATE, level - 1));
}

export function getTotalXpForLevel(targetLevel: number): number {
  let total = 0;
  for (let i = 1; i < targetLevel; i++) {
    total += getXpForLevel(i);
  }
  return total;
}

export function getLevelFromTotalXp(totalXp: number): { level: number; currentXp: number; xpForNextLevel: number } {
  let level = 1;
  let remainingXp = totalXp;
  
  while (remainingXp >= getXpForLevel(level)) {
    remainingXp -= getXpForLevel(level);
    level++;
  }
  
  return {
    level,
    currentXp: remainingXp,
    xpForNextLevel: getXpForLevel(level)
  };
}

// Achievement tier colors
export const ACHIEVEMENT_TIER_COLORS = {
  bronze: { bg: "bg-amber-700", text: "text-amber-100", border: "border-amber-600" },
  silver: { bg: "bg-slate-400", text: "text-slate-900", border: "border-slate-300" },
  gold: { bg: "bg-yellow-500", text: "text-yellow-950", border: "border-yellow-400" },
  platinum: { bg: "bg-cyan-400", text: "text-cyan-950", border: "border-cyan-300" },
  legendary: { bg: "bg-purple-600", text: "text-purple-100", border: "border-purple-400" },
} as const;

// Habit frequency helpers
export const WEEKDAYS = [1, 2, 3, 4, 5]; // Mon-Fri
export const WEEKENDS = [0, 6]; // Sun, Sat
export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

export function getDayName(dayIndex: number): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return days[dayIndex] || "";
}

export function isHabitDueToday(frequency: string, frequencyDays: number[], customInterval?: number, lastCompletionDate?: string): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  switch (frequency) {
    case "daily":
      return true;
    case "weekdays":
      return WEEKDAYS.includes(dayOfWeek);
    case "weekends":
      return WEEKENDS.includes(dayOfWeek);
    case "specific":
      return frequencyDays.includes(dayOfWeek);
    case "custom":
      if (!customInterval || !lastCompletionDate) return true;
      const last = new Date(lastCompletionDate);
      const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= customInterval;
    default:
      return true;
  }
}

// Stat category mapping - which stats increase based on habit/goal categories
export const STAT_CATEGORY_MAP: Record<string, string> = {
  fitness: "strength",
  health: "vitality",
  learning: "intelligence",
  mindfulness: "sense",
  productivity: "agility",
  personal: "willpower",
  work: "intelligence",
  finance: "sense",
  social: "agility",
  creative: "intelligence",
};

export const STAT_METADATA = {
  strength: { label: "Strength", icon: "Sword", color: "text-red-500", bgColor: "bg-red-500" },
  intelligence: { label: "Intelligence", icon: "Brain", color: "text-blue-500", bgColor: "bg-blue-500" },
  vitality: { label: "Vitality", icon: "Heart", color: "text-green-500", bgColor: "bg-green-500" },
  agility: { label: "Agility", icon: "Zap", color: "text-yellow-500", bgColor: "bg-yellow-500" },
  sense: { label: "Sense", icon: "Eye", color: "text-purple-500", bgColor: "bg-purple-500" },
  willpower: { label: "Willpower", icon: "Flame", color: "text-orange-500", bgColor: "bg-orange-500" },
} as const;

export type StatType = keyof typeof STAT_METADATA;
