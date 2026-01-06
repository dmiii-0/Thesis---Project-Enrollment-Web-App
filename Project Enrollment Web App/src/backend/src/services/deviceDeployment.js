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
async function deployToArduinoESP32({ comPort, deviceType, project }) {
  const deploymentLog = [];
  
  try {
    deploymentLog.push(`🔌 Starting deployment to ${deviceType}`);
    deploymentLog.push(`📍 Target port: ${comPort}`);
    
    // Step 1: Verify COM port exists
    deploymentLog.push('\n📡 Checking COM port availability...');
    const ports = await SerialPort.list();
    const portExists = ports.find(p => p.path === comPort);
    
    if (!portExists) {
      const availablePorts = ports.map(p => p.path).join(', ');
      throw new Error(
        `COM port ${comPort} not found.\nAvailable ports: ${availablePorts || 'None'}`
      );
    }
    
    deploymentLog.push(`✓ COM port ${comPort} found`);
    deploymentLog.push(`  Device info: ${portExists.manufacturer || 'Unknown'} - ${portExists.serialNumber || 'N/A'}`);
    
    // Step 2: Locate project files
    deploymentLog.push('\n📁 Locating project files...');
    const localProjectPath = path.join(__dirname, '../../uploads/', project._id.toString());
    
    try {
      await fs.access(localProjectPath);
    } catch (error) {
      throw new Error(
        `Project files not found at: ${localProjectPath}\n` +
        'Please ensure project files are uploaded correctly.'
      );
    }
    
    deploymentLog.push(`✓ Project directory: ${localProjectPath}`);
    
    // Step 3: Find the main .ino sketch file
    const files = await fs.readdir(localProjectPath);
    const inoFile = files.find(f => f.endsWith('.ino'));
    
    if (!inoFile) {
      throw new Error(
        'No Arduino sketch (.ino file) found in project.\n' +
        `Files found: ${files.join(', ')}`
      );
    }
    
    deploymentLog.push(`✓ Found sketch: ${inoFile}`);
    
    // Step 4: Determine board FQBN (Fully Qualified Board Name)
    const boardFQBN = getBoardFQBN(deviceType);
    deploymentLog.push(`🎯 Board type: ${boardFQBN}`);
    
    // Step 5: Check Arduino CLI installation
    deploymentLog.push('\n🔧 Verifying Arduino CLI...');
    try {
      const { stdout } = await execPromise('arduino-cli version');
      deploymentLog.push(`✓ Arduino CLI: ${stdout.trim()}`);
    } catch (error) {
      throw new Error(
        'Arduino CLI not installed or not in PATH.\n' +
        'Please install: https://arduino.github.io/arduino-cli/'
      );
    }
    
    // Step 6: Update core index if needed (for ESP32)
    if (deviceType === 'ESP32') {
      deploymentLog.push('\n📥 Updating ESP32 board support...');
      try {
        await execPromise('arduino-cli core update-index');
        await execPromise('arduino-cli core install esp32:esp32');
        deploymentLog.push('✓ ESP32 core ready');
      } catch (error) {
        deploymentLog.push('⚠️  Core update failed (may already be installed)');
      }
    }
    
    // Step 7: Compile the sketch
    deploymentLog.push('\n🔨 Compiling sketch...');
    const compileCmd = `arduino-cli compile --fqbn ${boardFQBN} "${localProjectPath}"`;
    deploymentLog.push(`Command: ${compileCmd}`);
    
    try {
      const { stdout, stderr } = await execPromise(compileCmd);
      deploymentLog.push('✓ Compilation successful');
      
      // Parse compilation output for size info
      const sizeMatch = stdout.match(/Sketch uses (\d+) bytes/);
      if (sizeMatch) {
        deploymentLog.push(`  Program size: ${sizeMatch[1]} bytes`);
      }
    } catch (error) {
      deploymentLog.push('❌ Compilation failed!');
      deploymentLog.push(`Error: ${error.message}`);
      if (error.stderr) {
        deploymentLog.push(`Details: ${error.stderr.substring(0, 500)}`);
      }
      throw new Error('Compilation failed. Check the code for errors.');
    }
    
    // Step 8: Upload to device
    deploymentLog.push('\n📤 Uploading to device...');
    const uploadCmd = `arduino-cli upload -p ${comPort} --fqbn ${boardFQBN} "${localProjectPath}"`;
    deploymentLog.push(`Command: ${uploadCmd}`);
    
    try {
      const { stdout, stderr } = await execPromise(uploadCmd, {
        timeout: 60000 // 60 second timeout
      });
      deploymentLog.push('✓ Upload successful');
      if (stdout) {
        deploymentLog.push(`Upload details: ${stdout.substring(0, 300)}`);
      }
    } catch (error) {
      deploymentLog.push('❌ Upload failed!');
      deploymentLog.push(`Error: ${error.message}`);
      
      // Provide helpful error messages
      if (error.message.includes('timeout')) {
        deploymentLog.push('⚠️  Upload timeout - device may not be responding');
      }
      if (error.message.includes('permission denied')) {
        deploymentLog.push('⚠️  Permission denied - try running as administrator');
      }
      
      throw new Error('Upload failed. Check device connection and drivers.');
    }
    
    // Step 9: Open serial monitor (optional - for debugging)
    deploymentLog.push('\n📊 Deployment complete!');
    deploymentLog.push(`You can monitor serial output on ${comPort} at 9600 baud`);
    deploymentLog.push('✅ Successfully deployed to device');
    
    return {
      success: true,
      message: `Successfully deployed to ${deviceType} on ${comPort}`,
      logs: deploymentLog,
      details: {
        device: deviceType,
        port: comPort,
        sketch: inoFile
      }
    };
    
  } catch (error) {
    deploymentLog.push(`\n❌ Deployment failed: ${error.message}`);
    return {
      success: false,
      message: error.message,
      logs: deploymentLog,
      error: error.toString()
    };
  }
}

/**
 * Get board FQBN based on device type
 */
function getBoardFQBN(deviceType) {
  const boardMap = {
    'Arduino': 'arduino:avr:uno',
    'ESP32': 'esp32:esp32:esp32doit-devkit-v1'
  };
  return boardMap[deviceType] || 'arduino:avr:uno';
}

/**
 * Open Serial Monitor (for debugging)
 */
async function openSerialMonitor(comPort, baudRate = 9600) {
  return new Promise((resolve, reject) => {
    const port = new SerialPort({
      path: comPort,
      baudRate: baudRate
    });
    
    const output = [];
    const timeout = setTimeout(() => {
      port.close();
      resolve(output.join('\n'));
    }, 5000); // Monitor for 5 seconds
    
    port.on('data', (data) => {
      output.push(data.toString());
    });
    
    port.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

module.exports = {
  deployToArduinoESP32,
  openSerialMonitor,
  getBoardFQBN
};
