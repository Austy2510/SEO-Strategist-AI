import { db } from "./db";
import { audits, type InsertAudit, type Audit } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAudits(): Promise<Audit[]>;
  getAudit(id: number): Promise<Audit | undefined>;
  createAudit(audit: InsertAudit): Promise<Audit>;
}

export class DatabaseStorage implements IStorage {
  async getAudits(): Promise<Audit[]> {
    return await db.select().from(audits).orderBy(desc(audits.createdAt));
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit;
  }

  async createAudit(audit: InsertAudit): Promise<Audit> {
    const [newAudit] = await db.insert(audits).values(audit).returning();
    return newAudit;
  }
}

export const storage = new DatabaseStorage();
