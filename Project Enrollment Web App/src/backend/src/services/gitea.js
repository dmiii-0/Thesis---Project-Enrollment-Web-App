const axios = require('axios');

// Gitea API configuration
const GITEA_BASE_URL = `${process.env.GITEA_URL || 'https://gitea.com'}/api/v1`;
const GITEA_TOKEN = process.env.GITEA_TOKEN;
const GITEA_OWNER = process.env.GITEA_OWNER || 'dmiii-0';

// Create axios instance with default config
const giteaApi = axios.create({
  baseURL: GITEA_BASE_URL,
  headers: {
    'Authorization': `token ${GITEA_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Create a new repository in Gitea
 * @param {string} name - Repository name
 * @param {string} description - Repository description
 * @param {boolean} isPrivate - Whether the repo should be private
 * @returns {Promise<Object>} Created repository data
 */
async function createRepository(name, description, isPrivate = false) {
  try {
    // Clean the repository name (Gitea requirements)
    const cleanName = name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);

    const response = await giteaApi.post('/user/repos', {
      name: cleanName,
      description: description,
      private: isPrivate,
      // auto_init: false,  // Disabled - causes GetOrgByName error in some Gitea versions
      default_branch: 'main',
    });

    return response.data;
  } catch (error) {
    console.error('Error creating Gitea repository:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to create Gitea repository');
  }
}

/**
 * List all repositories for the authenticated user
 * @returns {Promise<Array>} List of repositories
 */
async function listRepositories() {
  try {
    const response = await giteaApi.get('/user/repos', {
      params: {
        page: 1,
        limit: 100, // Adjust as needed
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error listing Gitea repositories:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to list Gitea repositories');
  }
}

/**
 * Get a specific repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository data
 */
async function getRepository(owner, repo) {
  try {
    const response = await giteaApi.get(`/repos/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    console.error('Error getting Gitea repository:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to get Gitea repository');
  }
}

/**
 * Delete a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<void>}
 */
async function deleteRepository(owner, repo) {
  try {
    await giteaApi.delete(`/repos/${owner}/${repo}`);
  } catch (error) {
    console.error('Error deleting Gitea repository:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to delete Gitea repository');
  }
}

/**
 * Create a file in a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filepath - Path to the file
 * @param {string} content - File content (base64 encoded)
 * @param {string} message - Commit message
 * @returns {Promise<Object>} Created file data
 */
async function createFile(owner, repo, filepath, content, message) {
  try {
        // Extract base64 from data URL if it's in that format
    let finalContent = content;
    if (content && content.startsWith('data:')) {
      const base64Index = content.indexOf(',');
      if (base64Index !== -1) {
        finalContent = content.substring(base64Index + 1);
      }
    }
    const response = await giteaApi.post(`/repos/${owner}/${repo}/contents/${filepath}`, {
      content: Buffer.from(finalContent).toString('base64'),
      message: message || `Add ${filepath}`,
    });
    return response.data;
  } catch (error) {
    console.error('Error creating file in Gitea:', error.response?.data || error.message);
// If file already exists, just log warning and continue (don't throw error)
    const errorMsg = error.response?.data?.message || error.message || '';
    if (errorMsg.includes('repository file already exists')) {
      console.warn(`File ${filepath} already exists in ${repo}, skipping...`);
      return { success: true, skipped: true, message: `File ${filepath} already exists` };
    }
    throw new Error(error.response?.data?.message || 'Failed to create file in Gitea');
  }
}

/**
 * Initialize repository with project structure
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} deviceType - Type of device/project
 * @returns {Promise<void>}
 */
async function initializeProjectStructure(owner, repo, deviceType) {
  try {
    // Create appropriate project structure based on device type
    let files = [];

    switch (deviceType) {
      case 'arduino':
      case 'esp32':
        files = [
          {
            path: 'src/main.ino',
            content: `// ${repo} - Main Arduino/ESP32 Code\n\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println("Project initialized!");\n}\n\nvoid loop() {\n  // Your code here\n  delay(1000);\n}\n`,
            message: 'Initialize Arduino/ESP32 project'
          },
          {
            path: 'README.md',
            content: `# ${repo}\n\nArduino/ESP32 Project\n\n## Setup\n1. Upload the code to your device\n2. Open Serial Monitor at 9600 baud\n\n## Hardware Requirements\n- Arduino/ESP32 Board\n- USB Cable\n\n## Usage\nAdd your project usage instructions here.\n`,
            message: 'Add README'
          }
        ];
        break;

      case 'raspberry-pi':
        files = [
          {
            path: 'main.py',
            content: `#!/usr/bin/env python3\n# ${repo} - Main Python Code\n\ndef main():\n    print("Project initialized!")\n    # Your code here\n\nif __name__ == "__main__":\n    main()\n`,
            message: 'Initialize Raspberry Pi project'
          },
          {
            path: 'requirements.txt',
            content: '# Add your Python dependencies here\n',
            message: 'Add requirements.txt'
          },
          {
            path: 'README.md',
            content: `# ${repo}\n\nRaspberry Pi Project\n\n## Setup\n1. Install dependencies: \`pip install -r requirements.txt\`\n2. Run: \`python3 main.py\`\n\n## Hardware Requirements\n- Raspberry Pi\n\n## Usage\nAdd your project usage instructions here.\n`,
            message: 'Add README'
          }
        ];
        break;

      case 'web-app':
        files = [
          {
            path: 'docker-compose.yml',
            content: `version: '3.8'\n\nservices:\n  app:\n    build: .\n    ports:\n      - "8080:8080"\n    environment:\n      - NODE_ENV=production\n`,
            message: 'Add Docker Compose configuration'
          },
          {
            path: 'Dockerfile',
            content: `FROM node:18-alpine\n\nWORKDIR /app\n\nCOPY package*.json ./\nRUN npm install\n\nCOPY . .\n\nEXPOSE 8080\n\nCMD ["npm", "start"]\n`,
            message: 'Add Dockerfile'
          },
          {
            path: 'README.md',
            content: `# ${repo}\n\nWeb Application Project\n\n## Setup\n1. Install dependencies: \`npm install\`\n2. Run locally: \`npm start\`\n\n## Docker Deployment\n\`\`\`bash\ndocker-compose up -d\n\`\`\`\n\n## Usage\nAdd your project usage instructions here.\n`,
            message: 'Add README'
          }
        ];
        break;

      default:
        // Basic project structure
        files = [
          {
            path: 'README.md',
            content: `# ${repo}\n\nProject Description\n\n## Setup\nAdd setup instructions here.\n\n## Usage\nAdd usage instructions here.\n`,
            message: 'Add README'
          }
        ];
    }

    // Create each file
    for (const file of files) {
      await createFile(owner, repo, file.path, file.content, file.message);
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ Initialized project structure for ${owner}/${repo}`);
  } catch (error) {
    console.error('Error initializing project structure:', error.message);
    // Don't throw error - project is already created, structure is optional
  }
}

/**
 * Get repository contents (files and folders)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - Path within the repository (default: root)
 * @returns {Promise<Array>} List of files and folders
 */
async function getRepositoryContents(owner, repo, path = '') {
  try {
    const response = await giteaApi.get(`/repos/${owner}/${repo}/contents/${path}`);
    return response.data;
  } catch (error) {
    console.error('Error getting repository contents:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to get repository contents');
  }
}

/**
 * Get file content from repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} filepath - Path to the file
 * @returns {Promise<Object>} File data including content
 */
async function getFileContent(owner, repo, filepath) {
  try {
    const response = await giteaApi.get(`/repos/${owner}/${repo}/contents/${filepath}`);
    // Decode base64 content
    if (response.data.content) {
      response.data.decodedContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    return response.data;
  } catch (error) {
    console.error('Error getting file content:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Failed to get file content');
  }
}

/**
 * Check if Gitea API is configured and accessible
 * @returns {Promise<boolean>}
 */
async function checkConnection() {
  try {
    if (!GITEA_TOKEN) {
      console.warn('⚠️  Gitea API token not configured');
      return false;
    }

    await giteaApi.get('/user');
    console.log('✅ Gitea API connection successful');
    return true;
  } catch (error) {
    console.error('❌ Gitea API connection failed:', error.response?.data || error.message);
    return false;
  }
}

module.exports = {
  createRepository,
  listRepositories,
  getRepository,
  deleteRepository,
  createFile,
  initializeProjectStructure,
  getRepositoryContents,
  getFileContent,
  checkConnection,
  GITEA_OWNER,
};
