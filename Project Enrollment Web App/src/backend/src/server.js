const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const WebSocket = require('ws');
const http = require('http');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize WebSocket server for Serial Monitor
const wss = new WebSocket.Server({ server, path: '/serial' });

wss.on('connection', (ws) => {
  console.log('🔌 Serial Monitor WebSocket connected');

  ws.on('message', (message) => {
    console.log('📨 Received from client:', message.toString());
    // TODO: Forward this to actual serial port
    // For now, just echo back
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('🔌 Serial Monitor WebSocket disconnected');
  });

  // Send mock serial data periodically (for testing)
  const interval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      const mockData = `[${new Date().toISOString()}] Device status: OK - Temp: ${(20 + Math.random() * 10).toFixed(2)}°C\n`;
      ws.send(mockData);
    }
  }, 2000);

  ws.on('close', () => {
    clearInterval(interval);
  });
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb', parameterLimit: 10000 }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/com-ports', require('./routes/comports'));
app.use('/api/deploy', require('./routes/deploy'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'UB Project Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongodb: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'University of Batangas Project Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        verify: 'GET /api/auth/verify',
        profile: 'GET /api/auth/me'
      },
      projects: {
        list: 'GET /api/projects',
        get: 'GET /api/projects/:id',
        create: 'POST /api/projects',
        update: 'PUT /api/projects/:id',
        delete: 'DELETE /api/projects/:id',
        uploadDoc: 'POST /api/projects/:id/upload-doc'
      },
      devices: {
        scanPorts: 'GET /api/com-ports',
        deployDevice: 'POST /api/deploy/device',
        deployWebApp: 'POST /api/deploy/webapp'
      },
      serial: 'WS /serial'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, async () => {
  console.log('');
  console.log('='.repeat(60));
  console.log('🚀 UB Project Management Backend Server');
  console.log('='.repeat(60));
  console.log(`📡 Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`🌐 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${PORT}/serial`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  
  // Check Gitea connection
  const giteaService = require('./services/gitea');
  await giteaService.checkConnection();
  
  console.log('='.repeat(60));
  console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});
