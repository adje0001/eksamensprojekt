# Web client (Next.js)

Browser client for the chat app. It only talks to the NestJS API in `api/`. No business logic or database access here (see the Architecture section in the root `CLAUDE.md`).

```bash
npm install
npm run dev        # http://localhost:3001 (the API uses 3000)
npm run lint
npm run typecheck  # generates route types first, then runs tsc
npm run build
npm run test:e2e   # Playwright E2E. Needs the API running: `docker compose up -d --build` in the repo root
```

First time only: `npx playwright install chromium` downloads the test browser.

- Pages live in `app/`. One folder per route, `page.tsx` is the screen, `layout.tsx` wraps it.
- Styling: Tailwind CSS (`app/globals.css`).
- `AGENTS.md` is written by Next.js itself and tells AI assistants to read the docs for this Next.js version. Keep it.

## Pages
| Page | Login needed | What it does |
| --- | --- | --- |
| `/signup` | No | Create an account (`POST /auth/signup`) |
| `/login` | No | Log in (`POST /auth/login`). The JWT is stored in an httpOnly cookie |
| `/` | Yes | Shows who is logged in (`GET /users/me`). Log out deletes the cookie |
| `/profile` | Yes | Change name and email (`PATCH /users/me`) or delete the account (`DELETE /users/me`) |

## How login works
- The forms call Server Actions in `app/actions.ts`. They run on the Next.js server and call the API with `lib/api.ts`.
- After login the token goes into an httpOnly cookie (`lib/session.ts`). JavaScript in the browser cannot read it.
- For pages that need login, Next.js reads the cookie and sends the token to the API as `Authorization: Bearer …`. The browser never talks to the API directly, so the API needs no CORS.
- `proxy.ts` sends visitors without a cookie to `/login` before the page renders. That check is optimistic: the API still verifies the token on every call (`lib/auth.ts`).
- `API_URL` sets the API address (default `http://localhost:3000`).
