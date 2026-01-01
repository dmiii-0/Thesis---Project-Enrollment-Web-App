#!/bin/bash

# UB Project Management System - Linux/Mac Setup Script
echo "============================================================"
echo "    UB Project Management System - Setup"
echo "============================================================"
echo ""

# Check Node.js installation
echo "[1/6] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi
echo "✓ Node.js is installed: $(node --version)"
echo ""

# Check MongoDB installation
echo "[2/6] Checking MongoDB..."
if command -v mongod &> /dev/null; then
    echo "✓ MongoDB is installed: $(mongod --version | head -n 1)"
else
    echo "⚠ MongoDB not found in PATH"
    echo "Please ensure MongoDB is installed and running on localhost:27017"
fi
echo ""

# Setup Backend
echo "[3/6] Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    echo "Creating backend .env file..."
    cp .env.example .env
fi
echo "Installing backend dependencies..."
npm install
cd ..
echo "✓ Backend setup complete"
echo ""

# Setup Frontend
echo "[4/6] Setting up frontend..."
if [ ! -f ".env" ]; then
    echo "Creating frontend .env file..."
    cp .env.example .env
fi
echo "Installing frontend dependencies..."
npm install
echo "✓ Frontend setup complete"
echo ""

# Setup complete
echo "============================================================"
echo "    Setup Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start MongoDB (if not running):"
echo "   sudo systemctl start mongod    # Linux"
echo "   brew services start mongodb-community  # Mac"
echo ""
echo "2. Start Backend (in a new terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "3. Start Frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "4. Open browser:"
echo "   http://localhost:5173"
echo ""
echo "============================================================"
