import { db } from "./db";
import { audits, users, keywordClusters, conversations, messages, type InsertAudit, type Audit, type InsertUser, type User, type InsertKeywordCluster, type KeywordCluster, type InsertConversation, type Conversation, type InsertMessage, type Message } from "@shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  incrementScanCount(userId: number): Promise<void>;
  resetScanCounts(): Promise<void>;

  // Audits
  getAudits(userId?: number): Promise<Audit[]>;
  getAudit(id: number): Promise<Audit | undefined>;
  createAudit(audit: InsertAudit): Promise<Audit>;

  // Keywords
  getKeywordClusters(userId?: number): Promise<KeywordCluster[]>;
  createKeywordCluster(cluster: InsertKeywordCluster): Promise<KeywordCluster>;

  // Chats
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversations(): Promise<Conversation[]>;
  getConversation(id: number): Promise<Conversation | undefined>;
  deleteConversation(id: number): Promise<void>;
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(conversationId: number): Promise<Message[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async incrementScanCount(userId: number): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.update(users)
      .set({
        scansToday: sql`${users.scansToday} + 1`,
        lastScanDate: new Date()
      })
      .where(eq(users.id, userId));
  }

  async resetScanCounts(): Promise<void> {
    // Implement if needed
  }

  async getAudits(userId?: number): Promise<Audit[]> {
    if (!db) throw new Error("Database not initialized");
    if (userId) {
      return await db.select().from(audits).where(eq(audits.userId, userId)).orderBy(desc(audits.createdAt));
    }
    return await db.select().from(audits).orderBy(desc(audits.createdAt));
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit;
  }

  async createAudit(audit: InsertAudit): Promise<Audit> {
    if (!db) throw new Error("Database not initialized");
    const [newAudit] = await db.insert(audits).values(audit).returning();
    return newAudit;
  }

  async getKeywordClusters(userId?: number): Promise<KeywordCluster[]> {
    if (!db) throw new Error("Database not initialized");
    if (userId) {
      return await db.select().from(keywordClusters).where(eq(keywordClusters.userId, userId)).orderBy(desc(keywordClusters.createdAt));
    }
    return [];
  }

  async createKeywordCluster(cluster: InsertKeywordCluster): Promise<KeywordCluster> {
    if (!db) throw new Error("Database not initialized");
    const [newCluster] = await db.insert(keywordClusters).values(cluster).returning();
    return newCluster;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    if (!db) throw new Error("Database not initialized");
    const [newChat] = await db.insert(conversations).values(conversation).returning();
    return newChat;
  }

  async getConversations(): Promise<Conversation[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(conversations).orderBy(desc(conversations.createdAt));
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [chat] = await db.select().from(conversations).where(eq(conversations.id, id));
    return chat;
  }

  async deleteConversation(id: number): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    if (!db) throw new Error("Database not initialized");
    const [newMsg] = await db.insert(messages).values(message).returning();
    return newMsg;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }
}

export class MemStorage implements IStorage {
  private audits: Audit[];
  private users: User[];
  private keywordClusters: KeywordCluster[];
  private conversations: Conversation[];
  private messages: Message[];

  private currentId: number;
  private currentUserId: number;
  private currentClusterId: number;
  private currentChatId: number;
  private currentMsgId: number;

  constructor() {
    this.audits = [];
    this.users = [];
    this.keywordClusters = [];
    this.conversations = [];
    this.messages = [];

    this.currentId = 1;
    this.currentUserId = 1;
    this.currentClusterId = 1;
    this.currentChatId = 1;
    this.currentMsgId = 1;

    // Seed test user
    this.createUser({ username: "demo_user", isPro: false });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = {
      ...user,
      id,
      createdAt: new Date(),
      isPro: user.isPro ?? false,
      scansToday: 0,
      lastScanDate: new Date(),
      email: user.email ?? null,
      password: user.password ?? null,
      name: user.name ?? null
    };
    this.users.push(newUser);
    return newUser;
  }

  async incrementScanCount(userId: number): Promise<void> {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const now = new Date();
      if (user.lastScanDate && user.lastScanDate.getDate() !== now.getDate()) {
        user.scansToday = 0;
      }
      user.scansToday = (user.scansToday || 0) + 1;
      user.lastScanDate = now;
    }
  }

  async resetScanCounts(): Promise<void> { }

  async getAudits(userId?: number): Promise<Audit[]> {
    if (userId) {
      return this.audits.filter(a => a.userId === userId);
    }
    return this.audits;
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    return this.audits.find((a) => a.id === id);
  }

  async createAudit(audit: InsertAudit): Promise<Audit> {
    const id = this.currentId++;
    const newAudit: Audit = {
      ...audit,
      id,
      userId: audit.userId ?? null,
      createdAt: new Date(),
      title: audit.title ?? null,
      metaDescription: audit.metaDescription ?? null,
      h1: audit.h1 ?? null,
      h2s: audit.h2s ?? null,
      recommendations: audit.recommendations ?? null,
      keywordDensity: audit.keywordDensity ?? null,
      images: audit.images ?? null,
      links: audit.links ?? null,
      loadTime: audit.loadTime ?? null,
      performanceScore: audit.performanceScore ?? null,
      publicId: audit.publicId ?? null
    };
    this.audits.push(newAudit);
    return newAudit;
  }

  async getKeywordClusters(userId?: number): Promise<KeywordCluster[]> {
    if (userId) {
      return this.keywordClusters.filter(k => k.userId === userId);
    }
    return [];
  }

  async createKeywordCluster(cluster: InsertKeywordCluster): Promise<KeywordCluster> {
    const id = this.currentClusterId++;
    const newCluster: KeywordCluster = {
      ...cluster,
      id,
      userId: cluster.userId ?? null,
      createdAt: new Date()
    };
    this.keywordClusters.push(newCluster);
    return newCluster;
  }

  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const id = this.currentChatId++;
    const newChat: Conversation = {
      ...conversation,
      id,
      createdAt: new Date()
    };
    this.conversations.push(newChat);
    return newChat;
  }

  async getConversations(): Promise<Conversation[]> {
    return [...this.conversations].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getConversation(id: number): Promise<Conversation | undefined> {
    return this.conversations.find(c => c.id === id);
  }

  async deleteConversation(id: number): Promise<void> {
    this.conversations = this.conversations.filter(c => c.id !== id);
    this.messages = this.messages.filter(m => m.conversationId !== id);
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentMsgId++;
    const newMsg: Message = {
      ...message,
      id,
      createdAt: new Date()
    };
    this.messages.push(newMsg);
    return newMsg;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
