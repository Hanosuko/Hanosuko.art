#!/usr/bin/env bash
set -euo pipefail

# Local deploy script - builds frontend and rsyncs everything to a VPS.
# Requires SSH key auth to $REMOTE_USER@$REMOTE_HOST.

: "${REMOTE_HOST:?Set REMOTE_HOST, for example REMOTE_HOST=example.com}"
REMOTE_USER="${REMOTE_USER:-deploy}"
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/link-profile}"
SERVICE_NAME="${SERVICE_NAME:-link-profile-api}"

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
ssh "$REMOTE_USER@$REMOTE_HOST" "cd $REMOTE_ROOT/server && npm ci --omit=dev && sudo systemctl restart $SERVICE_NAME"

echo "==> Done"
