# .gitignore Setup Guide

This guide explains the `.gitignore` configuration for the University of Batangas Project Management System to ensure sensitive data and unnecessary files are not committed to version control.

## Overview

The `.gitignore` file prevents Git from tracking specific files and directories. This is crucial for:
- **Security**: Protecting sensitive data (API keys, passwords, tokens)
- **Performance**: Excluding large/generated files
- **Cleanliness**: Keeping the repository focused on source code

---

## 📁 File Locations

The project requires **two** `.gitignore` files:

1. **Root `.gitignore`**: `/gitignore` (frontend and general files)
2. **Backend `.gitignore`**: `/backend/.gitignore` (backend-specific files)

---

## 🎯 Root `.gitignore` Configuration

### Location: `/.gitignore`

Create this file in the **root** directory:

```gitignore
# ============================================
# ENVIRONMENT VARIABLES & SECRETS
# ============================================
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*.key
*.pem
*.cert

# ============================================
# NODE MODULES
# ============================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# ============================================
# BUILD OUTPUT & DISTRIBUTION
# ============================================
dist/
dist-ssr/
build/
out/
*.local

# ============================================
# VITE & FRONTEND CACHE
# ============================================
.vite/
.vite-inspect/
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

# ============================================
# EDITOR & IDE FILES
# ============================================
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store
Thumbs.db

# ============================================
# TYPESCRIPT
# ============================================
*.tsbuildinfo

# ============================================
# TESTING
# ============================================
coverage/
*.lcov
.nyc_output/
*.test.js.snap

# ============================================
# LOGS
# ============================================
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ============================================
# TEMPORARY FILES
# ============================================
tmp/
temp/
*.tmp
*.temp

# ============================================
# OPERATING SYSTEM FILES
# ============================================
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db
desktop.ini

# ============================================
# BACKUP FILES
# ============================================
*.bak
*.backup
*.old

# ============================================
# DOCUMENTATION BUILDS (Optional)
# ============================================
docs/.vitepress/dist
docs/.vitepress/cache

# ============================================
# PACKAGE MANAGER LOCK FILES (Choose One)
# ============================================
# Uncomment based on your package manager
# package-lock.json   # If using Yarn/pnpm
# yarn.lock           # If using npm/pnpm
# pnpm-lock.yaml      # If using npm/Yarn
```

---

## 🔧 Backend `.gitignore` Configuration

### Location: `/backend/.gitignore`

Create this file in the **backend** directory:

```gitignore
# ============================================
# ENVIRONMENT VARIABLES & SECRETS
# ============================================
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
config/secrets.json

# ============================================
# NODE MODULES
# ============================================
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ============================================
# UPLOADS & USER-GENERATED CONTENT
# ============================================
uploads/
*.pdf
*.docx
*.xlsx
temp_uploads/

# ============================================
# LOGS
# ============================================
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
combined.log
error.log
access.log

# ============================================
# DATABASE BACKUPS & DUMPS
# ============================================
*.sql
*.sqlite
*.sqlite3
*.db
backups/
dump/
mongo_dump/

# ============================================
# CACHE & TEMPORARY FILES
# ============================================
.cache/
tmp/
temp/
*.tmp
*.temp
.pid

# ============================================
# EDITOR & IDE FILES
# ============================================
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# ============================================
# TESTING
# ============================================
coverage/
.nyc_output/
test-results/

# ============================================
# BUILD OUTPUT
# ============================================
dist/
build/

# ============================================
# SSL/TLS CERTIFICATES
# ============================================
*.pem
*.key
*.cert
*.crt
ssl/
certs/

# ============================================
# SESSION STORAGE (if using file-based)
# ============================================
sessions/
*.session

# ============================================
# DOCKER (if needed)
# ============================================
.dockerignore
docker-compose.override.yml
```

---

## 🔐 Security-Critical Files to Ignore

### High Priority (Must Ignore)
These files contain sensitive data and must **never** be committed:

```gitignore
.env                    # Environment variables
.env.local              # Local environment overrides
.env.production         # Production secrets
*.key                   # Private keys
*.pem                   # SSL certificates
config/secrets.json     # Secret configurations
```

### Medium Priority (Should Ignore)
These files may contain sensitive paths or data:

```gitignore
uploads/               # User-uploaded files
logs/                  # Application logs
*.log                  # Log files
backups/               # Database backups
```

---

## 📦 Files to Keep in Repository

These files **should** be committed:

```
✅ Source code files (.js, .ts, .tsx, .jsx)
✅ Configuration templates (.env.example)
✅ Documentation (.md files)
✅ Package manifests (package.json)
✅ Build configurations (vite.config.ts, tsconfig.json)
✅ Static assets (public images, icons)
✅ Git configuration (.gitattributes)
```

---

## 📋 Setup Steps

### Step 1: Create Root `.gitignore`
```bash
# In project root directory
touch .gitignore

# Add the root gitignore content (see above)
```

### Step 2: Create Backend `.gitignore`
```bash
# In backend directory
cd backend
touch .gitignore

# Add the backend gitignore content (see above)
```

### Step 3: Create `.env.example` Files
Create template files to guide other developers:

**Root `.env.example`:**
```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_APP_NAME=UB Project Management System
```

**Backend `.env.example`:**
```bash
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/ub-project-management
JWT_SECRET=change-this-secret
GITEA_TOKEN=your-gitea-token-here
GITEA_OWNER=your-gitea-username
```

### Step 4: Verify Gitignore is Working
```bash
# Check which files are being tracked
git status

# Check if .env is ignored
git check-ignore .env
# Should output: .env

# Check if uploads/ is ignored
git check-ignore backend/uploads/
# Should output: backend/uploads/
```

---

## 🛠️ Advanced Gitignore Patterns

### Ignore Specific File Types in All Directories
```gitignore
**/*.log          # All .log files anywhere
**/*.tmp          # All .tmp files anywhere
**/.env           # All .env files anywhere
```

### Ignore Except Specific Files
```gitignore
# Ignore all files in uploads/
uploads/*

# But keep the directory structure
!uploads/.gitkeep

# And keep sample files
!uploads/samples/
```

### Platform-Specific Ignores

**Windows:**
```gitignore
Thumbs.db
ehthumbs.db
Desktop.ini
$RECYCLE.BIN/
*.lnk
```

**macOS:**
```gitignore
.DS_Store
.AppleDouble
.LSOverride
._*
.Spotlight-V100
.Trashes
```

**Linux:**
```gitignore
*~
.nfs*
```

---

## 🔍 Common Mistakes to Avoid

### ❌ Don't Ignore Package Manifests
```gitignore
# WRONG - Never ignore these!
package.json
package-lock.json  # Keep at least one lock file
```

### ❌ Don't Ignore Build Configs
```gitignore
# WRONG - These are needed for builds
vite.config.ts
tsconfig.json
```

### ❌ Don't Ignore README
```gitignore
# WRONG - Documentation should be versioned
README.md
```

### ✅ Do Ignore Generated Files
```gitignore
# CORRECT - These are generated during build
dist/
build/
node_modules/
```

---

## 🧹 Cleaning Already Committed Files

If you accidentally committed files that should be ignored:

### Remove Single File
```bash
# Remove from Git but keep local file
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from version control"
```

### Remove Directory
```bash
# Remove from Git but keep local directory
git rm -r --cached uploads/

# Commit the removal
git commit -m "Remove uploads directory from version control"
```

### Remove Multiple Files
```bash
# Remove all .log files
git rm --cached **/*.log

# Commit the removal
git commit -m "Remove log files from version control"
```

### Nuclear Option (Clean Everything)
```bash
# Remove all ignored files from Git
git rm -r --cached .
git add .
git commit -m "Apply .gitignore to all files"
```

---

## 📊 Gitignore Validation

### Check if File is Ignored
```bash
# Check single file
git check-ignore -v .env

# Check multiple files
git check-ignore -v .env backend/.env uploads/test.pdf
```

### List All Ignored Files
```bash
# Show all ignored files in current directory
git status --ignored

# Show all ignored files recursively
git status --ignored --short
```

### Dry Run Git Add
```bash
# See what would be added (without actually adding)
git add --dry-run .
```

---

## 🎯 Best Practices Checklist

- [ ] `.gitignore` exists in root directory
- [ ] `.gitignore` exists in backend directory
- [ ] All `.env` files are ignored
- [ ] `node_modules/` is ignored
- [ ] Upload directories are ignored
- [ ] Log files are ignored
- [ ] `.env.example` templates are committed
- [ ] No sensitive data in repository history
- [ ] Lock files strategy is consistent (keep one type)
- [ ] Platform-specific files are ignored

---

## 🔄 Updating .gitignore

### When Adding New Secrets
```bash
# Edit .gitignore
echo "new-secret-file.json" >> .gitignore

# If file was already committed, remove it
git rm --cached new-secret-file.json

# Commit changes
git add .gitignore
git commit -m "Add new-secret-file.json to gitignore"
```

### When Adding New Features
```bash
# Example: Adding Redis cache files
echo "dump.rdb" >> backend/.gitignore
echo "*.rdb" >> backend/.gitignore

# Commit the update
git add backend/.gitignore
git commit -m "Ignore Redis dump files"
```

---

## 📚 Additional Resources

- [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
- [GitHub's gitignore templates](https://github.com/github/gitignore)
- [gitignore.io - Generate .gitignore files](https://www.toptal.com/developers/gitignore)

---

## 🆘 Troubleshooting

### Issue: Git Still Tracking Ignored Files
**Cause**: Files were committed before being added to `.gitignore`

**Solution**:
```bash
git rm --cached <file>
git commit -m "Remove tracked file"
```

### Issue: .gitignore Not Working
**Cause**: Cached index needs to be cleared

**Solution**:
```bash
git rm -r --cached .
git add .
git commit -m "Fix gitignore"
```

### Issue: Need to Track Exception in Ignored Directory
**Solution**: Use `!` to negate pattern
```gitignore
uploads/*
!uploads/.gitkeep
!uploads/examples/
```

---

**Need help?** Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide or refer to [ENV_SETUP.md](./ENV_SETUP.md) for environment configuration.
