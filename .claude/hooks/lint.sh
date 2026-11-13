#!/usr/bin/env bash
# lint.sh: runs ESLint --fix on a file right after Claude edits it.
# Registered in .claude/settings.json under PostToolUse (matcher: Edit|Write).
# See .claude/hooks/README.md.

# Skip quietly if jq is not installed (brew install jq).
command -v jq >/dev/null 2>&1 || exit 0

# Claude Code sends event data as JSON on stdin. Pull out the edited file path.
file=$(jq -r '.tool_input.file_path // empty')

# Only lint JavaScript and TypeScript files.
case "$file" in
  *.ts|*.tsx|*.js|*.jsx) ;;
  *) exit 0 ;;
esac

# Run from the project root. --no-install means: do nothing until ESLint is a project dependency.
cd "$CLAUDE_PROJECT_DIR" || exit 0
npx --no-install eslint --fix "$file" 2>/dev/null || true

# Always exit 0 so a lint problem never blocks Claude. CI is the hard gate.
exit 0
