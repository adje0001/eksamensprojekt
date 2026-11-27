import "server-only";
import { redirect } from "next/navigation";
import { api } from "./api";
import { getToken } from "./session";

export type CurrentUser = { id: number; firstName: string; lastName: string; email: string };

// The logged-in user, checked by the API on every call. No token, an invalid or expired token
// (401) or a deleted user (404) end at /login. Any other API error is thrown, so Next.js shows
// an error page instead of a confusing logout. Must be called inside <Suspense> (it reads cookies).
export async function getCurrentUser(): Promise<CurrentUser> {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await api("/users/me", { token });
  if (res.status === 401 || res.status === 404) redirect("/login");
  if (!res.ok) throw new Error(`API error ${res.status} on GET /users/me`);

  return res.data;
}
