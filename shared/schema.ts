import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conversations, messages } from "./models/chat";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Keeping username for legacy/internal use, or can map to email
  email: text("email").unique(),
  password: text("password"),
  name: text("name"),
  isPro: boolean("is_pro").default(false).notNull(),
  scansToday: integer("scans_today").default(0).notNull(),
  lastScanDate: timestamp("last_scan_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Foreign key to users
  url: text("url").notNull(),
  score: integer("score").notNull(),
  title: text("title"),
  metaDescription: text("meta_description"),
  h1: text("h1"),
  h2s: text("h2s").array(),
  // New Technical SEO Fields
  images: jsonb("images"),
  links: jsonb("links"),
  loadTime: integer("load_time"),
  performanceScore: integer("performance_score"),
  keywordDensity: jsonb("keyword_density"),
  recommendations: text("recommendations").array(),
  publicId: text("public_id").unique(), // For sharing
  createdAt: timestamp("created_at").defaultNow(),
});

export const keywordClusters = pgTable("keyword_clusters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"), // Foreign key to users
  name: text("name").notNull(),
  data: jsonb("data").notNull(), // The cluster data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, scansToday: true, lastScanDate: true });
export const insertAuditSchema = createInsertSchema(audits).omit({ id: true, createdAt: true });
export const insertKeywordClusterSchema = createInsertSchema(keywordClusters).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type KeywordCluster = typeof keywordClusters.$inferSelect;
export type InsertKeywordCluster = z.infer<typeof insertKeywordClusterSchema>;

export type CreateAuditRequest = { url: string };



// AI SEO Suggest Schemas - V2
export const seoModeSchema = z.enum(["research", "website", "content", "page"]);
export const techStackSchema = z.enum(["wordpress", "php", "react", "laravel", "static", "other"]);
export type SeoMode = z.infer<typeof seoModeSchema>;

export const suggestInputSchema = z.object({
  mode: seoModeSchema.default("research"),

  // common / research
  keyword: z.string().optional(), // optional because content mode might not need it initially
  country: z.string().default("US"),
  language: z.string().default("en"),
  intent: z.enum(["Informational", "Navigational", "Commercial", "Transactional"]).default("Informational"),
  businessType: z.enum(["Blog", "E-commerce", "SaaS", "Service", "News", "Local Business"]).default("Blog"),

  // website mode
  url: z.string().optional(),
  techStack: techStackSchema.default("wordpress"),

  // content mode
  content: z.string().optional(),

  // page mode
  pageType: z.string().default("Landing Page"),
});

export const suggestOutputSchema = z.object({
  // General Strategy
  strategy: z.array(z.string()),

  // Research Mode Data
  marketAnalysis: z.string().optional(),
  primaryKeyword: z.object({
    term: z.string(),
    volume: z.string(),
    difficulty: z.string(),
  }).optional(),
  secondaryKeywords: z.array(z.object({
    term: z.string(),
    intent: z.string(),
    difficulty: z.string(),
  })).optional(),
  longTailKeywords: z.array(z.string()).optional(),
  competitorInsights: z.array(z.string()).optional(),
  contentIdeas: z.array(z.object({
    title: z.string(),
    type: z.string(),
    audience: z.string(),
  })).optional(),

  // Website/Technical Mode Data
  technicalAudit: z.array(z.object({
    issue: z.string(),
    priority: z.string(), // High, Medium, Low
    fix: z.string(),
  })).optional(),

  // Content Mode Data
  contentAnalysis: z.object({
    score: z.number(),
    improvedTitle: z.string(),
    metaDescription: z.string(),
    contentGaps: z.array(z.string()),
    lsiKeywords: z.array(z.string()),
  }).optional(),

  // Page Mode Data
  onPageOptimizations: z.array(z.object({
    element: z.string(), // H1, Title, Meta, etc.
    suggestion: z.string(),
  })).optional(),
});

export type SuggestInput = z.infer<typeof suggestInputSchema>;
export type SuggestOutput = z.infer<typeof suggestOutputSchema>;

// Export chat models
export * from "./models/chat";
