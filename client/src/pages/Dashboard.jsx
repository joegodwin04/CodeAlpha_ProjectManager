import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { FolderKanban, CheckSquare, AlertTriangle, ArrowRight, Plus } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import ProgressBar from '../components/ui/ProgressBar';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className="rounded-xl bg-white border border-slate-200 p-5 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-4">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${bgColor}`}>
        <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900 tabular-nums">{value}</p>
      </div>
    </div>
  </div>
);

// Colors for charts
const COLORS = {
  Planning: '#94a3b8', // slate-400
  Active: '#3b82f6',   // blue-500
  'On Hold': '#f59e0b',// amber-500
  Completed: '#10b981',// emerald-500
  Todo: '#94a3b8',     // slate-400
  'In Progress': '#3b82f6',// blue-500
  Done: '#10b981'      // emerald-500
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, projectsRes, tasksRes] = await Promise.all([
          api.get('/users/dashboard'),
          api.get('/projects'),
          api.get('/tasks'),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data);
        setTasks(tasksRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  // Recent projects
  const recentProjects = [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  // Overdue tasks count
  const activeTasks = tasks.filter(t => t.status !== 'Done');
  const overdueTasksCount = activeTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length;

  // --- CHART DATA PREPARATION ---

  // 1. Task Status Distribution
  const taskStatusData = [
    { name: 'Todo', value: tasks.filter(t => t.status === 'Todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'Done').length }
  ].filter(d => d.value > 0);

  // 2. Project Status Distribution
  const projectStatusData = [
    { name: 'Planning', value: projects.filter(p => p.status === 'Planning').length },
    { name: 'Active', value: projects.filter(p => p.status === 'Active').length },
    { name: 'On Hold', value: projects.filter(p => p.status === 'On Hold').length },
    { name: 'Completed', value: projects.filter(p => p.status === 'Completed').length }
  ].filter(d => d.value > 0);

  // 3. Project Progress Overview (Top 5 active projects by progress)
  const projectProgressData = projects
    .filter(p => p.status !== 'Completed')
    .map(p => ({
      name: p.title.length > 15 ? p.title.substring(0, 15) + '...' : p.title,
      progress: p.progress || 0
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening across your projects.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={FolderKanban} label="Total Projects" value={stats?.projects?.total || 0} color="text-indigo-600" bgColor="bg-indigo-50" />
        <StatCard icon={FolderKanban} label="Active Projects" value={stats?.projects?.active || 0} color="text-blue-600" bgColor="bg-blue-50" />
        <StatCard icon={CheckSquare} label="Completed Projects" value={stats?.projects?.completed || 0} color="text-emerald-600" bgColor="bg-emerald-50" />
        <StatCard icon={AlertTriangle} label="Overdue Tasks" value={overdueTasksCount} color="text-red-600" bgColor="bg-red-50" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Task Status Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col min-h-[300px]">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Task Status Overview</h2>
          {taskStatusData.length > 0 ? (
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
              No tasks available.
            </div>
          )}
        </div>

        {/* Project Status Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col min-h-[300px]">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Project Status Overview</h2>
          {projectStatusData.length > 0 ? (
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
              No projects available.
            </div>
          )}
        </div>
      </div>

      {/* Progress Chart & Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Project Progress Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col min-h-[300px]">
          <h2 className="text-sm font-semibold text-slate-900 mb-6">Active Projects Progress</h2>
          {projectProgressData.length > 0 ? (
            <div className="flex-1 min-h-0 relative -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectProgressData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`${value}%`, 'Progress']}
                  />
                  <Bar dataKey="progress" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
              No active projects to display.
            </div>
          )}
        </div>

        {/* Recent Projects List */}
        <div className="rounded-xl border border-slate-200 bg-white flex flex-col h-full">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 shrink-0">
            <h2 className="text-sm font-semibold text-slate-900">Recent Projects</h2>
            <Link to="/projects" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="flex-1 flex items-center justify-center px-5 py-10 text-center text-sm text-slate-500">
              No projects yet. Create your first one!
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 flex-1 overflow-auto">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <Link to={`/projects/${project.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{project.title}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={project.status} />
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <ProgressBar value={project.progress} size="sm" showLabel={true} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
