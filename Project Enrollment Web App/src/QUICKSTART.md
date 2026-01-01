# Quick Start Guide

Get the UB Project Management System up and running in 5 minutes!

## Prerequisites

✅ **Node.js** v16 or higher ([Download](https://nodejs.org/))  
✅ **MongoDB** v5.0 or higher ([Download](https://www.mongodb.com/try/download/community))  
✅ **Git** (optional, for cloning)

## Installation

### Option 1: Automated Setup (Recommended)

#### Windows:
```bash
# Run the setup script
setup.bat

# Start both servers
start-dev.bat
```

#### Linux/Mac:
```bash
# Make scripts executable
chmod +x setup.sh start-dev.sh

# Run the setup script
./setup.sh

# Start both servers
./start-dev.sh
```

### Option 2: Manual Setup

#### Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

#### Step 2: Configure Environment

```bash
# Frontend .env (already created)
# VITE_API_URL=http://localhost:3001/api

# Backend .env (already created with Gitea credentials)
cd backend
# Edit .env if needed
cd ..
```

#### Step 3: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Linux:**
```bash
sudo systemctl start mongod
```

**Mac:**
```bash
brew services start mongodb-community
```

#### Step 4: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Access the Application

🌐 **Frontend**: http://localhost:5173  
🔌 **Backend API**: http://localhost:3001  
💚 **Health Check**: http://localhost:3001/api/health

## Default Login

On first run, use these credentials:

- **Email**: `admin@ub.edu.ph`
- **Password**: `admin123`
- **Role**: Instructor

⚠️ **Change this password immediately after first login!**

## Create Your First Project

1. **Log in** with the default credentials
2. Go to **Enroll Project** page
3. Fill in the form:
   - **Name**: My First Arduino Project
   - **Description**: Testing the system
   - **Device Type**: Arduino
4. Click **Create Project**
5. A Gitea repository will be automatically created! ✨

## View Your Projects

1. Go to **Projects** page
2. Click on your project
3. View repository files in the **Files** tab
4. Check the repository on Gitea.com

## What's Next?

- 📚 Read the full [README.md](README.md) for detailed documentation
- 🔧 Check [GITEA_SETUP.md](GITEA_SETUP.md) for Gitea configuration
- 🚀 Start building your IoT projects!

## Troubleshooting

### MongoDB Connection Failed

**Windows:**
```bash
# Start MongoDB service
net start MongoDB

# If service doesn't exist, install MongoDB as a service
```

**Linux/Mac:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Port Already in Use

**Backend (Port 3001):**
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

**Frontend (Port 5173):**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

### Gitea Connection Failed

1. Check `backend/.env` for correct `GITEA_TOKEN`
2. Verify your internet connection
3. Test token: 
   ```bash
   curl -H "Authorization: token 8e3b07b99105e50bfff5e05dd410f1439693c07a" https://gitea.com/api/v1/user
   ```

## Need Help?

- 📖 Check [README.md](README.md) for comprehensive guide
- 🔍 Look at [backend/README.md](backend/README.md) for API documentation
- 🐛 Check backend console logs for errors
- ✅ Verify all services are running

## System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        YOUR COMPUTER                             │
│                                                                  │
│  ┌────────────────────┐                                         │
│  │   Browser          │  Navigate to http://localhost:5173      │
│  │   (Chrome/Firefox) │                                         │
│  └─────────┬──────────┘                                         │
│            │                                                     │
│            │ HTTP Requests                                       │
│            ▼                                                     │
│  ┌────────────────────┐                                         │
│  │   Frontend         │  React + TypeScript + Tailwind          │
│  │   Port: 5173       │  npm run dev (from root)                │
│  │                    │  .env: VITE_API_URL=http://localhost... │
│  └─────────┬──────────┘                                         │
│            │                                                     │
│            │ API Calls (axios)                                   │
│            │ /api/auth/login                                     │
│            │ /api/projects                                       │
│            ▼                                                     │
│  ┌────────────────────┐                                         │
│  │   Backend          │  Node.js + Express                      │
│  │   Port: 3001       │  cd backend && npm run dev              │
│  │                    │  .env: MONGODB_URI, GITEA_TOKEN...      │
│  └─────────┬──────────┘                                         │
│            │                                                     │
│       ┌────┴─────┬─────────────┬──────────────┐                │
│       │          │             │              │                 │
│       ▼          ▼             ▼              ▼                 │
│  ┌─────────┐ ┌────────┐  ┌─────────┐  ┌──────────┐            │
│  │MongoDB  │ │ Gitea  │  │ Serial  │  │ Docker   │            │
│  │Port:    │ │  API   │  │ Ports   │  │          │            │
│  │ 27017   │ │        │  │         │  │          │            │
│  └─────────┘ └────────┘  └─────────┘  └──────────┘            │
│      ▲           │            │             │                   │
│      │           │            │             │                   │
└──────┼───────────┼────────────┼─────────────┼───────────────────┘
       │           │            │             │
       │           │            │             │
   Local DB    Internet    USB Device    Containers
                gitea.com   (Arduino/ESP)
```

### Connection Flow

1. **User** opens browser → http://localhost:5173
2. **Frontend** (React app) loads from Vite dev server (port 5173)
3. **User** performs action (login, create project, etc.)
4. **Frontend** sends HTTP request to backend API
   - Example: `POST http://localhost:3001/api/auth/login`
5. **Backend** (Express server on port 3001) receives request
6. **Backend** processes:
   - Authenticates with MongoDB
   - Creates repositories via Gitea API
   - Communicates with serial devices
7. **Backend** sends response back to frontend
8. **Frontend** updates UI with response data
9. **User** sees the result

---

**Happy Coding! 🚀**
