import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  FolderGit2, 
  PlusCircle, 
  Code, 
  Cpu, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectAPI, giteaAPI } from '../lib/api';
import { toast } from 'sonner@2.0.3';

interface DashboardPageProps {
  user: any;
  onLogout: () => void;
}

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    deviceProjects: 0,
    webProjects: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [projects, repos] = await Promise.all([
        projectAPI.getProjects({ limit: 5 }),
        giteaAPI.getRepositories()
      ]);

      // Calculate stats
      const deviceProjects = repos.filter((r: any) => 
        r.description?.toLowerCase().includes('arduino') || 
        r.description?.toLowerCase().includes('esp32') || 
        r.description?.toLowerCase().includes('raspberry')
      ).length;

      const webProjects = repos.filter((r: any) => 
        r.description?.toLowerCase().includes('web') || 
        r.description?.toLowerCase().includes('docker')
      ).length;

      setStats({
        totalProjects: repos.length,
        activeProjects: repos.filter((r: any) => !r.archived).length,
        completedProjects: repos.filter((r: any) => r.archived).length,
        deviceProjects,
        webProjects,
      });

      setRecentProjects(repos.slice(0, 5));
    } catch (error: any) {
      toast.error('Failed to load dashboard data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderGit2,
      color: 'from-blue-500 to-blue-600',
      change: '+12%',
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: Clock,
      color: 'from-green-500 to-green-600',
      change: '+8%',
    },
    {
      title: 'Device Projects',
      value: stats.deviceProjects,
      icon: Cpu,
      color: 'from-purple-500 to-purple-600',
      change: '+5%',
    },
    {
      title: 'Web Projects',
      value: stats.webProjects,
      icon: Code,
      color: 'from-orange-500 to-orange-600',
      change: '+15%',
    },
  ];

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl text-gray-900 dark:text-white mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's an overview of your project management dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-green-600 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}
                    </span>
                  </div>
                  <h3 className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {stat.title}
                  </h3>
                  <p className="text-3xl text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/enroll">
                <Button className="w-full gap-2" variant="outline">
                  <PlusCircle className="w-4 h-4" />
                  Enroll New Project
                </Button>
              </Link>
              <Link to="/projects">
                <Button className="w-full gap-2" variant="outline">
                  <FolderGit2 className="w-4 h-4" />
                  View All Projects
                </Button>
              </Link>
                          </div>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest project repositories</CardDescription>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <FolderGit2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No projects yet. Create your first project to get started!</p>
                <Link to="/enroll">
                  <Button className="mt-4 gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Enroll Project
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <FolderGit2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-gray-900 dark:text-white">{project.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        Active
                      </span>
                      <Link to={`/project/${project.id}`}>
                        <Button size="sm" variant="ghost">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
