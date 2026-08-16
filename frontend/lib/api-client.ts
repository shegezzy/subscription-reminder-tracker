const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiEnvelope<T> = { success: boolean; data?: T; error?: { code: string; message: string } };

export class ApiClientError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const response = await fetch(`${apiUrl}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", ...init.headers },
  });

  if (response.status === 401 && retryOnUnauthorized && await refreshAccessToken()) {
    return apiRequest<T>(path, init, false);
  }

  const body = await response.json() as ApiEnvelope<T>;
  if (!response.ok || !body.success || body.data === undefined) {
    throw new ApiClientError(response.status, body.error?.message ?? "Unable to complete the request.");
  }
  return body.data;
}

export type AuthenticatedUser = { id: string; email: string };
export type AuthResponse = { user: AuthenticatedUser };

export const authApi = {
  currentUser: () => apiRequest<AuthResponse>("/api/auth/me"),
  login: (body: { email: string; password: string }) => apiRequest<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }, false),
  register: (body: { email: string; password: string; firstName: string; lastName: string }) => apiRequest<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }, false),
  logout: () => apiRequest<{ message: string }>("/api/auth/logout", { method: "POST" }, false),
};

export type CreateSubscriptionInput = { name: string; amount: number; currency: "NGN" | "USD" | "GBP" | "EUR"; billingCycle: "weekly" | "monthly" | "quarterly" | "yearly"; renewalDate: string; category?: string; paymentMethod?: string; websiteUrl?: string; reminderDays: number[]; isTrial: boolean; trialEndDate?: string };
export type Subscription = { _id: string; name: string; amount: number | { $numberDecimal: string }; currency: string; billingCycle: "weekly" | "monthly" | "quarterly" | "yearly"; renewalDate: string; category?: string; status: "active" | "paused" | "cancelled"; isTrial: boolean; trialEndDate?: string };
export const subscriptionApi = {
  create: (body: CreateSubscriptionInput) => apiRequest<{ subscription: Subscription }>("/api/subscriptions", { method: "POST", body: JSON.stringify(body) }),
  list: () => apiRequest<{ subscriptions: Subscription[] }>("/api/subscriptions"),
};
