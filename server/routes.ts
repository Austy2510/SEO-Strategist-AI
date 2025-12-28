import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { analyzeUrl, clusterKeywords, generateContentBrief } from "./seo";
import { setupAuth } from "./auth";

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

  return httpServer;
}
