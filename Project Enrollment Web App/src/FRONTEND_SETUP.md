# Frontend Setup Guide

Complete guide for setting up the React frontend application.

## Overview

The frontend is a React + TypeScript application using Vite as the build tool and Tailwind CSS for styling. It communicates with the backend API for all data operations.

## Prerequisites

- ✅ Node.js v16 or higher
- ✅ npm v8 or higher
- ✅ Backend server running (see BACKEND_SETUP.md)

## Project Structure

```
frontend/  (root directory)
├── src/
│   └── main.tsx           # React entry point
├── components/            # Reusable React components
│   ├── ui/               # UI library components
│   ├── Layout.tsx        # Main layout wrapper
│   ├── EnrollProject.tsx # Project enrollment form
│   ├── COMPortSelector.tsx
│   └── SerialMonitor.tsx
├── pages/                # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProjectsPage.tsx
│   ├── ProjectDetailPage.tsx
│   ├── EnrollmentPage.tsx
│   └── DeploymentPage.tsx
├── lib/                  # Utilities and contexts
│   ├── api.ts           # API client functions
│   └── auth-context.tsx # Authentication context
├── styles/
│   └── globals.css      # Global styles + Tailwind
├── App.tsx              # Main app component with routing
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── package.json         # Dependencies
└── .env                 # Environment variables
```

## Step-by-Step Setup

### 1. Install Dependencies

```bash
# From the root directory (frontend root)
npm install
```

This will install:
- React & React DOM
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React (icons)
- Axios (HTTP client)
- Sonner (toast notifications)
- Other UI dependencies

### 2. Configure Environment Variables

The `.env` file should already exist in the root directory. Verify it contains:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api
```

**Important Notes:**
- The `VITE_` prefix is required for Vite to expose the variable
- Update the URL if your backend runs on a different port
- For production, change to your production backend URL

### 3. Verify Backend Connection

Before starting the frontend, ensure:
1. Backend is running on http://localhost:3001
2. Backend health check works:
   ```bash
   curl http://localhost:3001/api/health
   ```
3. CORS is properly configured in backend

### 4. Start Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 5. Access the Application

Open your browser to: **http://localhost:5173**

You should see the login page.

## Default Login Credentials

```
Email:    admin@ub.edu.ph
Password: admin123
```

⚠️ **Security**: Change this password after first login!

## Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
```

### Build
```bash
npm run build        # Build for production (outputs to /dist)
npm run preview      # Preview production build locally
```

### Type Checking
```bash
npm run type-check   # Run TypeScript compiler check
```

## Features & Pages

### 1. Authentication
- **Login Page** (`/login`) - User authentication
- **Register Page** (`/register`) - New user registration

### 2. Dashboard
- **Dashboard** (`/dashboard`) - Overview and quick actions
- Shows project statistics
- Quick access to recent projects

### 3. Projects
- **Projects List** (`/projects`) - View all projects
  - Search and filter functionality
  - Sort by name, date, type
  - Gitea sync status
- **Project Detail** (`/project/:id`) - View single project
  - Repository files browser
  - Documentation management
  - Deployment options

### 4. Enrollment
- **Enroll Project** (`/enroll`) - Create new project
  - Automatically creates Gitea repository
  - Initializes project structure
  - Supports Arduino, ESP32, Raspberry Pi, Web App

### 5. Deployment
- **Deploy** (`/deploy/:id`) - Deploy to devices
  - COM port selection
  - Serial monitor
  - Code upload
  - Docker manifest generation

## API Integration

The frontend uses the API client in `lib/api.ts` to communicate with the backend.

### API Client Functions

```typescript
// Authentication
authAPI.login(email, password)
authAPI.register(userData)

// Gitea Integration (Direct)
giteaAPI.getRepositories()
giteaAPI.getRepoContents(repoName, path)
giteaAPI.createRepository(repoData)

// Projects (via Backend)
projectAPI.createProject(projectData)
projectAPI.getProjects(filters)
projectAPI.getProject(id)
projectAPI.updateProject(id, data)
projectAPI.uploadDocumentation(id, file)

// Serial Communication
serialAPI.getPorts()
serialAPI.deploy(projectId, port, code)

// Docker
dockerAPI.generateManifest(projectId, config)
dockerAPI.deploy(projectId, manifest)
```

### Example API Usage

```typescript
import { projectAPI } from '../lib/api';

// Create a new project
const newProject = await projectAPI.createProject({
  name: 'LED Blink',
  description: 'Simple LED project',
  deviceType: 'arduino'
});

// Get all projects
const projects = await projectAPI.getProjects({ 
  search: 'LED' 
});
```

## Authentication Flow

1. **Login**:
   - User enters credentials on `/login`
   - Frontend calls `authAPI.login()`
   - Backend validates and returns JWT token
   - Token stored in `localStorage`
   - User redirected to `/dashboard`

2. **Protected Routes**:
   - App checks for token in `localStorage`
   - If no token → redirect to `/login`
   - Token included in all API requests as `Authorization: Bearer <token>`

3. **Logout**:
   - Token removed from `localStorage`
   - User redirected to `/login`

## Styling

### Dark Theme
The application uses a dark theme by default. It's configured in:
- `index.html` - `<html class="dark">`
- `styles/globals.css` - Dark mode CSS variables

### Tailwind CSS
All styling uses Tailwind CSS utility classes:
```tsx
<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
  Click Me
</button>
```

### Custom Styles
Custom styles are in `styles/globals.css`:
- CSS variables for colors
- Dark mode support
- Typography defaults

## Development Tips

### Hot Module Replacement (HMR)
Vite provides instant HMR. Changes to:
- React components → Instant update
- CSS/Tailwind → Instant update
- `lib/api.ts` → Requires page refresh

### TypeScript
The project uses TypeScript. Type errors will show:
- In your IDE
- In the terminal during `npm run dev`
- During build with `npm run build`

### API Development
When the backend API changes:
1. Update types in `types/index.ts`
2. Update API client in `lib/api.ts`
3. Update components using the API

## Connecting to Backend

### Local Development
```env
VITE_API_URL=http://localhost:3001/api
```

### Production
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Testing Connection
Create a test file `test-connection.html`:
```html
<!DOCTYPE html>
<html>
<body>
  <h1>Backend Connection Test</h1>
  <button onclick="testConnection()">Test Connection</button>
  <pre id="result"></pre>
  
  <script>
    async function testConnection() {
      try {
        const response = await fetch('http://localhost:3001/api/health');
        const data = await response.json();
        document.getElementById('result').textContent = JSON.stringify(data, null, 2);
      } catch (error) {
        document.getElementById('result').textContent = 'Error: ' + error.message;
      }
    }
  </script>
</body>
</html>
```

## Common Issues

### 1. Backend Connection Failed

**Symptom**: API calls fail with network errors

**Solution**:
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check .env file
cat .env

# Restart frontend
npm run dev
```

### 2. CORS Errors

**Symptom**: Browser console shows CORS errors

**Solution**: Update `backend/.env`:
```env
FRONTEND_URL=http://localhost:5173
```

### 3. Page Not Found (404)

**Symptom**: Direct URL access shows 404

**Cause**: Vite dev server doesn't have fallback configured for SPA

**Solution**: Always navigate from root or use React Router `<Link>`

### 4. White Screen / React Error

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check browser console for errors
# Open DevTools (F12) → Console tab
```

### 5. Gitea Integration Not Working

**Symptom**: Projects page shows no repositories

**Check**:
1. Backend Gitea connection (see backend logs)
2. Gitea token in `backend/.env`
3. Browser console for API errors

### 6. Environment Variables Not Loading

**Symptom**: `import.meta.env.VITE_API_URL` is undefined

**Solution**:
1. Verify `.env` file exists in root directory
2. Restart dev server (Ctrl+C, then `npm run dev`)
3. Variable MUST start with `VITE_`

## Building for Production

### 1. Build
```bash
npm run build
```

Outputs to `dist/` directory:
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── vite.svg
```

### 2. Preview Production Build
```bash
npm run preview
```

Opens at http://localhost:4173

### 3. Deploy
Upload the `dist/` directory to your web server or hosting platform:
- **Netlify**: Drag & drop `dist` folder
- **Vercel**: Connect Git repo, set build command to `npm run build`
- **Apache/Nginx**: Copy `dist` contents to web root

### 4. Environment Variables for Production

Create `.env.production`:
```env
VITE_API_URL=https://api.your-domain.com/api
```

Build with:
```bash
npm run build -- --mode production
```

## Performance Optimization

### Code Splitting
React Router automatically splits routes into separate chunks.

### Lazy Loading
Use React.lazy for heavy components:
```tsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<div>Loading...</div>}>
  <HeavyComponent />
</Suspense>
```

### Bundle Size
Check bundle size:
```bash
npm run build
```

Look for large files in build output.

## Browser Compatibility

Supports all modern browsers:
- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+

## Security Considerations

1. **JWT Token Storage**: Stored in `localStorage`
   - Vulnerable to XSS attacks
   - Keep dependencies updated
   - Sanitize user inputs

2. **API Token**: Never commit `.env` files
   ```bash
   # Already in .gitignore
   .env
   .env.local
   ```

3. **HTTPS**: Always use HTTPS in production

4. **Content Security Policy**: Add CSP headers on server

## Additional Resources

- **React Docs**: https://react.dev
- **Vite Docs**: https://vitejs.dev
- **Tailwind CSS**: https://tailwindcss.com
- **TypeScript**: https://www.typescriptlang.org

## Support

- Check main **README.md** for general information
- Check **BACKEND_SETUP.md** for backend setup
- Check **TROUBLESHOOTING.md** for common issues
- Review **GITEA_SETUP.md** for Gitea integration

---

**Ready to develop!** 🚀

Start the dev server with `npm run dev` and open http://localhost:5173
