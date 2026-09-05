import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { FolderKanban, CheckSquare, Clock, AlertCircle } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/users/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {user?.name}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link to="/projects" className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700">
            View Projects
          </Link>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Project Overview</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800">
            <dt>
              <div className="absolute rounded-md bg-blue-500 p-3">
                <FolderKanban className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Projects</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.projects.total || 0}</p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800">
            <dt>
              <div className="absolute rounded-md bg-blue-500 p-3">
                <FolderKanban className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.projects.active || 0}</p>
            </dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800">
            <dt>
              <div className="absolute rounded-md bg-green-500 p-3">
                <CheckSquare className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">Completed Projects</p>
            </dt>
            <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats?.projects.completed || 0}</p>
            </dd>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Task Summary</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800">
            <dt>
              <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">Total Tasks</p>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.tasks.total || 0}</dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800 border-b-4 border-gray-300 dark:border-gray-700">
            <dt>
              <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-4 w-4" /> To Do
              </p>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.tasks.pending || 0}</dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800 border-b-4 border-blue-500">
            <dt>
              <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="h-4 w-4 text-blue-500" /> In Progress
              </p>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.tasks.inProgress || 0}</dd>
          </div>
          <div className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 dark:bg-gray-900 ring-1 ring-gray-900/5 dark:ring-gray-800 border-b-4 border-red-500">
            <dt>
              <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500" /> Overdue
              </p>
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{stats?.tasks.overdue || 0}</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
