/**
 * Centralized API client for the Laravel backend.
 * Every request to the API goes through here — never hardcode URLs in components.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]>;

  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** First error message across all fields (for toasts). */
  firstError(): string {
    const flat = Object.values(this.errors).flat();
    return flat[0] ?? this.message;
  }
}

const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Ask the backend whether the stored token is actually valid.
 * Uses a raw fetch with a hard timeout so a hung/unreachable API can never
 * leave an admin page spinning forever, and deliberately skips api()'s
 * 401 auto-redirect so verification has no side effects.
 */
export async function verifyAdminSession(): Promise<{
  ok: boolean;
  reachable: boolean;
}> {
  const token = getToken();
  if (!token) return { ok: false, reachable: true };

  try {
    const response = await fetch(`${API_URL}/api/admin/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    return { ok: response.ok, reachable: true };
  } catch {
    // Timeout or network failure — distinguishable from "not authorized".
    return { ok: false, reachable: false };
  }
}

type ApiOptions = Omit<RequestInit, "body"> & { body?: unknown };

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      // Accept both plain objects and pre-stringified bodies.
      body:
        options.body === undefined
          ? undefined
          : typeof options.body === "string"
            ? options.body
            : JSON.stringify(options.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the API running?", 0);
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    // Expired/revoked session on an admin endpoint: drop the token and
    // bounce to the login screen instead of leaving the user stranded.
    if (
      response.status === 401 &&
      path.startsWith("/api/admin/") &&
      !path.endsWith("/login") &&
      typeof window !== "undefined"
    ) {
      clearToken();
      window.location.replace("/admin/login");
    }

    // Laravel validation errors: {message, errors}
    const errors =
      payload && typeof payload === "object" && "errors" in payload
        ? (payload.errors as Record<string, string[]>)
        : {};
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : `Request failed (${response.status})`;
    throw new ApiError(message, response.status, errors);
  }

  return payload as T;
}

/** Multipart upload (images). */
export async function apiUpload<T = unknown>(path: string, formData: FormData): Promise<T> {
  const headers = new Headers({ Accept: "application/json" });
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload?.message ?? `Upload failed (${response.status})`;
    const errors = payload?.errors ?? {};
    throw new ApiError(message, response.status, errors);
  }
  return payload as T;
}

/** Trigger a CSV download from an admin export endpoint. */
export async function downloadExport(url: string, token: string) {
  const response = await fetch(url, {
    headers: { Accept: "text/csv", Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError("Export failed", response.status);

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const match = /filename="?([^";]+)"?/.exec(disposition);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = match?.[1] ?? "export.csv";
  a.click();
  URL.revokeObjectURL(objectUrl);
}

/* Aliases used by the admin console — same client, explicit names. */
export const adminApi = api;
export function getAdminToken(): string | null {
  return getToken();
}
export function setAdminToken(token: string) {
  setToken(token);
}
export function clearAdminToken() {
  clearToken();
}
