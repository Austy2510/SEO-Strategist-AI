import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conversations, messages } from "./models/chat";

// User Schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
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

export type CreateAuditRequest = { url: string };

// Export chat models
export * from "./models/chat";
