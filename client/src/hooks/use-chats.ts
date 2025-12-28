import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Conversation } from "@shared/routes";
import { useState, useCallback, useRef } from "react";

// GET /api/conversations
export function useConversations() {
  return useQuery({
    queryKey: [api.chats.list.path],
    queryFn: async () => {
      const res = await fetch(api.chats.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      return api.chats.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/conversations/:id
export function useConversation(id: number | null) {
  return useQuery({
    queryKey: [api.chats.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.chats.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversation");
      return api.chats.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/conversations
export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { title?: string }) => {
      const validated = api.chats.create.input.parse(data);
      const res = await fetch(api.chats.create.path, {
        method: api.chats.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      return api.chats.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    },
  });
}

// DELETE /api/conversations/:id
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.chats.delete.path, { id });
      const res = await fetch(url, { method: api.chats.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.chats.list.path] });
    },
  });
}

// Custom hook for SSE Streaming chat
export function useChatStream(conversationId: number | null) {
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    setIsStreaming(true);
    setStreamedContent(""); // Reset stream buffer
    
    // Create new abort controller
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      // Optimistically add user message to cache
      queryClient.setQueryData([api.chats.get.path, conversationId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...(old.messages || []), { role: 'user', content, createdAt: new Date().toISOString() }]
        };
      });

      const url = buildUrl(api.messages.create.path, { id: conversationId });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
        credentials: "include",
      });

      if (!response.ok) throw new Error('Network response was not ok');
      if (!response.body) throw new Error('No body in response');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      let loop = true;
      while (loop) {
        const { value, done } = await reader.read();
        if (done) {
          loop = false;
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        // Parse SSE format: "data: {...}\n\n"
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            if (!jsonStr) continue;
            try {
              const data = JSON.parse(jsonStr);
              if (data.done) {
                loop = false;
              } else if (data.content) {
                setStreamedContent(prev => prev + data.content);
              } else if (data.error) {
                console.error("Stream error:", data.error);
                loop = false;
              }
            } catch (e) {
              console.error('Error parsing JSON chunk', e);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted');
      } else {
        console.error('Stream error:', error);
      }
    } finally {
      setIsStreaming(false);
      setStreamedContent(""); // Clear transient stream state
      // Refetch to get the persisted assistant message
      queryClient.invalidateQueries({ queryKey: [api.chats.get.path, conversationId] });
      abortControllerRef.current = null;
    }
  }, [conversationId, queryClient]);

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  return { sendMessage, isStreaming, streamedContent, abortStream };
}
