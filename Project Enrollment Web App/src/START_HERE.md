# 👋 Start Here - UB Project Management System

Welcome! This guide will help you navigate the documentation and get started quickly.

## 🎯 What Do You Want to Do?

### 🚀 I want to get started NOW!
→ Go to **[QUICKSTART.md](QUICKSTART.md)**

### 📚 I want to understand the project first
→ Go to **[README.md](README.md)**

### 🔧 I want to set up the frontend
→ Go to **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)**

### ⚙️ I want to set up the backend
→ Go to **[BACKEND_SETUP.md](BACKEND_SETUP.md)**

### 🌐 I want to configure Gitea integration
→ Go to **[GITEA_SETUP.md](GITEA_SETUP.md)**

### 🔐 I want to configure environment variables
→ Go to **[ENV_SETUP.md](ENV_SETUP.md)**

### 📝 I want to set up .gitignore properly
→ Go to **[GITIGNORE_SETUP.md](GITIGNORE_SETUP.md)**

### 🧪 I want to test if everything works
→ Go to **[CONNECTION_TEST.md](CONNECTION_TEST.md)**

### ❓ I'm having problems
→ Go to **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

### 📁 I want to understand the folder structure
→ Go to **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)**

### 📋 I need a quick command reference
→ Go to **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)**

## 🎓 Learning Path

### For Complete Beginners

1. **[README.md](README.md)** - Read overview to understand what this system does
2. **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - Understand project organization
3. **[QUICKSTART.md](QUICKSTART.md)** - Follow step-by-step setup
4. **[CONNECTION_TEST.md](CONNECTION_TEST.md)** - Verify everything works
5. **[GITEA_SETUP.md](GITEA_SETUP.md)** - Configure Gitea integration
6. Start developing!

### For Experienced Developers

1. **[QUICKSTART.md](QUICKSTART.md)** - Quick setup (5 minutes)
2. **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - Reference for commands/ports
3. **[GITEA_SETUP.md](GITEA_SETUP.md)** - Gitea configuration
4. Start developing!

### For Frontend Developers

1. **[QUICKSTART.md](QUICKSTART.md)** - Get backend running first
2. **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** - Detailed frontend guide
3. **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - Know where files are
4. Start building UI!

### For Backend Developers

1. **[QUICKSTART.md](QUICKSTART.md)** - Get MongoDB running first
2. **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Detailed backend guide
3. **[GITEA_SETUP.md](GITEA_SETUP.md)** - Gitea API integration
4. Start building APIs!

## 📖 Complete Documentation Index

### Getting Started
- 🚀 **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup guide
- 📘 **[README.md](README.md)** - Complete project overview
- 📋 **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - Quick reference guide

### Setup Guides
- 🎨 **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** - React frontend setup
- ⚙️ **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Node.js backend setup
- 🔄 **[GITEA_SETUP.md](GITEA_SETUP.md)** - Repository integration
- 🔐 **[ENV_SETUP.md](ENV_SETUP.md)** - Environment variables configuration
- 📝 **[GITIGNORE_SETUP.md](GITIGNORE_SETUP.md)** - Git ignore configuration

### Reference
- 📁 **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** - Project organization
- 🧪 **[CONNECTION_TEST.md](CONNECTION_TEST.md)** - Connection testing
- 🛠️ **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problem solving

## ⚡ Quick Actions

### First Time Setup

```bash
# Windows
setup.bat

# Linux/Mac
chmod +x setup.sh
./setup.sh
```

### Start Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend (from root)
npm run dev
```

### Access Application

- 🌐 Frontend: http://localhost:5173
- 🔌 Backend: http://localhost:3001
- 🗄️ MongoDB: mongodb://localhost:27017

### Default Login

- Email: `admin@ub.edu.ph`
- Password: `admin123`

## 🎯 Project Structure Summary

```
Root Directory (Frontend)
├── src/           ← React entry point
├── components/    ← React components
├── pages/         ← Page components
├── lib/           ← API client & utils
└── .env           ← Frontend config

backend/           ← Backend application
├── src/           ← Node.js source
│   ├── routes/   ← API endpoints
│   ├── models/   ← MongoDB schemas
│   └── services/ ← Gitea integration
└── .env           ← Backend config
```

## 🔧 Common Commands

### Installation
```bash
npm install               # Install frontend
cd backend && npm install # Install backend
```

### Development
```bash
npm run dev              # Start frontend (from root)
cd backend && npm run dev # Start backend
```

### Testing
```bash
curl http://localhost:3001/api/health  # Test backend
curl http://localhost:5173             # Test frontend
```

## 🆘 Need Help?

### Quick Troubleshooting

**Backend won't start?**
```bash
cd backend
rm -rf node_modules
npm install
npm run dev
```

**Frontend won't start?**
```bash
rm -rf node_modules
npm install
npm run dev
```

**MongoDB not connecting?**
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
```

**Port already in use?**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3001   # Windows
```

### Still Need Help?

1. Check **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** for detailed solutions
2. Review backend console logs for errors
3. Check browser console (F12) for frontend errors
4. Verify all prerequisites are installed

## 📊 System Requirements

- ✅ Node.js v16 or higher
- ✅ npm v8 or higher
- ✅ MongoDB v5.0 or higher
- ✅ Git (optional)
- ✅ Modern browser (Chrome, Firefox, Safari, Edge)

## 🎨 What This System Does

### For Students
- 📝 Create and manage IoT/web projects
- 🔄 Get automatic Gitea repository for each project
- 💾 Upload project documentation
- 🚀 Deploy to Arduino/ESP32/Raspberry Pi devices
- 🐳 Deploy web apps with Docker

### For Instructors
- 👥 Manage student projects
- 📊 View project statistics
- ✅ Review project documentation
- 🔍 Search and filter projects
- 📦 Access all project repositories

## 🛠️ Tech Stack

### Frontend
- ⚛️ React 18 + TypeScript
- ⚡ Vite
- 🎨 Tailwind CSS
- 🧭 React Router

### Backend
- 🟢 Node.js + Express
- 🍃 MongoDB + Mongoose
- 🔐 JWT Authentication
- 🔄 Gitea API Integration
- 🔌 WebSocket (Serial Monitor)

## 🌟 Key Features

1. **Authentication** - Secure JWT-based login/register
2. **Project Management** - CRUD operations for projects
3. **Gitea Integration** - Automatic repository creation
4. **File Browser** - View repository files in UI
5. **Documentation Upload** - PDF documentation storage
6. **Device Deployment** - Upload code to microcontrollers
7. **Serial Monitor** - Real-time serial communication
8. **Docker Support** - Web app deployment with Docker
9. **Search & Filter** - Find projects easily
10. **Dark Theme** - Modern dark UI by default

## 🚀 Ready to Start?

Choose your path:

### Path 1: Quick Start (Recommended)
```bash
# 1. Run setup
setup.bat  # Windows
./setup.sh # Linux/Mac

# 2. Start MongoDB
net start MongoDB  # Windows
sudo systemctl start mongod  # Linux/Mac

# 3. Start servers
start-dev.bat  # Windows
./start-dev.sh # Linux/Mac

# 4. Open browser
# http://localhost:5173
```

### Path 2: Manual Setup
Follow **[QUICKSTART.md](QUICKSTART.md)** for step-by-step instructions

### Path 3: Deep Dive
Read **[README.md](README.md)** for comprehensive information

## 📞 Support

**Documentation:**
- All guides are in the root directory
- Use table of contents in each guide
- Cross-references link to other guides

**Common Issues:**
- Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) first
- Review console logs (backend terminal & browser)
- Verify environment variables in `.env` files
- Ensure all services are running (MongoDB, backend, frontend)

## ✨ Next Steps After Setup

1. ✅ Login with default credentials
2. ✅ Create your first project
3. ✅ Check Gitea for created repository
4. ✅ Explore the project features
5. ✅ Start developing!

---

## 🎉 Let's Get Started!

Click here to begin: **[QUICKSTART.md](QUICKSTART.md)**

Or jump to: **[README.md](README.md)** for full overview

**Happy coding!** 💻