import { expect, test } from "@playwright/test";
import {
  createUserViaApi,
  deleteUserViaApi,
  logInViaForm,
  newUser,
  submitLogin,
  type TestUser,
} from "./helpers";

// Users created in a test are deleted afterwards through the API
let created: TestUser[] = [];

test.afterEach(async ({ request }) => {
  for (const user of created) await deleteUserViaApi(request, user);
  created = [];
});

function track(user: TestUser) {
  created.push(user);
  return user;
}

test.describe("sign up", () => {
  test("1. a new user can sign up and is sent to login", async ({ page }) => {
    const user = track(newUser());

    await page.goto("/signup");
    await page.getByLabel("First name").fill(user.firstName);
    await page.getByLabel("Last name").fill(user.lastName);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill(user.password);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page).toHaveURL("/login?created=1");
    await expect(page.getByText("Account created. Please log in.")).toBeVisible();
  });

  test("2a. a taken email shows the API's error and keeps the form", async ({
    page,
    request,
  }) => {
    const user = track(newUser());
    await createUserViaApi(request, user);

    await page.goto("/signup");
    await page.getByLabel("First name").fill("Bo");
    await page.getByLabel("Last name").fill(user.lastName);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill(user.password);
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Email is already registered")).toBeVisible();
    await expect(page).toHaveURL("/signup");
    await expect(page.getByLabel("First name")).toHaveValue("Bo");
    await expect(page.getByLabel("Email")).toHaveValue(user.email);
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  });

  test("2b. mismatched passwords show an error", async ({ page }) => {
    const user = newUser();

    await page.goto("/signup");
    await page.getByLabel("First name").fill(user.firstName);
    await page.getByLabel("Last name").fill(user.lastName);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm password").fill("Different123!");
    await page.getByRole("button", { name: "Sign up" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
    await expect(page).toHaveURL("/signup");
  });
});

test.describe("log in and out", () => {
  test("3. login shows the user, and the token is not readable from JavaScript", async ({
    page,
    context,
    request,
  }) => {
    const user = track(newUser());
    await createUserViaApi(request, user);

    await logInViaForm(page, user);

    await expect(page.getByText("Logged in as Anna Jensen")).toBeVisible();

    const cookie = (await context.cookies()).find((c) => c.name === "token");
    expect(cookie?.httpOnly).toBe(true);
    expect(await page.evaluate(() => document.cookie)).not.toContain("token");
  });

  test("4. a wrong password shows an error", async ({ page, request }) => {
    const user = track(newUser());
    await createUserViaApi(request, user);

    await submitLogin(page, { ...user, password: "Wrong123!" });

    await expect(page.getByText("Invalid email or password")).toBeVisible();
    await expect(page).toHaveURL("/login");
  });

  test("5. pages that need login send you to /login (denied access)", async ({ page }) => {
    for (const path of ["/", "/profile"]) {
      await page.goto(path);
      await expect(page).toHaveURL("/login");
    }
  });

  test("6. log out removes the cookie", async ({ page, context, request }) => {
    const user = track(newUser());
    await createUserViaApi(request, user);
    await logInViaForm(page, user);
    await expect(page.getByText("Logged in as Anna Jensen")).toBeVisible();

    await page.getByRole("button", { name: "Log out" }).click();

    await expect(page).toHaveURL("/login");
    expect((await context.cookies()).find((c) => c.name === "token")).toBeUndefined();
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});

test.describe("profile", () => {
  test("7a. the user can change their own name", async ({ page, request }) => {
    const user = track(newUser());
    await createUserViaApi(request, user);
    await logInViaForm(page, user);

    await page.getByRole("link", { name: "Edit profile" }).click();
    await expect(page.getByLabel("Email")).toHaveValue(user.email);
    await page.getByLabel("First name").fill("Annie");
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Profile saved")).toBeVisible();
    await page.goto("/");
    await expect(page.getByText("Logged in as Annie Jensen")).toBeVisible();
  });

  test("7b. an email that belongs to someone else shows an error", async ({ page, request }) => {
    const anna = track(newUser("Anna"));
    const bo = track(newUser("Bo"));
    await createUserViaApi(request, anna);
    await createUserViaApi(request, bo);
    await logInViaForm(page, anna);

    await page.goto("/profile");
    await page.getByLabel("Email").fill(bo.email);
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page.getByText("Email is already registered")).toBeVisible();
  });

  test("8. the user can delete their account and cannot log in again", async ({
    page,
    request,
  }) => {
    const user = track(newUser());
    await createUserViaApi(request, user);
    await logInViaForm(page, user);

    await page.goto("/profile");
    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete account" }).click();

    await expect(page).toHaveURL("/login?deleted=1");
    await expect(page.getByText("Your account has been deleted.")).toBeVisible();

    await submitLogin(page, user);
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });
});
