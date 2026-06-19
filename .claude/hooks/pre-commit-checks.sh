#!/usr/bin/env bash
# PreToolUse gate on `git commit`: block the commit if typecheck or lint fails.
# Reads the hook payload JSON on stdin. Exit 2 blocks the commit.
set -uo pipefail

input=$(cat)
cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')

# Only gate actual commits (the `if` filter should already ensure this).
case "$cmd" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

if ! out=$(pnpm typecheck 2>&1); then
  echo "Commit blocked: \`pnpm typecheck\` failed. Fix the type errors first." >&2
  printf '%s\n' "$out" | tail -25 >&2
  exit 2
fi

if ! out=$(pnpm lint 2>&1); then
  echo "Commit blocked: \`pnpm lint\` failed. Fix the lint errors first." >&2
  printf '%s\n' "$out" | tail -25 >&2
  exit 2
fi

exit 0
