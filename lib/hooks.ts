// lib/hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";

const authHeaders = (): Record<string, string> => {
  const token = Cookies.get("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export function useBoards() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await fetch("/api/boards", { headers: { ...authHeaders() } });
      if (!res.ok) throw new Error("Failed to fetch boards");
      return res.json();
    },
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Create board failed");
      return res.json();
    },
    onSuccess: (b: any) => qc.invalidateQueries({ queryKey: ["boards"] }),
  });
}

/* Lists */
export function useLists(boardId?: string) {
  return useQuery({
    queryKey: ["lists", boardId],
    queryFn: async () => {
      if (!boardId) return [];
      const res = await fetch(`/api/boards/${boardId}/lists`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch lists");
      return res.json();
    },
    enabled: !!boardId,
  });
}

export function useCreateList(boardId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Create list failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lists", boardId] }),
  });
}

/* Tasks (cards) */
export function useTasks(listId?: string) {
  return useQuery({
    queryKey: ["tasks", listId],
    queryFn: async () => {
      if (!listId) return [];
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!listId,
  });
}

export function useCreateTask(listId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Create task failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", listId] });
      qc.invalidateQueries({ queryKey: ["lists"] });
    },
  });
}

/* Update / Delete helpers (generic) */
export function useUpdateResource(key: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ url, body }: { url: string; body: any }) => {
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteResource(key: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch(url, {
        method: "DELETE",
        headers: { ...authHeaders() },
      });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });
}
