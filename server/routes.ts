import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import OpenAI from "openai";

// Helper to get today's date in CST (Central Standard Time - America/Chicago)
function getTodayCST(): string {
  const now = new Date();
  // Convert to CST using Intl.DateTimeFormat
  const cstDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  return cstDate; // Returns YYYY-MM-DD format
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check endpoint for Railway and monitoring
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected' // Will be updated with actual DB check if needed
    });
  });

  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);
  registerObjectStorageRoutes(app);

  // Initialize OpenAI client for suggestions
  const openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });

  // Helper to get tier info based on completion percentage
  function getTierInfo(percentage: number): { tier: 'critical' | 'needs-work' | 'good' | 'excellent'; label: string; suggestion?: string } {
    if (percentage < 25) {
      return { tier: 'critical', label: 'Critical', suggestion: 'This habit needs immediate attention. Try setting reminders or linking it to an existing routine.' };
    } else if (percentage < 50) {
      return { tier: 'needs-work', label: 'Needs Work', suggestion: 'Below 50% completion is a problem. Consider simplifying this habit or breaking it into smaller steps.' };
    } else if (percentage < 75) {
      return { tier: 'good', label: 'Good Progress', suggestion: 'You\'re on track! Focus on consistency to reach the next level.' };
    } else {
      return { tier: 'excellent', label: 'Excellent', suggestion: undefined };
    }
  }

  // Helper to calculate analytics with real data
  async function getAnalytics() {
    const habits = await storage.getHabits();
    const completions = await storage.getAllCompletions();
    const activeHabits = habits.filter(h => h.active !== false);
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Calculate daily data (last 7 days)
    const dailyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletions = completions.filter(c => c.date === dateStr && c.completed);
      const percentage = activeHabits.length > 0 ? Math.round((dayCompletions.length / activeHabits.length) * 100) : 0;
      return {
        name: date.toLocaleDateString('en-US', { weekday: 'short' }),
        percentage,
        completions: dayCompletions.length,
        total: activeHabits.length
      };
    });

    // Calculate weekly data (last 4 weeks)
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - ((3 - i) * 7 + weekStart.getDay()));
      let weekCompletions = 0;
      let weekTotal = 0;
      for (let d = 0; d < 7; d++) {
        const date = new Date(weekStart);
        date.setDate(date.getDate() + d);
        const dateStr = date.toISOString().split('T')[0];
        const dayCompletions = completions.filter(c => c.date === dateStr && c.completed);
        weekCompletions += dayCompletions.length;
        weekTotal += activeHabits.length;
      }
      const percentage = weekTotal > 0 ? Math.round((weekCompletions / weekTotal) * 100) : 0;
      return { name: `Week ${i + 1}`, percentage, completions: weekCompletions, total: weekTotal };
    });

    // Calculate monthly data (last 12 months)
    const monthlyData = Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(today.getFullYear(), today.getMonth() - (11 - i), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      let monthCompletions = 0;
      let monthTotal = 0;
      for (let d = 1; d <= monthEnd.getDate(); d++) {
        const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), d);
        if (date > today) break;
        const dateStr = date.toISOString().split('T')[0];
        const dayCompletions = completions.filter(c => c.date === dateStr && c.completed);
        monthCompletions += dayCompletions.length;
        monthTotal += activeHabits.length;
      }
      const percentage = monthTotal > 0 ? Math.round((monthCompletions / monthTotal) * 100) : 0;
      return {
        name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        percentage,
        completions: monthCompletions,
        total: monthTotal
      };
    });

    // Calculate yearly data (last 5 years)
    const yearlyData = Array.from({ length: 5 }, (_, i) => {
      const year = today.getFullYear() - (4 - i);
      const yearCompletions = completions.filter(c => {
        const compYear = new Date(c.date).getFullYear();
        return compYear === year && c.completed;
      });
      const daysInYear = year === today.getFullYear() ? Math.ceil((today.getTime() - new Date(year, 0, 1).getTime()) / (1000 * 60 * 60 * 24)) : 365;
      const total = daysInYear * activeHabits.length;
      const percentage = total > 0 ? Math.round((yearCompletions.length / total) * 100) : 0;
      return { name: year.toString(), percentage, completions: yearCompletions.length, total };
    });

    // Helper to calculate habit stats for a given number of days
    function calculateHabitStatsForPeriod(days: number) {
      const periodStart = new Date(today);
      periodStart.setDate(periodStart.getDate() - days + 1);
      const periodStartStr = periodStart.toISOString().split('T')[0];
      
      return activeHabits.map((habit) => {
        const periodCompletions = completions.filter(c => 
          c.habitId === habit.id && 
          c.completed && 
          c.date >= periodStartStr
        );
        const uniqueDays = new Set(periodCompletions.map(c => c.date)).size;
        const completionRate = Math.min(100, Math.round((uniqueDays / days) * 100));
        const tierInfo = getTierInfo(completionRate);
        
        return {
          id: habit.id,
          name: habit.name,
          completionRate,
          tier: tierInfo.tier,
          tierLabel: tierInfo.label,
          suggestion: tierInfo.suggestion
        };
      });
    }

    // Calculate habit stats for each timeframe
    const habitStatsByTimeframe = {
      daily: calculateHabitStatsForPeriod(1),
      weekly: calculateHabitStatsForPeriod(7),
      monthly: calculateHabitStatsForPeriod(30),
      yearly: calculateHabitStatsForPeriod(365)
    };
    
    // Keep monthly as default for backwards compatibility
    const habitStats = habitStatsByTimeframe.monthly;

    // Calculate streak data
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const totalCompletions = completions.filter(c => c.completed).length;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletions = completions.filter(c => c.date === dateStr && c.completed);
      const dayPercentage = activeHabits.length > 0 ? (dayCompletions.length / activeHabits.length) : 0;
      
      if (dayPercentage >= 0.5) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak = tempStreak;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }

    // Category breakdown (last 30 days only)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];
    
    const categories = Array.from(new Set(activeHabits.map(h => h.category)));
    const categoryBreakdown = categories.map(category => {
      const categoryHabits = activeHabits.filter(h => h.category === category);
      const categoryCompletions = completions.filter(c => 
        categoryHabits.some(h => h.id === c.habitId) && 
        c.completed && 
        c.date >= thirtyDaysAgoStr
      );
      const uniqueCompletions = new Set(categoryCompletions.map(c => `${c.habitId}-${c.date}`)).size;
      const expectedCompletions = 30 * categoryHabits.length;
      const completionRate = expectedCompletions > 0 ? Math.min(100, Math.round((uniqueCompletions / expectedCompletions) * 100)) : 0;
      return { category, completionRate, count: categoryHabits.length };
    });

    // Calculate overall metrics
    const thisWeekPercentage = weeklyData[3]?.percentage || 0;
    const lastWeekPercentage = weeklyData[2]?.percentage || 0;
    const overallGrowth = (thisWeekPercentage - lastWeekPercentage).toFixed(1);
    const overallCompletion = dailyData.length > 0 
      ? (dailyData.reduce((sum, d) => sum + d.percentage, 0) / dailyData.length).toFixed(1)
      : "0";

    return {
      dailyData,
      weeklyData,
      monthlyData,
      yearlyData,
      overallGrowth,
      weeklyProgress: thisWeekPercentage.toString(),
      overallCompletion,
      habitStats,
      habitStatsByTimeframe,
      streakData: { currentStreak, longestStreak, totalCompletions },
      categoryBreakdown
    };
  }

  // --- Habits Routes ---
  app.get(api.habits.list.path, async (req, res) => {
    const habits = await storage.getHabits();
    // Enrich with stats (mocked for now, or fetch completions)
    const enriched = await Promise.all(habits.map(async (h) => {
      // Check if completed today (using CST timezone - resets at midnight CST)
      const today = getTodayCST();
      const completion = await storage.getCompletion(h.id, today);
      
      return {
        ...h,
        streak: Math.floor(Math.random() * 10), // Mock streak
        completionRate: Math.floor(Math.random() * 100), // Mock rate
        completedToday: !!completion?.completed
      };
    }));
    
    // Sort: Priority first, then incomplete first
    enriched.sort((a, b) => {
      if (a.completedToday !== b.completedToday) return a.completedToday ? 1 : -1;
      if (a.priority !== b.priority) return b.priority ? 1 : -1;
      return 0;
    });

    res.json(enriched);
  });

  app.post(api.habits.create.path, async (req, res) => {
    try {
      const input = api.habits.create.input.parse(req.body);
      
      // Use AI to assess difficulty for average person
      let difficulty = 2; // Default to medium
      let xpReward = 200; // Default for medium
      let difficultyRationale = '';
      
      try {
        const aiPrompt = `You are assessing the difficulty of a daily habit for an average person.

Habit: "${input.name}"
Category: ${input.category}
${input.description ? `Description: ${input.description}` : ''}

Rate the difficulty on a scale of 1-3:
- 1 (Easy): Simple tasks most people can do without much effort (e.g., drink 8 glasses of water, take vitamins)
- 2 (Medium): Requires some discipline or time commitment (e.g., exercise 30 min, read 1 hour)
- 3 (Hard): Requires significant effort, skill, or time (e.g., wake up at 5am, cold showers, intense workout)

Consider: time required, physical/mental effort, consistency challenge, skill level needed.

Return JSON format:
{
  "difficulty": 1|2|3,
  "rationale": "Brief explanation (1-2 sentences) of why this difficulty was chosen"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: aiPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 150,
        });

        const result = JSON.parse(response.choices[0].message.content || '{"difficulty": 2}');
        difficulty = Math.min(3, Math.max(1, result.difficulty || 2));
        difficultyRationale = result.rationale || '';
      } catch (aiError) {
        console.error("AI difficulty assessment failed:", aiError);
        // Default to medium if AI fails
      }
      
      // XP mapping for habits: Easy=100, Medium=200, Hard=300
      const xpByDifficulty: Record<number, number> = { 1: 100, 2: 200, 3: 300 };
      xpReward = xpByDifficulty[difficulty];
      
      const habit = await storage.createHabit({
        ...input,
        difficulty,
        xpReward,
        difficultyRationale,
      });
      res.status(201).json(habit);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
      else throw err;
    }
  });

  app.put(api.habits.update.path, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = api.habits.update.input.parse(req.body);
      const habit = await storage.updateHabit(id, input);
      res.json(habit);
    } catch (err) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.delete(api.habits.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteHabit(id);
    res.status(204).end();
  });

  app.post(api.habits.toggle.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const { date, completed } = req.body;
    
    const habit = await storage.getHabit(id);
    if (!habit) return res.status(404).json({ message: "Habit not found" });

    await storage.toggleCompletion(id, date, completed);
    
    // XP, Gold, and Stats Calculation
    let xpGained = 0;
    let goldGained = 0;
    let leveledUp = false;
    let newLevel = 1;
    let unlockedAchievement = null;
    
    if (completed) {
      // Use stored xpReward, fallback to difficulty-based calculation
      xpGained = habit.xpReward || ({ 1: 100, 2: 200, 3: 300 }[habit.difficulty || 1] ?? 100);
      
      // Gold calculation based on difficulty: Easy=10, Medium=25, Hard=50
      goldGained = { 1: 10, 2: 25, 3: 50 }[habit.difficulty || 1] ?? 10;
      
      // Stat calculation based on habit category
      const statUpdates: Partial<{ strength: number; intelligence: number; vitality: number; agility: number; sense: number; willpower: number }> = {};
      const category = habit.category?.toLowerCase() || 'personal';
      const statMapping: Record<string, keyof typeof statUpdates> = {
        fitness: 'strength',
        health: 'vitality',
        learning: 'intelligence',
        mindfulness: 'sense',
        productivity: 'agility',
        personal: 'willpower',
        work: 'intelligence',
        finance: 'sense',
        social: 'agility',
        creative: 'intelligence',
      };
      const statToIncrease = statMapping[category] || 'willpower';
      const statGain = { 1: 1, 2: 2, 3: 3 }[habit.difficulty || 1] ?? 1;
      statUpdates[statToIncrease] = statGain;
      
      const result = await storage.updateUserStats(xpGained, goldGained, statUpdates);
      leveledUp = result.leveledUp;
      newLevel = result.stats.level || 1;
      
      // Check for first habit achievement
      unlockedAchievement = await storage.unlockAchievement("first_habit");
      
      // Check for level achievements
      if (newLevel >= 5) await storage.unlockAchievement("level_5");
      if (newLevel >= 10) await storage.unlockAchievement("level_10");
      if (newLevel >= 25) await storage.unlockAchievement("level_25");
      if (newLevel >= 50) await storage.unlockAchievement("level_50");
    } else {
      const stats = await storage.getUserStats();
      newLevel = stats.level || 1;
    }
    
    res.json({ xpGained, goldGained, newLevel, leveledUp, unlockedAchievement });
  });

  // --- Goals Routes ---
  app.get(api.goals.list.path, async (req, res) => {
    const goals = await storage.getGoals();
    res.json(goals);
  });

  app.post(api.goals.create.path, async (req, res) => {
    try {
      const input = api.goals.create.input.parse(req.body);
      // Goal XP: 1000 for easy, 2000 for medium, 3000 for hard
      const goalXpByDifficulty: Record<number, number> = { 1: 1000, 2: 2000, 3: 3000 };
      
      // Use AI to assess difficulty for goals
      let difficulty = 2; // Default to medium
      let difficultyRationale = '';
      
      try {
        const aiPrompt = `You are assessing the difficulty of achieving a goal for an average person.

Goal: "${input.title}"
${input.description ? `Description: ${input.description}` : ''}
${input.deadline ? `Deadline: ${input.deadline}` : ''}

Rate the difficulty on a scale of 1-3:
- 1 (Easy): Simple goals achievable with minimal effort (e.g., organize desk, create a schedule)
- 2 (Medium): Requires sustained effort over weeks/months (e.g., learn a new skill, save $1000)
- 3 (Hard): Requires significant long-term commitment (e.g., start a business, lose 50 lbs, learn a language fluently)

Consider: time required, complexity, resources needed, skill development required.

Return JSON format:
{
  "difficulty": 1|2|3,
  "rationale": "Brief explanation (1-2 sentences) of why this difficulty was chosen"
}`;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: aiPrompt }],
          response_format: { type: "json_object" },
          max_tokens: 150,
        });

        const result = JSON.parse(response.choices[0].message.content || '{"difficulty": 2}');
        difficulty = Math.min(3, Math.max(1, result.difficulty || 2));
        difficultyRationale = result.rationale || '';
      } catch (aiError) {
        console.error("AI goal difficulty assessment failed:", aiError);
      }
      
      const xpReward = goalXpByDifficulty[difficulty] || 2000;
      const goal = await storage.createGoal({ ...input, difficulty, xpReward } as any);
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) res.status(400).json({ message: err.message });
      else throw err;
    }
  });

  app.put(api.goals.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const input = api.goals.update.input.parse(req.body);
    
    // Get the current goal state before update
    const existingGoal = await storage.getGoal(id);
    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }
    
    // Difficulty is AI-assessed at creation and cannot be changed
    const updatedGoal = await storage.updateGoal(id, input);
    
    // Check if goal was just completed (progress 100) and award XP
    const wasNotCompleted = (existingGoal.progress || 0) < 100 && !existingGoal.completed;
    const isNowCompleted = input.progress === 100 || input.completed === true;
    
    if (wasNotCompleted && isNowCompleted) {
      // Use the existing xpReward value (set at creation by AI)
      const xpToAward = existingGoal.xpReward;
      await storage.updateUserStats(xpToAward);
    }
    
    res.json(updatedGoal);
  });

  app.delete(api.goals.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteGoal(id);
    res.status(204).end();
  });

  // --- Stats & Analytics ---
  app.get(api.stats.get.path, async (req, res) => {
    const stats = await storage.getUserStats();
    res.json(stats);
  });

  app.get(api.stats.analytics.path, async (req, res) => {
    const analytics = await getAnalytics();
    res.json(analytics);
  });

  // --- AI Suggestions ---
  app.post(api.suggestions.generate.path, async (req, res) => {
    try {
      const { context } = req.body;
      const habits = await storage.getHabits();
      const goals = await storage.getGoals();
      const stats = await storage.getUserStats();

      const prompt = `
        You are a gamified life coach. The user is Level ${stats.level}.
        Current Habits: ${habits.map(h => h.name).join(", ")}.
        Current Goals: ${goals.map(g => g.title).join(", ")}.
        User Context/Focus: ${context || "General self-improvement"}

        Suggest 3 new habits or goals that compliment their current list and help them gain XP.
        Difficulty should scale with their level (currently ${stats.level}).
        Return JSON format: { "suggestions": [{ "type": "habit|goal", "title": "...", "description": "...", "difficulty": 1-5, "reason": "..." }] }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{\"suggestions\": []}");
      res.json(result);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // --- Generate Full Long-term Goal with Steps and Habits ---
  app.post(api.suggestions.generateFullGoal.path, async (req, res) => {
    try {
      const { context } = req.body;
      if (!context || typeof context !== 'string') {
        return res.status(400).json({ message: "Context/mission statement is required" });
      }

      const habits = await storage.getHabits();
      const goals = await storage.getGoals();
      const stats = await storage.getUserStats();

      const prompt = `
You are an expert life coach creating a comprehensive long-term goal based on the user's mission statement.

User's Mission Statement: "${context}"
User Level: ${stats.level}
Current Habits: ${habits.map(h => h.name).join(", ") || "None"}
Current Goals: ${goals.map(g => g.title).join(", ") || "None"}

Create ONE detailed long-term goal with exactly 7 actionable steps. For each step, suggest a corresponding daily habit.

Difficulty Assessment Rules:
- Easy (1): Achievable within 2-4 weeks with minimal effort, XP reward: 1000
- Medium (2): Requires 1-3 months of consistent effort, XP reward: 2000
- Hard (3): Major life goal requiring 3+ months of dedicated work, XP reward: 3000

Return JSON format:
{
  "goal": {
    "title": "Clear, motivating goal title",
    "description": "Detailed description of what achieving this goal means",
    "difficulty": 1-3,
    "xpReward": 1000|2000|3000,
    "steps": [
      {
        "id": "step-1",
        "title": "First actionable step",
        "completed": false,
        "suggestedHabit": "Daily habit to support this step (max 6 words)"
      }
    ]
  }
}

Make sure:
- Goal title is inspiring and specific
- All 7 steps are concrete and measurable
- Each suggested habit is a small, daily action (not weekly)
- Steps progress logically from start to completion
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      if (!result.goal || !result.goal.steps || result.goal.steps.length !== 7) {
        throw new Error("Invalid goal structure from AI");
      }

      res.json(result);
    } catch (error) {
      console.error("AI Full Goal Generation Error:", error);
      res.status(500).json({ message: "Failed to generate goal" });
    }
  });

  // --- Add Custom Step with AI Habit Suggestion ---
  app.post('/api/goals/:id/steps', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title } = req.body;
      
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: "Step title is required" });
      }

      const goal = await storage.getGoal(id);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      const habits = await storage.getHabits();
      const stats = await storage.getUserStats();
      const existingSteps = Array.isArray(goal.steps) ? goal.steps : [];

      // Generate habit suggestion for this step
      let suggestedHabit: string | undefined;
      try {
        const prompt = `
          You are a habit coach. A user is working on the goal: "${goal.title}"
          They just added this step: "${title}"
          
          Current user level: ${stats.level}
          Existing habits: ${habits.map(h => h.name).join(", ") || "None"}
          
          Suggest ONE short, specific daily habit (max 5 words) that would help accomplish this step.
          Return only the habit name, nothing else. Example: "Practice for 15 minutes daily"
        `;

        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 50,
        });

        suggestedHabit = response.choices[0].message.content?.trim();
      } catch (aiError) {
        console.error("AI habit suggestion failed:", aiError);
        // Continue without suggestion if AI fails
      }

      const newStep = {
        id: `step-${Date.now()}`,
        title,
        completed: false,
        suggestedHabit
      };

      const updatedSteps = [...existingSteps, newStep];
      const completedCount = updatedSteps.filter(s => s.completed).length;
      const progress = Math.round((completedCount / updatedSteps.length) * 100);

      const updatedGoal = await storage.updateGoal(id, { steps: updatedSteps, progress });
      
      res.json({ step: newStep, goal: updatedGoal });
    } catch (error) {
      console.error("Add step error:", error);
      res.status(500).json({ message: "Failed to add step" });
    }
  });

  // --- AI Goal Steps Suggestion ---
  app.post('/api/goals/:id/suggest-steps', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const goal = await storage.getGoal(id);
      
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      const habits = await storage.getHabits();
      const stats = await storage.getUserStats();

      const prompt = `
        You are a strategic life coach helping someone achieve their long-term goal.
        
        Goal: "${goal.title}"
        ${goal.description ? `Description: ${goal.description}` : ''}
        ${goal.deadline ? `Deadline: ${goal.deadline}` : ''}
        User Level: ${stats.level}
        Current Habits: ${habits.map(h => h.name).join(", ") || "None yet"}
        
        Generate 5-7 actionable steps to achieve this goal. For each step, also suggest a daily habit that would help accomplish it.
        
        Be specific and practical. Consider the user's current level when suggesting difficulty.
        
        Return JSON format:
        {
          "steps": [
            {
              "id": "step-1",
              "title": "Clear, actionable step description",
              "completed": false,
              "suggestedHabit": "Daily habit to support this step"
            }
          ]
        }
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(response.choices[0].message.content || '{"steps": []}');
      
      // Update goal with new steps
      await storage.updateGoal(id, { steps: result.steps });
      
      res.json(result);
    } catch (error) {
      console.error("AI Goal Steps Error:", error);
      res.status(500).json({ message: "Failed to generate steps" });
    }
  });

  // --- Notes Routes ---
  const noteInputSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().optional().default(""),
    category: z.string().optional().default("general"),
    pinned: z.boolean().optional().default(false),
    color: z.string().optional().default("default"),
  });

  app.get('/api/notes', async (req, res) => {
    const notesList = await storage.getNotes();
    res.json(notesList);
  });

  app.post('/api/notes', async (req, res) => {
    try {
      const input = noteInputSchema.parse(req.body);
      const note = await storage.createNote(input);
      res.status(201).json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      } else {
        res.status(500).json({ message: "Failed to create note" });
      }
    }
  });

  app.put('/api/notes/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = noteInputSchema.partial().parse(req.body);
      const note = await storage.updateNote(id, input);
      res.json(note);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      } else {
        res.status(500).json({ message: "Failed to update note" });
      }
    }
  });

  app.delete('/api/notes/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteNote(id);
    res.status(204).end();
  });

  // --- Single Note AI Actions (within note) ---
  app.post('/api/notes/:id/summarize', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      if (!note.content || note.content.trim().length < 10) {
        return res.status(400).json({ message: "Note content is too short to summarize" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert note analyst. Summarize the note into a simple bullet list of key points.

RULES:
- Maximum 12 bullet points
- Each point should be a single, clear sentence in normal written format
- Focus on the most important ideas, insights, and takeaways
- Use simple dash (-) for bullets, no asterisks or markdown
- No headers, sections, or categories - just a flat list of points
- Write naturally, not in title case or fragmented phrases`
          },
          {
            role: "user",
            content: `Summarize this note titled "${note.title}" into up to 12 key points:\n\n${note.content}`
          }
        ],
        max_tokens: 500,
      });

      let summary = response.choices[0].message.content || "Unable to generate summary.";
      summary = summary.replace(/\*\*/g, '').replace(/^\*\s/gm, '- ').replace(/\*/g, '');
      
      await storage.updateNote(id, { aiSummary: summary });
      
      res.json({ 
        noteId: id,
        action: "summarize",
        result: summary 
      });
    } catch (error) {
      console.error("AI Note Summarize Error:", error);
      res.status(500).json({ message: "Failed to summarize note" });
    }
  });

  app.post('/api/notes/:id/organize', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const note = await storage.getNote(id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      if (!note.content || note.content.trim().length < 10) {
        return res.status(400).json({ message: "Note content is too short to organize" });
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert content organizer. Rearrange and restructure the note content based on:
- CONTEXT: Group related ideas and concepts together
- RELEVANCY: Put the most important information first, supporting details after
- LOGICAL FLOW: Arrange content so it reads naturally and coherently
- TOPICAL GROUPING: Organize by themes or subjects within the note

IMPORTANT RULES:
- Preserve ALL original information - do not summarize or remove content
- Only rearrange and restructure, don't add new content
- Use clear headings and formatting to improve readability
- Maintain the author's voice and intent`
          },
          {
            role: "user",
            content: `Rearrange and organize this note titled "${note.title}" based on context and relevancy:\n\n${note.content}`
          }
        ],
        max_tokens: 1000,
      });

      const organized = response.choices[0].message.content || "Unable to organize note.";
      
      res.json({ 
        noteId: id,
        action: "organize",
        result: organized 
      });
    } catch (error) {
      console.error("AI Note Organize Error:", error);
      res.status(500).json({ message: "Failed to organize note" });
    }
  });

  // --- Organize All Notes (global organization) ---
  app.post('/api/notes/organize-all', async (req, res) => {
    try {
      const notesList = await storage.getNotes();
      
      if (notesList.length === 0) {
        return res.status(400).json({ message: "No notes to organize" });
      }

      const validCategories = ['personal', 'work', 'health', 'goals', 'ideas', 'learning'];
      
      const notesData = notesList.map(n => ({
        id: n.id,
        title: n.title,
        currentCategory: n.category,
        createdAt: n.createdAt,
        contentPreview: (n.content || '').substring(0, 200)
      }));

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert note organizer. Analyze the notes and assign each note to the most appropriate category based on:
- CONTEXT: What the note is about
- CREATION DATE: When it was created (for temporal relevance)
- CURRENT CATEGORY: Whether it's already correctly categorized

Available categories: ${validCategories.join(', ')}

Respond with ONLY a valid JSON object in this exact format:
{
  "changes": [
    {"id": <note_id>, "newCategory": "<category>", "reason": "<brief reason>"}
  ],
  "summary": "<brief overview of organization changes made>"
}

Only include notes that need their category changed. If a note is already in the right category, don't include it.`
          },
          {
            role: "user",
            content: `Organize these ${notesList.length} notes by assigning appropriate categories:\n\n${JSON.stringify(notesData, null, 2)}`
          }
        ],
        max_tokens: 1500,
        response_format: { type: "json_object" }
      });

      const aiResponse = response.choices[0].message.content || "{}";
      let parsed: { changes?: Array<{id: number, newCategory: string, reason: string}>, summary?: string };
      
      try {
        parsed = JSON.parse(aiResponse);
      } catch {
        parsed = { changes: [], summary: "Unable to parse AI response" };
      }

      const changes = parsed.changes || [];
      let updatedCount = 0;

      for (const change of changes) {
        if (validCategories.includes(change.newCategory)) {
          await storage.updateNote(change.id, { category: change.newCategory });
          updatedCount++;
        }
      }

      const resultText = updatedCount > 0 
        ? `**Organization Complete**\n\nUpdated ${updatedCount} note(s) with new categories.\n\n${parsed.summary || ''}\n\n**Changes Made:**\n${changes.map(c => `- "${notesList.find(n => n.id === c.id)?.title}": ${c.newCategory} (${c.reason})`).join('\n')}`
        : `**All Notes Already Organized**\n\n${parsed.summary || 'Your notes are already well-categorized based on their content and context.'}`;
      
      res.json({ 
        action: "organize-all",
        notesCount: notesList.length,
        updatedCount,
        result: resultText 
      });
    } catch (error) {
      console.error("AI Organize All Notes Error:", error);
      res.status(500).json({ message: "Failed to organize notes" });
    }
  });

  // --- AI Note Analysis Routes ---
  app.post('/api/notes/analyze', async (req, res) => {
    try {
      const { noteIds, action } = req.body as { noteIds: number[], action: 'summarize' | 'organize' | 'actionize' };
      
      if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
        return res.status(400).json({ message: "Please select at least one note to analyze" });
      }
      
      const notes = await Promise.all(noteIds.map(id => storage.getNote(id)));
      const validNotes = notes.filter((n): n is NonNullable<typeof n> => n != null);
      
      if (validNotes.length === 0) {
        return res.status(404).json({ message: "No valid notes found" });
      }
      
      const notesContent = validNotes.map(n => `**${n.title}** (${n.category}):\n${n.content || ''}`).join('\n\n---\n\n');
      
      let systemPrompt = '';
      let userPrompt = '';
      
      if (action === 'summarize') {
        systemPrompt = `You are an expert note analyst. Your job is to create precise, context-aware summaries that:
- Extract the core message and key insights from each note
- Preserve important details, dates, names, and specific information
- Identify the purpose or intent behind each note
- Highlight any decisions, conclusions, or action items mentioned
- Maintain the original tone and context
Be thorough but concise. Every sentence should add value.`;
        userPrompt = `Analyze and summarize the following notes. For each note, identify:
1. Main Topic/Purpose
2. Key Points and Details
3. Important Context
4. Any Action Items or Decisions

Provide a comprehensive yet focused summary that captures all essential information:

${notesContent}`;
      } else if (action === 'organize') {
        systemPrompt = `You are a professional information architect specializing in organizing scattered thoughts into clear, logical structures. You excel at:
- Identifying themes, patterns, and relationships between ideas
- Creating hierarchical structures that make information easy to navigate
- Grouping related concepts together
- Establishing logical flow and connections
- Separating facts from opinions, tasks from ideas`;
        userPrompt = `Analyze the following notes and organize them into a clear, structured format.

Your organization should include:
1. **Main Themes/Categories** - Group related ideas together under clear headings
2. **Key Topics** - Within each theme, list the main topics discussed
3. **Supporting Details** - Include relevant facts, ideas, and context under each topic
4. **Connections** - Note any relationships or dependencies between topics
5. **Open Questions** - List any unresolved questions or areas needing clarification
6. **Priority Items** - Highlight anything that seems time-sensitive or important

Notes to organize:

${notesContent}`;
      } else if (action === 'actionize') {
        systemPrompt = `You are a strategic execution planner who transforms ideas into concrete action plans. You specialize in:
- Breaking down abstract ideas into specific, measurable tasks
- Prioritizing based on impact and effort
- Identifying dependencies and logical sequences
- Anticipating obstacles and planning mitigations
- Creating realistic timelines and milestones`;
        userPrompt = `Transform the following notes into a detailed, actionable execution plan.

Create a comprehensive plan that includes:

## Executive Summary
Brief overview of what these notes are about and the main objective.

## Action Items
List specific, actionable tasks extracted from the notes. For each action item include:
- Clear description of what needs to be done
- Priority level (High/Medium/Low)
- Estimated effort (Quick/Medium/Extended)
- Any prerequisites or dependencies

## Implementation Strategy
- Recommended order of execution
- Key milestones to track progress
- Resources or tools that might be needed

## Potential Challenges
- Obstacles you might encounter
- Specific recommendations on how to address each challenge

## Success Metrics
- How to know when objectives are achieved
- Measurable outcomes to track

## Quick Wins
- Easy tasks that can be completed immediately for momentum

Notes to transform:

${notesContent}`;
      } else {
        return res.status(400).json({ message: "Invalid action. Use: summarize, organize, or actionize" });
      }
      
      const OpenAI = (await import('openai')).default;
      const openai = new OpenAI({
        apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
      });
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 2000,
      });
      
      const result = completion.choices[0]?.message?.content || 'Unable to analyze notes';
      
      res.json({ 
        action,
        result,
        notesAnalyzed: validNotes.length 
      });
    } catch (err) {
      console.error('Note analysis error:', err);
      res.status(500).json({ message: "Failed to analyze notes. Please try again." });
    }
  });

  // --- Achievements Routes ---
  app.get('/api/achievements', async (req, res) => {
    const achievementsList = await storage.getAchievements();
    res.json(achievementsList);
  });

  app.get('/api/achievements/unlocked', async (req, res) => {
    const unlocked = await storage.getUnlockedAchievements();
    res.json(unlocked);
  });

  app.post('/api/achievements/:key/unlock', async (req, res) => {
    const key = req.params.key;
    const achievement = await storage.unlockAchievement(key);
    if (achievement) {
      res.json(achievement);
    } else {
      res.status(404).json({ message: "Achievement not found or already unlocked" });
    }
  });

  // --- Daily Motivation Quote ---
  app.get('/api/motivation/today', async (req, res) => {
    try {
      // Use CST timezone for daily reset at midnight CST
      const today = getTodayCST();
      
      // Check if we already have a motivation for today
      let motivation = await storage.getMotivationForDate(today);
      
      if (motivation) {
        return res.json(motivation);
      }
      
      // Generate a new motivation quote
      const habits = await storage.getHabits();
      const goals = await storage.getGoals();
      const stats = await storage.getUserStats();
      const activeHabits = habits.filter(h => h.active !== false);
      const activeGoals = goals.filter(g => !g.completed);
      
      // Get recent motivations to avoid repeating traditions
      const recentMotivations = await storage.getRecentMotivations(3);
      const recentTraditions = recentMotivations.map(m => m.tradition);
      
      const allTraditions = ['Esoteric/Hermetic', 'Biblical', 'Quranic', 'Metaphysical', 'Ancient Philosophy'];
      // Filter out recently used traditions for variety
      let availableTraditions = allTraditions.filter(t => !recentTraditions.includes(t));
      if (availableTraditions.length === 0) availableTraditions = allTraditions;
      const selectedTradition = availableTraditions[Math.floor(Math.random() * availableTraditions.length)];
      
      // Build detailed context from user's actual habits and goals
      const habitDetails = activeHabits.map(h => `${h.name} (${h.category})`).join(', ') || 'building discipline and self-mastery';
      const goalDetails = activeGoals.map(g => {
        let detail = g.title;
        if (g.deadline) detail += ` (target: ${g.deadline})`;
        return detail;
      }).join(', ') || 'personal growth and achievement';
      
      const prompt = `You are a wise teacher drawing from ${selectedTradition} wisdom traditions.

USER CONTEXT - You MUST incorporate this into your response:
- Level: ${stats.level} on their self-improvement journey
- Daily habits they're building: ${habitDetails}
- Active goals they're pursuing: ${goalDetails}

Generate an inspiring daily motivation quote that:
1. Draws specifically from ${selectedTradition} philosophy, texts, or teachings
2. DIRECTLY relates to their specific habits (${habitDetails}) and goals (${goalDetails})
3. Provides practical wisdom they can apply today to these specific pursuits
4. Mentions at least one of their habits or goals by name in the habitContext

For each tradition, draw from these sources:
- Esoteric/Hermetic: Kybalion, Emerald Tablet, hermetic principles, Thoth teachings
- Biblical: Proverbs, Ecclesiastes, Psalms, wisdom literature, teachings of Christ
- Quranic: Verses on patience, striving, self-improvement, and righteous action
- Metaphysical: New Thought, Law of Attraction, mental science, consciousness principles
- Ancient Philosophy: Stoicism, Kemetic wisdom, Ma'at principles, Greek philosophy, Eastern wisdom

Return JSON format:
{
  "quote": "The actual quote or teaching (can be original or adapted)",
  "philosophy": "2-3 sentences explaining the wisdom and how to apply it today",
  "tradition": "${selectedTradition}",
  "habitContext": "Specific connection to their habits and goals by name"
}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 400,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Store the motivation
      motivation = await storage.createMotivation({
        date: today,
        quote: result.quote || "The journey of a thousand miles begins with a single step.",
        philosophy: result.philosophy || "Focus on the present moment and take action.",
        tradition: result.tradition || selectedTradition,
        habitContext: result.habitContext || null,
      });
      
      res.json(motivation);
    } catch (error) {
      console.error("Motivation generation error:", error);
      // Return a fallback quote if AI fails
      res.json({
        quote: "True power comes from consistent daily action, not sporadic bursts of effort.",
        philosophy: "Each small step you take today builds the foundation for your future success. Stay focused on your habits.",
        tradition: "Universal Wisdom",
        habitContext: "Your habits are the building blocks of greatness.",
        date: new Date().toISOString().split('T')[0],
      });
    }
  });

  // Seed data if empty
  const habitsList = await storage.getHabits();
  if (habitsList.length === 0) {
    await storage.createHabit({ name: 'Morning Exercise', color: 'bg-blue-500', difficulty: 3, xpReward: 300, category: 'fitness' });
    await storage.createHabit({ name: 'Read 30 Minutes', color: 'bg-green-500', difficulty: 2, xpReward: 200, category: 'learning' });
    await storage.createHabit({ name: 'Meditate', color: 'bg-purple-500', difficulty: 2, xpReward: 200, category: 'mindfulness' });
    await storage.createHabit({ name: 'Drink Water', color: 'bg-cyan-500', difficulty: 1, xpReward: 100, category: 'health' });
  }

  // Initialize achievements
  await storage.initializeAchievements();

  // --- Philosophy Documents Routes ---
  const philosophyDocInputSchema = z.object({
    title: z.string().min(1, "Title is required"),
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileSize: z.number().positive(),
    objectPath: z.string().min(1),
    category: z.string().optional().default("personal"),
  });

  app.get('/api/philosophy-documents', async (req, res) => {
    const docs = await storage.getPhilosophyDocuments();
    res.json(docs);
  });

  app.get('/api/philosophy-documents/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const doc = await storage.getPhilosophyDocument(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json(doc);
  });

  app.post('/api/philosophy-documents', async (req, res) => {
    try {
      const input = philosophyDocInputSchema.parse(req.body);
      const doc = await storage.createPhilosophyDocument(input);
      res.status(201).json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      } else {
        res.status(500).json({ message: "Failed to create document" });
      }
    }
  });

  app.put('/api/philosophy-documents/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const input = philosophyDocInputSchema.partial().parse(req.body);
      const doc = await storage.updatePhilosophyDocument(id, input);
      res.json(doc);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0]?.message || "Invalid input" });
      } else {
        res.status(500).json({ message: "Failed to update document" });
      }
    }
  });

  app.delete('/api/philosophy-documents/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deletePhilosophyDocument(id);
    res.status(204).end();
  });

  // Toggle document AI inclusion
  app.post('/api/philosophy-documents/:id/toggle-ai', async (req, res) => {
    const id = parseInt(req.params.id);
    const doc = await storage.getPhilosophyDocument(id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    
    const updated = await storage.updatePhilosophyDocument(id, { 
      useForAi: !doc.useForAi 
    });
    res.json(updated);
  });

  // --- User Profile Routes ---
  app.get('/api/profile', async (req, res) => {
    const profile = await storage.getUserProfile();
    res.json(profile);
  });

  app.put('/api/profile', async (req, res) => {
    try {
      const profile = await storage.updateUserProfile(req.body);
      res.json(profile);
    } catch (err) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // --- Progressive Goal Generation ---
  app.post('/api/goals/:id/generate-next', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const completedGoal = await storage.getGoal(id);
      if (!completedGoal) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      // Get philosophy documents for AI context
      const philosophyDocs = await storage.getActivePhilosophyDocuments();
      const philosophyContext = philosophyDocs
        .filter(doc => doc.aiSummary || doc.keyThemes?.length)
        .map(doc => `${doc.title}: ${doc.aiSummary || doc.keyThemes?.join(', ')}`)
        .slice(0, 3)
        .join('\n');
      
      const habits = await storage.getHabits();
      const goals = await storage.getGoals();
      const stats = await storage.getUserStats();

      const prompt = `
You are an expert life coach creating a progressive follow-up goal.

Just Completed Goal: "${completedGoal.title}"
${completedGoal.description ? `Description: ${completedGoal.description}` : ''}
Difficulty: ${completedGoal.difficulty}/3
Category: ${completedGoal.category || 'personal'}
${completedGoal.steps?.length ? `Steps completed: ${completedGoal.steps.map(s => s.title).join(', ')}` : ''}

User Stats:
- Level: ${stats.level}
- Total XP: ${stats.totalXp}

${philosophyContext ? `User's Philosophy/Values (from their library):\n${philosophyContext}\n` : ''}

Current Active Goals: ${goals.filter(g => !g.completed).map(g => g.title).join(", ") || "None"}
Current Habits: ${habits.map(h => h.name).join(", ") || "None"}

Create a natural progression goal that builds on what the user just achieved.
The new goal should be slightly more challenging (increase difficulty by 1 level if under 3).
Align the goal with the user's documented philosophy/values if available.

Return JSON format:
{
  "goal": {
    "title": "Clear, motivating goal title that builds on previous achievement",
    "description": "Detailed description showing progression from previous goal",
    "difficulty": ${Math.min(3, (completedGoal.difficulty || 1) + 1)},
    "category": "${completedGoal.category || 'personal'}",
    "steps": [
      {
        "id": "step-1",
        "title": "First actionable step",
        "completed": false,
        "suggestedHabit": "Daily habit to support this step"
      }
    ]
  },
  "rationale": "Brief explanation of how this builds on the previous goal"
}

Ensure exactly 5-7 steps are included.
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      if (!result.goal) {
        return res.status(500).json({ message: "Failed to generate progressive goal" });
      }

      // Set XP reward based on difficulty
      const xpByDifficulty: Record<number, number> = { 1: 1000, 2: 2000, 3: 3000 };
      result.goal.xpReward = xpByDifficulty[result.goal.difficulty] || 2000;
      result.goal.parentGoalId = id;

      res.json(result);
    } catch (error) {
      console.error("Progressive goal generation error:", error);
      res.status(500).json({ message: "Failed to generate progressive goal" });
    }
  });

  // --- AI Suggestions with Philosophy Library Integration ---
  app.post('/api/suggestions/philosophy-enhanced', async (req, res) => {
    try {
      const { context } = req.body;
      const habits = await storage.getHabits();
      const goals = await storage.getGoals();
      const stats = await storage.getUserStats();
      const philosophyDocs = await storage.getActivePhilosophyDocuments();
      
      const philosophyContext = philosophyDocs
        .filter(doc => doc.aiSummary || doc.extractedText || doc.keyThemes?.length)
        .map(doc => {
          let content = `Document: ${doc.title} (${doc.category})\n`;
          if (doc.aiSummary) content += `Summary: ${doc.aiSummary}\n`;
          if (doc.keyThemes?.length) content += `Themes: ${doc.keyThemes.join(', ')}\n`;
          return content;
        })
        .slice(0, 5)
        .join('\n');

      const prompt = `
You are a personalized life coach with deep understanding of the user's values and philosophy.

User Level: ${stats.level}
Current Habits: ${habits.map(h => `${h.name} (${h.category})`).join(", ") || "None"}
Current Goals: ${goals.filter(g => !g.completed).map(g => g.title).join(", ") || "None"}
User's Focus: ${context || "General self-improvement"}

${philosophyContext ? `
USER'S PERSONAL PHILOSOPHY & VALUES:
${philosophyContext}

Use these documents to inform your suggestions. Reference specific principles or themes from their library when explaining why each suggestion fits them.
` : ''}

Generate 3 highly personalized suggestions (mix of habits and goals) that:
1. Align with their documented philosophy and values
2. Complement their existing habits and goals
3. Match their current level and progression

Return JSON format:
{
  "suggestions": [
    {
      "type": "habit" | "goal",
      "title": "...",
      "description": "...",
      "difficulty": 1-3,
      "category": "fitness|health|learning|mindfulness|productivity|personal|work|finance|social|creative",
      "reason": "Explain how this aligns with their philosophy/values",
      "philosophyReference": "Name of document or theme this draws from (if applicable)"
    }
  ]
}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        max_tokens: 600,
      });

      const result = JSON.parse(response.choices[0].message.content || '{"suggestions": []}');
      res.json(result);
    } catch (error) {
      console.error("Philosophy-enhanced suggestion error:", error);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  // --- Shop System ---
  
  // Get player inventory
  app.get('/api/shop/inventory', async (_req, res) => {
    try {
      const items = await storage.getInventory();
      res.json(items);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Failed to get inventory" });
    }
  });

  // Get active effects
  app.get('/api/shop/effects', async (_req, res) => {
    try {
      await storage.removeExpiredEffects();
      const effects = await storage.getActiveEffects();
      res.json(effects);
    } catch (error) {
      console.error("Get effects error:", error);
      res.status(500).json({ message: "Failed to get active effects" });
    }
  });

  // Purchase item from shop
  app.post('/api/shop/purchase', async (req, res) => {
    try {
      const { itemId, quantity = 1 } = req.body;
      
      // Import shop items dynamically
      const { ALL_SHOP_ITEMS } = await import("@shared/shopItems");
      const shopItem = ALL_SHOP_ITEMS.find(item => item.id === itemId);
      
      if (!shopItem) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      const totalCost = shopItem.price.gold * quantity;
      const stats = await storage.getUserStats();
      
      if ((stats.currentGold || 0) < totalCost) {
        return res.status(400).json({ message: "Insufficient gold", required: totalCost, available: stats.currentGold || 0 });
      }
      
      // Deduct gold
      const { stats: updatedStats } = await storage.updateUserStats(0, -totalCost);
      
      // Add to inventory
      const inventoryItem = await storage.addInventoryItem(itemId, quantity);
      
      res.json({ 
        success: true, 
        item: inventoryItem, 
        goldSpent: totalCost,
        remainingGold: updatedStats.currentGold || 0
      });
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(500).json({ message: "Failed to purchase item" });
    }
  });

  // Use item from inventory
  app.post('/api/shop/use', async (req, res) => {
    try {
      const { itemId } = req.body;
      
      const inventoryItem = await storage.getInventoryItem(itemId);
      if (!inventoryItem || (inventoryItem.quantity || 0) <= 0) {
        return res.status(400).json({ message: "Item not in inventory" });
      }
      
      const { ALL_SHOP_ITEMS } = await import("@shared/shopItems");
      const shopItem = ALL_SHOP_ITEMS.find(item => item.id === itemId);
      
      if (!shopItem) {
        return res.status(404).json({ message: "Item definition not found" });
      }
      
      // Apply item effects
      const effects: any[] = [];
      
      for (const effect of shopItem.effects) {
        if (effect.type === 'xp_multiplier' || effect.type === 'gold_multiplier') {
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + (effect.duration || 24));
          
          const activeEffect = await storage.addActiveEffect({
            effectType: effect.type,
            value: effect.value,
            expiresAt,
            itemId,
          });
          effects.push(activeEffect);
        } else if (effect.type === 'instant_xp') {
          await storage.updateUserStats(effect.value);
        } else if (effect.type === 'instant_gold') {
          await storage.updateUserStats(0, effect.value);
        } else if (effect.type === 'stat_boost') {
          const statUpdates: any = {};
          statUpdates[effect.stat!] = effect.value;
          await storage.updateUserStats(0, 0, statUpdates);
        }
      }
      
      // Remove from inventory
      await storage.removeInventoryItem(itemId, 1);
      
      res.json({ success: true, appliedEffects: effects });
    } catch (error) {
      console.error("Use item error:", error);
      res.status(500).json({ message: "Failed to use item" });
    }
  });

  return httpServer;
}
