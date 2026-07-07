import type { AdminDashboardResponse, AdminLoginResponse, AdminSettings, AdminUser } from "@/types/admin";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers
      },
      cache: "no-store"
    });
  } catch {
    throw new Error("Backend API is not running. Start the backend server and try again.");
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "API request failed");
  }

  return payload.data;
};

const authHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});

export const loginAdmin = (email: string, password: string) =>
  request<AdminLoginResponse>("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });

export const getAdminProfile = (token: string) =>
  request<{ user: AdminUser }>("/admin/auth/me", {
    headers: authHeader(token)
  });

export const getAdminDashboard = (token: string) =>
  request<AdminDashboardResponse>("/admin/dashboard", {
    headers: authHeader(token)
  });

export const getAdminSettings = (token: string) =>
  request<AdminSettings>("/admin/settings", {
    headers: authHeader(token)
  });

export const updateAdminSettings = (token: string, body: Record<string, unknown>) =>
  request<AdminSettings>("/admin/settings", {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(body)
  });

export type AdminListResponse = {
  items: Array<Record<string, unknown>>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export const listAdminResource = (token: string, resource: string) =>
  request<AdminListResponse>(`/admin/${resource}`, {
    headers: authHeader(token)
  });

export const createAdminResource = (token: string, resource: string, body: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/admin/${resource}`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(body)
  });

export const updateAdminResource = (token: string, resource: string, id: string, body: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/admin/${resource}/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(body)
  });

export const deleteAdminResource = (token: string, resource: string, id: string) =>
  request<Record<string, unknown>>(`/admin/${resource}/${id}`, {
    method: "DELETE",
    headers: authHeader(token)
  });

export const listAdminOrders = (token: string) =>
  request<AdminListResponse>("/admin/orders", {
    headers: authHeader(token)
  });

export const updateOrderStatus = (token: string, id: string, body: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(body)
  });

export const updateOrderPayment = (token: string, id: string, body: Record<string, unknown>) =>
  request<Record<string, unknown>>(`/admin/orders/${id}/payment`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(body)
  });

export const adjustStock = (token: string, body: Record<string, unknown>) =>
  request<Record<string, unknown>>("/admin/stock/adjust", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(body)
  });

export const importRestockCsv = (token: string, rows: Array<Record<string, unknown>>) =>
  request<{ updated: number; items: Array<Record<string, unknown>> }>("/admin/stock/import-restock", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ rows })
  });

export const listStockLogs = (token: string) =>
  request<AdminListResponse>("/admin/stock/logs", {
    headers: authHeader(token)
  });
