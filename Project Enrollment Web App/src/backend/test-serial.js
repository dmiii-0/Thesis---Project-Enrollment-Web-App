// Test script to check SerialPort detection - JSON output version
const { SerialPort } = require('serialport');

SerialPort.list().then(ports => {
  // Output as JSON for easy parsing by the web server
  console.log(JSON.stringify(ports));
}).catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});