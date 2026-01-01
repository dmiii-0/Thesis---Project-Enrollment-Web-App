# Troubleshooting Guide

Comprehensive guide to solve common issues with the UB Project Management System.

## Quick Diagnosis

### System Status Checklist

Run through this checklist first:

```bash
# 1. Check Node.js
node --version        # Should be v16+

# 2. Check MongoDB
mongosh              # Should connect
# Or: mongo

# 3. Check Backend
curl http://localhost:3001/api/health

# 4. Check Frontend
curl http://localhost:5173
```

---

## Table of Contents

1. [MongoDB Issues](#mongodb-issues)
2. [Backend Issues](#backend-issues)
3. [Frontend Issues](#frontend-issues)
4. [Gitea Integration Issues](#gitea-integration-issues)
5. [Connection Issues](#connection-issues)
6. [Authentication Issues](#authentication-issues)
7. [Port Conflicts](#port-conflicts)
8. [Installation Issues](#installation-issues)
9. [Serial Port Issues](#serial-port-issues)
10. [Production Issues](#production-issues)

---

## MongoDB Issues

### ❌ MongoDB Connection Failed

**Error:**
```
MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

#### Windows
```bash
# Check if MongoDB service is running
sc query MongoDB

# Start MongoDB service
net start MongoDB

# If service doesn't exist, install MongoDB as service
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" --install

# Then start it
net start MongoDB
```

#### Linux
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB on boot
sudo systemctl enable mongod

# If still not working, check logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### Mac
```bash
# Check if MongoDB is running
brew services list

# Start MongoDB
brew services start mongodb-community

# If not installed
brew tap mongodb/brew
brew install mongodb-community
```

### ❌ MongoDB Authentication Failed

**Error:**
```
MongoServerError: Authentication failed
```

**Solution:**

Update `backend/.env`:
```env
# If MongoDB has authentication enabled
MONGODB_URI=mongodb://username:password@localhost:27017/ub-project-management

# If no authentication
MONGODB_URI=mongodb://localhost:27017/ub-project-management
```

### ❌ Database Not Found

**Error:**
```
Database 'ub-project-management' not found
```

**Solution:**

MongoDB creates databases automatically. Just start the backend:
```bash
cd backend
npm run dev
```

The database will be created on first write operation.

### ❌ MongoDB Compass Can't Connect

**Solutions:**

1. **Check MongoDB is running**:
   ```bash
   # Windows
   sc query MongoDB
   
   # Linux/Mac
   sudo systemctl status mongod
   ```

2. **Check connection string**: `mongodb://localhost:27017`

3. **Check firewall**: MongoDB uses port 27017

4. **Check MongoDB config**:
   ```bash
   # Linux
   sudo nano /etc/mongod.conf
   
   # Ensure bindIp allows connections
   net:
     bindIp: 127.0.0.1
   ```

---

## Backend Issues

### ❌ Backend Won't Start

**Error:**
```
Error: Cannot find module 'express'
```

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::3001
```

**Solutions:**

#### Windows
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3002
```

#### Linux/Mac
```bash
# Find and kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in backend/.env
PORT=3002
```

### ❌ JWT Token Invalid

**Error:**
```
Not authorized, token failed
```

**Solutions:**

1. **Check JWT_SECRET** in `backend/.env`:
   ```env
   JWT_SECRET=ub-project-management-super-secret-jwt-key-2024
   ```

2. **Generate new token** by logging in again

3. **Check token format** in requests:
   ```
   Authorization: Bearer <your-token>
   ```

4. **Token expired**: Tokens expire after 30 days, login again

### ❌ Module Not Found

**Error:**
```
Error: Cannot find module './config/database'
```

**Solutions:**

1. **Verify file structure**:
   ```bash
   cd backend
   ls -la src/config/database.js
   ```

2. **Check file paths** in imports

3. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### ❌ Environment Variables Not Loading

**Error:**
```
process.env.MONGODB_URI is undefined
```

**Solutions:**

1. **Verify .env file exists**:
   ```bash
   cd backend
   ls -la .env
   ```

2. **Check .env format** (no quotes needed):
   ```env
   MONGODB_URI=mongodb://localhost:27017/ub-project-management
   PORT=3001
   ```

3. **Restart server** after changing .env:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## Frontend Issues

### ❌ Frontend Won't Start

**Error:**
```
Error: Cannot find module 'react'
```

**Solution:**
```bash
# From root directory
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ API Connection Failed

**Error in browser console:**
```
Failed to fetch
Network request failed
```

**Solutions:**

1. **Check backend is running**:
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check .env file** in root directory:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Restart frontend** after changing .env:
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

4. **Check backend CORS** in `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

### ❌ White Screen / Blank Page

**Solutions:**

1. **Check browser console** (F12 → Console tab)

2. **Clear cache**:
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E

3. **Check for React errors** in console

4. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

### ❌ Page Not Found (404)

**Symptom:** Direct URL like `/projects` shows 404

**Solutions:**

1. **Always start from root**: http://localhost:5173

2. **Use React Router navigation**:
   ```tsx
   <Link to="/projects">Projects</Link>
   // Not: <a href="/projects">
   ```

3. **Check routing in App.tsx**

### ❌ Environment Variables Not Working

**Error:**
```
import.meta.env.VITE_API_URL is undefined
```

**Solutions:**

1. **Check .env file exists** in root directory

2. **Verify variable name starts with VITE_**:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Restart dev server**:
   ```bash
   # Stop (Ctrl+C)
   npm run dev
   ```

4. **Access variables correctly**:
   ```typescript
   // Correct
   const apiUrl = import.meta.env.VITE_API_URL
   
   // Wrong
   const apiUrl = process.env.VITE_API_URL
   ```

### ❌ CORS Error

**Error in console:**
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solutions:**

1. **Update backend/.env**:
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

2. **Restart backend server**

3. **Check CORS configuration** in `backend/src/server.js`:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL,
     credentials: true
   }))
   ```

---

## Gitea Integration Issues

### ❌ Gitea Connection Failed

**Error in backend logs:**
```
❌ Gitea API connection failed
```

**Solutions:**

1. **Check Gitea token** in `backend/.env`:
   ```env
   GITEA_TOKEN=8e3b07b99105e50bfff5e05dd410f1439693c07a
   ```

2. **Test token manually**:
   ```bash
   curl -H "Authorization: token 8e3b07b99105e50bfff5e05dd410f1439693c07a" \
     https://gitea.com/api/v1/user
   ```

3. **Generate new token** if expired:
   - Go to https://gitea.com
   - Settings → Applications
   - Generate new token with repository access

4. **Check internet connection**

### ❌ Repository Creation Failed

**Error:**
```
Failed to create Gitea repository
```

**Solutions:**

1. **Check token permissions**: Needs "repo" access

2. **Repository name conflict**: Name already exists
   - Use different project name
   - Or delete existing repository on Gitea

3. **Check Gitea API limits**: May be rate limited

4. **Verify GITEA_OWNER** in `backend/.env`:
   ```env
   GITEA_OWNER=dmiii-0
   ```

### ❌ Can't See Repository Files

**Symptom:** Projects page shows projects but no files

**Solutions:**

1. **Check repository exists** on Gitea.com

2. **Wait for initialization**: Takes a few seconds

3. **Refresh the page**

4. **Check backend logs** for Gitea API errors

5. **Test API directly**:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" \
     https://gitea.com/api/v1/repos/dmiii-0/REPO_NAME/contents
   ```

### ❌ Repository Not Found

**Error:**
```
404 Not Found: Repository does not exist
```

**Solutions:**

1. **Check repository name** matches project

2. **Verify owner** in `backend/.env`:
   ```env
   GITEA_OWNER=dmiii-0
   ```

3. **Check if repository is private**: Token needs access

4. **Repository may have been deleted**: Create project again

---

## Connection Issues

### ❌ Frontend Can't Connect to Backend

**Solutions:**

1. **Verify both are running**:
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2 (from root)
   npm run dev
   ```

2. **Check ports**:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:5173

3. **Check .env files**:
   ```env
   # Root .env
   VITE_API_URL=http://localhost:3001/api
   
   # backend/.env
   FRONTEND_URL=http://localhost:5173
   ```

4. **Test backend directly**:
   ```bash
   curl http://localhost:3001/api/health
   ```

5. **Check firewalls**: Ports 3001 and 5173 must be open

### ❌ Requests Timeout

**Symptom:** API requests take forever and timeout

**Solutions:**

1. **Check backend is running**: 
   ```bash
   curl http://localhost:3001/api/health
   ```

2. **Check MongoDB is running**

3. **Restart both servers**

4. **Check system resources**: CPU/Memory usage

5. **Check for infinite loops** in code

---

## Authentication Issues

### ❌ Can't Login

**Error:**
```
Invalid credentials
```

**Solutions:**

1. **Verify credentials**:
   - Default: `admin@ub.edu.ph` / `admin123`

2. **Check MongoDB has users**:
   ```bash
   mongosh
   use ub-project-management
   db.users.find().pretty()
   ```

3. **Create admin user manually** (if needed):
   ```bash
   # In MongoDB shell
   use ub-project-management
   db.users.insertOne({
     name: "Admin",
     email: "admin@ub.edu.ph",
     password: "$2a$10$...", // Need to hash with bcrypt
     role: "instructor",
     createdAt: new Date(),
     updatedAt: new Date()
   })
   ```

4. **Check backend auth route** is working:
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@ub.edu.ph","password":"admin123"}'
   ```

### ❌ Token Expired

**Error:**
```
jwt expired
```

**Solution:**

1. **Login again** to get new token

2. **Tokens expire after 30 days** by default

3. **Update JWT expiration** in `backend/src/middleware/auth.js`:
   ```javascript
   const token = jwt.sign({ id: user._id }, secret, {
     expiresIn: '90d' // Change from 30d to 90d
   })
   ```

### ❌ Unauthorized Access

**Error:**
```
Not authorized
```

**Solutions:**

1. **Login first** to get token

2. **Check token is saved** in localStorage:
   ```javascript
   // In browser console
   localStorage.getItem('token')
   ```

3. **Token format correct**:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## Port Conflicts

### ❌ Port 3001 Already in Use

**Solutions:**

#### Windows
```bash
# Method 1: Kill process
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Method 2: Change port
# Edit backend/.env
PORT=3002

# Then update frontend .env
VITE_API_URL=http://localhost:3002/api
```

#### Linux/Mac
```bash
# Method 1: Kill process
lsof -ti:3001 | xargs kill -9

# Method 2: Change port
# Edit backend/.env
PORT=3002

# Update frontend .env
VITE_API_URL=http://localhost:3002/api
```

### ❌ Port 5173 Already in Use

**Solutions:**

```bash
# Kill process
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9

# Or let Vite use another port (it will ask)
```

### ❌ MongoDB Port 27017 in Use

**Solutions:**

```bash
# Change MongoDB port
# Edit MongoDB config

# Windows
# C:\Program Files\MongoDB\Server\5.0\bin\mongod.cfg

# Linux
# /etc/mongod.conf

# Change:
net:
  port: 27018

# Then update backend/.env
MONGODB_URI=mongodb://localhost:27018/ub-project-management
```

---

## Installation Issues

### ❌ npm install Fails

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solutions:**

#### Permission Errors (Linux/Mac)
```bash
# Don't use sudo! Fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Add to .bashrc or .zshrc
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Then try again
npm install
```

#### Corrupted Cache
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf node_modules package-lock.json

# Install again
npm install
```

#### Network Issues
```bash
# Use different registry
npm config set registry https://registry.npmjs.org/

# Or retry with different network
npm install --verbose
```

### ❌ Python/node-gyp Errors

**Error:**
```
gyp ERR! find Python
```

**Solutions:**

#### Windows
```bash
# Install windows-build-tools
npm install --global windows-build-tools

# Or install Visual Studio Build Tools
```

#### Linux
```bash
# Install build essentials
sudo apt-get install build-essential python3

# Or on Fedora/RHEL
sudo yum install gcc-c++ make python3
```

#### Mac
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

---

## Serial Port Issues

### ❌ COM Port Not Found

**Solutions:**

1. **Install drivers**:
   - CH340: https://www.wch-ic.com/downloads/CH341SER_ZIP.html
   - CP2102: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

2. **Check device is connected**

3. **Check Device Manager** (Windows):
   - Ports (COM & LPT)
   - Should show COM port number

4. **Check /dev/** (Linux/Mac):
   ```bash
   ls /dev/tty*
   # Should show /dev/ttyUSB0 or /dev/ttyACM0
   ```

5. **Grant permissions** (Linux):
   ```bash
   sudo usermod -a -G dialout $USER
   # Logout and login again
   ```

### ❌ Serial Port Access Denied

**Error:**
```
Error: Access denied
```

**Solutions:**

#### Windows
- Close Arduino IDE or other programs using the port
- Run application as Administrator

#### Linux
```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER

# Or change permissions
sudo chmod 666 /dev/ttyUSB0
```

#### Mac
```bash
# Grant permissions
sudo chmod 666 /dev/cu.usbserial-*
```

---

## Production Issues

### ❌ Build Fails

**Error:**
```
Build failed with errors
```

**Solutions:**

1. **Check TypeScript errors**:
   ```bash
   npm run type-check
   ```

2. **Fix errors** shown in output

3. **Clear cache and rebuild**:
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

### ❌ Environment Variables Not Working in Production

**Solution:**

For frontend:
```bash
# Create .env.production
VITE_API_URL=https://api.yourdomain.com/api

# Build with production env
npm run build
```

For backend:
```bash
# Set environment variables on server
export NODE_ENV=production
export MONGODB_URI=mongodb://...
export JWT_SECRET=...
```

### ❌ MongoDB Connection Timeout in Production

**Solutions:**

1. **Check MongoDB URL** has correct host

2. **Check firewall rules**: Port 27017 must be open

3. **Use MongoDB Atlas** for cloud hosting

4. **Add IP to whitelist** in MongoDB Atlas

---

## Getting More Help

### Check Logs

#### Backend Logs
```bash
cd backend
npm run dev
# Watch console output
```

#### MongoDB Logs
```bash
# Linux
sudo tail -f /var/log/mongodb/mongod.log

# Mac
tail -f /usr/local/var/log/mongodb/mongodb.log
```

#### Browser Console
- Open DevTools: F12 or Ctrl+Shift+I
- Check Console tab for errors
- Check Network tab for failed requests

### Debug Mode

Enable detailed logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend  
npm run dev -- --debug
```

### Common Commands Reference

```bash
# Restart everything
# Terminal 1
cd backend && npm run dev

# Terminal 2 (from root)
npm run dev

# Check all ports
netstat -ano | findstr "3001 5173 27017"  # Windows
lsof -i :3001,:5173,:27017                 # Linux/Mac

# Clear all caches
rm -rf node_modules package-lock.json backend/node_modules backend/package-lock.json
npm install
cd backend && npm install
```

### Still Having Issues?

1. **Check all documentation**:
   - README.md
   - FRONTEND_SETUP.md
   - BACKEND_SETUP.md
   - GITEA_SETUP.md

2. **Review error messages** carefully

3. **Search for error online**: Copy exact error message

4. **Check GitHub Issues** (if applicable)

5. **Create detailed bug report** with:
   - Error message
   - Steps to reproduce
   - System info (OS, Node version, etc.)
   - Console logs
   - Screenshots

---

**Most issues can be solved by:**
1. ✅ Restarting servers
2. ✅ Checking environment variables
3. ✅ Reinstalling dependencies
4. ✅ Checking logs for detailed errors

**Good luck!** 🚀
