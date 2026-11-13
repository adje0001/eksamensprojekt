# Skills

A skill is a folder with a `SKILL.md`. Type `/<name>` in Claude Code to run it.

All three use `disable-model-invocation: true`. That means Claude never starts them by itself. They only run when you type the command. This keeps them out of Claude's context until needed and avoids surprise branches or PRs.

| Skill | Start with | What it does | Exam link |
| --- | --- | --- | --- |
| `feature/` | `/feature` | User story, MoSCoW, 3 to 7 acceptance tests (Given/When/Then), branch, tests first, code, lint and test, reviewer, PR | DE: agile methods, GitHub Flow, QA |
| `migration/` | `/migration` | Entity change, TypeORM migration, check `up`/`down`, seed update, grants, `EXPLAIN ANALYZE` saved to `docs/db/` | DB2: physical DB, seed data, indexes, app role |
| `pr/` | `/pr` | Opens a PR with our template, incl. course relevance and AI use | DE: version control, AI reflection |

## Editing a skill
- The frontmatter (`name`, `description`) tells Claude Code what the skill is.
- The body is plain instructions. Edit them like any document.
- Keep steps short and numbered. Claude follows them in order.
