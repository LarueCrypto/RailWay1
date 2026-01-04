import { motion } from "framer-motion";

interface XpBarProps {
  current: number;
  total: number; // XP needed for next level
  level: number;
}

export function XpBar({ current, total, level }: XpBarProps) {
  // Progressive leveling: Level 1→2 needs 1000 XP, each level adds +500 more
  // Formula: 1000 + (level - 1) * 500 = 500 + level * 500
  const xpForNextLevel = 500 + level * 500;
  const percentage = Math.min(100, Math.max(0, (current / xpForNextLevel) * 100));

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end text-sm">
        <span className="font-bold text-black drop-shadow-lg" style={{textShadow: '0 0 12px rgba(255,215,0,0.9), 0 0 20px rgba(255,215,0,0.6), 0 0 30px rgba(255,215,0,0.4)'}}>Level {level}</span>
        <span className="text-white drop-shadow-lg" style={{textShadow: '0 0 8px rgba(255,255,255,0.95)'}} >{current} / {xpForNextLevel} XP</span>
      </div>
      <div className="h-3 md:h-4 w-full bg-muted rounded-full overflow-hidden shadow-inner relative">
        <motion.div 
          className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Shine effect */}
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
