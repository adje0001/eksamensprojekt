# Web client (Next.js)

Browser client for the chat app. It only talks to the NestJS API in `api/`. No business logic or database access here (see the Architecture section in the root `CLAUDE.md`).

```bash
npm install
npm run dev        # http://localhost:3001 (the API uses 3000)
npm run lint
npm run typecheck  # generates route types first, then runs tsc
npm run build
```

- Pages live in `app/`. One folder per route, `page.tsx` is the screen, `layout.tsx` wraps it.
- Styling: Tailwind CSS (`app/globals.css`).
- `AGENTS.md` is written by Next.js itself and tells AI assistants to read the docs for this Next.js version. Keep it.
