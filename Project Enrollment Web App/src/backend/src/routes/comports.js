const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route   GET /api/com-ports
// @desc    Scan and list available COM ports
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // NOTE: This is a mock implementation
    // In production, you would use the 'serialport' library:
    const { SerialPort } = require('serialport');
 const ports = await SerialPort.list();
    
    
    res.json(ports);
  } catch (error) {
    console.error('Scan COM ports error:', error);
    res.status(500).json({ 
      message: 'Server error while scanning COM ports',
      error: error.message 
    });
  }
});

module.exports = router;
