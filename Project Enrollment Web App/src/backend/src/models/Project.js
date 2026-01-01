const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a project description'],
  },
  deviceType: {
    type: String,
    enum: ['arduino', 'esp32', 'raspberry-pi', 'web-app'],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdByName: {
    type: String,
    required: true,
  },
  giteaRepoUrl: {
    type: String,
    required: true,
  },
  giteaRepoName: {
    type: String,
    required: true,
  },
  documentationUrl: {
    type: String,
  },
  ports: [{
    type: String,
  }],
  dockerManifest: {
    type: String,
  },
  deploymentManifest: {
    type: String,
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Project', projectSchema);
