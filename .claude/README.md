# .claude/: Shared Claude Code setup

Everything in this folder is committed, so the whole group works with the same rules and tools. Change it through a normal PR.

| Part | File | What it does | Why we have it |
| --- | --- | --- | --- |
| Settings | `settings.json` | Permission rules and hook registration | Guardrails that hold every time, not just when Claude remembers |
| Hooks | `hooks/` | Scripts that run automatically on events | Linting and prompt logging without anyone asking |
| Skills | `skills/` | Workflows we start with `/feature`, `/migration`, `/pr` | Same process for everyone, every time |
| Agents | `agents/reviewer.md` | A separate reviewer with read-only tools | Independent check of AI-written code before a PR |
| Logs | `logs/` (git-ignored) | Each person's prompt log | Evidence for the AI reflection in the DE report |
| Local settings | `settings.local.json` (git-ignored) | Personal overrides | Your own preferences without changing the group setup |

## settings.json explained
JSON cannot hold comments, so the notes live here.

- `permissions.deny`: Claude may never read or write `.env` files. Secrets stay out of the AI context. Supports the DE security section (secrets management).
- `permissions.ask`: Claude must ask before editing `docker-compose.prod.yml` or anything in `.github/workflows/`. These affect production and CI, so a human decides.
- `hooks.PostToolUse`: after every Edit or Write, run `hooks/lint.sh`.
- `hooks.UserPromptSubmit`: every time you send a prompt, run `hooks/log-prompt.sh`.

## agents/reviewer.md explained
- Runs in its own context. It has not seen the code being written, so it is not grading its own work.
- Tools are limited to Read, Grep, Glob and Bash. It reports, it does not edit.
- Checks security (401/403, ownership, SQL injection, secrets, hashing, non-root), database (migrations, transactions, indexes) and tests.
- Use it by saying "use the reviewer agent on my changes". The `/feature` skill also calls it.
- Links to course material: `Block_2_Web_Security_and_Access.docx` and `Block_3_Tests_AI_and_Static_Analysis.docx`.

## Rule of thumb for changes
| Situation | Change |
| --- | --- |
| Claude makes the same mistake twice | Add a rule to `CLAUDE.md` |
| Same prompt typed three times | Make it a skill |
| Something must happen every time | Make it a hook |
| A rule must never be broken | Make it a permission or a hook, not only a line in `CLAUDE.md` |
