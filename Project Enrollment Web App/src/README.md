# UB Project Management System

A comprehensive project management system for University of Batangas Lipa Campus that enables students and instructors to enroll, manage, and deploy projects for microcontroller devices (Arduino, ESP32, Raspberry Pi) and web applications.

## 📚 Documentation Guide

Choose the guide that matches your needs:

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| **[QUICKSTART.md](QUICKSTART.md)** | 5-minute setup | First time setup, want to get running fast |
| **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** | Quick reference | Need reminder of commands/ports/config |
| **[FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md)** | Project organization | Understanding where files are located |
| **[FRONTEND_SETUP.md](FRONTEND_SETUP.md)** | Frontend details | Working on React app, need API integration help |
| **[BACKEND_SETUP.md](BACKEND_SETUP.md)** | Backend details | Setting up API server, MongoDB, Gitea integration |
| **[GITEA_SETUP.md](GITEA_SETUP.md)** | Gitea integration | Configuring automatic repository creation |
| **[ENV_SETUP.md](ENV_SETUP.md)** | Environment variables | Configure .env files for frontend & backend |
| **[GITIGNORE_SETUP.md](GITIGNORE_SETUP.md)** | Git configuration | Set up proper .gitignore for security |
| **[CONNECTION_TEST.md](CONNECTION_TEST.md)** | Connection testing | Verify frontend-backend communication |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Problem solving | Having issues, need solutions |
| **README.md** *(this file)* | Overview & complete guide | Want comprehensive information |

### 🚀 New to the project?

1. Start with [QUICKSTART.md](QUICKSTART.md) to get everything running
2. Check [FOLDER_STRUCTURE.md](FOLDER_STRUCTURE.md) to understand project organization
3. Read [GITEA_SETUP.md](GITEA_SETUP.md) to configure repository integration
4. Use [CONNECTION_TEST.md](CONNECTION_TEST.md) to verify everything works
5. Keep [TROUBLESHOOTING.md](TROUBLESHOOTING.md) handy for issues

## Features

- 🔐 **Authentication & Authorization** - Role-based access for students and instructors
- 📦 **Project Management** - Create, update, and manage projects
- 🔄 **Gitea Integration** - Automatic repository creation and file management
- 💻 **Device Deployment** - COM port scanning and serial monitor for Arduino/ESP32
- 🐳 **Docker Support** - Docker manifest generation for web app deployments
- 📄 **Documentation** - PDF upload capabilities
- 🔍 **Search & Filter** - Find projects easily
- 🌓 **Dark Theme** - Modern dark UI

## Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Gitea API Integration
- Serial Port (for device communication)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5.0 or higher)
- Gitea account with API token
- npm or yarn

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ub-project-management
```

### 2. Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

### 3. Manual Setup

If you prefer manual setup or need more control:

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (already done if you ran setup script)
cp .env.example .env

# Edit .env file with your configuration if needed
nano .env
```

**Configure `.env` file:**

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/ub-project-management

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Secret (Change this!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Gitea Configuration
GITEA_URL=https://gitea.com
GITEA_TOKEN=8e3b07b99105e50bfff5e05dd410f1439693c07a
GITEA_OWNER=dmiii-0

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

```bash
# Start MongoDB (if not running)
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod

# Start backend server
npm run dev
```

The backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# Open new terminal and navigate to root directory
cd ..

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
nano .env
```

**Configure `.env` file:**

```env
VITE_API_URL=http://localhost:3001/api
```

```bash
# Start frontend development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Gitea Integration Setup

### 1. Get Gitea API Token

1. Log in to your Gitea account at https://gitea.com
2. Go to **Settings** → **Applications**
3. Generate a new access token with **full repository access**
4. Copy the token

### 2. Configure Gitea in Backend

Update your `backend/.env` file:

```env
GITEA_URL=https://gitea.com
GITEA_TOKEN=your_gitea_token_here
GITEA_OWNER=your_gitea_username
```

### 3. Test Gitea Connection

The backend will automatically test the Gitea connection on startup. Look for:

```
✅ Gitea API connection successful
```

### How It Works

1. **Project Creation**: When you create a new project, the system automatically:
   - Creates a Gitea repository
   - Initializes with appropriate project structure based on device type
   - Stores repository information in MongoDB

2. **Repository Files**: View and manage files directly from the Projects page
3. **Automatic Structure**: Each project type gets specific starter files:
   - **Arduino/ESP32**: `src/main.ino` + README
   - **Raspberry Pi**: `main.py` + `requirements.txt` + README
   - **Web App**: `Dockerfile` + `docker-compose.yml` + README

## MongoDB Setup

### Install MongoDB

#### Windows
1. Download from https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### Mac
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Verify MongoDB is Running

```bash
# Check if MongoDB is running
mongosh

# Or
mongo
```

You should see the MongoDB shell. Type `exit` to quit.

## Usage

### Default Users

On first run, the system creates a default admin account:

- **Email**: `admin@ub.edu.ph`
- **Password**: `admin123`
- **Role**: Instructor

**⚠️ Change this password immediately after first login!**

### Creating a Project

1. Log in with student or instructor account
2. Navigate to **Enroll Project**
3. Fill in project details:
   - Project Name
   - Description
   - Device Type (Arduino, ESP32, Raspberry Pi, or Web App)
4. Click **Create Project**
5. A Gitea repository will be automatically created

### Viewing Projects

1. Go to **Projects** page
2. See all your enrolled projects
3. Click on a project to view details and repository files
4. Use the search bar to filter projects

### Deployment

#### For Microcontroller Projects:
1. Open project details
2. Go to **Deploy** tab
3. Select COM port from dropdown
4. Set baud rate (default: 9600)
5. Upload your code
6. Monitor output via Serial Monitor

#### For Web App Projects:
1. View generated Docker manifest
2. Deploy using Docker Compose
3. Access your application

## Project Structure

```
ub-project-management/
│
├── 📁 backend/                 # Node.js Backend Server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   ├── middleware/        # Auth middleware
│   │   ├── models/            # MongoDB models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Gitea API integration
│   │   └── server.js          # Express server entry
│   ├── .env                   # Backend environment variables
│   ├── .env.example
│   ├── package.json
│   └── README.md              # Backend documentation
│
├── 📁 Frontend (Root Directory) # React Frontend App
│   ├── src/
│   │   └── main.tsx           # React entry point
│   ├── components/            # React components
│   │   ��── ui/               # UI library components
│   │   └── ...
│   ├── pages/                # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── ProjectsPage.tsx
│   │   └── ...
│   ├── lib/                  # Utilities
│   │   ├── api.ts           # API client
│   │   └── auth-context.tsx # Auth context
│   ├── styles/
│   │   └── globals.css      # Global styles + dark theme
│   ├── .env                 # Frontend environment variables
│   ├── .env.example
│   ├── App.tsx              # Main app with routing
│   ├── vite.config.ts       # Vite configuration
│   └── package.json         # Frontend dependencies
│
├── 📄 Documentation
│   ├── README.md            # Main documentation (this file)
│   ├── FRONTEND_SETUP.md    # Frontend setup guide
│   ├── BACKEND_SETUP.md     # Backend setup guide
│   ├── GITEA_SETUP.md       # Gitea integration guide
│   ├── TROUBLESHOOTING.md   # Common issues & solutions
│   └── QUICKSTART.md        # Quick start guide
│
└── 🚀 Setup Scripts
    ├── setup.bat            # Windows setup script
    ├── setup.sh             # Linux/Mac setup script
    ├── start-dev.bat        # Windows dev startup
    └── start-dev.sh         # Linux/Mac dev startup
```

### Folder Separation

**Frontend (Root)**: All React/TypeScript files are in the root directory
- Run: `npm run dev` from root
- Port: 5173
- Environment: `.env` in root

**Backend**: All Node.js/Express files are in `backend/` directory
- Run: `cd backend && npm run dev`
- Port: 3001
- Environment: `backend/.env`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (creates Gitea repo)
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Archive project
- `POST /api/projects/:id/upload-doc` - Upload PDF documentation
- `GET /api/projects/:id/files` - Get repository files
- `GET /api/projects/:id/files/content` - Get file content

### COM Ports
- `GET /api/comports` - List available COM ports

### Deployment
- `POST /api/deploy/upload` - Upload code to device
- `POST /api/deploy/docker-manifest` - Generate Docker manifest

## Troubleshooting

**For detailed troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)**

### Quick Fixes

#### MongoDB Connection Failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
net start MongoDB             # Windows
brew services list            # Mac
```

#### Backend/Frontend Connection Issues
```bash
# Restart both servers
cd backend && npm run dev     # Terminal 1
npm run dev                   # Terminal 2 (from root)

# Check .env files
cat .env                      # Frontend
cat backend/.env              # Backend
```

#### Port Already in Use
```bash
# Kill process on port
lsof -ti:3001 | xargs kill -9      # Backend (Mac/Linux)
lsof -ti:5173 | xargs kill -9      # Frontend (Mac/Linux)
netstat -ano | findstr :3001       # Backend (Windows)
taskkill /PID <PID> /F             # Kill process (Windows)
```

#### Installation Issues
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Getting Help

1. 📖 Read [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for comprehensive solutions
2. 🔍 Check backend console logs for errors
3. 🌐 Check browser console (F12) for frontend errors
4. ✅ Verify all prerequisites are installed
5. 🔄 Try restarting all services

## Development

### Running in Development Mode

```bash
# Backend with auto-reload
cd backend
npm run dev

# Frontend with hot reload
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Backend is production-ready, just set NODE_ENV=production
cd backend
NODE_ENV=production npm start
```

## Security Notes

⚠️ **Important Security Considerations:**

1. **Change Default Credentials**: Update admin password after first login
2. **JWT Secret**: Use a strong, random JWT secret in production
3. **Environment Variables**: Never commit `.env` files
4. **API Tokens**: Keep Gitea tokens secure
5. **MongoDB**: Enable authentication in production
6. **HTTPS**: Use HTTPS in production environments
7. **CORS**: Configure proper CORS origins for production

## Support

For issues, questions, or contributions:

1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed information

## License

MIT License - see LICENSE file for details

---

**University of Batangas Lipa Campus** - Project Management System