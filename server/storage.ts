import { db } from "./db";
import { 
  habits, goals, completions, userStats, notes, achievements, motivations, philosophyDocuments, userProfile, inventory, activeEffects,
  type Habit, type InsertHabit, type Goal, type InsertGoal,
  type Completion, type UserStats, type UpdateHabitRequest, type UpdateGoalRequest,
  type Note, type InsertNote, type Achievement, type InsertAchievement,
  type Motivation, type InsertMotivation,
  type PhilosophyDocument, type InsertPhilosophyDocument,
  type UserProfile, type InsertUserProfile,
  type InventoryItem, type InsertInventoryItem,
  type ActiveEffect, type InsertActiveEffect
} from "@shared/schema";
import { eq, and, gte, lte, desc, isNotNull } from "drizzle-orm";
import { getXpForLevel } from "@shared/gameplay";
import { ALL_ACHIEVEMENTS } from "@shared/achievements";

export type FullHabitData = InsertHabit & {
  difficulty: number;
  xpReward: number;
  difficultyRationale?: string;
};

export interface IStorage {
  // Habits
  getHabits(): Promise<Habit[]>;
  getHabit(id: number): Promise<Habit | undefined>;
  createHabit(habit: FullHabitData): Promise<Habit>;
  updateHabit(id: number, updates: UpdateHabitRequest): Promise<Habit>;
  deleteHabit(id: number): Promise<void>;
  
  // Goals
  getGoals(): Promise<Goal[]>;
  getGoal(id: number): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, updates: UpdateGoalRequest): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Completions
  getAllCompletions(): Promise<Completion[]>;
  getCompletions(habitId: number, fromDate: string, toDate: string): Promise<Completion[]>;
  getCompletion(habitId: number, date: string): Promise<Completion | undefined>;
  toggleCompletion(habitId: number, date: string, completed: boolean): Promise<Completion>;
  
  // Stats
  getUserStats(): Promise<UserStats>;
  updateUserStats(xp: number, gold?: number, statUpdates?: Partial<{ strength: number; intelligence: number; vitality: number; agility: number; sense: number; willpower: number }>): Promise<{ stats: UserStats; leveledUp: boolean; oldLevel: number }>;
  
  // Notes
  getNotes(): Promise<Note[]>;
  getNote(id: number): Promise<Note | undefined>;
  createNote(note: InsertNote): Promise<Note>;
  updateNote(id: number, updates: Partial<InsertNote>): Promise<Note>;
  deleteNote(id: number): Promise<void>;
  
  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUnlockedAchievements(): Promise<Achievement[]>;
  unlockAchievement(key: string): Promise<Achievement | null>;
  initializeAchievements(): Promise<void>;
  
  // Motivations
  getMotivationForDate(date: string): Promise<Motivation | undefined>;
  getRecentMotivations(limit: number): Promise<Motivation[]>;
  createMotivation(motivation: InsertMotivation): Promise<Motivation>;
  
  // Philosophy Documents
  getPhilosophyDocuments(): Promise<PhilosophyDocument[]>;
  getPhilosophyDocument(id: number): Promise<PhilosophyDocument | undefined>;
  createPhilosophyDocument(doc: InsertPhilosophyDocument): Promise<PhilosophyDocument>;
  updatePhilosophyDocument(id: number, updates: Partial<InsertPhilosophyDocument>): Promise<PhilosophyDocument>;
  deletePhilosophyDocument(id: number): Promise<void>;
  getActivePhilosophyDocuments(): Promise<PhilosophyDocument[]>;
  
  // User Profile
  getUserProfile(): Promise<UserProfile>;
  updateUserProfile(updates: Partial<InsertUserProfile>): Promise<UserProfile>;
  
  // Inventory
  getInventory(): Promise<InventoryItem[]>;
  getInventoryItem(itemId: string): Promise<InventoryItem | undefined>;
  addInventoryItem(itemId: string, quantity: number): Promise<InventoryItem>;
  removeInventoryItem(itemId: string, quantity: number): Promise<InventoryItem | null>;
  
  // Active Effects
  getActiveEffects(): Promise<ActiveEffect[]>;
  addActiveEffect(effect: InsertActiveEffect): Promise<ActiveEffect>;
  removeExpiredEffects(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getHabits(): Promise<Habit[]> {
    return await db.select().from(habits).orderBy(desc(habits.priority), habits.id);
  }

  async getHabit(id: number): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit;
  }

  async createHabit(habit: FullHabitData): Promise<Habit> {
    const [newHabit] = await db.insert(habits).values(habit).returning();
    return newHabit;
  }

  async updateHabit(id: number, updates: UpdateHabitRequest): Promise<Habit> {
    const [updated] = await db.update(habits).set(updates).where(eq(habits.id, id)).returning();
    return updated;
  }

  async deleteHabit(id: number): Promise<void> {
    await db.delete(habits).where(eq(habits.id, id));
  }

  async getGoals(): Promise<Goal[]> {
    return await db.select().from(goals).orderBy(goals.deadline);
  }

  async getGoal(id: number): Promise<Goal | undefined> {
    const [goal] = await db.select().from(goals).where(eq(goals.id, id));
    return goal;
  }

  async createGoal(goal: InsertGoal): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: number, updates: UpdateGoalRequest): Promise<Goal> {
    const [updated] = await db.update(goals).set(updates).where(eq(goals.id, id)).returning();
    return updated;
  }

  async deleteGoal(id: number): Promise<void> {
    await db.delete(goals).where(eq(goals.id, id));
  }

  async getAllCompletions(): Promise<Completion[]> {
    return await db.select().from(completions);
  }

  async getCompletions(habitId: number, fromDate: string, toDate: string): Promise<Completion[]> {
    return await db.select()
      .from(completions)
      .where(
        and(
          eq(completions.habitId, habitId),
          gte(completions.date, fromDate),
          lte(completions.date, toDate)
        )
      );
  }

  async getCompletion(habitId: number, date: string): Promise<Completion | undefined> {
    const [completion] = await db.select()
      .from(completions)
      .where(and(eq(completions.habitId, habitId), eq(completions.date, date)));
    return completion;
  }

  async toggleCompletion(habitId: number, date: string, completed: boolean): Promise<Completion> {
    const existing = await this.getCompletion(habitId, date);
    if (existing) {
      const [updated] = await db.update(completions)
        .set({ completed })
        .where(eq(completions.id, existing.id))
        .returning();
      return updated;
    } else {
      const [newCompletion] = await db.insert(completions)
        .values({ habitId, date, completed })
        .returning();
      return newCompletion;
    }
  }

  async getUserStats(): Promise<UserStats> {
    let [stats] = await db.select().from(userStats);
    if (!stats) {
      [stats] = await db.insert(userStats).values({ 
        level: 1, currentXp: 0, totalXp: 0 
      }).returning();
    }
    return stats;
  }

  async updateUserStats(xpToAdd: number, goldToAdd: number = 0, statUpdates: Partial<{ strength: number; intelligence: number; vitality: number; agility: number; sense: number; willpower: number }> = {}): Promise<{ stats: UserStats; leveledUp: boolean; oldLevel: number }> {
    const stats = await this.getUserStats();
    const oldLevel = stats.level || 1;
    let { level, currentXp, totalXp, currentGold, lifetimeGold, strength, intelligence, vitality, agility, sense, willpower } = stats;
    
    currentXp = (currentXp || 0) + xpToAdd;
    totalXp = (totalXp || 0) + xpToAdd;
    
    // Add gold
    currentGold = (currentGold || 0) + goldToAdd;
    lifetimeGold = (lifetimeGold || 0) + goldToAdd;
    
    // Add stat updates
    strength = (strength || 0) + (statUpdates.strength || 0);
    intelligence = (intelligence || 0) + (statUpdates.intelligence || 0);
    vitality = (vitality || 0) + (statUpdates.vitality || 0);
    agility = (agility || 0) + (statUpdates.agility || 0);
    sense = (sense || 0) + (statUpdates.sense || 0);
    willpower = (willpower || 0) + (statUpdates.willpower || 0);
    
    // Progressive XP System: 5% compound increase per level
    // Level 1 requires 1000 XP, Level 2 requires 1050 XP, Level 3 requires 1102 XP, etc.
    let leveledUp = false;
    
    // Handle multiple level-ups if XP is high enough
    while (currentXp >= getXpForLevel(level || 1)) {
      const xpForThisLevel = getXpForLevel(level || 1);
      level = (level || 1) + 1;
      currentXp = currentXp - xpForThisLevel;
      leveledUp = true;
    }

    const [updated] = await db.update(userStats)
      .set({ 
        level, currentXp, totalXp, 
        currentGold, lifetimeGold,
        strength, intelligence, vitality, agility, sense, willpower,
        lastLevelUp: leveledUp ? new Date() : stats.lastLevelUp 
      })
      .where(eq(userStats.id, stats.id))
      .returning();
    return { stats: updated, leveledUp, oldLevel };
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    return await db.select().from(notes).orderBy(desc(notes.pinned), desc(notes.updatedAt));
  }

  async getNote(id: number): Promise<Note | undefined> {
    const [note] = await db.select().from(notes).where(eq(notes.id, id));
    return note;
  }

  async createNote(note: InsertNote): Promise<Note> {
    const [newNote] = await db.insert(notes).values(note).returning();
    return newNote;
  }

  async updateNote(id: number, updates: Partial<InsertNote>): Promise<Note> {
    const [updated] = await db.update(notes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning();
    return updated;
  }

  async deleteNote(id: number): Promise<void> {
    await db.delete(notes).where(eq(notes.id, id));
  }

  // Achievements methods
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUnlockedAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements).where(isNotNull(achievements.unlockedAt));
  }

  async unlockAchievement(key: string): Promise<Achievement | null> {
    const [existing] = await db.select().from(achievements).where(eq(achievements.key, key));
    if (!existing || existing.unlockedAt) return null;
    
    const [updated] = await db.update(achievements)
      .set({ unlockedAt: new Date() })
      .where(eq(achievements.key, key))
      .returning();
    return updated;
  }

  async initializeAchievements(): Promise<void> {
    const existing = await this.getAchievements();
    if (existing.length >= ALL_ACHIEVEMENTS.length) return;

    // Insert all 200 achievements
    for (const achievement of ALL_ACHIEVEMENTS) {
      // Skip if already exists
      const [existingAchievement] = await db.select().from(achievements).where(eq(achievements.key, achievement.key));
      if (!existingAchievement) {
        await db.insert(achievements).values(achievement);
      }
    }
  }

  // Motivation methods
  async getMotivationForDate(date: string): Promise<Motivation | undefined> {
    const [motivation] = await db.select().from(motivations).where(eq(motivations.date, date));
    return motivation;
  }

  async getRecentMotivations(limit: number): Promise<Motivation[]> {
    return await db.select().from(motivations).orderBy(desc(motivations.date)).limit(limit);
  }

  async createMotivation(motivation: InsertMotivation): Promise<Motivation> {
    const [newMotivation] = await db.insert(motivations).values(motivation).returning();
    return newMotivation;
  }

  // Philosophy Documents methods
  async getPhilosophyDocuments(): Promise<PhilosophyDocument[]> {
    return await db.select().from(philosophyDocuments).orderBy(desc(philosophyDocuments.createdAt));
  }

  async getPhilosophyDocument(id: number): Promise<PhilosophyDocument | undefined> {
    const [doc] = await db.select().from(philosophyDocuments).where(eq(philosophyDocuments.id, id));
    return doc;
  }

  async createPhilosophyDocument(doc: InsertPhilosophyDocument): Promise<PhilosophyDocument> {
    const [newDoc] = await db.insert(philosophyDocuments).values(doc).returning();
    return newDoc;
  }

  async updatePhilosophyDocument(id: number, updates: Partial<InsertPhilosophyDocument>): Promise<PhilosophyDocument> {
    const [updated] = await db.update(philosophyDocuments)
      .set(updates)
      .where(eq(philosophyDocuments.id, id))
      .returning();
    return updated;
  }

  async deletePhilosophyDocument(id: number): Promise<void> {
    await db.delete(philosophyDocuments).where(eq(philosophyDocuments.id, id));
  }

  async getActivePhilosophyDocuments(): Promise<PhilosophyDocument[]> {
    return await db.select()
      .from(philosophyDocuments)
      .where(eq(philosophyDocuments.useForAi, true))
      .orderBy(desc(philosophyDocuments.createdAt));
  }

  // User Profile methods
  async getUserProfile(): Promise<UserProfile> {
    let [profile] = await db.select().from(userProfile);
    if (!profile) {
      [profile] = await db.insert(userProfile).values({}).returning();
    }
    return profile;
  }

  async updateUserProfile(updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const profile = await this.getUserProfile();
    const [updated] = await db.update(userProfile)
      .set(updates)
      .where(eq(userProfile.id, profile.id))
      .returning();
    return updated;
  }

  // Inventory methods
  async getInventory(): Promise<InventoryItem[]> {
    return await db.select().from(inventory).orderBy(desc(inventory.purchasedAt));
  }

  async getInventoryItem(itemId: string): Promise<InventoryItem | undefined> {
    const [item] = await db.select().from(inventory).where(eq(inventory.itemId, itemId));
    return item;
  }

  async addInventoryItem(itemId: string, quantity: number): Promise<InventoryItem> {
    const existing = await this.getInventoryItem(itemId);
    if (existing) {
      const [updated] = await db.update(inventory)
        .set({ quantity: (existing.quantity || 0) + quantity })
        .where(eq(inventory.id, existing.id))
        .returning();
      return updated;
    }
    const [newItem] = await db.insert(inventory).values({ itemId, quantity }).returning();
    return newItem;
  }

  async removeInventoryItem(itemId: string, quantity: number): Promise<InventoryItem | null> {
    const existing = await this.getInventoryItem(itemId);
    if (!existing) return null;
    
    const newQuantity = (existing.quantity || 0) - quantity;
    if (newQuantity <= 0) {
      await db.delete(inventory).where(eq(inventory.id, existing.id));
      return null;
    }
    
    const [updated] = await db.update(inventory)
      .set({ quantity: newQuantity })
      .where(eq(inventory.id, existing.id))
      .returning();
    return updated;
  }

  // Active Effects methods
  async getActiveEffects(): Promise<ActiveEffect[]> {
    const now = new Date();
    return await db.select().from(activeEffects).where(gte(activeEffects.expiresAt, now));
  }

  async addActiveEffect(effect: InsertActiveEffect): Promise<ActiveEffect> {
    const [newEffect] = await db.insert(activeEffects).values(effect).returning();
    return newEffect;
  }

  async removeExpiredEffects(): Promise<void> {
    const now = new Date();
    await db.delete(activeEffects).where(lte(activeEffects.expiresAt, now));
  }
}

export const storage = new DatabaseStorage();
