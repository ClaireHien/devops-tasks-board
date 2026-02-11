#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
echo "🚀 Démarrage de l'application en mode LOCAL..."
cd "$ROOT_DIR"
# Lancer le backend
echo "➡ Lancement du backend (http://localhost:3000)"
cd backend
npm install
npm run dev &
BACKEND_PID=$!
# Lancer le frontend
echo "➡ Lancement du frontend (http://localhost:5173)"
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!
# Sauvegarde des PID
echo "$BACKEND_PID" > "$SCRIPT_DIR/.local_backend.pid"
echo "$FRONTEND_PID" > "$SCRIPT_DIR/.local_frontend.pid"
echo "✅ Mode LOCAL démarré."
echo "
Backend PID : $BACKEND_PID"
echo "
Frontend PID : $FRONTEND_PID"
echo "ℹ Pour arrêter : ./scripts/local-stop.sh"