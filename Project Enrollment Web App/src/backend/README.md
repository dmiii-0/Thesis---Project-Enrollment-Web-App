# UB Project Management Backend

Node.js backend API for the University of Batangas Project Management System with MongoDB authentication.

## Features

- ✅ User authentication (JWT-based)
- ✅ Role-based access control (Student/Instructor)
- ✅ Project management (CRUD operations)
- ✅ PDF documentation upload
- ✅ COM port scanning (mock)
- ✅ Device deployment (mock)
- ✅ WebSocket support for Serial Monitor
- ✅ MongoDB integration

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **WebSocket:** ws library

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB Compass installed and running
- MongoDB server running locally on port 27017

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

The `.env` file is already created with default settings. If needed, modify it:

```bash
# Edit .env file
nano .env
```

**Important Environment Variables:**
- `MONGODB_URI`: MongoDB connection string (default: `mongodb://localhost:27017/ub-project-management`)
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)

### 3. Start MongoDB

Make sure MongoDB is running. If using MongoDB Compass, it should already be connected to your local MongoDB server.

**Check MongoDB Status:**
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`
- The connection should be successful

### 4. Start the Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see output like:
```
============================================================
🚀 UB Project Management Backend Server
============================================================
📡 Server running in development mode
🌐 HTTP Server: http://localhost:3001
🔌 WebSocket Server: ws://localhost:3001/serial
📚 API Documentation: http://localhost:3001/
💚 Health Check: http://localhost:3001/api/health
============================================================

✅ MongoDB Connected: localhost
📦 Database: ub-project-management
```

### 5. Verify the Backend is Running

Open your browser or use curl to test:

```bash
# Health check
curl http://localhost:3001/api/health

# API documentation
curl http://localhost:3001/
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/auth/me` - Get current user profile

### Projects
- `GET /api/projects` - List all projects (with search)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Archive project
- `POST /api/projects/:id/upload-doc` - Upload PDF documentation

### Devices
- `GET /api/com-ports` - Scan available COM ports
- `POST /api/deploy/device` - Deploy to microcontroller
- `POST /api/deploy/webapp` - Deploy web application

### WebSocket
- `WS /serial` - Serial monitor WebSocket connection

## Testing the API

### 1. Create a User (Signup)

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@ub.edu.ph",
    "password": "password123",
    "role": "student",
    "studentId": "2024-00001"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@ub.edu.ph",
    "password": "password123"
  }'
```

Save the returned `token` for subsequent requests.

### 3. Create a Project (Protected Route)

```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "LED Blink Project",
    "description": "Simple LED blinking project using Arduino",
    "deviceType": "arduino"
  }'
```

### 4. Get All Projects

```bash
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## MongoDB Compass

After starting the backend:

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. You should see the database: `ub-project-management`
4. Collections:
   - `users` - User accounts
   - `projects` - Project data

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User model
│   │   └── Project.js           # Project model
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── projects.js          # Project routes
│   │   ├── comports.js          # COM port routes
│   │   └── deploy.js            # Deployment routes
│   └── server.js                # Main server file
├── uploads/                      # Uploaded files directory
├── .env                          # Environment variables
├── .env.example                  # Example environment variables
├── .gitignore                    # Git ignore file
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Development Notes

### Mock Implementations

The following features are currently mocked for development:

1. **COM Port Scanning** - Returns mock COM ports
2. **Device Deployment** - Simulates deployment with delay
3. **Gitea Integration** - Uses mock repository URLs

These will need to be implemented in production using:
- `serialport` library for COM port scanning
- `arduino-cli` or `platformio` for device deployment
- Gitea API for repository management

### WebSocket Serial Monitor

The WebSocket server is set up at `/serial` and currently sends mock serial data. In production, this should be connected to actual serial port communication.

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoDB Connection Error: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
1. Make sure MongoDB is installed and running
2. Check MongoDB Compass is connected
3. Verify the connection string in `.env`

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
1. Change the PORT in `.env` file
2. Or kill the process using port 3001:
   ```bash
   # Windows
   netstat -ano | findstr :3001
   taskkill /PID <PID> /F
   
   # Mac/Linux
   lsof -ti:3001 | xargs kill -9
   ```

### JWT Token Errors

**Error:** `Not authorized, token failed`

**Solution:**
1. Make sure JWT_SECRET is set in `.env`
2. Use a fresh token from login
3. Include `Bearer` prefix in Authorization header

## Next Steps

1. ✅ Backend is running successfully
2. ✅ Connected to MongoDB
3. ✅ Gitea API integrated
4. ✅ Ready to receive frontend requests
5. 🔄 Test with frontend at http://localhost:5173

## Support

**Full Documentation:**
- 📘 Main README: `/README.md`
- ⚙️ Backend Setup Guide: `/BACKEND_SETUP.md`
- 🔄 Gitea Setup: `/GITEA_SETUP.md`
- 🛠️ Troubleshooting: `/TROUBLESHOOTING.md`
- 🚀 Quick Start: `/QUICKSTART.md`

**Quick Help:**
```bash
# From project root
cat README.md            # Full guide
cat BACKEND_SETUP.md     # Backend details
cat TROUBLESHOOTING.md   # Common issues
```
