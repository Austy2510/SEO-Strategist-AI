import { z } from 'zod';
import { insertAuditSchema, audits, conversations, messages, insertConversationSchema, insertMessageSchema } from './schema';

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
  audits: {
    create: {
      method: 'POST' as const,
      path: '/api/audits',
      input: z.object({ url: z.string().url() }),
      responses: {
        201: z.custom<typeof audits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/audits',
      responses: {
        200: z.array(z.custom<typeof audits.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/audits/:id',
      responses: {
        200: z.custom<typeof audits.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  chats: {
    create: {
      method: 'POST' as const,
      path: '/api/conversations',
      input: z.object({ title: z.string().optional() }),
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/conversations',
      responses: {
        200: z.array(z.custom<typeof conversations.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/conversations/:id',
      responses: {
        200: z.custom<typeof conversations.$inferSelect & { messages: (typeof messages.$inferSelect)[] }>(),

      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/conversations/:id',
      responses: {
        204: z.void(),
      },
    },
  },
  messages: {
    create: {
      method: 'POST' as const,
      path: '/api/conversations/:id/messages',
      input: z.object({ content: z.string() }),
      responses: {
        200: z.void(), // SSE stream response
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

export type Audit = z.infer<typeof api.audits.create.responses[201]>;
export type Conversation = z.infer<typeof api.chats.create.responses[201]>;
