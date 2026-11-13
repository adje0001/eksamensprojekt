# AI Setup (Claude Code)

The whole group uses the same Claude Code setup. It is committed to the repo, so everyone gets it with `git pull`.

## What is where
| File | What it does |
| --- | --- |
| `CLAUDE.md` | Project rules and commands. Loaded in every session |
| `.claude/settings.json` | Blocks Claude from reading or editing `.env`. Asks before editing prod compose and CI workflows. Registers the hooks |
| `.claude/hooks/lint.sh` | Runs ESLint --fix after every file Claude edits |
| `.claude/hooks/log-prompt.sh` | Logs every prompt to `.claude/logs/prompts.jsonl` (git-ignored, per person) |
| `.claude/skills/feature/` | `/feature`: user story, acceptance tests, branch, tests, code, review, PR |
| `.claude/skills/migration/` | `/migration`: TypeORM migration, seed update, EXPLAIN ANALYZE |
| `.claude/skills/pr/` | `/pr`: opens a PR with the team template |
| `.claude/agents/reviewer.md` | Read-only reviewer for security and missing tests |
| `.mcp.json` | MCP servers shared by the group (Playwright) |
| `db/init/01-claude-readonly.sql` | Dev-only read-only DB role for the Postgres MCP server |

## Detailed notes
- [.claude/README.md](../.claude/README.md): settings.json and the reviewer agent explained
- [.claude/hooks/README.md](../.claude/hooks/README.md): each hook, and how to test it
- [.claude/skills/README.md](../.claude/skills/README.md): each skill and its exam link
- [db/init/README.md](../db/init/README.md): the dev-only read-only DB role

## First-time setup (each group member)
1. Install jq: `brew install jq` (Mac). The hooks skip silently without it.
2. `git pull`, then start Claude Code in the repo root.
3. Approve the project MCP servers when asked.
4. Check: `/mcp` lists playwright, asking Claude "Which subagents are available in this project?" lists reviewer, typing `/` shows feature, migration and pr.
5. Personal settings go in `.claude/settings.local.json` (git-ignored).

## Adding the Postgres MCP server (once the database runs)
The original reference Postgres MCP server is no longer maintained. Pick an actively maintained one and connect it with the `claude_ro` role, dev database only:
`claude mcp add --scope project postgres -- <server command> postgresql://claude_ro:dev_only_change_me@localhost:5432/<dev_db>`
Never point it at production.

## Daily use
- New feature: `/feature`
- Database change: `/migration`
- Before a PR: "use the reviewer agent on my changes"
- Open PR: `/pr`

## For the DE report (AI reflection)
- Each member keeps their own prompt log in `.claude/logs/`.
- Note concrete cases: what Claude suggested, what a test, review or human caught, what we changed.
- Fill in the "AI use" section in every PR. That gives a running record across the project.

## Keeping it up to date
- Claude makes the same mistake twice: add a rule to `CLAUDE.md`.
- Same prompt typed three times: make it a skill.
- Something must happen every time: make it a hook.
- Change the setup via a normal PR, like any other code.
