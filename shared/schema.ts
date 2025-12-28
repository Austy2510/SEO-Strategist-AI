import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { conversations, messages } from "./models/chat";

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  score: integer("score").notNull(),
  title: text("title"),
  metaDescription: text("meta_description"),
  h1: text("h1"),
  h2s: text("h2s").array(),
  keywordDensity: jsonb("keyword_density"),
  recommendations: text("recommendations").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAuditSchema = createInsertSchema(audits).omit({ id: true, createdAt: true });

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;

export type CreateAuditRequest = { url: string };

// Export chat models
export * from "./models/chat";
