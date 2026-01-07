# Arduino/ESP32 Deployment Setup Guide

## Overview
This guide explains what needs to be installed on your system for the Project Enrollment Web App to successfully deploy code to Arduino and ESP32 microcontrollers.

---

## Required Software & Drivers

### 1. **Arduino CLI** (REQUIRED)

The web app uses Arduino CLI to compile and upload code to microcontrollers. **You MUST install Arduino CLI** for deployment to work.

#### Windows Installation:

**Option A: Using Installer (Recommended)**
1. Download Arduino CLI from: https://arduino.github.io/arduino-cli/latest/installation/
2. Download the Windows installer (.exe)
3. Run the installer and follow the setup wizard
4. Make sure to check "Add to PATH" during installation

**Option B: Manual Installation**
1. Download Arduino CLI: https://downloads.arduino.cc/arduino-cli/arduino-cli_latest_Windows_64bit.zip
2. Extract the ZIP file
3. Place `arduino-cli.exe` in a folder like `C:\\Program Files\\Arduino CLI\\`
4. Add the folder to your Windows PATH:
   - Search for "Environment Variables" in Windows
   - Click "Environment Variables"
   - Under "System Variables", find "Path" and click "Edit"
   - Click "New" and add the path to your Arduino CLI folder
   - Click "OK" on all dialogs

**Verify Installation:**
Open Command Prompt and run:
```bash
arduino-cli version
```
You should see the version number if installed correctly.

---

### 2. **Prolific USB-to-Serial Driver** (REQUIRED FOR ESP32)

Your professor mentioned this is needed for ESP32 to connect to the web app. Many ESP32 boards use the Prolific PL2303 USB-to-Serial chip.

#### Installation Steps:

1. **Download Prolific Driver:**
   - Official site: http://www.prolific.com.tw/US/ShowProduct.aspx?p_id=225&pcid=41
   - Or search "Prolific PL2303 driver download"

2. **Install the Driver:**
   - Run the installer
   - Restart your computer after installation

3. **Verify Driver Installation:**
   - Connect your ESP32 to your computer via USB
   - Open Device Manager (Right-click Start → Device Manager)
   - Look under "Ports (COM & LPT)"
   - You should see "Prolific USB-to-Serial Comm Port (COMX)" where X is the port number

**Alternative Drivers for ESP32:**
Some ESP32 boards use different USB chips:
- **CH340/CH341**: Download from: http://www.wch-ic.com/downloads/CH341SER_ZIP.html
- **CP2102**: Download from: https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers

*Check your ESP32 board documentation to see which USB chip it uses.*

---

### 3. **Node.js & NPM** (Should already be installed)

The web app backend requires Node.js. You likely already have this if the web app is running.

**Verify:**
```bash
node --version
npm --version
```

---

## How the Web App Deployment Works

Now that you've fixed the code, here's what happens when you deploy:

### Deployment Process:
1. **User uploads code** through the web interface
2. **Backend receives** the code and target device info
3. **Arduino CLI check**: Verifies Arduino CLI is installed
4. **Board core installation**: Automatically installs required cores:
   - Arduino Uno → `arduino:avr`
   - ESP32 → `esp32:esp32` (with board manager URL)
5. **Compilation**: Uses `arduino-cli compile` to compile the code
6. **Upload**: Uses `arduino-cli upload` to deploy to the connected device via COM port

### What the Code Fixes Do:

✅ **Automatic core installation** - No need to manually install board support
✅ **ESP32 board manager setup** - Configures ESP32 URLs automatically  
✅ **Retry logic** - Tries up to 3 times if upload fails
✅ **Better error messages** - Shows detailed errors for debugging
✅ **Verbose output** - Provides detailed logs during upload

---

## Troubleshooting

### Issue: "Arduino CLI not found"
**Solution:**
- Make sure Arduino CLI is installed
- Verify it's in your system PATH
- Restart your terminal/command prompt
- Restart the Node.js backend server

### Issue: "COM port not found" or "Device not detected"
**Solution:**
- Install the correct USB driver (Prolific, CH340, or CP2102)
- Check Device Manager to see if the device appears
- Try a different USB cable (some cables are charge-only)
- Try a different USB port on your computer

### Issue: "Upload failed" or "Access denied"
**Solution:**
- Make sure no other program is using the COM port
- Close Arduino IDE if it's open
- Close any serial monitor applications
- The web app's serial monitor may need to be disconnected before upload

### Issue: "Board core installation failed"
**Solution:**
- Check your internet connection (cores download from online)
- Run manually in Command Prompt:
  ```bash
  arduino-cli core update-index
  arduino-cli core install arduino:avr
  arduino-cli core install esp32:esp32
  ```

---

## Quick Start Checklist

- [ ] Install Arduino CLI and add to PATH
- [ ] Install Prolific driver (or appropriate USB driver for your board)
- [ ] Restart your computer
- [ ] Verify `arduino-cli version` works in Command Prompt
- [ ] Connect your Arduino/ESP32 and check Device Manager for COM port
- [ ] Restart the web app backend server
- [ ] Try deploying code through the web app

---

## Additional Notes

- The web app **does NOT require** the full Arduino IDE to be installed
- Arduino CLI is lightweight and sufficient for deployment
- Board cores will be installed automatically on first deployment
- ESP32 support includes additional configuration for board manager URLs

---

## Support

If you continue to have issues:
1. Check the backend console logs for detailed error messages
2. Check the web app's deployment logs (they now show detailed info)
3. Verify all drivers are installed correctly in Device Manager
4. Ensure Arduino CLI is in your system PATH

**Last Updated:** January 2026