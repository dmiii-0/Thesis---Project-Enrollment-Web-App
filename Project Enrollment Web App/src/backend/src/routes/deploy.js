const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { deployToArduinoESP32 } = require('../services/deviceDeployment');
const Project = require('../models/Project');
const giteaService = require('../services/gitea');

// @route   POST /api/deploy/device
// @desc    Deploy project to microcontroller device
// @access  Private
router.post('/device', async (req, res) => {
  try {
    const { projectId, comPort, deviceType, codeContent } = req.body;
        console.log('=== DEVICE DEPLOYMENT DEBUG ===');
            console.log('Request body:', { projectId, comPort, deviceType, codeContentLength: codeContent?.length });

    // Validation
    if (!projectId || !comPort || !deviceType || !codeContent) {
      return res.status(400).json({ 
        message: 'Please provide projectId, comPort, deviceType, and codeContent'      });
    }
        console.log('Validation passed');

    // Fetch Gitea repo by ID and find MongoDB project by repo name
        let giteaRepo;
    try {
            giteaRepo = await giteaService.getRepository('dmiii-0', projectId);
                } catch (err) {
                        console.error('Gitea fetch failed:', err.message);
                            }
    let project = await Project.findOne({ giteaRepoId: projectId });
        // Fallback: If not found by giteaRepoId, try finding by giteaRepoName
    if (!project) {
      const allProjects = await Project.find({});
      console.log('All projects:', allProjects.map(p => ({ name: p.name, giteaRepoName: p.giteaRepoName })));
      // For now, use the first project as fallback for testing
      const fallbackProject = allProjects[0];
      if (fallbackProject) {
        console.log('Using fallback project:', fallbackProject.name);
        project = fallbackProject;      }
    }
    
        console.log('Project found:', project ? project.name : 'NOT FOUND');
            console.log('After project found, checking if project exists:', !!project, project?.name);
    console.log('BEFORE if (!project) check. Project value:', project, 'Is falsy?:', !project);        
            if (!project) {
              
                    return res.status(404).json({
                              success: false,
                                      message: 'Project not found. Please check the project ID.'
                                            });
                                                // Call the Arduino/ESP32 deployment service
        console.log('Calling deployToArduinoESP32...');
            console.log('About to call deployToArduinoESP32 with:', { comPort, deviceType, projectName: project?.name, codeContentLength: codeContent?.length });
    const deploymentResult = await deployToArduinoESP32({
      comPort,
      deviceType,
      project,
      codeContent
    });
    
        console.log('deployToArduinoESP32 returned:', deploymentResult);
    // Return the deployment result with logs
    if (deploymentResult.success) {
      res.json({
        success: true,
        message: deploymentResult.message,
        logs: deploymentResult.logs,
        details: deploymentResult.details,
        projectId,
        comPort,
        deviceType
      });
    } else {
      res.status(500).json({
        success: false,
        message: deploymentResult.message,
        logs: deploymentResult.logs,
        error: deploymentResult.error
      });
    }
    
          }
  }
catch (error) {
    console.error('Device deployment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during device deployment',
      error: error.message 
    });
  }
});

// @route   POST /api/deploy/webapp
// @desc    Deploy web application using Docker
// @access  Private
router.post('/webapp', protect, async (req, res) => {
  try {
    const { projectId } = req.body;

    // Validation
    if (!projectId) {
      return res.status(400).json({ 
        message: 'Please provide projectId' 
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.deviceType !== 'web-app') {
      return res.status(400).json({ 
        message: 'This project is not a web application' 
      });
    }

    // TODO: Implement actual Docker deployment logic
    // This would involve:
    // 1. Fetching project from Gitea repository
    // 2. Building Docker image from Dockerfile
    // 3. Running docker-compose up
    // 4. Returning deployment URL
    
    // Mock successful deployment
    console.log(`Deploying web app ${projectId}`);
    
    // Simulate deployment delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockPort = 8080 + Math.floor(Math.random() * 100);
    const deploymentUrl = `http://localhost:${mockPort}`;

    res.json({
      success: true,
      message: `Successfully deployed web application "${project.name}"`,
      url: deploymentUrl,
      projectId
    });
  } catch (error) {
    console.error('Web app deployment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during web app deployment',
      error: error.message 
    });
  }
});

module.exports = router;
