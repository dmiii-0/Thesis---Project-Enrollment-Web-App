# Environment Variables Setup Guide

This guide explains how to configure environment variables for the University of Batangas Project Management System.

## Overview

The application requires environment variables for both **frontend** and **backend** components. These variables configure database connections, API keys, server ports, and external service integrations.

---

## 📁 File Locations

- **Backend**: `/backend/.env`
- **Frontend**: `/.env` (root directory)

---

## 🔧 Backend Environment Variables

### Location: `/backend/.env`

Create this file in the `backend` folder with the following configuration:

```env
# ==============================================
# SERVER CONFIGURATION
# ==============================================
NODE_ENV=development
PORT=3001

# ==============================================
# FRONTEND CONFIGURATION
# ==============================================
FRONTEND_URL=http://localhost:5173

# ==============================================
# DATABASE CONFIGURATION
# ==============================================
MONGODB_URI=mongodb://localhost:27017/ub-project-management

# ==============================================
# JWT AUTHENTICATION
# ==============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# ==============================================
# GITEA INTEGRATION
# ==============================================
GITEA_URL=https://gitea.com
GITEA_TOKEN=8e3b07b99105e50bfff5e05dd410f1439693c07a
GITEA_OWNER=dmiii-0

# ==============================================
# FILE UPLOAD CONFIGURATION
# ==============================================
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# ==============================================
# SERIAL PORT CONFIGURATION
# ==============================================
SERIAL_BAUD_RATE=9600
SERIAL_TIMEOUT=3000

# ==============================================
# DOCKER CONFIGURATION (Optional)
# ==============================================
DOCKER_REGISTRY=localhost:5000
DOCKER_NETWORK=ub-project-network
```

### Variable Descriptions

#### Server Configuration
- **`NODE_ENV`**: Application environment (`development` | `production` | `test`)
- **`PORT`**: Backend server port (default: `3001`)

#### Frontend Configuration
- **`FRONTEND_URL`**: Frontend application URL for CORS configuration

#### Database Configuration
- **`MONGODB_URI`**: MongoDB connection string
  - Local: `mongodb://localhost:27017/ub-project-management`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/database`
  - Docker: `mongodb://mongodb:27017/ub-project-management`

#### JWT Authentication
- **`JWT_SECRET`**: Secret key for JWT token generation (⚠️ **CHANGE IN PRODUCTION!**)
- **`JWT_EXPIRE`**: Token expiration time (e.g., `30d`, `7d`, `24h`)

#### Gitea Integration
- **`GITEA_URL`**: Gitea server URL (default: `https://gitea.com`)
- **`GITEA_TOKEN`**: Personal access token for Gitea API
- **`GITEA_OWNER`**: Gitea username or organization name

#### File Upload Configuration
- **`MAX_FILE_SIZE`**: Maximum file upload size in bytes (default: 10MB)
- **`UPLOAD_PATH`**: Directory for storing uploaded files

#### Serial Port Configuration
- **`SERIAL_BAUD_RATE`**: Default baud rate for serial communication
- **`SERIAL_TIMEOUT`**: Serial port timeout in milliseconds

#### Docker Configuration (Optional)
- **`DOCKER_REGISTRY`**: Docker registry URL for web app deployments
- **`DOCKER_NETWORK`**: Docker network name for containers

---

## 🎨 Frontend Environment Variables

### Location: `/.env` (root directory)

Create this file in the **root** directory with the following configuration:

```env
# ==============================================
# BACKEND API CONFIGURATION
# ==============================================
VITE_API_URL=http://localhost:3001/api

# ==============================================
# WEBSOCKET CONFIGURATION
# ==============================================
VITE_WS_URL=ws://localhost:3001

# ==============================================
# APPLICATION CONFIGURATION
# ==============================================
VITE_APP_NAME=UB Project Management System
VITE_APP_VERSION=1.0.0

# ==============================================
# FEATURE FLAGS (Optional)
# ==============================================
VITE_ENABLE_SERIAL_MONITOR=true
VITE_ENABLE_DOCKER_DEPLOY=true
VITE_ENABLE_GITEA_INTEGRATION=true
```

### Variable Descriptions

#### Backend API Configuration
- **`VITE_API_URL`**: Backend API base URL (used by all API calls)

#### WebSocket Configuration
- **`VITE_WS_URL`**: WebSocket server URL for Serial Monitor

#### Application Configuration
- **`VITE_APP_NAME`**: Application name (displayed in UI)
- **`VITE_APP_VERSION`**: Application version number

#### Feature Flags
- **`VITE_ENABLE_SERIAL_MONITOR`**: Enable/disable Serial Monitor feature
- **`VITE_ENABLE_DOCKER_DEPLOY`**: Enable/disable Docker deployment feature
- **`VITE_ENABLE_GITEA_INTEGRATION`**: Enable/disable Gitea integration

---

## 🔐 Security Best Practices

### 1. **Never Commit `.env` Files**
Ensure `.env` files are listed in `.gitignore` to prevent sensitive data from being committed.

### 2. **Use Strong JWT Secrets**
Generate a strong random secret for production:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

### 3. **Use Environment-Specific Values**
- **Development**: Use `localhost` URLs
- **Production**: Use actual domain names and secure protocols (HTTPS/WSS)

### 4. **Rotate Gitea Tokens Regularly**
Create new Gitea tokens periodically and update the `.env` file.

### 5. **Secure MongoDB Connection**
- Use authentication for MongoDB in production
- Use MongoDB Atlas or secure on-premise deployment
- Enable SSL/TLS for database connections

---

## 📋 Quick Setup Steps

### Step 1: Create Backend `.env` File
```bash
cd backend
cp .env.example .env    # If .env.example exists
# OR
touch .env              # Create new file
# Edit the file with your values
```

### Step 2: Create Frontend `.env` File
```bash
cd ..                   # Back to root directory
cp .env.example .env    # If .env.example exists
# OR
touch .env              # Create new file
# Edit the file with your values
```

### Step 3: Configure MongoDB
Ensure MongoDB is running:
```bash
# Check MongoDB status (Windows)
sc query MongoDB

# Check MongoDB status (Linux/Mac)
sudo systemctl status mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Verify Configuration
```bash
# Test backend
cd backend
npm run dev

# Test frontend (in new terminal)
cd ..
npm run dev
```

---

## 🌐 Production Configuration

### Backend Production `.env`
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ub-project-management
JWT_SECRET=<YOUR_STRONG_RANDOM_SECRET_HERE>
JWT_EXPIRE=7d
GITEA_URL=https://gitea.com
GITEA_TOKEN=<YOUR_GITEA_TOKEN>
GITEA_OWNER=dmiii-0
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/app/uploads
```

### Frontend Production `.env`
```env
VITE_API_URL=https://api.your-domain.com/api
VITE_WS_URL=wss://api.your-domain.com
VITE_APP_NAME=UB Project Management System
VITE_APP_VERSION=1.0.0
```

---

## 🔍 Troubleshooting

### Issue: Backend Cannot Connect to MongoDB
**Solution**: Verify MongoDB is running and the `MONGODB_URI` is correct
```bash
# Test MongoDB connection
mongosh "mongodb://localhost:27017/ub-project-management"
```

### Issue: CORS Errors
**Solution**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL

### Issue: Gitea API Errors
**Solution**: 
1. Verify `GITEA_TOKEN` is valid
2. Check token permissions in Gitea settings
3. Ensure `GITEA_OWNER` matches your Gitea username

### Issue: WebSocket Connection Failed
**Solution**: Ensure `VITE_WS_URL` matches backend WebSocket server URL

### Issue: File Upload Fails
**Solution**: 
1. Verify `UPLOAD_PATH` directory exists
2. Check `MAX_FILE_SIZE` is appropriate for your files
3. Ensure write permissions on upload directory

---

## 📚 Additional Resources

- [MongoDB Connection String Documentation](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Gitea API Documentation](https://docs.gitea.io/en-us/api-usage/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## ✅ Verification Checklist

Before starting the application, verify:

- [ ] Backend `.env` file created in `/backend/.env`
- [ ] Frontend `.env` file created in `/.env`
- [ ] MongoDB is running and accessible
- [ ] JWT_SECRET is changed from default
- [ ] Gitea token has appropriate permissions
- [ ] All required variables are set
- [ ] `.env` files are in `.gitignore`

---

**Need help?** Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide or refer to other setup documentation.
