"use server";

import { redirect } from "next/navigation";
import { api, errorMessage } from "@/lib/api";
import { clearToken, getToken, setToken } from "@/lib/session";

// What a form shows after a failed or successful submit. values refills the fields
// (React resets a form after its action runs). Passwords are never sent back.
export type FormState = { error?: string; message?: string; values?: Record<string, string> };

const field = (formData: FormData, name: string) => String(formData.get(name) ?? "");

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    email: field(formData, "email"),
  };
  const res = await api("/auth/signup", {
    method: "POST",
    body: {
      ...values,
      password: field(formData, "password"),
      confirmPassword: field(formData, "confirmPassword"),
    },
  });
  if (!res.ok) return { error: errorMessage(res.data), values };

  // redirect() throws, so it must stay outside any try/catch
  redirect("/login?created=1");
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email");
  const res = await api("/auth/login", {
    method: "POST",
    body: { email, password: field(formData, "password") },
  });
  if (!res.ok) return { error: errorMessage(res.data), values: { email } };

  await setToken(res.data.accessToken);
  redirect("/");
}

export async function logout() {
  await clearToken();
  redirect("/login");
}

// Server Actions are public endpoints, so each one reads the token itself and lets the API
// decide. The user id is never taken from the form: the API takes it from the token.
export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const values = {
    firstName: field(formData, "firstName"),
    lastName: field(formData, "lastName"),
    email: field(formData, "email"),
  };
  const res = await api("/users/me", { method: "PATCH", body: values, token });
  if (res.status === 401) redirect("/login");
  if (!res.ok) return { error: errorMessage(res.data), values };

  return { message: "Profile saved", values };
}

export async function deleteAccount(): Promise<FormState> {
  const token = await getToken();
  if (!token) redirect("/login");

  const res = await api("/users/me", { method: "DELETE", token });
  // 401: the token expired. 404: the account is already gone. Either way, log out.
  if (res.status === 401 || res.status === 404) {
    await clearToken();
    redirect("/login");
  }
  // Anything else that failed: keep the user logged in and say so, never claim success
  if (!res.ok) return { error: errorMessage(res.data) };

  await clearToken();
  redirect("/login?deleted=1");
}
