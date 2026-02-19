// API Configuration
const API_BASE_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Authentication APIs
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },

  register: async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('Registration failed');
    return response.json();
  },
};

// Gitea APIs - All calls proxied through backend to prevent CORS
export const giteaAPI = {
  createRepository: async (repoData: any) => {
    const response = await fetch(`${API_BASE_URL}/projects/gitea/repos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        name: repoData.name,
        description: repoData.description,
        isPrivate: repoData.private || false,
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create repository');
    }
    return response.json();
  },

  getRepositories: async () => {
    const response = await fetch(`${API_BASE_URL}/projects/gitea/repos`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch repositories');
    return response.json();
  },

  getRepository: async (repoName: string) => {
    const response = await fetch(`${API_BASE_URL}/projects/gitea/repos/${repoName}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch repository');
    return response.json();
  },

  getRepoContents: async (repoName: string, path: string = '') => {
    const url = path
      ? `${API_BASE_URL}/projects/gitea/repos/${repoName}/contents/${path}`
      : `${API_BASE_URL}/projects/gitea/repos/${repoName}/contents`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch repository contents');
    return response.json();
  },

  createFile: async (repoName: string, filePath: string, content: string, message: string) => {
    const response = await fetch(`${API_BASE_URL}/projects/gitea/repos/${repoName}/contents/${filePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
            body: JSON.stringify({ content: content, message }),
    });
    if (!response.ok) {
      const error = await response.json();
      if (error.message?.includes('already exists') || response.status === 409) {
        console.warn(`File ${filePath} already exists in ${repoName}, skipping...`);
        return { success: true, skipped: true, message: `File ${filePath} already exists` };
      }
      throw new Error(error.message || 'Failed to create file');
    }
    return response.json();
  },
};

// Project APIs
export const projectAPI = {
  createProject: async (projectData: any) => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(projectData),
    });
const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Failed to create project');
  }
  return data;
  },

  getProjects: async (filters?: any) => {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE_URL}/projects?${queryParams}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },

  getProject: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },

  updateProject: async (id: string, data: any) => {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },

  uploadDocumentation: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('documentation', file);
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/projects/${id}/documentation`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload documentation');
    return response.json();
  },

};

// Serial Port APIs (for COM port scanning and serial monitor)
export const serialAPI = {
  getPorts: async () => {
    const response = await fetch(`${API_BASE_URL}/com-ports`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch COM ports');
    return response.json();
  },

  deploy: async (projectId: string, port: string, code: string, deviceType: string) => {          const response = await fetch(`${API_BASE_URL}/deploy/device`, {
      headers: getAuthHeaders(),
          method: 'POST',
      body: JSON.stringify({ projectId, comPort: port, deviceType: deviceType, codeContent: code }),    });
    if (!response.ok) throw new Error('Failed to deploy to device');
    return response.json();
  },
};

// Raspberry Pi SSH Deployment API
export const raspberryPiAPI = {
  deploy: async (projectId: string, ipAddress: string, code: string) => {
    const response = await fetch(`${API_BASE_URL}/deploy/raspberry-pi`, {
      headers: getAuthHeaders(),
      method: 'POST',
      body: JSON.stringify({ 
        projectId, 
        ipAddress, 
        codeContent: code 
      }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to deploy to Raspberry Pi');
    }
    return response.json();
  },
};

// Docker APIs
export const dockerAPI = {
  generateManifest: async (projectId: string, config: any) => {
    const response = await fetch(`${API_BASE_URL}/docker/manifest`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ projectId, config }),
    });
    if (!response.ok) throw new Error('Failed to generate Docker manifest');
    return response.json();
  },

  deploy: async (projectId: string, manifest: any) => {
    const response = await fetch(`${API_BASE_URL}/docker/deploy`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ projectId, manifest }),
    });
    if (!response.ok) throw new Error('Failed to deploy Docker container');
    return response.json();
  },
};