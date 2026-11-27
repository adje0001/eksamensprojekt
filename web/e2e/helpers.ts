import { expect, type APIRequestContext, type Page } from "@playwright/test";

// The API the web app talks to. Tests call it directly only to set up and clean up users.
export const API_URL = process.env.API_URL ?? "http://localhost:3000";
export const PASSWORD = "Secret123!";

export function newUser(firstName = "Anna") {
  return {
    firstName,
    lastName: "Jensen",
    // randomUUID: Playwright runs tests in parallel processes, so a per-process counter could collide
    email: `e2e-${crypto.randomUUID()}@example.com`,
    password: PASSWORD,
  };
}

export type TestUser = ReturnType<typeof newUser>;

// Creates a user through the API, so tests that are not about signup start faster
export async function createUserViaApi(request: APIRequestContext, user: TestUser) {
  const res = await request.post(`${API_URL}/auth/signup`, {
    data: { ...user, confirmPassword: user.password },
  });
  expect(res.status()).toBe(201);
}

// Deletes a user through the API. Ignores users that no longer exist (e.g. deleted by the test).
export async function deleteUserViaApi(request: APIRequestContext, user: TestUser) {
  const login = await request.post(`${API_URL}/auth/login`, {
    data: { email: user.email, password: user.password },
  });
  if (!login.ok()) return;
  const { accessToken } = await login.json();
  await request.delete(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

// Fills in and submits the login form. Does not wait for the result,
// so tests can check both a successful and a failed login.
export async function submitLogin(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
}

// Logs in and waits for the start page, so the cookie is set before the test goes on
export async function logInViaForm(page: Page, user: TestUser) {
  await submitLogin(page, user);
  await expect(page).toHaveURL("/");
}
