#!/usr/bin/env bash
set -euo pipefail
DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$DIR"

echo "Starting wrangler dev (local)..."
npx wrangler dev --local --persist-to=./.wrangler/state --miniflare-config ./.miniflare.js &
PID=$!

echo "Waiting for worker to bind on 8787..."
for i in {1..30}; do
  if nc -z 127.0.0.1 8787; then
    echo "Worker is up"
    curl -sS http://127.0.0.1:8787/ && break
  fi
  sleep 1
done

echo "If it didn't start, check logs (foreground run recommended): kill $PID and run 'npx wrangler dev'"
