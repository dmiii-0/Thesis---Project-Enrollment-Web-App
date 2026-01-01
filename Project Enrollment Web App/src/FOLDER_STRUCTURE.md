# Folder Structure Guide

Understanding the project organization and file locations.

## Overview

This project uses a **hybrid structure** where:
- **Frontend** files are in the **root directory**
- **Backend** files are in the **backend/ subdirectory**

## Complete Folder Tree

```
ub-project-management/                    ← ROOT (Frontend)
│
├── 📁 backend/                            ← BACKEND (Separate app)
│   ├── src/                              ← Backend source code
│   │   ├── config/
│   │   │   └── database.js              # MongoDB connection setup
│   │   ├── middleware/
│   │   │   └── auth.js                  # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.js                  # User schema/model
│   │   │   └── Project.js               # Project schema/model
│   │   ├── routes/
│   │   │   ├── auth.js                  # POST /api/auth/login, /register
│   │   │   ├── projects.js              # CRUD /api/projects
│   │   │   ├── comports.js              # GET /api/comports
│   │   │   └── deploy.js                # POST /api/deploy/*
│   │   ├── services/
│   │   │   └── gitea.js                 # Gitea API integration
│   │   └── server.js                    # Express app entry point
│   ├── uploads/                          # PDF uploads storage
│   ├── .env                              # Backend environment variables
│   ├── .env.example                      # Backend env template
│   ├── package.json                      # Backend dependencies
│   ├── README.md                         # Backend documentation
│   └── node_modules/                     # Backend packages (gitignored)
│
├── 📁 src/                                ← Frontend React entry
│   └── main.tsx                          # React initialization, mounts to DOM
│
├── 📁 components/                         ← Reusable React components
│   ├── ui/                               # UI library (shadcn components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ... (40+ UI components)
│   ├── figma/
│   │   └── ImageWithFallback.tsx        # Image component with fallback
│   ├── Layout.tsx                        # Main layout with sidebar
│   ├── EnrollProject.tsx                 # Project creation form
│   ├── COMPortSelector.tsx               # COM port selection UI
│   └── SerialMonitor.tsx                 # Serial monitor UI
│
├── 📁 pages/                              ← Page components (routes)
│   ├── LoginPage.tsx                     # /login
│   ├── RegisterPage.tsx                  # /register
│   ├── DashboardPage.tsx                 # /dashboard
│   ├── ProjectsPage.tsx                  # /projects
│   ├── ProjectDetailPage.tsx             # /project/:id
│   ├── EnrollmentPage.tsx                # /enroll
│   └── DeploymentPage.tsx                # /deploy/:id
│
├── 📁 lib/                                ← Utilities and helpers
│   ├── api.ts                            # API client (axios wrappers)
│   └── auth-context.tsx                  # React Auth context
│
├── 📁 styles/                             ← Styling
│   └── globals.css                       # Global CSS + Tailwind + Dark theme
│
├── 📁 types/                              ← TypeScript definitions
│   └── index.ts                          # Shared type definitions
│
├── 📁 guidelines/                         ← Development guidelines
│   └── Guidelines.md                     # Coding standards
│
├── 📄 Configuration Files (Frontend)
│   ├── App.tsx                           # Main app with React Router
│   ├── index.html                        # HTML entry, loads React app
│   ├── vite.config.ts                    # Vite build configuration
│   ├── tsconfig.json                     # TypeScript config
│   ├── tsconfig.node.json                # TypeScript config for Node
│   ├── package.json                      # Frontend dependencies
│   ├── .env                              # Frontend environment variables
│   ├── .env.example                      # Frontend env template
│   └── .gitignore                        # Git ignore rules
│
├── 📄 Documentation
│   ├── README.md                         # Main documentation (you are here)
│   ├── QUICKSTART.md                     # 5-minute quick start
│   ├── SETUP_SUMMARY.md                  # Commands & config reference
│   ├── FRONTEND_SETUP.md                 # Frontend detailed setup
│   ├── BACKEND_SETUP.md                  # Backend detailed setup
│   ├── GITEA_SETUP.md                    # Gitea integration guide
│   ├── CONNECTION_TEST.md                # Test frontend-backend connection
│   ├── TROUBLESHOOTING.md                # Common issues & solutions
│   ├── FOLDER_STRUCTURE.md               # This file
│   └── Attributions.md                   # Credits & licenses
│
└── 📄 Setup Scripts
    ├── setup.bat                         # Windows automated setup
    ├── setup.sh                          # Linux/Mac automated setup
    ├── start-dev.bat                     # Windows dev servers starter
    └── start-dev.sh                      # Linux/Mac dev servers starter
```

## Key Directories Explained

### 🎨 Frontend (Root Directory)

**What it is:**
- React application
- TypeScript
- Vite for building
- Runs on port 5173

**Main files:**
- `App.tsx` - Main app, routing
- `src/main.tsx` - React entry point
- `vite.config.ts` - Build config
- `.env` - Frontend config (VITE_API_URL)

**To run:**
```bash
# From root directory
npm run dev
```

### ⚙️ Backend (backend/ subdirectory)

**What it is:**
- Node.js + Express API server
- MongoDB integration
- Gitea API integration
- Runs on port 3001

**Main files:**
- `src/server.js` - Express server
- `src/routes/*.js` - API endpoints
- `src/models/*.js` - MongoDB schemas
- `.env` - Backend config (MONGODB_URI, GITEA_TOKEN)

**To run:**
```bash
# From root directory
cd backend
npm run dev
```

## File Responsibilities

### Frontend Files

| File/Folder | Purpose | When to Edit |
|-------------|---------|--------------|
| `App.tsx` | React Router setup, main routes | Adding/changing routes |
| `pages/*.tsx` | Individual page components | Creating new pages |
| `components/*.tsx` | Reusable UI components | Creating shared components |
| `lib/api.ts` | API calls to backend | Adding new API endpoints |
| `styles/globals.css` | Global styles, Tailwind, dark theme | Changing colors/theme |
| `.env` | Frontend config | Changing backend URL |

### Backend Files

| File/Folder | Purpose | When to Edit |
|-------------|---------|--------------|
| `src/server.js` | Express server setup, middleware | Changing server config |
| `src/routes/*.js` | API endpoint handlers | Adding new endpoints |
| `src/models/*.js` | MongoDB schemas | Changing data structure |
| `src/services/gitea.js` | Gitea API integration | Changing repo behavior |
| `src/middleware/auth.js` | JWT authentication | Changing auth logic |
| `.env` | Backend config | Changing MongoDB, Gitea, ports |

## Environment Files

### Frontend .env (in root)
```env
# Location: /.env
VITE_API_URL=http://localhost:3001/api
```

**Used by:** Frontend React app  
**Access via:** `import.meta.env.VITE_API_URL`  
**Must restart:** Yes (stop and start `npm run dev`)

### Backend .env (in backend/)
```env
# Location: /backend/.env
MONGODB_URI=mongodb://localhost:27017/ub-project-management
PORT=3001
JWT_SECRET=your-secret
GITEA_URL=https://gitea.com
GITEA_TOKEN=your-token
GITEA_OWNER=your-username
FRONTEND_URL=http://localhost:5173
```

**Used by:** Backend Node.js server  
**Access via:** `process.env.MONGODB_URI`  
**Must restart:** Yes (stop and start backend)

## Dependencies (node_modules/)

### Frontend node_modules (in root)
```bash
# Location: /node_modules/
# Installed by: npm install (in root)
# Contains: React, TypeScript, Vite, Tailwind, etc.
# Size: ~200-300 MB
```

### Backend node_modules (in backend/)
```bash
# Location: /backend/node_modules/
# Installed by: cd backend && npm install
# Contains: Express, Mongoose, JWT, etc.
# Size: ~50-100 MB
```

**Important:** These are **separate**! Must install both:
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

## Where to Make Changes

### Adding a New Page

1. Create page component:
   ```bash
   # Create file
   touch pages/NewPage.tsx
   ```

2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new-page" element={<NewPage />} />
   ```

### Adding a New API Endpoint

1. Create route handler in `backend/src/routes/`:
   ```javascript
   // backend/src/routes/newroute.js
   router.get('/endpoint', async (req, res) => {
     // Handle request
   })
   ```

2. Register route in `backend/src/server.js`:
   ```javascript
   app.use('/api/newroute', require('./routes/newroute'))
   ```

3. Add API call in `lib/api.ts`:
   ```typescript
   export const newAPI = {
     getData: async () => {
       const response = await fetch(`${API_BASE_URL}/newroute/endpoint`)
       return response.json()
     }
   }
   ```

### Adding a New Component

1. Create component file:
   ```bash
   touch components/NewComponent.tsx
   ```

2. Import and use in page:
   ```tsx
   import { NewComponent } from '../components/NewComponent'
   ```

### Changing Database Schema

1. Edit model in `backend/src/models/`:
   ```javascript
   // backend/src/models/Project.js
   const schema = new Schema({
     // Add new field
     newField: String
   })
   ```

2. Update API routes to handle new field

3. Update frontend types in `types/index.ts`

4. Update frontend components

## Build Outputs

### Frontend Build
```bash
npm run build
# Creates: /dist/
```

Output folder:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images]
└── vite.svg
```

**Deploy:** Upload `dist/` folder to web server

### Backend (No Build)
Backend doesn't need building. Deploy as-is:
```bash
# Just copy backend/ folder to server
# Run: npm start
```

## Common Locations

### Finding Things

**Looking for...** → **Check...**

- Page layout → `components/Layout.tsx`
- Login form → `pages/LoginPage.tsx`
- API calls → `lib/api.ts`
- Dark theme colors → `styles/globals.css`
- API endpoint → `backend/src/routes/*.js`
- Database schema → `backend/src/models/*.js`
- Gitea integration → `backend/src/services/gitea.js`
- Environment config → `.env` or `backend/.env`
- Dependencies → `package.json` or `backend/package.json`

## Gitignored Files

These don't appear in the tree (not committed to git):

```
# Frontend
/node_modules/          # ~200-300 MB
/dist/                  # Build output
/.env                   # Environment variables

# Backend
/backend/node_modules/  # ~50-100 MB
/backend/uploads/       # Uploaded PDFs
/backend/.env           # Environment variables

# Other
.DS_Store              # Mac OS files
Thumbs.db              # Windows files
*.log                  # Log files
```

## Quick Navigation

```bash
# Frontend development
cd /                    # Root directory
npm run dev            # Start frontend

# Backend development
cd backend             # Backend directory
npm run dev            # Start backend

# Edit frontend code
nano App.tsx           # From root
nano pages/LoginPage.tsx
nano components/Layout.tsx

# Edit backend code
nano backend/src/server.js
nano backend/src/routes/projects.js
nano backend/src/models/Project.js

# Edit configuration
nano .env              # Frontend config
nano backend/.env      # Backend config
nano vite.config.ts    # Frontend build config
```

## Directory Size Reference

Typical sizes (after installation):

| Directory | Size | Why |
|-----------|------|-----|
| `/node_modules/` | ~200-300 MB | React, TypeScript, Vite, etc. |
| `/backend/node_modules/` | ~50-100 MB | Express, Mongoose, etc. |
| `/dist/` (after build) | ~500 KB - 2 MB | Optimized production build |
| `/backend/uploads/` | Varies | PDF documentation uploads |
| Source code | ~5-10 MB | Your code + docs |

## Best Practices

### ✅ Do:
- Keep frontend and backend dependencies separate
- Install deps in correct directory
- Use correct `.env` file for each app
- Run servers from correct directories

### ❌ Don't:
- Mix frontend and backend dependencies
- Edit `node_modules/` directly
- Commit `.env` files to git
- Put backend files in frontend folders

## Summary

**Remember:**

1. **Two separate applications**:
   - Frontend (root) - React app
   - Backend (backend/) - Node.js API

2. **Two package.json files**:
   - Root: Frontend dependencies
   - backend/: Backend dependencies

3. **Two .env files**:
   - Root: Frontend config
   - backend/: Backend config

4. **Two terminal windows needed**:
   - Terminal 1: Backend server
   - Terminal 2: Frontend server

---

**Now you know where everything is!** 📁

For setup instructions, see [QUICKSTART.md](QUICKSTART.md)
