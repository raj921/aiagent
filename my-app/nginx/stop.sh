#!/usr/bin/env bash
set -euo pipefail
PID_FILE=/tmp/aiagent-nginx-dev.pid
if [[ -f "$PID_FILE" ]]; then
  kill "$(cat "$PID_FILE")" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "nginx stopped."
else
  echo "No pid file at $PID_FILE (nginx dev proxy may not be running)."
fi
