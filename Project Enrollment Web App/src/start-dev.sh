#!/bin/bash

# Start both backend and frontend in development mode
echo "Starting UB Project Management System..."
echo ""

# Check if tmux is available (for better terminal management)
if command -v tmux &> /dev/null; then
    # Start a new tmux session with backend and frontend
    tmux new-session -d -s ub-pm 'cd backend && npm run dev'
    tmux split-window -h 'npm run dev'
    tmux attach-session -t ub-pm
else
    # Fallback: start in background
    echo "Starting Backend..."
    cd backend && npm run dev &
    BACKEND_PID=$!
    cd ..
    
    echo "Starting Frontend..."
    npm run dev &
    FRONTEND_PID=$!
    
    echo ""
    echo "Backend: http://localhost:3001 (PID: $BACKEND_PID)"
    echo "Frontend: http://localhost:5173 (PID: $FRONTEND_PID)"
    echo ""
    echo "Press Ctrl+C to stop both servers"
    
    # Wait for both processes
    wait
fi
