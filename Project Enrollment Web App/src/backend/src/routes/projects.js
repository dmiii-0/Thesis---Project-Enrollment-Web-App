const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');
const giteaService = require('../services/gitea');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const projectId = req.params.id;
    const dir = path.join(uploadDir, projectId);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: function (req, file, cb) {
    // Accept PDF files only
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// @route   GET /api/projects
// @desc    Get all projects with optional search (synced with Gitea)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: 'active' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get projects from MongoDB
    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Optionally sync with Gitea repositories
    try {
      const giteaRepos = await giteaService.listRepositories();
      
      // Add Gitea sync status to each project
      const projectsWithSync = projects.map(project => {
        const projectObj = project.toObject();
        const giteaRepo = giteaRepos.find(repo => repo.name === project.giteaRepoName);
        
        if (giteaRepo) {
          projectObj.giteaSynced = true;
          projectObj.giteaStars = giteaRepo.stars_count || 0;
          projectObj.giteaUpdatedAt = giteaRepo.updated_at;
        } else {
          projectObj.giteaSynced = false;
        }
        
        return projectObj;
      });
      
      res.json(projectsWithSync);
    } catch (giteaError) {
      console.warn('Could not sync with Gitea:', giteaError.message);
      // Return projects without Gitea sync data
      res.json(projects);
    }
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching projects',
      error: error.message 
    });
  }
});

// @route   GET /api/projects/:id/main-code
// @desc    Get main code file from repository based on device type
// @access  Private
router.get('/:id/main-code', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get all files from repository root
    const files = await giteaService.getRepositoryContents(
      giteaService.GITEA_OWNER,
      project.giteaRepoName,
      ''
    );

    // Determine main file extension based on device type
    let mainFileExtension;
    switch (project.deviceType?.toUpperCase()) {
      case 'RASPBERRY PI':
        mainFileExtension = '.py';
        break;
      case 'ARDUINO':
      case 'ESP32':
        mainFileExtension = '.ino';
        break;
      default:
        return res.status(400).json({ 
          message: 'Unknown device type',
          deviceType: project.deviceType 
        });
    }

    // Find the main code file
    const mainFile = files.find(file => 
      file.type === 'file' && file.name.endsWith(mainFileExtension)
    );

    if (!mainFile) {
      return res.status(404).json({ 
        message: `No ${mainFileExtension} file found in repository`,
        availableFiles: files.map(f => f.name)
      });
    }

    // Get the file content
    const fileContent = await giteaService.getFileContent(
      giteaService.GITEA_OWNER,
      project.giteaRepoName,
      mainFile.path
    );

    res.json({
      filename: mainFile.name,
      path: mainFile.path,
      content: fileContent.content,
      sha: fileContent.sha
    });
  } catch (error) {
    console.error('Get main code error:', error);
    res.status(500).json({
      message: 'Server error while fetching main code',
      error: error.message
    });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role studentId');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching project',
      error: error.message 
    });
  }
});

// @route   POST /api/projects
// @desc    Create a new project and Gitea repository
// @access  Private
router.post('/', protect, async (req, res) => {
    let project;
  try {
    const { name, description, deviceType, ports, dockerManifest, codeFiles } = req.body;

    // Validation
    if (!name || !description || !deviceType) {
      return res.status(400).json({ 
        message: 'Please provide name, description, and deviceType' 
      });
    }

    // Generate Gitea repository name
    const giteaRepoName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '-').replace(/^-+|-+$/g, '').substring(0, 100);

    // Create Gitea repository
    let giteaRepo;
    let giteaRepoUrl;
    
    try {
      console.log(`Creating Gitea repository: ${giteaRepoName}`);
      giteaRepo = await giteaService.createRepository(
        giteaRepoName,
        description,
        false // public repository
      );
      
      giteaRepoUrl = giteaRepo.html_url;
      
      // Initialize project structure based on device type
      await giteaService.initializeProjectStructure(
        giteaService.GITEA_OWNER,
        giteaRepoName,
        deviceType
      );
      
      console.log(`✅ Gitea repository created: ${giteaRepoUrl}`);
    } catch (giteaError) {
      
      
      console.error('Gitea repository creation failed:', giteaError.message);
    // Check if repository already exists
    if (giteaError.message?.includes('already exists')) {
      try {
        // Fetch the existing repository
                  const existingRepo = await giteaService.getRepository(giteaService.GITEA_OWNER, giteaRepoName);giteaRepoUrl = existingRepo.html_url;giteaService.GconsoleITEA_OWNER.warn(`Repository ${giteaRepoName} already exists, using existing repository`);
                          giteaRepo = existingRepo;  // Assign to giteaRepo for later use
      } catch (fetchErr) {
          console.warn('Could not fetch existing repository:', fetchErr.message);
      }
    } else {
      console.warn('Gitea project initialization failed, but proceeding with project creation:', giteaError.message);
    }

    // Create project in MongoDB
        console.log('DEBUG - giteaRepo:', giteaRepo);
    project= await Project.create({
      name,
      description,
      deviceType,
      createdBy: req.user._id,
      createdByName: req.user.name,
      giteaRepoUrl,
            giteaRepoId: giteaRepo?.id,
      giteaRepoName,
      ports: ports || [],
      dockerManifest: dockerManifest || '',
      status: 'active',
    });
        await project.save();


    if (req.body.codeFiles && req.body.codeFiles.length > 0) {
      for (const file of req.body.codeFiles) {
        try {
          await giteaService.createFile(
            giteaService.GITEA_OWNER, 
            giteaRepoName, 
            file.name, 
            file.content, 
            `Add uploaded file: ${file.name}`
          );
        } catch (fileErr) {
          if (!fileErr.message.includes('already exists')) {
             console.warn(`Failed to upload code file ${file.name}:`, fileErr.message);
          }
        }
      }
    }

    if (req.body.documentationFile) {
      try {
        await giteaService.createFile(
          giteaService.GITEA_OWNER, 
          giteaRepoName, 
          req.body.documentationFile.name, 
          req.body.documentationFile.content, 
          `Add documentation: ${req.body.documentationFile.name}`
        );
      } catch (docError) {
        if (!docError.message.includes('already exists')) {
          console.warn('Failed to upload documentation:', docError.message);
        }
      }
    }
    }
    console.log('All file uploads completed');
    res.status(201).json({ 
      ...project.toObject(), 
      message: 'Project and Gitea repository created successfully' 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error while creating project', error: error.message });
  }
;});
// @route   PUT /api/projects/:id
// @desc    Update a project
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the creator or an instructor
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { name, description, deviceType, ports, dockerManifest, status } = req.body;

    project.name = name || project.name;
    project.description = description || project.description;
    project.deviceType = deviceType || project.deviceType;
    project.ports = ports || project.ports;
    project.dockerManifest = dockerManifest || project.dockerManifest;
    project.status = status || project.status;

    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      message: 'Server error while updating project',
      error: error.message 
    });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (soft delete - set status to archived)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the creator or an instructor
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    project.status = 'archived';
    await project.save();

    res.json({ message: 'Project archived successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      message: 'Server error while deleting project',
      error: error.message 
    });
  }
});

// @route   POST /api/projects/:id/upload-doc
// @desc    Upload documentation PDF for a project
// @access  Private
router.post('/:id/upload-doc', protect, upload.single('documentation'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is the creator or an instructor
    if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'instructor') {
      return res.status(403).json({ message: 'Not authorized to upload documentation for this project' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Store the file path in the project
    const documentationUrl = `/uploads/${req.params.id}/${req.file.filename}`;
    project.documentationUrl = documentationUrl;
    await project.save();

    res.json({ 
      message: 'Documentation uploaded successfully',
      documentationUrl 
    });
  } catch (error) {
    console.error('Upload documentation error:', error);
    res.status(500).json({ 
      message: 'Server error while uploading documentation',
      error: error.message 
    });
  }
});

// @route   GET /api/projects/:id/files
// @desc    Get repository files for a project
// @access  Private
router.get('/:id/files', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { path: repoPath } = req.query;
    
    const files = await giteaService.getRepositoryContents(
      giteaService.GITEA_OWNER,
      project.giteaRepoName,
      repoPath || ''
    );

    res.json(files);
  } catch (error) {
    console.error('Get repository files error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching repository files',
      error: error.message 
    });

  }
});

// @route   GET /api/projects/:id/files/content
// @desc    Get file content from repository
// @access  Private
router.get('/:id/files/content', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { filepath } = req.query;
    
    if (!filepath) {
      return res.status(400).json({ message: 'Filepath is required' });
    }

    const fileContent = await giteaService.getFileContent(
      giteaService.GITEA_OWNER,
      project.giteaRepoName,
      filepath
    );

    res.json(fileContent);
  } catch (error) {
    console.error('Get file content error:', error);
    res.status(500).json({ 
      message: 'Server error while fetching file content',
      error: error.message 
    });
  }
});
// @route   GET /api/projects/:id/file-content/:filename
// @desc    Get file content from repository (alternative route)
// @access  Private
router.get('/:id/file-content/:filename', protect, async (req, res) => {
  try {
        console.log('=== FILE-CONTENT ROUTE CALLED ===');
    console.log('Project ID:', req.params.id);
    console.log('Filename:', req.params.filename);
    // Try to find project by _id (MongoDB ObjectId) or by a numeric identifier
    let project;
    try {
      project = await Project.findById(req.params.id);
    } catch (err) {
      // If findById fails (invalid ObjectId format), try finding by other fields
      project = await Project.findOne({ $or: [{ enrollmentNumber: req.params.id }, { projectNumber: req.params.id }] });
    }    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required' });
    }

    const fileContent = await giteaService.getFileContent(
      giteaService.GITEA_OWNER,
      project.giteaRepoName,
      filename
    );

    res.json({ content: fileContent });
  } catch (error) {
    console.error('Get file content error:', error);
    res.status(500).json({
      message: 'Server error while fetching file content',
      error: error.message
    });
  }
});


module.exports = router;
