import { z } from 'zod';
import { insertHabitSchema, insertGoalSchema, habits, goals, userStats } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  habits: {
    list: {
      method: 'GET' as const,
      path: '/api/habits',
      responses: {
        200: z.array(z.custom<any>()), // Returns HabitWithStats
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/habits',
      input: insertHabitSchema,
      responses: {
        201: z.custom<typeof habits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/habits/:id',
      input: insertHabitSchema.partial(),
      responses: {
        200: z.custom<typeof habits.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/habits/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    toggle: {
      method: 'POST' as const,
      path: '/api/habits/:id/toggle',
      input: z.object({ date: z.string(), completed: z.boolean() }),
      responses: {
        200: z.object({ 
          xpGained: z.number(), 
          newLevel: z.number().optional(),
          leveledUp: z.boolean().optional(),
          unlockedAchievement: z.any().nullable().optional()
        }),
        404: errorSchemas.notFound,
      },
    },
  },
  goals: {
    list: {
      method: 'GET' as const,
      path: '/api/goals',
      responses: {
        200: z.array(z.custom<typeof goals.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/goals',
      input: insertGoalSchema,
      responses: {
        201: z.custom<typeof goals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/goals/:id',
      input: insertGoalSchema.partial(),
      responses: {
        200: z.custom<typeof goals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/goals/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.custom<typeof userStats.$inferSelect>(),
      },
    },
    analytics: {
      method: 'GET' as const,
      path: '/api/analytics',
      responses: {
        200: z.object({
          dailyData: z.array(z.object({ name: z.string(), percentage: z.number(), completions: z.number(), total: z.number() })),
          weeklyData: z.array(z.object({ name: z.string(), percentage: z.number(), completions: z.number(), total: z.number() })),
          monthlyData: z.array(z.object({ name: z.string(), percentage: z.number(), completions: z.number(), total: z.number() })),
          yearlyData: z.array(z.object({ name: z.string(), percentage: z.number(), completions: z.number(), total: z.number() })),
          overallGrowth: z.string(),
          weeklyProgress: z.string(),
          overallCompletion: z.string(),
          habitStats: z.array(z.object({
            id: z.number(),
            name: z.string(),
            completionRate: z.number(),
            tier: z.enum(['critical', 'needs-work', 'good', 'excellent']),
            tierLabel: z.string(),
            suggestion: z.string().optional(),
          })),
          habitStatsByTimeframe: z.object({
            daily: z.array(z.object({
              id: z.number(),
              name: z.string(),
              completionRate: z.number(),
              tier: z.enum(['critical', 'needs-work', 'good', 'excellent']),
              tierLabel: z.string(),
              suggestion: z.string().optional(),
            })),
            weekly: z.array(z.object({
              id: z.number(),
              name: z.string(),
              completionRate: z.number(),
              tier: z.enum(['critical', 'needs-work', 'good', 'excellent']),
              tierLabel: z.string(),
              suggestion: z.string().optional(),
            })),
            monthly: z.array(z.object({
              id: z.number(),
              name: z.string(),
              completionRate: z.number(),
              tier: z.enum(['critical', 'needs-work', 'good', 'excellent']),
              tierLabel: z.string(),
              suggestion: z.string().optional(),
            })),
            yearly: z.array(z.object({
              id: z.number(),
              name: z.string(),
              completionRate: z.number(),
              tier: z.enum(['critical', 'needs-work', 'good', 'excellent']),
              tierLabel: z.string(),
              suggestion: z.string().optional(),
            })),
          }),
          streakData: z.object({
            currentStreak: z.number(),
            longestStreak: z.number(),
            totalCompletions: z.number(),
          }),
          categoryBreakdown: z.array(z.object({
            category: z.string(),
            completionRate: z.number(),
            count: z.number(),
          })),
        }),
      },
    },
  },
  suggestions: {
    generate: {
      method: 'POST' as const,
      path: '/api/suggestions',
      input: z.object({ context: z.string().optional() }),
      responses: {
        200: z.object({
          suggestions: z.array(z.object({
            type: z.enum(['habit', 'goal']),
            title: z.string(),
            description: z.string(),
            difficulty: z.number(),
            reason: z.string(),
          })),
        }),
      },
    },
    generateFullGoal: {
      method: 'POST' as const,
      path: '/api/suggestions/full-goal',
      input: z.object({ context: z.string() }),
      responses: {
        200: z.object({
          goal: z.object({
            title: z.string(),
            description: z.string(),
            difficulty: z.number(),
            xpReward: z.number(),
            steps: z.array(z.object({
              id: z.string(),
              title: z.string(),
              completed: z.boolean(),
              suggestedHabit: z.string().optional(),
            })),
          }),
        }),
      },
    },
    goalSteps: {
      method: 'POST' as const,
      path: '/api/goals/:id/suggest-steps',
      input: z.object({}),
      responses: {
        200: z.object({
          steps: z.array(z.object({
            id: z.string(),
            title: z.string(),
            completed: z.boolean(),
            suggestedHabit: z.string().optional(),
          })),
        }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
