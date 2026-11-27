import "server-only";

// The NestJS API. All data and all business rules live there (see Architecture in CLAUDE.md).
const API_URL = process.env.API_URL ?? "http://localhost:3000";

type ApiOptions = { method?: string; body?: unknown; token?: string };

// Calls the API from the Next.js server. The token comes from the httpOnly cookie,
// so the browser never sees it and never talks to the API directly.
export async function api(path: string, { method = "GET", body, token }: ApiOptions = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
  });
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

// The API sends { message: string } or, for DTO validation errors, { message: string[] }
export function errorMessage(data: { message?: string | string[] } | null): string {
  const message = data?.message;
  if (Array.isArray(message)) return message.join(". ");
  return message ?? "Something went wrong. Please try again.";
}
