import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Cpu, 
  Code,
  Upload,
  Terminal,
  RefreshCw,
  Play,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Usb,
    File,
} from 'lucide-react';
import { giteaAPI, serialAPI, dockerAPI } from '../lib/api';
import { toast } from 'sonner';
interface DeploymentPageProps {
  user: any;
  onLogout: () => void;
}

export function DeploymentPage({ user, onLogout }: DeploymentPageProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

    const { id } = useParams();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  
  // Device deployment state
  const [ports, setPorts] = useState<string[]>([]);
  const [selectedPort, setSelectedPort] = useState('');
    const [selectedDeviceType, setSelectedDeviceType] = useState('Arduino');
  const [deviceCode, setDeviceCode] = useState('');
    const [codeFiles, setCodeFiles] = useState<any[]>([]);
  const [selectedCodeFile, setSelectedCodeFile] = useState<string>('');
  const [serialOutput, setSerialOutput] = useState<string[]>([]);
  const [serialConnected, setSerialConnected] = useState(false);
  
  // Docker deployment state
  const [dockerConfig, setDockerConfig] = useState({
    port: '3000',
    environment: 'production',
    replicas: '1',
  });
  
  const serialOutputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadProjectDetails();
      loadComPorts();
    }
  }, [id]);

  useEffect(() => {
    // Auto-scroll serial output
    if (serialOutputRef.current) {
      serialOutputRef.current.scrollTop = serialOutputRef.current.scrollHeight;
    }
  }, [serialOutput]);

    // Load code from repository when project changes
  useEffect(() => {
    if (!project) return;
    (async () => {

// Code from enrolled repository - displayed in read-only container
    // Fetch actual code file from repository
try {
        // Fetch list of files from repository
const contents = await giteaAPI.getRepoContents(project.name);
                        const files = contents;
              console.log('Files received:', files);
                        setCodeFiles(files);
                                  toast.success(`Loaded ${files.length} files from repository`);
    
    // Auto-select the first code file if available
    if (codeFiles.length > 0) {
      setSelectedCodeFile(codeFiles[0].name);
            }
                }
        catch (error) {
        console.error('Error fetching code files:', error);
      }
    })();
  }, [project]);
  const loadProjectDetails = async () => {
    try {
      const repos = await giteaAPI.getRepositories();
      const repo = repos.find((r: any) => r.id === parseInt(id || '0'));
      
      if (!repo) {
        toast.error('Project not found');
        return;
      }

      setProject(repo);
              console.log('User object:', user);
        console.log('Repo object:', repo);

    } catch (error: any) {
      toast.error('Failed to load project details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadComPorts = async () => {
    try {
          const response = await serialAPI.getPorts();
          // Handle both response formats: array directly or {ports: array}
    const portsArray = Array.isArray(response) ? response : (response.ports || []);
    setPorts(portsArray);
        console.log('✅ About to setPorts with:', portsArray);
    console.log('✅ portsArray.length:', portsArray.length);
    console.log('✅ portsArray[0]:', portsArray[0]);
    if (portsArray && portsArray.length > 0) {      setSelectedPort(portsArray[0].path);      }
    } catch (error: any) {
      console.error('Failed to load COM ports:', error);
    }
  };

  const handleDeviceDeployment = async () => {
    if (!selectedPort) {
      toast.error('Please select a COM port');
      return;
    }

    if (!selectedCodeFile) {      toast.error('No code to deploy');
      return;
    }

    setDeploying(true);
    addSerialOutput('🚀 Starting deployment...');
    addSerialOutput(`📡 Selected port: ${selectedPort}`);


        // Fetch the selected file content
    addSerialOutput('⏳ Loading code file...');
    // Fetch file content directly from Gitea
    // Fetch file content directly from Gitea using raw file URL
    // Fetch file content using Gitea API through backend
    const fileContentResponse = await giteaAPI.getRepoContents(project.name, selectedCodeFile);
    const codeContent = atob(fileContentResponse.content); // Gitea returns base64 encoded content    }
    try {
      await serialAPI.deploy(id || '', selectedPort, codeContent, selectedDeviceType);      addSerialOutput('✅ Code compiled successfully');
      addSerialOutput('📤 Uploading to device...');
      
      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addSerialOutput('✅ Upload complete!');
      addSerialOutput('🎉 Device programmed successfully');
      toast.success('Deployment successful!');
    } catch (error: any) {
      addSerialOutput(`❌ Error: ${error.message}`);
      toast.error(error.message || 'Deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const handleDockerDeployment = async () => {
    setDeploying(true);

    try {
      const manifest = await dockerAPI.generateManifest(id || '', dockerConfig);
      toast.success('Docker manifest generated');
      
      await dockerAPI.deploy(id || '', manifest);
      toast.success('Docker container deployed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Docker deployment failed');
    } finally {
      setDeploying(false);
    }
  };

  const toggleSerialMonitor = () => {
    if (serialConnected) {
      setSerialConnected(false);
      addSerialOutput('❌ Serial monitor disconnected');
    } else {
      if (!selectedPort) {
        toast.error('Please select a COM port');
        return;
      }
      setSerialConnected(true);
      addSerialOutput('✅ Serial monitor connected');
      addSerialOutput(`📡 Listening on ${selectedPort}...`);
      
      // Simulate receiving data
      const interval = setInterval(() => {
        if (serialConnected) {
          const mockData = [
            'LED ON',
            'LED OFF',
            'Sensor reading: 23.5°C',
            'Loop iteration: ' + Math.floor(Math.random() * 1000),
          ];
          addSerialOutput(mockData[Math.floor(Math.random() * mockData.length)]);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  };

  const addSerialOutput = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSerialOutput(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearSerialOutput = () => {
    setSerialOutput([]);
  };

  const isDeviceProject = () => {
    const desc = project?.description?.toLowerCase() || '';
    return desc.includes('arduino') || desc.includes('esp32') || desc.includes('raspberry');
  };

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="text-center py-12">
          <h2 className="text-2xl text-gray-900 dark:text-white mb-4">Project Not Found</h2>
          <Link to="/projects">
            <Button>Back to Projects</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/project/${project.id}`} className="text-blue-600 hover:underline">
              {project.name}
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-gray-400">Deploy</span>
          </div>
          <h1 className="text-3xl text-gray-900 dark:text-white">
            Deploy Project
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isDeviceProject() 
              ? 'Deploy your code to microcontroller device'
              : 'Deploy your web application using Docker'}
          </p>
        </div>

        <Card>
          <Tabs defaultValue={isDeviceProject() ? 'device' : 'docker'}>
            <CardHeader>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="device" className="gap-2">
                  <Cpu className="w-4 h-4" />
                  Device Deployment
                </TabsTrigger>
                <TabsTrigger value="docker" className="gap-2">
                  <Code className="w-4 h-4" />
                  Docker Deployment
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              {/* Device Deployment */}
              <TabsContent value="device" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Configuration */}
                  <div className="space-y-6">
                                    {/* Device Type selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Device Type</Label>
                  </div>
                  <Select value={selectedDeviceType} onValueChange={setSelectedDeviceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Arduino">Arduino</SelectItem>
                      <SelectItem value="ESP32">ESP32</SelectItem>
                      <SelectItem value="Raspberry Pi">Raspberry Pi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                    {/* COM Port Selection */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>COM Port</Label>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={loadComPorts}
                          className="gap-2"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Refresh
                        </Button>
                      </div>
                      <Select value={selectedPort} onValueChange={setSelectedPort}>
                        <SelectTrigger>
                          <Usb className="w-4 h-4 mr-2" />
                          <SelectValue placeholder="Select COM port" />
                        </SelectTrigger>
                        <SelectContent>
                          {ports.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No ports detected
                            </SelectItem>
                          ) : (
                            ports.map((port) => (
              <SelectItem key={port.path} value={port.path}>
                {port.path}
              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                                  
                    {/* Code Editor */}
                    <div className="space-y-3">
                                    <Label>Select Code File to Upload</Label>
              <div className="space-y-2">
                {codeFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p>No code files found in repository</p>
                  </div>
                ) : (
                  codeFiles.map((file: any) => (
                    <div
                      key={file.path || file.name}
                      onClick={() => setSelectedCodeFile(file.name)}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedCodeFile === file.name
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <File className="w-5 h-5 text-gray-400" />                        <div>
                          <p className="text-gray-900 dark:text-white">{file.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      {selectedCodeFile === file.name && (
                        <div className="flex items-center gap-2 text-blue-500">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
                    </div>

                    {/* Deploy Button */}
                    <Button
                      className="w-full gap-2"
                      onClick={handleDeviceDeployment}
                      disabled={deploying || !selectedPort}
                    >
                      {deploying ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Deploying...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload to Device
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Right Column - Serial Monitor */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Serial Monitor</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={clearSerialOutput}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={serialConnected ? 'destructive' : 'default'}
                          onClick={toggleSerialMonitor}
                          className="gap-2"
                        >
                          {serialConnected ? (
                            <>
                              <AlertCircle className="w-3 h-3" />
                              Disconnect
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3" />
                              Connect
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <Card className="bg-black">
                      <CardContent className="p-4">
                        <div
                          ref={serialOutputRef}
                          className="font-mono text-sm text-green-400 h-[500px] overflow-y-auto space-y-1"
                        >
                          {serialOutput.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-gray-500">
                              <div className="text-center">
                                <Terminal className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Serial monitor not connected</p>
                                <p className="text-xs mt-2">Click "Connect" to start monitoring</p>
                              </div>
                            </div>
                          ) : (
                            serialOutput.map((line, index) => (
                              <div key={index} className="whitespace-pre-wrap break-all">
                                {line}
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Docker Deployment */}
              <TabsContent value="docker" className="space-y-6">
                <div className="max-w-2xl mx-auto space-y-6">
                    <Card className="bg-gray-50 dark:bg-gray-800">
<CardHeader>
                      <CardTitle className="text-sm">Generated Docker Compose</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs font-mono text-gray-900 dark:text-white overflow-x-auto">
{`version: '3.8'

services:
  ${project.name.toLowerCase().replace(/\s+/g, '-')}:
    build: .
    ports:
      - "${dockerConfig.port}:${dockerConfig.port}"
    environment:
      - NODE_ENV=${dockerConfig.environment}
    deploy:
      replicas: ${dockerConfig.replicas}
    restart: unless-stopped`}
                      </pre>
                    </CardContent>
                  </Card>

                {/* Instructions for running Docker */}
                <Card className="mt-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      How to Run with Docker
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Follow these steps to run your project with Docker:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                      <li>Copy the docker-compose.yml content above</li>
                      <li>Save it as <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">docker-compose.yml</code> in your project directory</li>
                      <li>Open a terminal in your project directory</li>
                      <li>Run: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs font-mono">docker-compose up -d</code></li>
                      <li>Access your application at <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded text-xs">http://localhost:3000</code></li>
                    </ol>
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                        💡 Note: Make sure Docker is installed and running on your machine before executing these commands.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
}