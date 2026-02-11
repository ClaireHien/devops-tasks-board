#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="${SCRIPT_DIR}/.."
cd "$ROOT_DIR"
echo "🚀 Démarrage du mode Kubernetes (backend + DB en K8s, frontend en
local)..."
# 1. Vérifier ou démarrer Minikube
echo "➡ Vérification de l'état de Minikube..."
MINIKUBE_STATUS=$(minikube status --format='{{.Host}}' 2>/dev/null || echo "Stopped")
if [ "$MINIKUBE_STATUS" != "Running" ]; then
echo "⚠ Minikube n'est pas démarré — lancement..."
minikube start
else
echo "✔ Minikube est déjà démarré."
fi
# 2. Utiliser le moteur Docker interne de Minikube
echo "➡ Bascule sur le daemon Docker interne de Minikube..."
eval "$(minikube docker-env)"
# 3. Rebuild des images backend & frontend dans Minikube
echo "➡ Reconstruction de l'image backend (tasks-backend:latest)..."
docker build -t tasks-backend:latest "$ROOT_DIR/backend"
echo "➡ Reconstruction de l'image frontend (tasks-frontend:latest)..."
docker build -t tasks-frontend:latest "$ROOT_DIR/frontend"
# 4. Retour au Docker hôte
echo "➡ Retour au Docker hôte..."
eval "$(minikube docker-env -u)"
# 5. Appliquer ou réappliquer les manifests Kubernetes
echo "➡ Application des manifests Kubernetes (infra/k8s)..."
kubectl apply -f "$ROOT_DIR/infra/k8s"
# 6. Attendre que le backend soit prêt
echo "⏳ Attente du déploiement backend..."
kubectl rollout status deployment/backend-deployment
# 7. Port-forward backend -> localhost:3000
echo "➡ Exposition du backend K8s sur http://localhost:3000 ..."
kubectl port-forward deployment/backend-deployment 3000:3000 &
echo $! > "$SCRIPT_DIR/.k8s_portforward.pid"
# 8. Lancer le frontend en local
echo "➡ Lancement du frontend local (http://localhost:5173)..."
cd "$ROOT_DIR/frontend"
npm install
npm run dev &
echo $! > "$SCRIPT_DIR/.k8s_frontend.pid"
echo "✅ Mode KUBERNETES démarré."
echo "
Backend (K8s) : http://localhost:3000"
echo "
Frontend local : http://localhost:5173"
echo "ℹ Pour arrêter : ./scripts/k8s-stop.sh"