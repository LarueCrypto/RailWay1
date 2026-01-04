import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/chat";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // health, fitness, learning, etc.
  difficulty: integer("difficulty").notNull().default(1), // 1=easy (50xp), 2=medium (100xp), 3=hard (300xp)
  xpReward: integer("xp_reward").notNull().default(50), // XP earned per completion
  difficultyRationale: text("difficulty_rationale"), // AI explanation for difficulty
  priority: boolean("priority").default(false),
  color: text("color").notNull().default("bg-blue-500"),
  frequency: text("frequency").default("daily"), // daily, weekdays, weekends, specific, custom
  frequencyDays: integer("frequency_days").array().default([]), // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  customInterval: integer("custom_interval"), // Every X days for custom frequency
  reminderTime: text("reminder_time"), // HH:MM format for notifications
  reminderEnabled: boolean("reminder_enabled").default(false),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").default("personal"),
  deadline: date("deadline"),
  progress: integer("progress").default(0), // 0-100
  difficulty: integer("difficulty").notNull().default(1), // 1=normal (1000xp), 2=medium (2000xp), 3=hard (3000xp)
  xpReward: integer("xp_reward").notNull().default(1000),
  completed: boolean("completed").default(false),
  priority: boolean("priority").default(false),
  steps: jsonb("steps").$type<GoalStep[]>().default([]),
  reminderEnabled: boolean("reminder_enabled").default(false),
  reminderDaysBefore: integer("reminder_days_before").default(1), // Reminder X days before deadline
  parentGoalId: integer("parent_goal_id"), // For progressive goal chains
  createdAt: timestamp("created_at").defaultNow(),
});

// User Profile for onboarding and preferences
export const userProfile = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  displayName: text("display_name").default("Hunter"),
  gender: text("gender").default("neutral"), // male, female, neutral
  avatarStyle: text("avatar_style").default("warrior"), // warrior, mage, rogue, sage
  timezone: text("timezone").default("America/Chicago"), // CST
  onboardingCompleted: boolean("onboarding_completed").default(false),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  dailyReminderTime: text("daily_reminder_time").default("09:00"), // HH:MM
  weeklyReportEnabled: boolean("weekly_report_enabled").default(true),
  philosophyTradition: text("philosophy_tradition").default("esoteric"), // primary wisdom tradition
  philosophyTraditions: text("philosophy_traditions").array().default([]), // multi-select wisdom traditions
  focusAreas: text("focus_areas").array().default([]), // multi-select: health, career, relationships, creativity, mindfulness, learning
  challengeApproaches: text("challenge_approaches").array().default([]), // multi-select: discipline, strategy, community, reflection, action
  createdAt: timestamp("created_at").defaultNow(),
});

export type GoalStep = {
  id: string;
  title: string;
  completed: boolean;
  suggestedHabit?: string;
};

export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: date("date").notNull(), // YYYY-MM-DD
  completed: boolean("completed").default(true),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  level: integer("level").default(1),
  currentXp: integer("current_xp").default(0),
  totalXp: integer("total_xp").default(0),
  lastLevelUp: timestamp("last_level_up"),
  // Player Stats (Solo Leveling inspired)
  strength: integer("strength").default(0),
  intelligence: integer("intelligence").default(0),
  vitality: integer("vitality").default(0),
  agility: integer("agility").default(0),
  sense: integer("sense").default(0),
  willpower: integer("willpower").default(0),
  // Gold Currency
  currentGold: integer("current_gold").default(0),
  lifetimeGold: integer("lifetime_gold").default(0),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").default(""),
  category: text("category").default("personal"), // personal, work, health, goals, ideas, learning
  tags: text("tags").array().default([]), // user-defined tags for context
  aiSummary: text("ai_summary"), // AI-generated summary of key points
  pinned: boolean("pinned").default(false),
  color: text("color").default("default"), // default, yellow, green, blue, purple
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(), // unique identifier like "first_habit", "level_10"
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // lucide icon name
  category: text("category").default("general"), // general, streaks, levels, habits, goals, special
  tier: text("tier").default("bronze"), // bronze, silver, gold, platinum, legendary
  xpReward: integer("xp_reward").default(50),
  goldReward: integer("gold_reward").default(0),
  statBonus: jsonb("stat_bonus").$type<{stat: string; amount: number}>(), // e.g. {stat: "strength", amount: 5}
  specialPower: text("special_power"), // Description of special unlocked ability
  unlockedAt: timestamp("unlocked_at"),
});

export const motivations = pgTable("motivations", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(), // The date this motivation is for (YYYY-MM-DD)
  quote: text("quote").notNull(),
  philosophy: text("philosophy").notNull(), // The philosophical explanation
  tradition: text("tradition").notNull(), // kemetic, samurai, biblical, quranic, esoteric, occult
  habitContext: text("habit_context"), // Which habits/goals this relates to
  createdAt: timestamp("created_at").defaultNow(),
});

// Player Inventory - purchased shop items
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull(), // shop item id
  quantity: integer("quantity").default(1),
  purchasedAt: timestamp("purchased_at").defaultNow(),
});

// Active Effects - temporary boosts currently active
export const activeEffects = pgTable("active_effects", {
  id: serial("id").primaryKey(),
  effectType: text("effect_type").notNull(), // xp_multiplier, gold_multiplier, etc.
  value: doublePrecision("value").notNull(), // multiplier value
  expiresAt: timestamp("expires_at").notNull(),
  itemId: text("item_id"), // source shop item
  createdAt: timestamp("created_at").defaultNow(),
});

// Philosophy Library - uploaded documents for AI context
export const philosophyDocuments = pgTable("philosophy_documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(), // pdf, jpg, png, etc.
  fileSize: integer("file_size").notNull(), // in bytes
  objectPath: text("object_path").notNull(), // path in object storage
  category: text("category").default("personal"), // personal, business, spiritual, productivity, health, etc.
  extractedText: text("extracted_text"), // OCR/parsed text content
  aiSummary: text("ai_summary"), // AI-generated summary of key themes
  keyThemes: text("key_themes").array().default([]), // extracted themes/values
  isProcessed: boolean("is_processed").default(false), // whether text extraction is complete
  useForAi: boolean("use_for_ai").default(true), // whether to include in AI context
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas
export const insertHabitSchema = createInsertSchema(habits).omit({ id: true, createdAt: true, xpReward: true, difficultyRationale: true, difficulty: true });
export const insertGoalSchema = createInsertSchema(goals).omit({ id: true, createdAt: true, xpReward: true, difficulty: true });
export const insertCompletionSchema = createInsertSchema(completions).omit({ id: true });
export const insertUserStatsSchema = createInsertSchema(userStats).omit({ id: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAchievementSchema = createInsertSchema(achievements).omit({ id: true });
export const insertMotivationSchema = createInsertSchema(motivations).omit({ id: true, createdAt: true });
export const insertPhilosophyDocumentSchema = createInsertSchema(philosophyDocuments).omit({ id: true, createdAt: true });
export const insertUserProfileSchema = createInsertSchema(userProfile).omit({ id: true, createdAt: true });
export const insertInventorySchema = createInsertSchema(inventory).omit({ id: true, purchasedAt: true });
export const insertActiveEffectSchema = createInsertSchema(activeEffects).omit({ id: true });

// Types
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Completion = typeof completions.$inferSelect;
export type UserStats = typeof userStats.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Motivation = typeof motivations.$inferSelect;
export type InsertMotivation = z.infer<typeof insertMotivationSchema>;
export type PhilosophyDocument = typeof philosophyDocuments.$inferSelect;
export type InsertPhilosophyDocument = z.infer<typeof insertPhilosophyDocumentSchema>;
export type UserProfile = typeof userProfile.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type InventoryItem = typeof inventory.$inferSelect;
export type InsertInventoryItem = z.infer<typeof insertInventorySchema>;
export type ActiveEffect = typeof activeEffects.$inferSelect;
export type InsertActiveEffect = z.infer<typeof insertActiveEffectSchema>;

// Request Types
export type CreateHabitRequest = InsertHabit;
export type UpdateHabitRequest = Partial<InsertHabit>;
export type CreateGoalRequest = InsertGoal;
export type UpdateGoalRequest = Partial<InsertGoal>;
export type ToggleCompletionRequest = { date: string; completed: boolean };

export type HabitWithStats = Habit & {
  streak: number;
  completionRate: number;
  completedToday: boolean;
};

export type SuggestionRequest = {
  context: string; // "I want to improve my running"
};

export type SuggestionResponse = {
  suggestions: {
    type: "habit" | "goal";
    title: string;
    description: string;
    difficulty: number;
    reason: string;
  }[];
};
