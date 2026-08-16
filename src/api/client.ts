const API_BASE = "";

let accessToken: string | null = localStorage.getItem("cygrx_token");

export function setAccessToken(token: string | null): void {
  accessToken = token;
  if (token) {
    localStorage.setItem("cygrx_token", token);
  } else {
    localStorage.removeItem("cygrx_token");
  }
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...((options.headers as Record<string, string>) || {}),
  };
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (res.status === 403 || res.status === 401) {
    const data = await res.json().catch(() => ({}));
    if (data.error === "Invalid or expired token" && accessToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${accessToken}`;
        const retryRes = await fetch(`${API_BASE}${url}`, { ...options, headers });
        if (!retryRes.ok) throw new Error(`API error: ${retryRes.status}`);
        return retryRes.json();
      }
    }
    setAccessToken(null);
    window.location.reload();
    throw new Error("Authentication required");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `API error: ${res.status}`);
  }

  return res.json();
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem("cygrx_refresh_token");
    if (!refreshToken) return false;

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    setAccessToken(data.accessToken);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: any; accessToken: string; refreshToken: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string, role?: string) =>
      request<{ user: any; accessToken: string; refreshToken: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name, role }),
      }),
    me: () => request<{ user: any }>("/api/auth/me"),
  },

  risks: {
    list: (status?: string, level?: string) => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (level) params.set("level", level);
      const qs = params.toString();
      return request<{ risks: any[] }>(`/api/risks${qs ? `?${qs}` : ""}`);
    },
    get: (id: string) => request<{ risk: any }>(`/api/risks/${id}`),
    create: (data: any) => request<{ risk: any }>("/api/risks", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ risk: any }>(`/api/risks/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/api/risks/${id}`, { method: "DELETE" }),
  },

  assets: {
    list: (type?: string) => {
      const params = type && type !== "ALL" ? `?type=${type}` : "";
      return request<{ assets: any[] }>(`/api/assets${params}`);
    },
    get: (id: string) => request<{ asset: any }>(`/api/assets/${id}`),
    create: (data: any) => request<{ asset: any }>("/api/assets", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ asset: any }>(`/api/assets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/api/assets/${id}`, { method: "DELETE" }),
  },

  controls: {
    list: (framework?: string) => {
      const params = framework ? `?framework=${framework}` : "";
      return request<{ controls: any[] }>(`/api/controls${params}`);
    },
    get: (id: string) => request<{ control: any }>(`/api/controls/${id}`),
    update: (id: string, data: any) => request<{ control: any }>(`/api/controls/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },

  evidence: {
    list: () => request<{ evidences: any[] }>("/api/evidence"),
    get: (id: string) => request<{ evidence: any }>(`/api/evidence/${id}`),
    upload: (formData: FormData) => {
      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      return fetch(`${API_BASE}/api/evidence`, { method: "POST", headers, body: formData }).then((r) => r.json());
    },
    download: (id: string) => `${API_BASE}/api/evidence/${id}/download`,
    delete: (id: string) => request<{ success: boolean }>(`/api/evidence/${id}`, { method: "DELETE" }),
  },

  incidents: {
    list: (severity?: string) => {
      const params = severity && severity !== "ALL" ? `?severity=${severity}` : "";
      return request<{ incidents: any[] }>(`/api/incidents${params}`);
    },
    get: (id: string) => request<{ incident: any }>(`/api/incidents/${id}`),
    create: (data: any) => request<{ incident: any }>("/api/incidents", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<{ incident: any }>(`/api/incidents/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request<{ success: boolean }>(`/api/incidents/${id}`, { method: "DELETE" }),
  },
};
