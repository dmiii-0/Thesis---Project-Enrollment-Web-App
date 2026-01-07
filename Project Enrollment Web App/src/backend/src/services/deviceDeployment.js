// const { Client } = require('ssh2');
const { SerialPort } = require('serialport');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * =============================================================
 * SERIAL COMMUNICATION - ARDUINO/ESP32 DEPLOYMENT
 * =============================================================
 */

/**
 * Deploy to Arduino/ESP32 via Serial Communication
 * Uses Arduino CLI for compilation and upload
 */
async function deployToArduinoESP32({ comPort, deviceType, project, codeContent }) {
  const deploymentLog = [];
  
  try {
        console.log('=== DEPLOYMENT STARTED ===');
    console.log('Received parameters:', { comPort, deviceType, projectId: project?._id, codeContentLength: codeContent?.length });
    deploymentLog.push(`🔌 Starting deployment to ${deviceType}`);
    deploymentLog.push(`📍 Target port: ${comPort}`);
    
    
    deploymentLog.push(`✓ COM port ${comPort} found`);
    deploymentLog.push(`  Device info: ${portExists.manufacturer || 'Unknown'} - ${portExists.serialNumber || 'N/A'}`);
    
    // Step 2: Validate code content
    if (!codeContent || codeContent.trim().length === 0) {
      throw new Error('No code content provided');
    }
    deploymentLog.push(`✅ Code content received (${codeContent.length} bytes)`);

    // Step 3: Create temporary directory and write code file
    deploymentLog.push(`📁 Creating temporary workspace...`);
    const os = require('os');
    const tempDir = path.join(os.tmpdir(), `arduino-deploy-${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });
    
    const sketchFile = path.join(tempDir, 'sketch', 'sketch.ino');
    await fs.promises.mkdir(path.dirname(sketchFile), { recursive: true });
    await fs.promises.writeFile(sketchFile, codeContent, 'utf8');
    deploymentLog.push(`✅ Code written to temporary file`);

    // Step 4: Check Arduino CLI installation
    deploymentLog.push(`🔍 Checking Arduino CLI installation...`);
    try {
      await execPromise('arduino-cli version');
      deploymentLog.push(`✅ Arduino CLI is installed`);
            console.log('Arduino CLI check passed');
    } catch (error) {
            console.error('Arduino CLI not found error:', error);
      deploymentLog.push(`❌ Arduino CLI not found!`);
      deploymentLog.push(`📌 Please install Arduino CLI from: https://arduino.github.io/arduino-cli/`);
      deploymentLog.push(`📌 After installation, add it to your system PATH`);
      throw new Error('Arduino CLI is not installed. Please install it and add to PATH.');
    }

    // Step 4: Get board FQBN
    const boardFQBN = getBoardFQBN(deviceType);
    deploymentLog.push(`💻 Board type: ${boardFQBN}`);

    // Step 5: Compile with Arduino CLI
    deploymentLog.push(`🔧 Compiling sketch...`);
    const compileCmd = `arduino-cli compile --fqbn ${boardFQBN} "${path.dirname(sketchFile)}"`;
    const compileResult = await execPromise(compileCmd);
    deploymentLog.push(`✅ Compilation successful`);

    // Step 6: Upload to device
    deploymentLog.push(`⬆️ Uploading to ${comPort}...`);
    const uploadCmd = `arduino-cli upload -p ${comPort} --fqbn ${boardFQBN} "${path.dirname(sketchFile)}"`;
    const uploadResult = await execPromise(uploadCmd);
    deploymentLog.push(`✅ Upload complete!`);

    // Clean up temp directory
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    return {
      success: true,
      log: deploymentLog,
      message: 'Deployment successful!'
    };

  } catch (error) {
    deploymentLog.push(`❌ Error: ${error.message}`);
    throw error;
  }
}

// Helper function to get board FQBN
function getBoardFQBN(deviceType) {
  switch (deviceType.toLowerCase()) {
    case 'arduino':
      return 'arduino:avr:uno';
    case 'esp32':
      return 'esp32:esp32:esp32';
    default:
      return 'arduino:avr:uno';
  }
}

module.exports = { deployToArduinoESP32 };

