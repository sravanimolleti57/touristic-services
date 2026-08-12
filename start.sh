#!/bin/bash
echo "=========================================================="
echo "  Launching Touristic Services Full-Stack Application"
echo "=========================================================="
echo ""
echo "[1/2] Launching Backend Server (Python Flask on port 5000)..."
(cd backend && python app.py) &

echo "[2/2] Launching Frontend Application (React/Vite on port 3000)..."
(cd frontend && npm run dev) &

wait
