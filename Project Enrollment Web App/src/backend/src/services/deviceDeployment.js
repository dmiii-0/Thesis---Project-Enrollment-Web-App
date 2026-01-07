// const { Client } = require('ssh2');
const { SerialPort } = require('serialport');
const fs = require('fs');const fsSync = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Wrapper for execPromise that ensures shell is used (important for Windows PATH)
const execWithShell = async (command, options = {}) => {
  return execPromise(command, { shell: true, ...options });
};

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
//     deploymentLog.push(`  Device info: ${portExists.manufacturer || 'Unknown'} - ${portExists.serialNumber || 'N/A'}`);
    //     
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
        // Decode Base64 if needed
    const decodedContent = Buffer.from(codeContent, 'base64').toString('utf8');
    await fs.promises.writeFile(sketchFile, decodedContent, 'utf8');    deploymentLog.push(`✅ Code written to temporary file`);

    // Step 4: Check Arduino CLI installation
    deploymentLog.push(`🔍 Checking Arduino CLI installation...`);
    try {
      await execWithShell('arduino-cli version');
      deploymentLog.push(`✅ Arduino CLI is installed`);
            console.log('Arduino CLI check passed');
    } catch (error) {
            console.error('Arduino CLI not found error:', error);
      deploymentLog.push(`❌ Arduino CLI not found!`);
      deploymentLog.push(`📌 Please install Arduino CLI from: https://arduino.github.io/arduino-cli/`);
      deploymentLog.push(`📌 After installation, add it to your system PATH`);
      throw new Error('Arduino CLI is not installed. Please install it and add to PATH.');
    }

        // Step 4: Install required board core    deploymentLog.push('🔧 Installing board core...');
    const corePackage = getCorePackage(deviceType);
    try {
            // For ESP32, configure board manager URL
      if (deviceType.toLowerCase() === 'esp32') {
        deploymentLog.push('🔧 Configuring ESP32 board manager URL...');
        await execWithShell('arduino-cli config init --overwrite || echo "Config exists"');
        await execWithShell('arduino-cli config add board_manager.additional_urls https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json');
      }
      // Update core index first
      deploymentLog.push('📦 Updating core index...');
      await execWithShell('arduino-cli core update-index');
      deploymentLog.push('✅ Core index updated');
      
      // Install the board core
      deploymentLog.push(`📦 Installing ${corePackage}...`);
      await execWithShell(`arduino-cli core install ${corePackage}`);
      deploymentLog.push('✅ Board core installed successfully');
    } catch (error) {
      console.log(`Board core installation info: ${error.message}`);
      deploymentLog.push('ℹ️ Board core may already be installed, continuing...');
    }

    // Step 5: Get board FQBN
    const boardFQBN = getBoardFQBN(deviceType);
    deploymentLog.push(`💻 Board type: ${boardFQBN}`);

    // Step 5: Compile with Arduino CLI
    deploymentLog.push(`🔧 Compiling sketch...`);
    const compileCmd = `arduino-cli compile --fqbn ${boardFQBN} "${path.dirname(sketchFile)}"`;
    const compileResult = await execWithShell(compileCmd);
    deploymentLog.push(`✅ Compilation successful`);

        // Step 6: Upload to device
    deploymentLog.push(`📤 Uploading to ${comPort}...`);
    
    // Wait a moment for any file operations to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try upload with retry logic
    let uploadSuccess = false;
    let lastError = null;
    
    for (let attempt = 1; attempt <= 3 && !uploadSuccess; attempt++) {
      try {
        if (attempt > 1) {
          deploymentLog.push(`🔄 Retry attempt ${attempt}/3...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between retries
        }
        
        // Use verbose flag and specify the sketch path correctly
                const uploadCmd = `arduino-cli upload -p ${comPort} --fqbn ${boardFQBN} -v "${path.dirname(sketchFile)}"`;
        console.log(`Upload command (attempt ${attempt}):`, uploadCmd);
        
        const uploadResult = await execWithShell(uploadCmd, { timeout: 60000 }); // 60 second timeout
        deploymentLog.push('✅ Upload complete!');
        uploadSuccess = true;
      } catch (error) {
        lastError = error;
        console.error(`Upload attempt ${attempt} failed:`, error.message);
        if (attempt < 3) {
          deploymentLog.push(`⚠️ Attempt ${attempt} failed, retrying...`);
        }
      }
    }
    
    if (!uploadSuccess) {
      throw lastError; // Throw the last error if all attempts failed
    }
    // Clean up temp directory
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    return {
      success: true,
      log: deploymentLog,
      message: 'Deployment successful!'
    };

  } catch (error) {
    deploymentLog.push(`❌ Upload Error: ${error.message}`);
    if (error.stderr) {
      deploymentLog.push(`📝 Details: ${error.stderr}`);
      console.error('Upload stderr:', error.stderr);
    }
    if (error.stdout) {
      console.log('Upload stdout:', error.stdout);
    }
    deploymentLog.push('⚠️ Tip: Make sure the device is connected and no other program is using the port');
    throw error;  }
}


// Helper function to get core package name
function getCorePackage(deviceType) {
  switch (deviceType.toLowerCase()) {
    case 'arduino':
      return 'arduino:avr';
    case 'esp32':
      return 'esp32:esp32';
    case 'raspberry':
      // Raspberry Pi doesn't use Arduino CLI
      return null;
    default:
      return 'arduino:avr'; // Default to Arduino
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

