import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateAuditRequest, type Audit } from "@shared/routes";

// GET /api/audits
export function useAudits() {
  return useQuery({
    queryKey: [api.audits.list.path],
    queryFn: async () => {
      const res = await fetch(api.audits.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audits");
      return api.audits.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/audits/:id
export function useAudit(id: number | null) {
  return useQuery({
    queryKey: [api.audits.get.path, id],
    enabled: !!id,
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.audits.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audit");
      return api.audits.get.responses[200].parse(await res.json());
    },
  });
}

// POST /api/audits
export function useCreateAudit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAuditRequest) => {
      const validated = api.audits.create.input.parse(data);
      const res = await fetch(api.audits.create.path, {
        method: api.audits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.audits.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create audit");
      }
      return api.audits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.audits.list.path] });
    },
  });
}
