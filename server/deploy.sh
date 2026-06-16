#!/usr/bin/env bash
# Run from the server/ directory on the Pi: bash deploy.sh
set -e

REPO_ROOT="$(dirname "$0")/.."
cd "$REPO_ROOT"

echo "[deploy] pulling latest..."
git pull

echo "[deploy] installing auth-server deps..."
cd server/auth && npm install --omit=dev

echo "[deploy] installing game-server deps..."
cd ../game && npm install --omit=dev

echo "[deploy] restarting pm2 processes..."
cd ..
pm2 restart wc-auth wc-game
pm2 save

echo "[deploy] done."
