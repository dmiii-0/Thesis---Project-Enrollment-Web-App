// Type definitions for the Project Management System

export type DeviceType = 'arduino' | 'esp32' | 'raspberry-pi' | 'web-app';

export type UserRole = 'student' | 'instructor';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  deviceType: DeviceType;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  giteaRepoUrl: string;
  giteaRepoName: string;
  documentationUrl?: string;
  ports?: string[];
  dockerManifest?: string;
  deploymentManifest?: string;
  status: 'active' | 'archived';
}

export interface COMPort {
  path: string;
  manufacturer?: string;
  serialNumber?: string;
  vendorId?: string;
  productId?: string;
}

export interface SerialMonitorMessage {
  timestamp: string;
  message: string;
  type: 'input' | 'output' | 'error';
}
