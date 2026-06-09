import type { User, Photo, Couple, AuthResponse } from "@/types";

const API_BASE = "/api";

class ApiError extends Error {
  status: number;
  code: string;
  constructor(
    status: number,
    code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("auth_token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: { code: "UNKNOWN", message: res.statusText } }));
    throw new ApiError(res.status, body.error?.code ?? "UNKNOWN", body.error?.message ?? res.statusText);
  }

  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (data: { email: string; displayName: string; password: string }) =>
      request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    me: () => request<{ user: User }>("/auth/me"),
  },
  couples: {
    invite: () => request<{ inviteCode: string; expiresAt: string }>("/couples/invite", { method: "POST" }),
    join: (inviteCode: string) =>
      request<{ couple: Couple }>("/couples/join", { method: "POST", body: JSON.stringify({ inviteCode }) }),
    me: () => request<{ couple: Couple; partner: User }>("/couples/me"),
  },
  photos: {
    list: () => request<{ photos: Photo[]; total: number }>("/photos"),
    get: (id: string) => request<{ photo: Photo }>(`/photos/${id}`),
    upload: (file: File, note?: string) => {
      const formData = new FormData();
      formData.append("file", file);
      if (note) formData.append("note", note);
      return request<{ photo: Photo }>("/photos", { method: "POST", body: formData });
    },
    delete: (id: string) => request<{ success: boolean }>(`/photos/${id}`, { method: "DELETE" }),
  },
};

export { ApiError };
