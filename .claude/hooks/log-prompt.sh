#!/usr/bin/env bash
# log-prompt.sh: logs every prompt for the AI reflection in the DE report.
# Registered in .claude/settings.json under UserPromptSubmit.
# Output: .claude/logs/prompts.jsonl (git-ignored, one file per person).
# See .claude/hooks/README.md.

# Skip quietly if jq is not installed (brew install jq).
command -v jq >/dev/null 2>&1 || exit 0

dir="$CLAUDE_PROJECT_DIR/.claude/logs"
mkdir -p "$dir"

# Tag each line with the author's git name, so group logs can be merged later.
author=$(git -C "$CLAUDE_PROJECT_DIR" config user.name 2>/dev/null || echo unknown)

# Read the event JSON from stdin and append one line: time, author, prompt.
jq -c --arg author "$author" '{time: (now | todate), author: $author, prompt: .prompt}' >> "$dir/prompts.jsonl"
exit 0
