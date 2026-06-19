#!/usr/bin/env bash
# PostToolUse: format the file Claude just wrote/edited with Prettier.
# Reads the hook payload JSON on stdin. Best-effort — never blocks.
set -uo pipefail

input=$(cat)
path=$(printf '%s' "$input" | jq -r '.tool_response.filePath // .tool_input.file_path // empty')
[ -z "$path" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
# Only format files inside this project (don't touch memory/config elsewhere).
case "$path" in
  "$root"/*) ;;
  *) exit 0 ;;
esac

cd "$root" || exit 0
# --ignore-unknown skips files Prettier can't handle; .prettierignore is honored.
pnpm exec prettier --write --ignore-unknown "$path" >/dev/null 2>&1 || true

exit 0
