import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Loader2, Code, Cpu, FileText, CheckCircle } from 'lucide-react';
import { giteaAPI, projectAPI } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface EnrollmentPageProps {
  user: any;
  onLogout: () => void;
}

export function EnrollmentPage({ user, onLogout }: EnrollmentPageProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    projectType: 'device',
    deviceType: 'Arduino',
    visibility: 'public',
    autoInit: true,
  });

    const [codeFiles, setCodeFiles] = useState<File[]>([]);
  const [documentationFile, setDocumentationFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);

    try {
      // Create Gitea repository
      const repoName = formData.projectName.toLowerCase().replace(/\s+/g, '-');
      const description = `${formData.projectType === 'device' ? formData.deviceType.toUpperCase() : 'WEB APP'} - ${formData.description}`;

      const repo = await giteaAPI.createRepository({
        name: repoName,
        description: description,
        private: formData.visibility === 'private',
        auto_init: formData.autoInit,
      });

      // Create initial project files
      if (formData.autoInit) {
        if (formData.projectType === 'device') {
          // Create README
          const readme = generateDeviceReadme(formData);
                try {
            await giteaAPI.createFile(
              repoName,
              'README.md',
              readme,
              'Initial commit: Add README'
            );
                  } catch (readmeErr) {
        // Silently ignore "already exists" errors for README
        if (!readmeErr.message?.includes('already exists')) {
          console.warn('Failed to upload README:', readmeErr.message);
        }
      }
        } else {
          // Create Docker manifest for web app
          const dockerfile = generateDockerfile('WEB APP');
          await giteaAPI.createFile(
            repoName,
            'Dockerfile',
            dockerfile,
            'Initial commit: Add Dockerfile'
          );

          const dockerCompose = generateDockerCompose(formData.projectName);
          await giteaAPI.createFile(
            repoName,
            'docker-compose.yml',
            dockerCompose,
            'Initial commit: Add docker-compose'
          );

          // Create README
          const readme = generateWebReadme(formData);
          await giteaAPI.createFile(
            repoName,
            'README.md',
            readme,
            'Initial commit: Add README'
          );
        }
      }
      

      // Save project metadata to backend
          // Convert File objects to serializable format
    const processedCodeFiles = await Promise.all(
      codeFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve({
              name: file.name,
              content: reader.result
            });
          };
          reader.readAsDataURL(file);
        });
      })
    );

    const processedDocFile = documentationFile ? await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: documentationFile.name,
          content: reader.result
        });
      };
      reader.readAsDataURL(documentationFile);
    }) : null;
      await projectAPI.createProject({
        name: formData.projectName,
        description: formData.description,
        type: formData.projectType,
        deviceType: formData.projectType === 'web' ? 'web-app' : formData.deviceType,
        giteaRepoUrl: repo.html_url,
        repoId: repo.id,
        userId: user.id,
            codeFiles: processedCodeFiles,
    documentationFile: processedDocFile,
      });

      toast.success('Project created successfully!');
          navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceCode = (deviceType: string) => {
    switch (deviceType) {
      case 'Arduino':
        return `// Arduino Starter Code
// University of Batangas Lipa Campus

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Initialize digital pin LED_BUILTIN as an output
  pinMode(LED_BUILTIN, OUTPUT);
  
  Serial.println("Arduino initialized!");
}

void loop() {
  // Turn LED on
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ON");
  delay(1000);
  
  // Turn LED off
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}`;

      case 'ESP32':
        return `// ESP32 Starter Code
// University of Batangas Lipa Campus

#define LED_PIN 2

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Initialize LED pin
  pinMode(LED_PIN, OUTPUT);
  
  Serial.println("ESP32 initialized!");
  Serial.println("Device: " + String(ESP.getChipModel()));
}

void loop() {
  // Blink LED
  digitalWrite(LED_PIN, HIGH);
  Serial.println("LED ON");
  delay(1000);
  
  digitalWrite(LED_PIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}`;

      case 'raspberry-pi':
        return `#!/usr/bin/env python3
# Raspberry Pi Starter Code
# University of Batangas Lipa Campus

import RPi.GPIO as GPIO
import time

# Setup
LED_PIN = 18
GPIO.setmode(GPIO.BCM)
GPIO.setup(LED_PIN, GPIO.OUT)

print("Raspberry Pi initialized!")

try:
    while True:
        # Turn LED on
        GPIO.output(LED_PIN, GPIO.HIGH)
        print("LED ON")
        time.sleep(1)
        
        # Turn LED off
        GPIO.output(LED_PIN, GPIO.LOW)
        print("LED OFF")
        time.sleep(1)

except KeyboardInterrupt:
    print("\\nCleaning up...")
    GPIO.cleanup()
`;

      default:
        return '// Starter code';
    }
  };

  const getDeviceFileName = (deviceType: string) => {
    switch (deviceType) {
      case 'Arduino':
      case 'ESP32':
        return 'main.ino';
      case 'raspberry-pi':
        return 'main.py';
      default:
        return 'main.txt';
    }
  };

  const generateDeviceReadme = (data: any) => {
    return `# ${data.projectName}

${data.description}

## Device Type
${data.deviceType.toUpperCase()}

## Setup Instructions

1. Clone this repository
2. Open the project in Arduino IDE / Platform IO / VS Code
3. Connect your ${data.deviceType} device
4. Select the correct COM port
5. Upload the code to your device

## Project Information

- **University**: University of Batangas Lipa Campus
- **Author**: ${user.name}
- **Created**: ${new Date().toLocaleDateString()}

## Documentation

Upload your project documentation (PDF) using the project management system.
`;
  };

  const generateDockerfile = (framework: string) => {
    switch (framework) {
      case 'react':
        return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=0 /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
`;

      case 'nodejs':
        return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["node", "index.js"]
`;

      case 'python':
        return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["python", "app.py"]
`;

      default:
        return `FROM node:18-alpine
WORKDIR /app
COPY . .
CMD ["npm", "start"]
`;
    }
  };

  const generateDockerCompose = (projectName: string) => {
    return `version: '3.8'

services:
  ${projectName.toLowerCase().replace(/\s+/g, '-')}:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
`;
  };

  const generateWebReadme = (data: any) => {
    return `# ${data.projectName}

${data.description}


## Deployment Instructions

### Using Docker

1. Clone this repository
2. Build the Docker image:
   \`\`\`bash
   docker build -t ${data.projectName.toLowerCase().replace(/\s+/g, '-')} .
   \`\`\`
3. Run the container:
   \`\`\`bash
   docker-compose up -d
   \`\`\`

### Manual Deployment

Refer to the framework-specific deployment guide.

## Project Information

- **University**: University of Batangas Lipa Campus
- **Author**: ${user.name}
- **Created**: ${new Date().toLocaleDateString()}

## Documentation

Upload your project documentation (PDF) using the project management system.
`;
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= s
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 ${
                    step > s ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Project Information'}
              {step === 2 && 'Project Type & Configuration'}
              {step === 3 && 'Review & Create'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter basic information about your project'}
              {step === 2 && 'Select your project type and configuration'}
              {step === 3 && 'Review your project details before creating'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="projectName">Project Name *</Label>
                    <Input
                      id="projectName"
                      placeholder="My Awesome Project"
                      value={formData.projectName}
                      onChange={(e) =>
                        setFormData({ ...formData, projectName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your project..."
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={4}
                      required
                    />
                  </div>
                </>
              )}

              {/* Step 2: Project Type */}
              {step === 2 && (
                <>
                  <div className="space-y-4">
                    <Label>Project Type *</Label>
                    <RadioGroup
                      value={formData.projectType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, projectType: value })
                      }
                    >
                      <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                        <RadioGroupItem value="device" id="device" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Cpu className="w-5 h-5 text-purple-600" />
                            <Label htmlFor="device" className="cursor-pointer">
                              Microcontroller Device
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Arduino, ESP32, Raspberry Pi projects
                          </p>
                        </div>
                      </div>


                      <div className="flex items-start space-x-3 p-4 border rounded-lg cursor-pointer hover:border-blue-500">
                        <RadioGroupItem value="web" id="web" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Code className="w-5 h-5 text-blue-600" />
                            <Label htmlFor="web" className="cursor-pointer">
                              Web Application
                            </Label>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Docker-based web application projects
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.projectType === 'device' && (
                    <div className="space-y-2">
                      <Label htmlFor="deviceType">Device Type *</Label>
                      <Select
                        value={formData.deviceType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, deviceType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arduino">Arduino</SelectItem>
                          <SelectItem value="ESP32">ESP32</SelectItem>
                          <SelectItem value="raspberry-pi">Raspberry Pi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                </>
              )}


            {/* File Uploads Section - Enhanced */}
                    {step === 2 && (
            <div className="space-y-4 pt-6 border-t-2 border-gray-600 mt-6">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="text-blue-400">📁</span> Project Files
              </h3>
              
              {/* Code Files Upload */}
              <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-6 border border-blue-500 border-opacity-50 hover:border-opacity-100 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📄</div>
                  <div className="flex-1">
                    <Label className="block text-sm font-semibold text-blue-100 mb-2">Source Code Files (Required)</Label>
                    <p className="text-xs text-blue-200 mb-4">Upload your project source code (.js, .ts, .py, .zip, etc.)</p>
                    <input
                      type="file"
                      id="codeFiles"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setCodeFiles(files);
                      }}
                      className="block w-full text-sm text-blue-100 bg-blue-700 bg-opacity-50 rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-blue-100 hover:file:bg-blue-500 transition-colors"
                    />
                    {codeFiles.length > 0 && (
                      <div className="mt-4 p-3 bg-blue-800 bg-opacity-50 rounded-md border border-blue-400 border-opacity-50">
                        <p className="text-sm font-medium text-blue-100 mb-2">✓ {codeFiles.length} file(s) selected</p>
                        <ul className="text-xs text-blue-200 space-y-1 max-h-24 overflow-y-auto">
                          {codeFiles.map((file, idx) => (
                            <li key={idx} className="truncate">• {file.name} ({(file.size / 1024).toFixed(2)} KB)</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* PDF Documentation Upload */}
              <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg p-6 border border-green-500 border-opacity-50 hover:border-opacity-100 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">📋</div>
                  <div className="flex-1">
                    <Label className="block text-sm font-semibold text-green-100 mb-2">Documentation (Optional)</Label>
                    <p className="text-xs text-green-200 mb-4">Upload project documentation or README as PDF</p>
                    <input
                      type="file"
                      id="documentationFile"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setDocumentationFile(file);
                      }}
                      className="block w-full text-sm text-green-100 bg-green-700 bg-opacity-50 rounded cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-green-100 hover:file:bg-green-500 transition-colors"
                    />
                    {documentationFile && (
                      <div className="mt-4 p-3 bg-green-800 bg-opacity-50 rounded-md border border-green-400 border-opacity-50">
                        <p className="text-sm font-medium text-green-100">✓ {documentationFile.name} ({(documentationFile.size / 1024).toFixed(2)} KB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
                    )}
              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Project Name</p>
                      <p className="text-gray-900 dark:text-white">{formData.projectName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Description</p>
                      <p className="text-gray-900 dark:text-white">{formData.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Type</p>
                      <p className="text-gray-900 dark:text-white capitalize">
                        {formData.projectType === 'device'
                          ? `Device (${formData.deviceType})`
                          : 'Web App'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white mb-1">
                        Initial Files
                      </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Source and configuration files will be automatically pushed to the repository.
                  </p>                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={loading}
                  >
                    Back
                  </Button>
                )}
                <Button type="submit" className="flex-1" disabled={loading || (step === 2 && codeFiles.length === 0)}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : step < 3 ? (
                    'Continue'
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
