# Backend Setup Guide

Complete guide for setting up the Node.js backend API server.

## Overview

The backend is a RESTful API built with Node.js and Express.js, using MongoDB for data persistence, JWT for authentication, and Gitea API for repository management.

## Prerequisites

- ✅ Node.js v16 or higher
- ✅ npm v8 or higher
- ✅ MongoDB v5.0 or higher (running locally or remote)
- ✅ Gitea account and API token (see GITEA_SETUP.md)

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   ├── models/
│   │   ├── User.js          # User schema
│   │   └── Project.js       # Project schema
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── projects.js      # Project CRUD + Gitea
│   │   ├── comports.js      # Serial port management
│   │   └── deploy.js        # Deployment routes
│   ├── services/
│   │   └── gitea.js         # Gitea API integration
│   └── server.js            # Express server entry point
├── uploads/                 # File uploads directory
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## Step-by-Step Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT authentication
- **bcryptjs** - Password hashing
- **cors** - Cross-origin requests
- **dotenv** - Environment variables
- **multer** - File uploads
- **axios** - HTTP client for Gitea API
- **ws** - WebSocket server
- **serialport** - Serial communication (for devices)

### 3. Configure Environment Variables

The `.env` file should already be created. Verify it contains:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ub-project-management

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (Change in production!)
JWT_SECRET=ub-project-management-super-secret-jwt-key-2024

# Gitea Configuration
GITEA_URL=https://gitea.com
GITEA_TOKEN=8e3b07b99105e50bfff5e05dd410f1439693c07a
GITEA_OWNER=dmiii-0

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# WebSocket Configuration
WS_PORT=3001
```

### 4. Start MongoDB

#### Windows
```bash
# Start MongoDB service
net start MongoDB

# Check if running
mongo --eval "db.version()"
```

#### Linux
```bash
# Start MongoDB
sudo systemctl start mongod

# Enable on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

#### Mac
```bash
# Start MongoDB
brew services start mongodb-community

# Check status
brew services list
```

#### Verify MongoDB Connection
```bash
# Connect to MongoDB shell
mongosh

# Or if using older version
mongo

# You should see MongoDB shell
# Type 'exit' to quit
```

### 5. Start Backend Server

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

### 6. Verify Server is Running

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
✅ Gitea API connection successful
```

### 7. Test the Backend

```bash
# Health check
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","message":"Server is running"}

# API documentation
curl http://localhost:3001/
```

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@ub.edu.ph",
  "password": "password123",
  "role": "student",
  "studentId": "2024-00001"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@ub.edu.ph",
  "password": "password123"
}

# Returns: { "token": "jwt_token", "user": {...} }
```

### Projects (`/api/projects`)

All project routes require authentication header:
```
Authorization: Bearer <jwt_token>
```

#### List Projects
```bash
GET /api/projects?search=arduino
Authorization: Bearer <token>
```

#### Get Project
```bash
GET /api/projects/:id
Authorization: Bearer <token>
```

#### Create Project (+ Gitea Repo)
```bash
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "LED Blink Project",
  "description": "Arduino LED blinking",
  "deviceType": "arduino"
}
```

This will:
1. Create project in MongoDB
2. Create Gitea repository
3. Initialize repository with project files
4. Return project data with repository URL

#### Update Project
```bash
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Project (Soft Delete)
```bash
DELETE /api/projects/:id
Authorization: Bearer <token>
```

#### Upload Documentation
```bash
POST /api/projects/:id/upload-doc
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Form data with 'documentation' field containing PDF file
```

#### Get Repository Files
```bash
GET /api/projects/:id/files?path=src
Authorization: Bearer <token>
```

#### Get File Content
```bash
GET /api/projects/:id/files/content?filepath=src/main.ino
Authorization: Bearer <token>
```

### COM Ports (`/api/comports`)

```bash
GET /api/comports
Authorization: Bearer <token>

# Returns list of available COM ports
```

### Deployment (`/api/deploy`)

#### Deploy to Device
```bash
POST /api/deploy/device
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "port": "COM3",
  "code": "arduino_code_here"
}
```

#### Generate Docker Manifest
```bash
POST /api/deploy/docker-manifest
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectId": "project_id",
  "config": {
    "port": 8080,
    "env": {}
  }
}
```

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (student/instructor),
  studentId: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```javascript
{
  name: String,
  description: String,
  deviceType: String (arduino/esp32/raspberry-pi/web-app),
  createdBy: ObjectId (User),
  createdByName: String,
  giteaRepoUrl: String,
  giteaRepoName: String,
  documentationUrl: String,
  ports: [String],
  dockerManifest: String,
  status: String (active/archived),
  createdAt: Date,
  updatedAt: Date
}
```

## Gitea Integration

The backend integrates with Gitea API to:
1. Create repositories automatically
2. Initialize with project structure
3. Manage repository files
4. Provide file browsing in frontend

### Gitea Service Functions

Located in `src/services/gitea.js`:

```javascript
// Create repository
await giteaService.createRepository(name, description, isPrivate)

// List repositories
await giteaService.listRepositories()

// Get repository
await giteaService.getRepository(owner, repo)

// Get repository contents
await giteaService.getRepositoryContents(owner, repo, path)

// Get file content
await giteaService.getFileContent(owner, repo, filepath)

// Create file
await giteaService.createFile(owner, repo, filepath, content, message)

// Initialize project structure
await giteaService.initializeProjectStructure(owner, repo, deviceType)
```

### Project Templates

When creating a project, the system initializes Gitea repositories with appropriate structures:

#### Arduino/ESP32
```
repository/
├── src/
│   └── main.ino
└── README.md
```

#### Raspberry Pi
```
repository/
├── main.py
├── requirements.txt
└── README.md
```

#### Web App
```
repository/
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Serial Port Communication

For Arduino/ESP32 deployment:

```javascript
// List available ports
const ports = await serialAPI.getPorts()

// Deploy to device
await serialAPI.deploy(projectId, port, code)
```

Uses the `serialport` npm package for device communication.

## WebSocket Server

Serial Monitor uses WebSocket for real-time communication:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3001/serial')

// Receive serial data
ws.onmessage = (event) => {
  console.log('Serial data:', event.data)
}
```

## Authentication Middleware

Protected routes use JWT authentication:

```javascript
// In routes/projects.js
router.get('/', protect, async (req, res) => {
  // req.user contains authenticated user
})
```

The `protect` middleware:
1. Extracts token from Authorization header
2. Verifies JWT signature
3. Loads user from database
4. Attaches user to `req.user`
5. Returns 401 if invalid

## File Upload

PDF documentation uploads use Multer:

```javascript
// Files stored in: uploads/<projectId>/<filename>
// Max size: 10MB
// Accepted: PDF only
```

## Error Handling

All routes use try-catch with proper error responses:

```javascript
try {
  // Route logic
} catch (error) {
  console.error('Error:', error)
  res.status(500).json({ 
    message: 'Error message',
    error: error.message 
  })
}
```

## CORS Configuration

CORS is configured to allow frontend access:

```javascript
// In server.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
```

## Environment-Specific Configuration

### Development
```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Features:
- Detailed error messages
- CORS enabled
- Auto-reload with nodemon

### Production
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

Features:
- Minimal error messages
- Strict CORS
- No auto-reload

## Testing the Backend

### Using cURL

#### 1. Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@ub.edu.ph",
    "password": "test123",
    "role": "student",
    "studentId": "2024-99999"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ub.edu.ph",
    "password": "test123"
  }'
```

Save the returned token!

#### 3. Create Project
```bash
curl -X POST http://localhost:3001/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "test-project",
    "description": "Test project",
    "deviceType": "arduino"
  }'
```

### Using Postman

1. Import collection or create requests manually
2. Set base URL: `http://localhost:3001/api`
3. For authenticated requests:
   - Go to Authorization tab
   - Type: Bearer Token
   - Token: Paste your JWT token

## MongoDB Management

### Using MongoDB Compass

1. Download: https://www.mongodb.com/try/download/compass
2. Connect to: `mongodb://localhost:27017`
3. Select database: `ub-project-management`
4. View collections: `users`, `projects`

### Using MongoDB Shell

```bash
# Connect
mongosh

# Or for older versions
mongo

# Select database
use ub-project-management

# Show collections
show collections

# Query users
db.users.find().pretty()

# Query projects
db.projects.find().pretty()

# Count documents
db.users.countDocuments()
db.projects.countDocuments()

# Delete all projects (careful!)
db.projects.deleteMany({})
```

## Logs and Debugging

### Server Logs
All logs appear in the console where you run `npm run dev`.

### Error Logs
Errors include:
- Stack trace
- Request details
- User information (if authenticated)

### Debug Mode
Set environment variable:
```bash
DEBUG=* npm run dev
```

## Performance Considerations

### Database Indexes
Add indexes for frequently queried fields:
```javascript
// In models/Project.js
ProjectSchema.index({ name: 'text', description: 'text' })
ProjectSchema.index({ createdBy: 1 })
ProjectSchema.index({ status: 1 })
```

### API Rate Limiting
Consider adding rate limiting for production:
```bash
npm install express-rate-limit
```

### Caching
For Gitea API calls, consider caching:
```bash
npm install node-cache
```

## Security Best Practices

1. **JWT Secret**: Use strong, random secret in production
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Environment Variables**: Never commit `.env` files
   ```bash
   # Already in .gitignore
   backend/.env
   ```

3. **MongoDB**: Enable authentication in production
   ```env
   MONGODB_URI=mongodb://username:password@host:port/database
   ```

4. **HTTPS**: Use HTTPS in production

5. **Input Validation**: Validate all user inputs

6. **File Upload**: Validate file types and sizes

## Deployment

### 1. Prepare for Production

Update `.env`:
```env
NODE_ENV=production
MONGODB_URI=mongodb://production-host/db
JWT_SECRET=<strong-random-secret>
GITEA_TOKEN=<your-token>
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Build (if using TypeScript)
```bash
npm run build
```

### 3. Start Production Server
```bash
npm start
```

### 4. Use Process Manager

#### PM2 (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start src/server.js --name ub-backend

# Save configuration
pm2 save

# Start on boot
pm2 startup
```

#### Forever
```bash
npm install -g forever
forever start src/server.js
```

### 5. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Backup and Restore

### Backup MongoDB
```bash
# Backup entire database
mongodump --db ub-project-management --out ./backup

# Backup single collection
mongodump --db ub-project-management --collection users --out ./backup
```

### Restore MongoDB
```bash
# Restore entire database
mongorestore --db ub-project-management ./backup/ub-project-management

# Restore single collection
mongorestore --db ub-project-management --collection users ./backup/ub-project-management/users.bson
```

## Common Issues

See **TROUBLESHOOTING.md** for detailed solutions to common problems.

## Additional Resources

- **Express.js**: https://expressjs.com
- **MongoDB**: https://docs.mongodb.com
- **Mongoose**: https://mongoosejs.com
- **JWT**: https://jwt.io
- **Gitea API**: https://docs.gitea.io/en-us/api-usage/

## Support

- Check main **README.md** for overview
- Check **FRONTEND_SETUP.md** for frontend setup
- Check **TROUBLESHOOTING.md** for common issues
- Check **GITEA_SETUP.md** for Gitea integration

---

**Backend is ready!** 🚀

Start the server with `npm run dev` and it will listen on http://localhost:3001
