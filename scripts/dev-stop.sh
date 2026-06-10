#!/usr/bin/env bash
# Stop background PulsePoint dev server started by dev-ensure.sh (optional).
set -euo pipefail

PORT="${PORT:-3000}"
PIDFILE="${PULSE_DEV_PIDFILE:-/tmp/pulse-dev.pid}"

if [[ -f "${PIDFILE}" ]]; then
  pid="$(cat "${PIDFILE}")"
  if kill -0 "${pid}" 2>/dev/null; then
    kill "${pid}" 2>/dev/null || true
    echo "Stopped dev server pid ${pid}"
  fi
  rm -f "${PIDFILE}"
fi

if lsof -iTCP:"${PORT}" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port ${PORT} still in use (maybe foreground pnpm dev). Use Ctrl+C in that terminal."
else
  echo "Port ${PORT} free."
fi
