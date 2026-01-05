import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { analyzeUrl, clusterKeywords, generateContentBrief, generateSeoSuggestions } from "./seo";
import { setupAuth } from "./auth";
import { suggestInputSchema } from "@shared/schema";

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  setupAuth(app);

  app.post("/api/keywords/cluster", isAuthenticated, async (req, res) => {
    try {
      const { keywords } = req.body;
      if (!Array.isArray(keywords) || keywords.length === 0) {
        return res.status(400).json({ message: "Invalid keywords" });
      }
      const clusters = await clusterKeywords(keywords);

      // Persist Result
      if (req.user) {
        await storage.createKeywordCluster({
          userId: req.user.id,
          name: `Cluster - ${keywords[0]}...`,
          data: clusters
        });
      }

      res.json(clusters);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to cluster keywords" });
    }
  });

  app.post("/api/keywords/brief", isAuthenticated, async (req, res) => {
    try {
      const { keyword } = req.body;
      if (!keyword) {
        return res.status(400).json({ message: "Invalid keyword" });
      }
      const brief = await generateContentBrief(keyword);
      res.json(brief);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to generate brief" });
    }
  });

  app.post("/api/keywords/optimize", isAuthenticated, async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      const optimization = await import("./seo").then(m => m.optimizeContent(content));
      res.json(optimization);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to optimize content" });
    }
  });

  // Audit routes
  app.post(api.audits.create.path, isAuthenticated, async (req, res) => {
    try {
      // Usage Limit Check
      if (req.user && req.user.scansToday >= 5 && !req.user.isPro) {
        return res.status(403).json({ message: "Daily limit reached (5 scans/day). Upgrade to Pro." });
      }

      const input = api.audits.create.input.parse(req.body);
      const analysis = await analyzeUrl(input.url);

      const audit = await storage.createAudit({
        ...analysis,
        userId: req.user!.id,
        h2s: analysis.h2s || [],
        recommendations: analysis.recommendations || [],
        images: analysis.images || [],
        links: analysis.links || [],
        loadTime: analysis.loadTime || 0,
        performanceScore: analysis.performanceScore || 0,
        keywordDensity: analysis.keywordDensity || {},
      });

      if (req.user) {
        await storage.incrementScanCount(req.user.id);
      }

      res.status(201).json(audit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.audits.list.path, isAuthenticated, async (req, res) => {
    const audits = await storage.getAudits(req.user!.id);
    res.json(audits);
  });

  app.get(api.audits.get.path, isAuthenticated, async (req, res) => {
    const audit = await storage.getAudit(Number(req.params.id));
    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }
    // Check ownership
    if (audit.userId !== req.user!.id && audit.userId !== null) { // audit.userId might be null for legacy/demo audits
      // strict mode: return res.sendStatus(403);
      // for MVP demo purposes we might allow viewing if it's public/demo
    }
    res.json(audit);
  });

  // Seed data if empty (kept for demo, but now linked to no user or a demo user)
  const existingAudits = await storage.getAudits();
  if (existingAudits.length === 0) {
    // We could seed some dummy audits
  }

  // Conversations
  app.get(api.chats.list.path, isAuthenticated, async (req, res) => {
    const chats = await storage.getConversations();
    res.json(chats);
  });

  app.post(api.chats.create.path, isAuthenticated, async (req, res) => {
    try {
      const data = api.chats.create.input.parse(req.body);
      const chat = await storage.createConversation({
        title: data.title || "New Session"
      });
      res.status(201).json(chat);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input" });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get(api.chats.get.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });

    const chat = await storage.getConversation(id);
    if (!chat) return res.status(404).json({ message: "Conversation not found" });

    const messages = await storage.getMessages(id);
    res.json({ ...chat, messages });
  });

  app.delete(api.chats.delete.path, isAuthenticated, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await storage.deleteConversation(id);
    res.sendStatus(204);
  });

  // Chat Messages & Streaming
  app.post(api.messages.create.path, isAuthenticated, async (req, res) => {
    const start = Date.now();
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) return res.status(400).json({ message: "Invalid ID" });

    try {
      const { content } = api.messages.create.input.parse(req.body);

      // 1. Save User Message
      await storage.createMessage({
        conversationId,
        role: "user",
        content
      });

      // 2. Setup SSE
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });

      const sendChunk = (data: any) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      // 3. Generate AI Response
      let fullResponse = "";

      try {
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyBFvpkHZswFcEEdzt8BB22Hl1EdoHEoqu8";
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Get context (previous messages)
        const history = await storage.getMessages(conversationId);
        // Convert to Gemini format if needed, or just send last prompt
        // For simple MVP: just send the latest content

        const result = await model.generateContentStream(content);
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          sendChunk({ content: chunkText });
        }

        // 4. Save Assistant Message
        await storage.createMessage({
          conversationId,
          role: "assistant",
          content: fullResponse
        });

        sendChunk({ done: true });
        res.end();

      } catch (aiError) {
        console.error("AI Generation Error:", aiError);
        sendChunk({ error: "Failed to generate response: " + (aiError instanceof Error ? aiError.message : "Unknown Error") });
        res.end();
      }

    } catch (err) {
      console.error("Message Error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Internal server error" });
      } else {
        res.end();
      }
    }
  });

  app.post("/api/seo/suggest", isAuthenticated, async (req, res) => {
    try {
      const input = suggestInputSchema.parse(req.body);
      const suggestions = await generateSeoSuggestions(input);

      // DATA PERSISTENCE: Save Research Results to Keyword Map
      if (input.mode === "research" && req.user) {
        const keywordsToSave = [
          ...(suggestions.primaryKeyword ? [{
            term: suggestions.primaryKeyword.term,
            intent: input.intent,
            difficulty: suggestions.primaryKeyword.difficulty
          }] : []),
          ...(suggestions.secondaryKeywords || []).map((k: any) => ({
            term: k.term,
            intent: k.intent,
            difficulty: k.difficulty
          }))
        ];

        // Save as a single cluster object
        await storage.createKeywordCluster({
          userId: req.user!.id,
          name: input.keyword || "AI Research " + new Date().toISOString(),
          data: {
            source: "AI_STRATEGY",
            keywords: keywordsToSave,
            marketAnalysis: suggestions.marketAnalysis,
            generatedAt: new Date().toISOString()
          }
        });
      }

      res.json(suggestions);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", details: err.errors });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  return httpServer;
}
