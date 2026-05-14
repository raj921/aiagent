#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE="$DIR/dev-proxy.conf"

MIME="/opt/homebrew/etc/nginx/mime.types"
if [[ ! -f "$MIME" ]]; then
  MIME="/usr/local/etc/nginx/mime.types"
fi
if [[ ! -f "$MIME" ]]; then
  echo "Could not find mime.types (tried Homebrew paths). Install nginx or edit dev-proxy.conf." >&2
  exit 1
fi

TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
sed "s|/opt/homebrew/etc/nginx/mime.types|$MIME|g" "$TEMPLATE" > "$TMP"

nginx -t -c "$TMP"
nginx -c "$TMP"
trap - EXIT
rm -f "$TMP"
echo "nginx listening on http://localhost:8088 → http://127.0.0.1:3000 (run Next in another terminal: npm run dev)"
