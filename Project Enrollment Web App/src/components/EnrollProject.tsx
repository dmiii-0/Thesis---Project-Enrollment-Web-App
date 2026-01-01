import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, CheckCircle2 } from 'lucide-react';
import { createProject, uploadDocumentation } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import { DeviceType } from '../types';
import { toast } from 'sonner@2.0.3';

interface EnrollProjectProps {
  onSuccess: () => void;
}

export function EnrollProject({ onSuccess }: EnrollProjectProps) {
  const { user } = useAuth();
  const [deviceType, setDeviceType] = useState<DeviceType>('arduino');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [documentation, setDocumentation] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setDocumentation(file);
        setError('');
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create project and Gitea repository
      toast.loading('Creating project and Gitea repository...', { id: 'enroll-project' });
      
      const project = await createProject({
        name: projectName,
        description,
        deviceType,
        createdBy: user!.id,
        createdByName: user!.name,
        giteaRepoUrl: `http://gitea.yourdomain.com/ubprojects/${projectName.toLowerCase().replace(/\s+/g, '-')}`,
        giteaRepoName: projectName.toLowerCase().replace(/\s+/g, '-'),
        status: 'active',
      });

      // Upload documentation if provided
      if (documentation) {
        await uploadDocumentation(project.id, documentation);
      }

      toast.success('Project enrolled successfully!', { id: 'enroll-project' });
      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setProjectName('');
        setDescription('');
        setDocumentation(null);
        setDeviceType('arduino');
        setSuccess(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      toast.error('Failed to enroll project. Please try again.', { id: 'enroll-project' });
      setError('Failed to enroll project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="text-center py-12">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl mb-2 text-white">Project Enrolled Successfully!</h3>
          <p className="text-gray-300 mb-4">
            Your Gitea repository has been created and initialized with default files.
          </p>
          <p className="text-sm text-gray-400">Redirecting to project list...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-2 text-white">Enroll New Project</h2>
        <p className="text-gray-400">Create a new project and initialize its repository</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Project Details</CardTitle>
          <CardDescription className="text-gray-400">
            Fill in the information below to create your project and automatically generate a Gitea repository
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Device Type Selection */}
            <Tabs value={deviceType} onValueChange={(value) => setDeviceType(value as DeviceType)}>
              <Label className="text-white">Project Type</Label>
              <TabsList className="grid w-full grid-cols-4 mt-2">
                <TabsTrigger value="arduino">Arduino</TabsTrigger>
                <TabsTrigger value="esp32">ESP32</TabsTrigger>
                <TabsTrigger value="raspberry-pi">Raspberry Pi</TabsTrigger>
                <TabsTrigger value="web-app">Web App</TabsTrigger>
              </TabsList>

              <TabsContent value="arduino" className="mt-4">
                <Alert>
                  <AlertDescription>
                    Arduino project will include default .ino sketch file and library configurations
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="esp32" className="mt-4">
                <Alert>
                  <AlertDescription>
                    ESP32 project will include PlatformIO configuration and WiFi setup examples
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="raspberry-pi" className="mt-4">
                <Alert>
                  <AlertDescription>
                    Raspberry Pi project will include Python environment setup and GPIO examples
                  </AlertDescription>
                </Alert>
              </TabsContent>

              <TabsContent value="web-app" className="mt-4">
                <Alert>
                  <AlertDescription>
                    Web app project will include Dockerfile, docker-compose.yml, and deployment scripts
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>

            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="projectName" className="text-white">Project Name</Label>
              <Input
                id="projectName"
                placeholder="My Awesome Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <p className="text-xs text-gray-400">
                Repository will be created as: {projectName.toLowerCase().replace(/\s+/g, '-') || 'project-name'}
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your project..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Documentation Upload */}
            <div className="space-y-2">
              <Label htmlFor="documentation" className="text-white">Documentation (PDF)</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors bg-gray-750">
                <input
                  id="documentation"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="documentation" className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">
                    {documentation ? documentation.name : 'Click to upload PDF documentation'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Optional - Max 10MB</p>
                </label>
              </div>
            </div>

            {/* Default Files Info */}
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
              <h4 className="text-sm mb-2 text-white">Default Files to be Created:</h4>
              <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
                <li>README.md - Project overview and setup instructions</li>
                {deviceType === 'web-app' ? (
                  <>
                    <li>Dockerfile - Container configuration</li>
                    <li>docker-compose.yml - Service orchestration</li>
                    <li>.gitignore - Git exclusions</li>
                  </>
                ) : (
                  <>
                    <li>.gitignore - Git exclusions</li>
                    <li>LICENSE - Open source license</li>
                    {deviceType === 'arduino' && <li>sketch.ino - Main Arduino sketch</li>}
                    {deviceType === 'esp32' && <li>platformio.ini - PlatformIO configuration</li>}
                    {deviceType === 'raspberry-pi' && <li>main.py - Main Python script</li>}
                  </>
                )}
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Enrolling Project...' : 'Enroll Project'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
