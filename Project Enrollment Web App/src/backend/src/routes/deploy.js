const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Project = require('../models/Project');
const { deployToArduinoESP32 } = require('../services/deviceDeployment');

// @route   POST /api/deploy/device
// @desc    Deploy project to microcontroller device
// @access  Private
router.post('/device', protect, async (req, res) => {
  try {
    const { projectId, comPort, deviceType, codeContent } = req.body;

    // Validation
    if (!projectId || !comPort || !deviceType) {
      return res.status(400).json({ 
        message: 'Please provide projectId, comPort, and deviceType' 
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Call the Arduino/ESP32 deployment service
    const deploymentResult = await deployToArduinoESP32({
      comPort,
      deviceType,
      project,
      codeContent
    });
    
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
      } catch (error) {
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
