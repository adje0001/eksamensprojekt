# Hooks

Hooks are shell scripts Claude Code runs on events. They run every time, whether Claude "remembers" or not. They are registered in `../settings.json`.

Claude Code sends event data to the script as JSON on stdin. We read it with `jq`. Both scripts exit quietly if `jq` is missing, so a missing tool never blocks work. Install it with `brew install jq`.

## lint.sh
- **Event:** `PostToolUse`, after Edit or Write.
- **Does:** runs `eslint --fix` on the edited file if it is `.ts`, `.tsx`, `.js` or `.jsx`.
- **Why:** keeps AI-written code in line with our lint rules at once, instead of failing later in CI.
- **Note:** runs ESLint from the app folder the file is in (`api/`, `web/` or `mobile/`), because each app has its own ESLint and config. Uses `npx --no-install`, so it does nothing until `npm install` has run in that folder.

## log-prompt.sh
- **Event:** `UserPromptSubmit`, every prompt you send.
- **Does:** appends one line to `../logs/prompts.jsonl` with time, your git name and the prompt.
- **Why:** the DE report must describe AI tools, prompts and reflections. This gives a real record instead of reconstructing it from memory.
- **Note:** `logs/` is git-ignored. Each person keeps their own log and copies good examples into the report.

## Test a hook by hand
```bash
export CLAUDE_PROJECT_DIR="$PWD"
echo '{"prompt":"hello"}' | .claude/hooks/log-prompt.sh
echo "{\"tool_input\":{\"file_path\":\"$PWD/web/app/page.tsx\"}}" | .claude/hooks/lint.sh
```
