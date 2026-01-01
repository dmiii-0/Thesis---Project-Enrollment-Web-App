# Frontend-Backend Connection Test Guide

Use this guide to verify that your frontend and backend are properly connected and communicating.

## Prerequisites

Before testing the connection:
- ✅ Backend is running on http://localhost:3001
- ✅ Frontend is running on http://localhost:5173
- ✅ MongoDB is running

## Quick Connection Test

### 1. Backend Health Check

Open a terminal and run:

```bash
curl http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2024-11-12T10:30:00.000Z"
}
```

✅ **If you see this**, backend is running correctly!

❌ **If you get an error**:
- Backend is not running
- Wrong port (check `backend/.env` for PORT setting)
- Firewall blocking the port

### 2. Frontend Access Test

Open your browser to: **http://localhost:5173**

**Expected Result:**
- You should see the login page
- No errors in browser console (press F12)

❌ **If you see errors**:
- Check browser console (F12 → Console tab)
- Frontend may not be running
- Wrong port in URL

### 3. API Connection Test

This tests if frontend can reach backend.

#### Method 1: Browser Console

1. Open http://localhost:5173
2. Press F12 to open DevTools
3. Go to Console tab
4. Paste and run:

```javascript
fetch('http://localhost:3001/api/health')
  .then(r => r.json())
  .then(data => console.log('✅ Connection successful:', data))
  .catch(err => console.error('❌ Connection failed:', err))
```

**Expected Output:**
```
✅ Connection successful: {status: "ok", message: "Server is running", ...}
```

#### Method 2: Network Tab

1. Open http://localhost:5173
2. Try to login (use any credentials)
3. Press F12 → Network tab
4. Look for request to `http://localhost:3001/api/auth/login`

**Expected:**
- Request shows up in network tab
- Status: 200, 400, or 401 (not network error)
- Response contains JSON data

**If you see CORS error:**
- Check `FRONTEND_URL` in `backend/.env`
- Should be: `FRONTEND_URL=http://localhost:5173`
- Restart backend after changing

## Comprehensive Test Suite

### Test 1: Environment Variables

#### Frontend Environment
```bash
# From root directory
cat .env
```

**Should contain:**
```env
VITE_API_URL=http://localhost:3001/api
```

**Test in browser console:**
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL)
// Should output: http://localhost:3001/api
```

#### Backend Environment
```bash
cd backend
cat .env
```

**Should contain:**
```env
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Test 2: CORS Configuration

Run this in terminal:

```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS http://localhost:3001/api/auth/login -v
```

**Look for these headers in response:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Credentials: true
```

✅ **If you see these**, CORS is configured correctly!

### Test 3: Authentication Flow

This tests the complete authentication flow from frontend to backend.

#### Step 1: Register a Test User

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@ub.edu.ph",
    "password": "test123",
    "role": "student",
    "studentId": "2024-TEST"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@ub.edu.ph",
    "role": "student"
  }
}
```

**Using Frontend:**
1. Go to http://localhost:5173/register
2. Fill in the form
3. Click Register
4. Should redirect to dashboard

#### Step 2: Login

**Using cURL:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ub.edu.ph",
    "password": "test123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

**Using Frontend:**
1. Go to http://localhost:5173/login
2. Email: `test@ub.edu.ph`
3. Password: `test123`
4. Click Login
5. Should redirect to dashboard

#### Step 3: Authenticated Request

**Using cURL:**
```bash
# Replace YOUR_TOKEN with token from login
curl -X GET http://localhost:3001/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
[]
// Or array of projects if you have any
```

**Using Frontend:**
1. After logging in, go to Projects page
2. Check Network tab (F12)
3. Should see request to `/api/projects`
4. Request should have `Authorization` header

### Test 4: Gitea Integration

This tests backend's connection to Gitea.

**Check Backend Logs:**

When you start backend with `npm run dev`, look for:
```
✅ Gitea API connection successful
```

**Manual Test:**
```bash
curl -H "Authorization: token 8e3b07b99105e50bfff5e05dd410f1439693c07a" \
  https://gitea.com/api/v1/user
```

**Expected Response:**
```json
{
  "id": ...,
  "login": "dmiii-0",
  "email": "...",
  ...
}
```

### Test 5: MongoDB Connection

**Check Backend Logs:**

When you start backend, look for:
```
✅ MongoDB Connected: localhost
📦 Database: ub-project-management
```

**Manual Test:**
```bash
mongosh

use ub-project-management
show collections
db.users.countDocuments()
```

**Expected:**
- Should connect without errors
- Should show `users` and `projects` collections (after first use)

### Test 6: Full Integration Test

This tests the complete flow from frontend → backend → MongoDB → Gitea.

#### Create a Project

**Using Frontend:**
1. Login to http://localhost:5173
2. Go to "Enroll Project"
3. Fill in:
   - Name: "Test Project"
   - Description: "Testing integration"
   - Device Type: Arduino
4. Click "Create Project"

**What should happen:**
1. ✅ Frontend sends POST to `/api/projects`
2. ✅ Backend receives request
3. ✅ Backend validates JWT token
4. ✅ Backend creates Gitea repository
5. ✅ Backend saves project to MongoDB
6. ✅ Backend returns project data
7. ✅ Frontend shows success message
8. ✅ Frontend redirects to project list

**Verify:**

1. **Check Gitea:**
   - Go to https://gitea.com/dmiii-0
   - Should see new repository "test-project"

2. **Check MongoDB:**
   ```bash
   mongosh
   use ub-project-management
   db.projects.find().pretty()
   ```
   - Should see your project

3. **Check Frontend:**
   - Go to Projects page
   - Should see your project listed

## Common Connection Issues

### Issue: "Failed to fetch" in browser

**Causes:**
- Backend not running
- Wrong API URL in `.env`
- Firewall blocking connection

**Solutions:**
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check .env file
cat .env
# Should have: VITE_API_URL=http://localhost:3001/api

# Restart frontend
npm run dev
```

### Issue: CORS Error

**Error in console:**
```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
```bash
# Check backend/.env
cat backend/.env
# Should have: FRONTEND_URL=http://localhost:5173

# Restart backend
cd backend
npm run dev
```

### Issue: 401 Unauthorized

**Causes:**
- Not logged in
- Token expired
- Invalid token

**Solutions:**
1. Login again
2. Check localStorage in browser:
   ```javascript
   localStorage.getItem('token')
   ```
3. Clear storage and login:
   ```javascript
   localStorage.clear()
   ```

### Issue: Backend responds but data is wrong

**Check:**
1. MongoDB has data:
   ```bash
   mongosh
   use ub-project-management
   db.users.find()
   db.projects.find()
   ```

2. Backend logs for errors

3. API responses in Network tab

## Testing Checklist

Use this checklist to verify everything is connected:

- [ ] Backend health check returns 200 OK
- [ ] Frontend loads without errors
- [ ] Browser console has no errors
- [ ] Can register new user
- [ ] Can login with user
- [ ] Token is saved in localStorage
- [ ] Can access protected routes (projects)
- [ ] Projects page loads
- [ ] Can create new project
- [ ] Gitea repository is created
- [ ] Project appears in MongoDB
- [ ] Project appears in frontend
- [ ] Can view project details
- [ ] Can see repository files
- [ ] No CORS errors in console
- [ ] Backend logs show no errors
- [ ] MongoDB connection successful
- [ ] Gitea connection successful

## Automated Test Script

Create a file `test-connection.sh`:

```bash
#!/bin/bash

echo "🧪 Testing UB Project Management System Connection..."
echo ""

# Test 1: Backend Health
echo "Test 1: Backend Health Check"
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is running"
else
    echo "❌ Backend is not responding"
    exit 1
fi
echo ""

# Test 2: Frontend
echo "Test 2: Frontend Health Check"
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Frontend is running"
else
    echo "❌ Frontend is not responding"
    exit 1
fi
echo ""

# Test 3: MongoDB
echo "Test 3: MongoDB Connection"
if mongosh --eval "db.version()" > /dev/null 2>&1; then
    echo "✅ MongoDB is running"
else
    echo "❌ MongoDB is not running"
    exit 1
fi
echo ""

# Test 4: Gitea
echo "Test 4: Gitea API Connection"
if curl -s -H "Authorization: token 8e3b07b99105e50bfff5e05dd410f1439693c07a" \
   https://gitea.com/api/v1/user > /dev/null; then
    echo "✅ Gitea API is accessible"
else
    echo "❌ Gitea API connection failed"
fi
echo ""

echo "🎉 All basic tests passed!"
echo ""
echo "Next: Try accessing http://localhost:5173 in your browser"
```

Run it:
```bash
chmod +x test-connection.sh
./test-connection.sh
```

## Success Indicators

You know everything is connected properly when:

1. ✅ Backend starts without errors
2. ✅ Frontend loads the login page
3. ✅ Can login successfully
4. ✅ Dashboard shows data
5. ✅ Projects page loads
6. ✅ Can create a new project
7. ✅ New repository appears on Gitea
8. ✅ No CORS errors in browser console
9. ✅ No connection errors in backend logs
10. ✅ MongoDB shows data when queried

---

**Connection verified!** 🎉

If all tests pass, your frontend and backend are properly connected and ready for development!

For issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
