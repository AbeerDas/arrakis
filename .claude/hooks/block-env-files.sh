#!/usr/bin/env bash
# PreToolUse guard: refuse to write/edit a real .env file, or to stage/overwrite
# one via Bash. .env* is gitignored on purpose; only .env.example is tracked.
# Reads the hook payload JSON on stdin. Exit 2 blocks the tool call.
set -euo pipefail

input=$(cat)
tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')

# True for .env / .env.local / .env.production etc., but NOT for example/sample
# /template variants that are safe to commit.
is_protected_env() {
  local base
  base=$(basename -- "$1")
  case "$base" in
    .env.example | .env.sample | .env.template | .env.*.example) return 1 ;;
    .env | .env.*) return 0 ;;
    *) return 1 ;;
  esac
}

case "$tool" in
  Write | Edit | MultiEdit)
    path=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
    if [ -n "$path" ] && is_protected_env "$path"; then
      echo "Blocked: '$path' is an environment/secret file. Put placeholders in .env.example instead; set real values by hand outside the agent." >&2
      exit 2
    fi
    ;;
  Bash)
    cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty')
    # Staging an env file (including a forced add that bypasses .gitignore).
    # Inspect only each `git add` clause's own args (up to the next separator),
    # so an unrelated later mention of .env in a compound command isn't blocked.
    add_clause=$(printf '%s' "$cmd" | grep -oE 'git[[:space:]]+add[^&;|]*' || true)
    if [ -n "$add_clause" ] &&
      printf '%s' "$add_clause" | grep -Eq '(^|[[:space:]/])\.env([[:space:]./]|$)'; then
      echo "Blocked: refusing to git add an env file. .env* is gitignored on purpose." >&2
      exit 2
    fi
    # Overwriting an env file via redirection / copy.
    if printf '%s' "$cmd" | grep -Eq '(>>?|tee|cp|mv)[[:space:]].*\.env([[:space:]./]|$)' &&
      ! printf '%s' "$cmd" | grep -Eq '\.env\.(example|sample|template)'; then
      echo "Blocked: refusing to write to an env file from the shell. Edit .env.example or set values by hand." >&2
      exit 2
    fi
    ;;
esac

exit 0
