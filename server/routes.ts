import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";
import { registerImageRoutes } from "./replit_integrations/image";
import { analyzeUrl } from "./seo";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register integration routes
  registerChatRoutes(app);
  registerImageRoutes(app);

  // Audit routes
  app.post(api.audits.create.path, async (req, res) => {
    try {
      const input = api.audits.create.input.parse(req.body);
      const analysis = await analyzeUrl(input.url);
      const audit = await storage.createAudit({
        ...analysis,
        h2s: analysis.h2s || [],
        recommendations: analysis.recommendations || [],
      });
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

  app.get(api.audits.list.path, async (req, res) => {
    const audits = await storage.getAudits();
    res.json(audits);
  });

  app.get(api.audits.get.path, async (req, res) => {
    const audit = await storage.getAudit(Number(req.params.id));
    if (!audit) {
      return res.status(404).json({ message: 'Audit not found' });
    }
    res.json(audit);
  });

  // Seed data if empty
  const existingAudits = await storage.getAudits();
  if (existingAudits.length === 0) {
    // We could seed some dummy audits, but analysis is real-time.
    // Let's seed a sample one for UI testing.
    await storage.createAudit({
      url: "https://example.com",
      score: 85,
      title: "Example Domain",
      metaDescription: "This domain is for use in illustrative examples in documents.",
      h1: "Example Domain",
      h2s: ["More Information"],
      keywordDensity: { "domain": 5.5, "example": 4.2 },
      recommendations: ["Add more content", "Improve H2 structure"],
    });
  }

  return httpServer;
}
