# Mobile client (React Native + Expo)

iOS/Android client for the chat app. It only talks to the NestJS API in `api/`. No business logic or database access here (see the Architecture section in the root `CLAUDE.md`).

```bash
npm install
npm start          # scan the QR code with Expo Go on your phone
npm run lint
npm run typecheck
npx expo-doctor    # checks dependencies and config
```

- Screens live in `src/app/` (Expo Router: one file per screen, `_layout.tsx` defines navigation).
- Other code (components, hooks) goes in `src/`, outside `src/app/`.
- Add packages with `npx expo install <package>`, not `npm install`, so versions match the Expo SDK.
- `AGENTS.md` comes from the Expo template and tells AI assistants to read the docs for this Expo SDK. Keep it.
