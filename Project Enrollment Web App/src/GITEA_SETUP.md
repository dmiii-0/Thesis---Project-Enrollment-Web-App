# Gitea Integration Setup Guide

This guide will help you set up Gitea integration for automatic repository creation and management.

## Overview

The system automatically creates Gitea repositories when you create new projects. Each repository is initialized with appropriate starter files based on the project type.

## Prerequisites

- Gitea account at https://gitea.com (or your own Gitea instance)
- API access token with repository permissions

## Step 1: Get Your Gitea API Token

### For gitea.com:

1. Log in to https://gitea.com
2. Click your profile picture (top right) → **Settings**
3. Go to **Applications** tab
4. Under "Generate New Token":
   - **Token Name**: Enter a descriptive name (e.g., "UB Project Management")
   - **Select permissions**: Check "Full repository access" or select:
     - `repo` (Full control of repositories)
     - `write:org` (Write access to organizations - if using org repos)
   - Click **Generate Token**
5. **IMPORTANT**: Copy the token immediately! You won't be able to see it again.

### For Self-Hosted Gitea:

1. Log in to your Gitea instance
2. Follow the same steps as above
3. Make note of your Gitea URL (e.g., `https://git.yourcompany.com`)

## Step 2: Configure Backend

1. Open `backend/.env` file
2. Update the Gitea configuration:

```env
# Gitea Configuration
GITEA_URL=https://gitea.com
GITEA_TOKEN=your_api_token_here
GITEA_OWNER=your_username_or_org
```

### Configuration Details:

- **GITEA_URL**: Your Gitea instance URL
  - For gitea.com: `https://gitea.com`
  - For self-hosted: `https://git.yourcompany.com`
  
- **GITEA_TOKEN**: The API token you just created
  - Example: `8e3b07b99105e50bfff5e05dd410f1439693c07a`
  
- **GITEA_OWNER**: Your username or organization name
  - This is where repositories will be created
  - Example: `dmiii-0` (for user repositories)
  - Example: `ub-projects` (for organization repositories)

## Step 3: Test Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Look for this message in the console:
   ```
   ✅ Gitea API connection successful
   ```

3. If you see an error:
   ```
   ❌ Gitea API connection failed
   ```
   
   Check:
   - Is your token correct?
   - Does the token have repository permissions?
   - Is GITEA_URL correct?
   - Is your internet connection working?

## Step 4: Test Repository Creation

1. Log in to the frontend
2. Go to **Enroll Project**
3. Create a test project:
   - **Name**: Test Project
   - **Description**: Testing Gitea integration
   - **Device Type**: Arduino
4. Click **Create Project**

5. You should see:
   - Success message
   - New repository created in your Gitea account
   - Repository initialized with starter files

6. Verify on Gitea:
   - Go to your Gitea account
   - You should see the new repository
   - It should contain:
     - `src/main.ino` (for Arduino projects)
     - `README.md`
     - Auto-initialized with main branch

## How It Works

### Repository Creation Flow:

1. User creates a project in the frontend
2. Frontend sends request to backend API
3. Backend calls Gitea API to create repository
4. Backend initializes repository with project structure
5. Backend saves project info to MongoDB
6. User can view repository files in the Projects page

### Project Structure Templates:

#### Arduino/ESP32 Projects:
```
repository-name/
├── src/
│   └── main.ino          # Main Arduino code
└── README.md             # Project documentation
```

#### Raspberry Pi Projects:
```
repository-name/
├── main.py               # Main Python code
├── requirements.txt      # Python dependencies
└── README.md             # Project documentation
```

#### Web App Projects:
```
repository-name/
├── Dockerfile            # Docker image config
├── docker-compose.yml    # Docker compose config
└── README.md             # Project documentation
```

## Viewing Repository Files

### In the Application:

1. Go to **Projects** page
2. Click on any project
3. Click **View Details**
4. Navigate to **Files** tab
5. Browse repository contents
6. Click on files to view content

### On Gitea:

1. Go to your Gitea account
2. Navigate to the repository
3. Browse and edit files directly
4. Changes are reflected in the application

## API Endpoints

The system provides these Gitea-related endpoints:

- `GET /api/projects/:id/files` - List repository files
- `GET /api/projects/:id/files/content?filepath=path/to/file` - Get file content
- `POST /api/projects` - Create project + repository

## Troubleshooting

### Error: "Failed to create Gitea repository"

**Possible causes:**
1. Invalid API token
2. Token expired
3. Insufficient permissions
4. Repository name already exists
5. Network issues

**Solutions:**
1. Generate a new API token
2. Check token permissions (need "repo" access)
3. Ensure repository name is unique
4. Check backend logs for detailed error

### Error: "Gitea API connection failed"

**Solutions:**
1. Verify `GITEA_URL` is correct
2. Verify `GITEA_TOKEN` is correct
3. Check internet connection
4. Try accessing Gitea URL in browser
5. Test with curl:
   ```bash
   curl -H "Authorization: token YOUR_TOKEN" https://gitea.com/api/v1/user
   ```

### Repository created but no files

**Cause:** File initialization might have failed

**Solution:**
1. Check backend logs
2. Files are added after repository creation
3. May take a few seconds due to rate limiting
4. Refresh the project page

### Can't view repository files

**Possible causes:**
1. Repository not fully initialized
2. Backend can't connect to Gitea
3. Repository is private and token doesn't have access

**Solutions:**
1. Wait a few seconds and refresh
2. Check backend Gitea connection
3. Ensure repository is public or token has access

## Using Organizations

To create repositories under an organization:

1. Create an organization on Gitea
2. Set `GITEA_OWNER=your-org-name` in backend/.env
3. Ensure your token has organization permissions
4. Repositories will now be created as: `gitea.com/your-org-name/project-name`

## Rate Limiting

Gitea API has rate limits. If you hit them:

1. Reduce concurrent operations
2. Add delays between operations
3. Use a self-hosted Gitea instance for higher limits

## Security Best Practices

⚠️ **Important:**

1. **Never commit `.env` files** - They contain your API token
2. **Use environment variables** - Don't hardcode tokens
3. **Rotate tokens regularly** - Generate new tokens periodically
4. **Limit token scope** - Only grant necessary permissions
5. **Use HTTPS** - Always use secure connections
6. **Monitor usage** - Check Gitea for unauthorized access

## Advanced Configuration

### Custom Repository Settings:

Edit `backend/src/services/gitea.js`:

```javascript
const response = await giteaApi.post('/user/repos', {
  name: cleanName,
  description: description,
  private: false,           // Set to true for private repos
  auto_init: true,          // Initialize with README
  default_branch: 'main',   // Default branch name
  gitignores: 'Node',       // Add .gitignore template
  license: 'MIT',           // Add license
  readme: 'Default',        // README template
});
```

### Custom File Templates:

Edit project structure in `backend/src/services/gitea.js` function `initializeProjectStructure()`.

## Support

For issues:

1. Check backend console logs
2. Verify Gitea account and token
3. Test API token with curl
4. Check main README.md troubleshooting section

## References

- Gitea API Documentation: https://docs.gitea.io/en-us/api-usage/
- Gitea.com: https://gitea.com
- Project README: /README.md
