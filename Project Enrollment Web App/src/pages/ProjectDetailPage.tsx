import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  GitBranch, 
  Star, 
  Eye,
  Clock,
  Upload,
  FileText,
  Code,
  Download,
  ExternalLink,
  Rocket,
  File
} from 'lucide-react';
import { giteaAPI, projectAPI } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface ProjectDetailPageProps {
  user: any;
  onLogout: () => void;
}

export function ProjectDetailPage({ user, onLogout }: ProjectDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProjectDetails();
    }
  }, [id]);

  const loadProjectDetails = async () => {
    try {
      const repos = await giteaAPI.getRepositories();
      const repo = repos.find((r: any) => r.id === parseInt(id || '0'));
      
      if (!repo) {
        toast.error('Project not found');
        return;
      }

      setProject(repo);

      // Load repository files
      try {
        const contents = await giteaAPI.getRepoContents(repo.name);
        setFiles(Array.isArray(contents) ? contents : []);
      } catch (error) {
        console.error('Failed to load files:', error);
        setFiles([]);
      }
    } catch (error: any) {
      toast.error('Failed to load project details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    setUploading(true);

    try {
      await projectAPI.uploadDocumentation(id || '', file);
      toast.success('Documentation uploaded successfully');
      loadProjectDetails();
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload documentation');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'md':
      case 'txt':
        return FileText;
      case 'ino':
      case 'py':
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return Code;
      default:
        return File;
    }
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 dark:text-white mb-2">
              {project.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {project.description || 'No description'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(project.html_url, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on Gitea
            </Button>
            <Link to={`/deploy/${project.id}`}>
              <Button>
                <Rocket className="w-4 h-4 mr-2" />
                Deploy
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stars</p>
                <p className="text-xl text-gray-900 dark:text-white">{project.stars_count}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <GitBranch className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Forks</p>
                <p className="text-xl text-gray-900 dark:text-white">{project.forks_count}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Eye className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Watchers</p>
                <p className="text-xl text-gray-900 dark:text-white">{project.watchers_count}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Updated</p>
                <p className="text-xs text-gray-900 dark:text-white">
                  {formatDate(project.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs defaultValue="files">
            <CardHeader>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="files">Files</TabsTrigger>
                <TabsTrigger value="info">Information</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="files" className="space-y-4">
                <div className="space-y-2">
                  {files.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No files found in this repository</p>
                    </div>
                  ) : (
                    files.map((file) => {
                      const FileIcon = getFileIcon(file.name);
                      return (
                        <div
                          key={file.path}
                          className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-gray-900 dark:text-white">{file.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(file.download_url, '_blank')}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })
                  )}
                </div>
              </TabsContent>


              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Repository URL</h3>
                    <a
                      href={project.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {project.html_url}
                    </a>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Clone URL</h3>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm break-all">
                        {project.clone_url}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(project.clone_url);
                          toast.success('Clone URL copied!');
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Default Branch</h3>
                    <p className="text-gray-900 dark:text-white">{project.default_branch}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Created</h3>
                    <p className="text-gray-900 dark:text-white">{formatDate(project.created_at)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last Updated</h3>
                    <p className="text-gray-900 dark:text-white">{formatDate(project.updated_at)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Visibility</h3>
                    <Badge variant={project.private ? 'destructive' : 'secondary'}>
                      {project.private ? 'Private' : 'Public'}
                    </Badge>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </Layout>
  );
}
