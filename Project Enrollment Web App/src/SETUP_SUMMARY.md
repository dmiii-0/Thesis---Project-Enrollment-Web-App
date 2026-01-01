# Setup Summary - UB Project Management System

Quick reference for setting up and running the system.

## 📋 What You're Setting Up

This system consists of **TWO separate applications** that work together:

### 1. Frontend (Root Directory)
- **Technology**: React + TypeScript + Tailwind CSS
- **Location**: Root directory of the project
- **Port**: 5173
- **Runs**: `npm run dev` (from root)
- **Config**: `.env` in root

### 2. Backend (backend/ Directory)
- **Technology**: Node.js + Express + MongoDB
- **Location**: `backend/` subdirectory
- **Port**: 3001
- **Runs**: `cd backend && npm run dev`
- **Config**: `backend/.env`

## 🚀 Quick Setup (3 Steps)

### Step 1: Run Setup Script

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

This script:
- ✅ Checks Node.js installation
- ✅ Creates `.env` files from examples
- ✅ Installs all dependencies (frontend + backend)
- ✅ Sets up project structure

### Step 2: Start MongoDB

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

### Step 3: Start Both Servers

**Option A - Automated (Recommended):**

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

**Option B - Manual:**

Open **2 terminal windows**:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (from root):**
```bash
npm run dev
```

## ✅ Verify Everything Works

### 1. Check Backend
```bash
curl http://localhost:3001/api/health
```
Expected: `{"status":"ok","message":"Server is running"}`

### 2. Check Frontend
Open browser: **http://localhost:5173**

Expected: Login page appears

### 3. Test Login
- Email: `admin@ub.edu.ph`
- Password: `admin123`

## 📁 File Locations

### Environment Files
```
/.env                    # Frontend config
/backend/.env           # Backend config
```

### Package Files
```
/package.json           # Frontend dependencies
/backend/package.json   # Backend dependencies
```

### Source Code
```
/src/main.tsx          # Frontend entry point
/components/           # Frontend components
/pages/                # Frontend pages
/backend/src/server.js # Backend entry point
```

## 🔧 Configuration

### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:3001/api
```

### Backend (backend/.env)
```env
MONGODB_URI=mongodb://localhost:27017/ub-project-management
PORT=3001
JWT_SECRET=ub-project-management-super-secret-jwt-key-2024
GITEA_URL=https://gitea.com
GITEA_TOKEN=8e3b07b99105e50bfff5e05dd410f1439693c07a
GITEA_OWNER=dmiii-0
FRONTEND_URL=http://localhost:5173
```

## 🌐 Ports Used

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 3001 | http://localhost:3001 |
| MongoDB | 27017 | mongodb://localhost:27017 |

## 📦 What Gets Installed

### Frontend Dependencies
- react & react-dom - UI library
- typescript - Type safety
- vite - Build tool
- tailwindcss - Styling
- react-router-dom - Routing
- axios - HTTP client
- lucide-react - Icons

### Backend Dependencies
- express - Web framework
- mongoose - MongoDB ODM
- jsonwebtoken - Authentication
- bcryptjs - Password hashing
- cors - Cross-origin requests
- axios - Gitea API calls
- multer - File uploads
- ws - WebSocket server

## 🔄 Development Workflow

### Daily Development

1. **Start MongoDB** (once per session):
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/Mac
   sudo systemctl start mongod
   ```

2. **Start Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   Backend will auto-reload on file changes

3. **Start Frontend** (Terminal 2, from root):
   ```bash
   npm run dev
   ```
   Frontend has hot module replacement (instant updates)

4. **Open Browser**: http://localhost:5173

5. **Develop**:
   - Edit files
   - Save
   - Changes appear automatically
   - Check console for errors

### Making Changes

**Frontend Changes:**
- Edit files in `/components`, `/pages`, `/lib`, etc.
- Save file
- Browser updates instantly (HMR)
- Check browser console (F12) for errors

**Backend Changes:**
- Edit files in `/backend/src`
- Save file
- Server restarts automatically (nodemon)
- Check terminal for errors

**Environment Changes:**
- Edit `.env` or `backend/.env`
- Restart respective server (Ctrl+C, then `npm run dev`)

## 🔍 Monitoring & Logs

### Backend Logs
Look at Terminal 1 (backend terminal):
```
✅ MongoDB Connected: localhost
✅ Gitea API connection successful
🚀 Server running on port 3001
```

### Frontend Logs
- Browser console (F12 → Console)
- Terminal 2 (frontend terminal)

### MongoDB Logs
```bash
# Linux
sudo tail -f /var/log/mongodb/mongod.log

# Mac
tail -f /usr/local/var/log/mongodb/mongodb.log
```

## 🛠️ Common Commands

### Restart Everything
```bash
# Stop all (Ctrl+C in both terminals)

# Terminal 1
cd backend && npm run dev

# Terminal 2 (from root)
npm run dev
```

### Reinstall Dependencies
```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Check Ports
```bash
# Windows
netstat -ano | findstr "3001 5173 27017"

# Linux/Mac
lsof -i :3001,:5173,:27017
```

### Kill Process on Port
```bash
# Windows (replace <PID>)
taskkill /PID <PID> /F

# Linux/Mac (replace port)
lsof -ti:3001 | xargs kill -9
```

## 📊 System Status Check

Quick health check script:

```bash
#!/bin/bash
echo "🔍 System Status Check"
echo ""

echo "1. Backend:"
curl -s http://localhost:3001/api/health && echo " ✅" || echo " ❌"

echo "2. Frontend:"
curl -s http://localhost:5173 > /dev/null && echo " ✅" || echo " ❌"

echo "3. MongoDB:"
mongosh --eval "db.version()" > /dev/null 2>&1 && echo " ✅" || echo " ❌"

echo "4. Gitea:"
curl -s -H "Authorization: token 8e3b07b99105e50bfff5e05dd410f1439693c07a" \
  https://gitea.com/api/v1/user > /dev/null && echo " ✅" || echo " ❌"
```

## 🆘 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| Backend won't start | `cd backend && rm -rf node_modules && npm install` |
| Frontend won't start | `rm -rf node_modules && npm install` |
| MongoDB error | `net start MongoDB` (Windows) or `sudo systemctl start mongod` (Linux) |
| Port in use | Kill process or change port in `.env` |
| CORS error | Check `FRONTEND_URL` in `backend/.env` matches frontend port |
| Gitea error | Check `GITEA_TOKEN` in `backend/.env` |
| Can't login | Use: `admin@ub.edu.ph` / `admin123` |

## 📚 Documentation Links

- **[README.md](README.md)** - Complete overview
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup
- **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** - Frontend details
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Backend details
- **[GITEA_SETUP.md](GITEA_SETUP.md)** - Gitea configuration
- **[ENV_SETUP.md](ENV_SETUP.md)** - Environment variables guide
- **[GITIGNORE_SETUP.md](GITIGNORE_SETUP.md)** - Git ignore configuration
- **[CONNECTION_TEST.md](CONNECTION_TEST.md)** - Test connections
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Problem solving

## 🎯 Next Steps After Setup

1. ✅ Verify connection: [CONNECTION_TEST.md](CONNECTION_TEST.md)
2. 📖 Read frontend guide: [FRONTEND_SETUP.md](FRONTEND_SETUP.md)
3. 📖 Read backend guide: [BACKEND_SETUP.md](BACKEND_SETUP.md)
4. 🔧 Configure Gitea: [GITEA_SETUP.md](GITEA_SETUP.md)
5. 🚀 Start developing!

## 💡 Development Tips

### Hot Reload
- Frontend changes show instantly
- Backend restarts automatically
- No need to manually refresh (usually)

### Debugging
- Frontend: Browser DevTools (F12)
- Backend: Terminal logs
- Database: MongoDB Compass

### Testing
- Create test user: Go to `/register`
- Create test project: Go to `/enroll`
- Check Gitea for created repos
- Check MongoDB for data

### Best Practices
- Keep both terminals visible
- Watch for errors in logs
- Use browser DevTools Network tab
- Check CORS issues early
- Test backend API with curl/Postman

## ✨ You're All Set!

Your system is ready when you see:

1. ✅ Backend terminal shows: `✅ MongoDB Connected`
2. ✅ Backend terminal shows: `✅ Gitea API connection successful`
3. ✅ Frontend terminal shows: `Local: http://localhost:5173/`
4. ✅ Browser opens to login page
5. ✅ No errors in browser console
6. ✅ Can login with default credentials

**Happy coding!** 🎉

---

**Need help?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for solutions to common issues.