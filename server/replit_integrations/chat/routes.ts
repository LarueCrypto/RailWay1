import type { Express, Request, Response } from "express";
import OpenAI from "openai";
import { chatStorage } from "./storage";
import { storage } from "../../storage";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

async function buildSystemPrompt(): Promise<string> {
  const habits = await storage.getHabits();
  const goals = await storage.getGoals();
  const stats = await storage.getUserStats();
  const completions = await storage.getAllCompletions();
  
  // Calculate streak from completions
  const sortedDates = Array.from(new Set(completions.map(c => c.date))).sort().reverse();
  let currentStreak = 0;
  const today = new Date().toISOString().split('T')[0];
  for (const date of sortedDates) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - currentStreak);
    const expectedDate = checkDate.toISOString().split('T')[0];
    if (date === expectedDate || date === today) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  const activeGoals = goals.filter(g => !g.completed);
  const habitsList = habits.map(h => `- ${h.name} (${h.category}, Tier ${h.difficulty})`).join('\n');
  const goalsList = activeGoals.map(g => {
    const stepsCompleted = g.steps?.filter(s => s.completed).length || 0;
    const totalSteps = g.steps?.length || 0;
    return `- ${g.title} (${stepsCompleted}/${totalSteps} steps done, ${g.progress}% progress)`;
  }).join('\n');
  
  return `You are Level Up Coach, an expert gamified productivity assistant. You provide personalized, actionable guidance to help users build habits, achieve goals, and level up their life.

USER PROFILE:
- Current Level: ${stats.level || 1}
- Total XP: ${stats.totalXp || 0}
- Current Streak: ${currentStreak} days

ACTIVE HABITS:
${habitsList || 'No habits yet - suggest starting with 1-2 simple habits!'}

ACTIVE GOALS:
${goalsList || 'No goals yet - help them set their first goal!'}

YOUR APPROACH:
1. **Step-by-Step Guides**: When users ask how to achieve something, provide clear numbered steps they can follow.
2. **Actionable Advice**: Give specific, concrete actions rather than vague suggestions.
3. **Resource Recommendations**: Suggest helpful web resources, apps, books, or tools when relevant. Format as: "[Resource Name](brief description of why it helps)"
4. **Gamification Mindset**: Frame progress in terms of XP gains, leveling up, and building streaks.
5. **Habit Stacking**: Suggest connecting new habits to existing routines.
6. **Progress Focus**: Celebrate their current level and streak, encourage consistency.

RESPONSE FORMAT:
- Use markdown formatting for clarity (headers, bullet points, numbered lists)
- Keep responses focused and scannable
- Include 2-3 relevant resource suggestions when applicable
- End with a specific next action or question to keep them engaged

Be encouraging but practical. Focus on sustainable progress over perfection.`;
}

export function registerChatRoutes(app: Express): void {
  // Get all conversations
  app.get("/api/conversations", async (req: Request, res: Response) => {
    try {
      const conversations = await chatStorage.getAllConversations();
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get single conversation with messages
  app.get("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const conversation = await chatStorage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }
      const messages = await chatStorage.getMessagesByConversation(id);
      res.json({ ...conversation, messages });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  // Create new conversation
  app.post("/api/conversations", async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const conversation = await chatStorage.createConversation(title || "New Chat");
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  // Delete conversation
  app.delete("/api/conversations/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await chatStorage.deleteConversation(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Failed to delete conversation" });
    }
  });

  // Send message and get AI response (streaming)
  app.post("/api/conversations/:id/messages", async (req: Request, res: Response) => {
    try {
      const conversationId = parseInt(req.params.id);
      const { content } = req.body;

      // Save user message
      await chatStorage.createMessage(conversationId, "user", content);

      // Get conversation history for context
      const messages = await chatStorage.getMessagesByConversation(conversationId);
      
      // Build system prompt with user context
      const systemPrompt = await buildSystemPrompt();
      
      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ];

      // Set up SSE
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: chatMessages,
        stream: true,
        max_completion_tokens: 2048,
      });

      let fullResponse = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      // Save assistant message
      await chatStorage.createMessage(conversationId, "assistant", fullResponse);

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Error sending message:", error);
      // Check if headers already sent (SSE streaming started)
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Failed to send message" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to send message" });
      }
    }
  });
}

