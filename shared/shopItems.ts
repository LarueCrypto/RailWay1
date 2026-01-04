export type ShopItemRarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "divine";
export type ShopItemCategory = "consumable" | "equipment" | "material" | "ability" | "cosmetic";
export type EquipmentSlot = "weapon" | "armor" | "ring" | "amulet" | "head";

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: ShopItemRarity;
  price: { gold: number; crystals?: number };
  effect?: {
    type: string;
    value?: number;
    duration?: number;
    stats?: string;
    uses?: number;
    quantity?: number;
    category?: string;
    difficulty?: string;
    frequency?: string;
    chance?: number;
    multiplier?: number;
    perHabit?: number;
    maxBonus?: number;
    xp?: number;
    gold?: number;
    choosable?: boolean;
  };
  stackable?: boolean;
  maxStack?: number;
  category: ShopItemCategory;
  slot?: EquipmentSlot;
  stats?: Partial<Record<string, number>>;
  permanent?: boolean;
  visual?: { type: string; color?: string };
  levelRequired?: number;
}

export const RARITY_COLORS: Record<ShopItemRarity, { bg: string; text: string; border: string; glow: string }> = {
  common: { bg: "bg-slate-500", text: "text-slate-100", border: "border-slate-400", glow: "" },
  uncommon: { bg: "bg-green-500", text: "text-green-100", border: "border-green-400", glow: "shadow-green-500/30" },
  rare: { bg: "bg-blue-500", text: "text-blue-100", border: "border-blue-400", glow: "shadow-blue-500/40" },
  epic: { bg: "bg-purple-500", text: "text-purple-100", border: "border-purple-400", glow: "shadow-purple-500/50" },
  legendary: { bg: "bg-orange-500", text: "text-orange-100", border: "border-orange-400", glow: "shadow-orange-500/60" },
  mythic: { bg: "bg-red-500", text: "text-red-100", border: "border-red-400", glow: "shadow-red-500/70" },
  divine: { bg: "bg-yellow-400", text: "text-yellow-950", border: "border-yellow-300", glow: "shadow-yellow-400/80" },
};

export const ALL_SHOP_ITEMS: ShopItem[] = [
  // CONSUMABLES - XP Boosters
  {
    id: "xp_boost_1h",
    name: "Lesser Mana Potion",
    description: "Doubles XP gains for 1 hour. The energy of a low-rank dungeon flows through you.",
    icon: "Flask",
    rarity: "common",
    price: { gold: 500 },
    effect: { type: "xp_multiplier", value: 2, duration: 3600 },
    stackable: true,
    maxStack: 99,
    category: "consumable",
  },
  {
    id: "xp_boost_6h",
    name: "Greater Mana Potion",
    description: "Doubles XP gains for 6 hours. Concentrated essence from B-Rank dungeons.",
    icon: "FlaskConical",
    rarity: "uncommon",
    price: { gold: 2500 },
    effect: { type: "xp_multiplier", value: 2, duration: 21600 },
    stackable: true,
    maxStack: 50,
    category: "consumable",
  },
  {
    id: "xp_boost_24h",
    name: "Elixir of Awakening",
    description: "Triples XP gains for 24 hours. A rare elixir that awakens your true potential.",
    icon: "Wine",
    rarity: "rare",
    price: { gold: 8000, crystals: 10 },
    effect: { type: "xp_multiplier", value: 3, duration: 86400 },
    stackable: true,
    maxStack: 10,
    category: "consumable",
  },
  {
    id: "xp_mega_boost",
    name: "Essence of the Monarch",
    description: "5x XP for 12 hours. The concentrated power of a Monarch flows through your veins.",
    icon: "Crown",
    rarity: "legendary",
    price: { gold: 50000, crystals: 100 },
    effect: { type: "xp_multiplier", value: 5, duration: 43200 },
    stackable: true,
    maxStack: 3,
    category: "consumable",
  },

  // CONSUMABLES - Gold Boosters
  {
    id: "gold_boost_1h",
    name: "Goblin's Lucky Coin",
    description: "Doubles gold earned for 1 hour. Even goblins know the value of wealth.",
    icon: "Coins",
    rarity: "common",
    price: { gold: 400 },
    effect: { type: "gold_multiplier", value: 2, duration: 3600 },
    stackable: true,
    maxStack: 99,
    category: "consumable",
  },
  {
    id: "gold_boost_24h",
    name: "Dragon's Hoard Blessing",
    description: "Triples gold earned for 24 hours. A dragon's greed becomes your fortune.",
    icon: "Flame",
    rarity: "epic",
    price: { gold: 10000, crystals: 15 },
    effect: { type: "gold_multiplier", value: 3, duration: 86400 },
    stackable: true,
    maxStack: 5,
    category: "consumable",
  },

  // CONSUMABLES - Streak Protectors
  {
    id: "streak_shield",
    name: "Shield of Perseverance",
    description: "Protects your streak from breaking once. Even hunters need a safety net.",
    icon: "Shield",
    rarity: "uncommon",
    price: { gold: 1000 },
    effect: { type: "streak_protection", uses: 1 },
    stackable: true,
    maxStack: 20,
    category: "consumable",
  },
  {
    id: "streak_shield_mega",
    name: "Barrier of the Unwavering",
    description: "Protects your streak from breaking 5 times. For those who refuse to fall.",
    icon: "ShieldCheck",
    rarity: "rare",
    price: { gold: 4000, crystals: 5 },
    effect: { type: "streak_protection", uses: 5 },
    stackable: true,
    maxStack: 5,
    category: "consumable",
  },

  // CONSUMABLES - Instant Completes
  {
    id: "instant_complete_habit",
    name: "Shadow Clone Scroll",
    description: "Instantly complete one habit. Your shadow does the work for you.",
    icon: "ScrollText",
    rarity: "rare",
    price: { gold: 3000, crystals: 5 },
    effect: { type: "instant_complete_habit", quantity: 1 },
    stackable: true,
    maxStack: 10,
    category: "consumable",
  },
  {
    id: "instant_complete_step",
    name: "Time Manipulation Crystal",
    description: "Instantly complete one goal step. Bend time to your will.",
    icon: "Timer",
    rarity: "epic",
    price: { gold: 8000, crystals: 20 },
    effect: { type: "instant_complete_step", quantity: 1 },
    stackable: true,
    maxStack: 5,
    category: "consumable",
  },

  // CONSUMABLES - Stat Boosters
  {
    id: "stat_boost_temp",
    name: "Essence of Strength",
    description: "+10 to all stats for 24 hours. Feel the power surge through you.",
    icon: "Dumbbell",
    rarity: "rare",
    price: { gold: 6000, crystals: 10 },
    effect: { type: "stat_boost_temp", stats: "all", value: 10, duration: 86400 },
    stackable: true,
    maxStack: 10,
    category: "consumable",
  },
  {
    id: "stat_boost_perm",
    name: "Eternal Growth Elixir",
    description: "Permanently increases one stat by 5. Choose your path wisely.",
    icon: "Sparkles",
    rarity: "legendary",
    price: { gold: 50000, crystals: 150 },
    effect: { type: "stat_boost_perm", value: 5, choosable: true },
    stackable: true,
    maxStack: 5,
    category: "consumable",
  },

  // EQUIPMENT - Weapons
  {
    id: "iron_dagger",
    name: "Iron Dagger of the Novice",
    description: "+5% XP for fitness goals. Your first real weapon.",
    icon: "Sword",
    rarity: "common",
    price: { gold: 2000 },
    effect: { type: "category_xp_boost", category: "fitness", value: 1.05 },
    slot: "weapon",
    stats: { strength: 5 },
    category: "equipment",
  },
  {
    id: "knights_sword",
    name: "Knight's Longsword",
    description: "+15% XP for fitness goals. A weapon worthy of a true warrior.",
    icon: "Swords",
    rarity: "uncommon",
    price: { gold: 8000, crystals: 10 },
    effect: { type: "category_xp_boost", category: "fitness", value: 1.15 },
    slot: "weapon",
    stats: { strength: 15, vitality: 5 },
    category: "equipment",
  },
  {
    id: "demons_dagger",
    name: "Demon King's Dagger",
    description: "+25% XP for all challenging goals. Forged in the depths of hell.",
    icon: "Sword",
    rarity: "legendary",
    price: { gold: 100000, crystals: 200 },
    effect: { type: "difficulty_xp_boost", difficulty: "challenging", value: 1.25 },
    slot: "weapon",
    stats: { strength: 30, agility: 20, willpower: 15 },
    category: "equipment",
    levelRequired: 50,
  },

  // EQUIPMENT - Armor
  {
    id: "leather_armor",
    name: "Hunter's Leather Armor",
    description: "Reduces habit difficulty by 5%. Lighter steps on your journey.",
    icon: "Shield",
    rarity: "common",
    price: { gold: 2500 },
    effect: { type: "difficulty_reduction", value: 0.05 },
    slot: "armor",
    stats: { vitality: 10 },
    category: "equipment",
  },
  {
    id: "knight_armor",
    name: "Knight's Plate Armor",
    description: "Streak shield activates automatically once per week.",
    icon: "ShieldHalf",
    rarity: "rare",
    price: { gold: 15000, crystals: 25 },
    effect: { type: "auto_streak_shield", frequency: "weekly" },
    slot: "armor",
    stats: { vitality: 25, willpower: 10 },
    category: "equipment",
    levelRequired: 25,
  },
  {
    id: "shadow_armor",
    name: "Armor of the Shadow Monarch",
    description: "Immune to streak breaks. The shadows protect you always.",
    icon: "Moon",
    rarity: "mythic",
    price: { gold: 500000, crystals: 1000 },
    effect: { type: "streak_immunity" },
    slot: "armor",
    stats: { vitality: 50, willpower: 50, sense: 30 },
    category: "equipment",
    levelRequired: 80,
  },

  // EQUIPMENT - Accessories
  {
    id: "ring_focus",
    name: "Ring of Focus",
    description: "+10% XP for learning goals. Clarity of mind brings power.",
    icon: "Circle",
    rarity: "uncommon",
    price: { gold: 5000, crystals: 5 },
    effect: { type: "category_xp_boost", category: "learning", value: 1.10 },
    slot: "ring",
    stats: { intelligence: 10 },
    category: "equipment",
  },
  {
    id: "amulet_wealth",
    name: "Amulet of Prosperity",
    description: "+20% gold from all sources. Wealth flows to you naturally.",
    icon: "Gem",
    rarity: "rare",
    price: { gold: 12000, crystals: 20 },
    effect: { type: "gold_multiplier_perm", value: 1.20 },
    slot: "amulet",
    stats: { sense: 15 },
    category: "equipment",
    levelRequired: 30,
  },
  {
    id: "crown_monarch",
    name: "Crown of the Eternal Monarch",
    description: "+50% XP and gold from all sources. Rule your domain.",
    icon: "Crown",
    rarity: "mythic",
    price: { gold: 1000000, crystals: 2500 },
    effect: { type: "all_multiplier", xp: 1.50, gold: 1.50 },
    slot: "head",
    stats: { strength: 40, intelligence: 40, vitality: 40, agility: 40, sense: 40, willpower: 60 },
    category: "equipment",
    levelRequired: 100,
  },

  // MATERIALS
  {
    id: "essence_common",
    name: "Essence Stone",
    description: "Common crafting material. The basic building block of power.",
    icon: "Diamond",
    rarity: "common",
    price: { gold: 100 },
    stackable: true,
    maxStack: 999,
    category: "material",
  },
  {
    id: "essence_rare",
    name: "Mana Crystal",
    description: "Rare crafting material. Pulsing with magical energy.",
    icon: "Gem",
    rarity: "rare",
    price: { gold: 1000, crystals: 2 },
    stackable: true,
    maxStack: 99,
    category: "material",
  },
  {
    id: "essence_legendary",
    name: "Shadow Fragment",
    description: "Legendary crafting material. A piece of the void itself.",
    icon: "Moon",
    rarity: "legendary",
    price: { gold: 25000, crystals: 50 },
    stackable: true,
    maxStack: 20,
    category: "material",
  },

  // ABILITIES
  {
    id: "ability_double_tap",
    name: "Double Impact",
    description: "Completing a habit has a 20% chance to count twice. Strike with precision.",
    icon: "Zap",
    rarity: "rare",
    price: { gold: 20000, crystals: 50 },
    effect: { type: "habit_double_chance", value: 0.20 },
    permanent: true,
    category: "ability",
    levelRequired: 20,
  },
  {
    id: "ability_chain_bonus",
    name: "Chain Mastery",
    description: "Each consecutive habit completion increases XP by 10% (max 50%). Build momentum.",
    icon: "Link",
    rarity: "epic",
    price: { gold: 40000, crystals: 100 },
    effect: { type: "chain_bonus", perHabit: 0.10, maxBonus: 0.50 },
    permanent: true,
    category: "ability",
    levelRequired: 35,
  },
  {
    id: "ability_critical_strike",
    name: "Critical Success",
    description: "10% chance to earn 5x XP on any action. Fortune favors the bold.",
    icon: "Target",
    rarity: "legendary",
    price: { gold: 100000, crystals: 250 },
    effect: { type: "critical_chance", chance: 0.10, multiplier: 5 },
    permanent: true,
    category: "ability",
    levelRequired: 50,
  },
  {
    id: "ability_shadow_soldiers",
    name: "Summon Shadow Soldiers",
    description: "Automatically complete one random habit per day. The shadows serve you.",
    icon: "Users",
    rarity: "mythic",
    price: { gold: 500000, crystals: 1000 },
    effect: { type: "auto_complete_daily", quantity: 1 },
    permanent: true,
    category: "ability",
    levelRequired: 75,
  },
  {
    id: "ability_arise",
    name: "Arise",
    description: "Once per week, automatically complete all habits. The ultimate power.",
    icon: "Sunrise",
    rarity: "divine",
    price: { gold: 2000000, crystals: 5000 },
    effect: { type: "auto_complete_all", frequency: "weekly" },
    permanent: true,
    category: "ability",
    levelRequired: 100,
  },

  // COSMETICS
  {
    id: "aura_blue",
    name: "Azure Aura",
    description: "Surrounds your profile with a blue aura. Style for the skilled.",
    icon: "Circle",
    rarity: "uncommon",
    price: { gold: 3000, crystals: 5 },
    visual: { type: "aura", color: "#3B82F6" },
    category: "cosmetic",
  },
  {
    id: "aura_purple",
    name: "Violet Veil",
    description: "A mystical purple aura surrounds your profile. Emanate power.",
    icon: "Circle",
    rarity: "rare",
    price: { gold: 8000, crystals: 15 },
    visual: { type: "aura", color: "#8B5CF6" },
    category: "cosmetic",
  },
  {
    id: "aura_gold",
    name: "Golden Radiance",
    description: "The legendary gold aura of champions. Show your wealth.",
    icon: "Circle",
    rarity: "legendary",
    price: { gold: 50000, crystals: 100 },
    visual: { type: "aura", color: "#F59E0B" },
    category: "cosmetic",
    levelRequired: 50,
  },
  {
    id: "aura_shadow",
    name: "Shadow Monarch's Aura",
    description: "The dark aura of the Shadow Monarch. Fear personified.",
    icon: "Moon",
    rarity: "mythic",
    price: { gold: 250000, crystals: 500 },
    visual: { type: "aura", color: "#1F2937" },
    category: "cosmetic",
    levelRequired: 90,
  },
  {
    id: "frame_gold",
    name: "Golden Frame",
    description: "A golden frame around your avatar. Elegance defined.",
    icon: "Frame",
    rarity: "epic",
    price: { gold: 25000, crystals: 50 },
    visual: { type: "frame", color: "#F59E0B" },
    category: "cosmetic",
    levelRequired: 40,
  },
  {
    id: "title_shadow_hunter",
    name: "Shadow Hunter Title",
    description: "Display 'Shadow Hunter' as your title. Walk the path of darkness.",
    icon: "Award",
    rarity: "epic",
    price: { gold: 30000, crystals: 75 },
    visual: { type: "title" },
    category: "cosmetic",
    levelRequired: 60,
  },
];

export function getItemsByCategory(category: ShopItemCategory): ShopItem[] {
  return ALL_SHOP_ITEMS.filter(item => item.category === category);
}

export function getItemById(id: string): ShopItem | undefined {
  return ALL_SHOP_ITEMS.find(item => item.id === id);
}

export function getAffordableItems(gold: number, crystals: number = 0): ShopItem[] {
  return ALL_SHOP_ITEMS.filter(item => 
    item.price.gold <= gold && (item.price.crystals || 0) <= crystals
  );
}
