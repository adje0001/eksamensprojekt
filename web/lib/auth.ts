import "server-only";
import { redirect } from "next/navigation";
import { api } from "./api";
import { getToken } from "./session";

export type CurrentUser = { id: number; firstName: string; lastName: string; email: string };

// The logged-in user, checked by the API on every call. No token, an expired token or a
// deleted user all end at /login. Must be called inside a <Suspense> boundary (it reads cookies).
export async function getCurrentUser(): Promise<CurrentUser> {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await api("/users/me", { token });
  if (!res.ok) redirect("/login");

  return res.data;
}
