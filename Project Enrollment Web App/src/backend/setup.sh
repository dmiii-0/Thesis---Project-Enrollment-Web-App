#!/bin/bash

# UB Project Management Backend Setup Script
# For Mac/Linux

echo "============================================================"
echo "🚀 UB Project Management Backend Setup"
echo "============================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "📥 Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js detected: $(node --version)"
echo "✅ npm detected: $(npm --version)"
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "Please run this script from the backend directory:"
    echo "  cd backend && ./setup.sh"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create uploads directory
if [ ! -d "uploads" ]; then
    echo "📁 Creating uploads directory..."
    mkdir uploads
    echo "✅ Uploads directory created!"
else
    echo "✅ Uploads directory already exists!"
fi

echo ""
echo "============================================================"
echo "✅ Setup Complete!"
echo "============================================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Make sure MongoDB is running:"
echo "   - Open MongoDB Compass"
echo "   - Connect to mongodb://localhost:27017"
echo ""
echo "2. Start the backend server:"
echo "   npm run dev    (development with auto-reload)"
echo "   npm start      (production)"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "4. View documentation:"
echo "   http://localhost:3001/"
echo ""
echo "For detailed setup instructions, see:"
echo "  /BACKEND_MONGODB_SETUP.md"
echo ""
