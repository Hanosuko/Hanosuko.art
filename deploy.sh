#!/usr/bin/env bash
set -euo pipefail

# Local deploy script — builds frontend and rsyncs everything to VPS.
# Requires: ssh-key auth to root@$REMOTE_HOST (no password prompts).

REMOTE_HOST="${REMOTE_HOST:-194.93.2.60}"
REMOTE_USER="${REMOTE_USER:-hanosuko}"
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/hanosuko}"

cd "$(dirname "$0")"

echo "==> Building frontend"
npm run build

echo "==> Syncing dist/ to $REMOTE_USER@$REMOTE_HOST:$REMOTE_ROOT/dist"
rsync -avz --delete dist/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_ROOT/dist/"

echo "==> Syncing server/ (excluding node_modules, data, .env)"
rsync -avz --delete \
  --exclude node_modules \
  --exclude data \
  --exclude .env \
  server/ "$REMOTE_USER@$REMOTE_HOST:$REMOTE_ROOT/server/"

echo "==> Installing server deps + restarting api"
ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_ROOT/server && npm ci --omit=dev && sudo systemctl restart hanosuko-api"

echo "==> Done"
