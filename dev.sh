#!/bin/bash

# Attest Development Server Startup Script
# Runs both backend and frontend concurrently with colored logs

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🛡️  Attest Development Environment                   ║"
echo "║                                                           ║"
echo "║   Starting backend and frontend servers...                ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colors for log prefixes
BACKEND_COLOR='\033[0;36m'  # Cyan
FRONTEND_COLOR='\033[0;35m' # Magenta
RESET='\033[0m'

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if node_modules exist
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd "$SCRIPT_DIR/backend" && npm install
fi

if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd "$SCRIPT_DIR/frontend" && npm install
fi

# Start backend
echo -e "${BACKEND_COLOR}[BACKEND]${RESET} Starting on http://localhost:3001"
cd "$SCRIPT_DIR/backend"
npm run dev 2>&1 | while IFS= read -r line; do
    echo -e "${BACKEND_COLOR}[BACKEND]${RESET} $line"
done &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend
echo -e "${FRONTEND_COLOR}[FRONTEND]${RESET} Starting on http://localhost:5173"
cd "$SCRIPT_DIR/frontend"
npm run dev 2>&1 | while IFS= read -r line; do
    echo -e "${FRONTEND_COLOR}[FRONTEND]${RESET} $line"
done &
FRONTEND_PID=$!

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║   Servers are running!                                    ║"
echo "║                                                           ║"
echo "║   🌐 Frontend: http://localhost:5173                      ║"
echo "║   🔧 Backend:  http://localhost:3001                      ║"
echo "║                                                           ║"
echo "║   Press Ctrl+C to stop both servers                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Wait for both processes
wait
