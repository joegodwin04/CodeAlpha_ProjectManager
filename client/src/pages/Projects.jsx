import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Plus, Search, Calendar, FolderKanban, Loader2, LayoutGrid, List,
  TrendingUp, CheckCircle2, Clock, AlertTriangle, ArrowRight
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';

const inputClass = "block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all";

const statusFilterOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Planning', label: 'Planning' },
  { value: 'Active', label: 'Active' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
];

const statusOptions = ['Planning', 'Active', 'On Hold', 'Completed'];
const priorityOptions = ['Low', 'Medium', 'High'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Planning', priority: 'Medium', startDate: '', dueDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        dueDate: formData.dueDate || null,
      };
      await api.post('/projects', payload);
      setIsModalOpen(false);
      setFormData({ title: '', description: '', status: 'Planning', priority: 'Medium', startDate: '', dueDate: '' });
      fetchProjects();
    } catch (error) {
      console.error('Failed to create project', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derived real project metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const planningProjects = projects.filter(p => p.status === 'Planning').length;
  const onHoldProjects = projects.filter(p => p.status === 'On Hold').length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueProjects = projects.filter(p => {
    if (!p.dueDate || p.status === 'Completed') return false;
    return new Date(p.dueDate) < today;
  });

  const avgProgress = totalProjects > 0
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / totalProjects)
    : 0;

  // Real upcoming deadlines (sorted soonest first)
  const upcomingProjects = projects
    .filter(p => p.dueDate && p.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  // Filtered project list
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner text="Loading projects…" />;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-slate-400">
            Overview, health metrics, and deliverables across all your workspaces.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary w-fit"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* KPI Overview Cards (Real data) */}
      {totalProjects > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-5 flex flex-col justify-between hover:border-white/[0.14] transition-all duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Total Projects</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-white/10">
                <FolderKanban className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">{totalProjects}</span>
              <span className="text-xs text-slate-400">{activeProjects} active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-5 flex flex-col justify-between hover:border-white/[0.14] transition-all duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Completed</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-white/10">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">{completedProjects}</span>
              <span className="text-xs text-emerald-400 font-semibold tabular-nums">
                {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}% rate
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-5 flex flex-col justify-between hover:border-white/[0.14] transition-all duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Average Progress</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 ring-1 ring-white/10">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums tracking-tight">{avgProgress}%</span>
                <span className="text-xs text-slate-400">all projects</span>
              </div>
              <ProgressBar value={avgProgress} size="sm" showLabel={false} />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-5 flex flex-col justify-between hover:border-white/[0.14] transition-all duration-200 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Overdue / Urgent</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ring-1 ring-white/10 ${overdueProjects.length > 0 ? 'bg-rose-500/15 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
                <AlertTriangle className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${overdueProjects.length > 0 ? 'text-rose-400' : 'text-white'}`}>
                {overdueProjects.length}
              </span>
              <span className="text-xs text-slate-400">
                {overdueProjects.length > 0 ? 'Requires attention' : 'On schedule'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Middle Section: Status distribution & Upcoming Deadlines */}
      {totalProjects > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Status Breakdown Bar */}
          <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-[#121526] p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-100 tracking-tight">Status Distribution</h3>
                <span className="text-xs text-slate-400 font-medium tabular-nums">{totalProjects} total projects</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Click any status category below to quickly filter the workspace view.
              </p>

              {/* Segmented Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.05] flex">
                {activeProjects > 0 && (
                  <div
                    style={{ width: `${(activeProjects / totalProjects) * 100}%` }}
                    className="bg-blue-500 transition-all shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    title={`Active: ${activeProjects}`}
                  />
                )}
                {planningProjects > 0 && (
                  <div
                    style={{ width: `${(planningProjects / totalProjects) * 100}%` }}
                    className="bg-slate-400 transition-all"
                    title={`Planning: ${planningProjects}`}
                  />
                )}
                {onHoldProjects > 0 && (
                  <div
                    style={{ width: `${(onHoldProjects / totalProjects) * 100}%` }}
                    className="bg-amber-400 transition-all shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    title={`On Hold: ${onHoldProjects}`}
                  />
                )}
                {completedProjects > 0 && (
                  <div
                    style={{ width: `${(completedProjects / totalProjects) * 100}%` }}
                    className="bg-emerald-500 transition-all shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    title={`Completed: ${completedProjects}`}
                  />
                )}
              </div>
            </div>

            {/* Quick status pill buttons */}
            <div className="mt-4 flex flex-wrap items-center gap-2 pt-3.5 border-t border-white/[0.05]">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'All'
                    ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }`}
              >
                All ({totalProjects})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Active')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'Active'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Active ({activeProjects})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Planning')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'Planning'
                    ? 'bg-slate-500/20 text-slate-200 border border-slate-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Planning ({planningProjects})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('On Hold')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'On Hold'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                On Hold ({onHoldProjects})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('Completed')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  statusFilter === 'Completed'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Completed ({completedProjects})
              </button>
            </div>
          </div>

          {/* Upcoming Project Milestones / Deadlines */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-violet-400" />
                Upcoming Milestones
              </h3>
              <span className="text-xs text-slate-400 tabular-nums">{upcomingProjects.length} scheduled</span>
            </div>

            {upcomingProjects.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center text-slate-500">
                <Calendar className="h-7 w-7 text-slate-600 mb-2 opacity-40" />
                <p className="text-xs font-medium">No upcoming project deadlines</p>
              </div>
            ) : (
              <div className="space-y-2.5 flex-1">
                {upcomingProjects.map((proj) => {
                  const daysLeft = differenceInDays(new Date(proj.dueDate), today);
                  const isOverdue = daysLeft < 0;
                  const isToday = daysLeft === 0;

                  return (
                    <Link
                      key={proj.id}
                      to={`/projects/${proj.id}`}
                      className="group flex items-center justify-between p-2.5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-violet-300 transition-colors">
                          {proj.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-400">
                            {format(new Date(proj.dueDate), 'MMM d')}
                          </span>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[11px] text-slate-400 tabular-nums">
                            {proj.progress || 0}% done
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0 ${
                          isOverdue
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : isToday
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'
                        }`}
                      >
                        {isOverdue
                          ? `${Math.abs(daysLeft)}d overdue`
                          : isToday
                          ? 'Due today'
                          : `In ${daysLeft}d`}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Controls Bar: Search, Status Filter, and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-500" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
              placeholder="Search projects by title or description…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Custom Dark Dropdown Filter */}
          <div className="w-full sm:w-52 shrink-0">
            <CustomSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusFilterOptions}
            />
          </div>
        </div>

        {/* View Mode Switcher: Grid vs List */}
        <div className="flex items-center gap-1 rounded-lg border border-white/[0.09] bg-[#121526] p-1 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid Card View"
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-violet-600/25 text-violet-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            title="Compact List View"
            className={`flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-violet-600/25 text-violet-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Display: Empty, Grid, or List */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={
            projects.length === 0
              ? "Create your first project to organize tasks, track milestones, and monitor delivery progress."
              : "No projects match your current search query or filter selection."
          }
          action={
            projects.length === 0 && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" /> New Project
              </button>
            )
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid / Card View */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, i) => {
            const taskCount = project.Tasks ? project.Tasks.length : 0;
            const completedTaskCount = project.Tasks
              ? project.Tasks.filter(t => t.status === 'Done').length
              : 0;

            const isOverdue = project.dueDate && new Date(project.dueDate) < today && project.status !== 'Completed';

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group rounded-2xl border border-white/[0.07] bg-[#121526] p-5 hover:border-violet-500/35 hover:bg-[#15192e] transition-all duration-200 flex flex-col justify-between shadow-sm hover:-translate-y-0.5"
                style={{ animationDelay: `${i * 25}ms` }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={project.status} />
                    <PriorityBadge priority={project.priority} />
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-100 tracking-tight group-hover:text-violet-300 transition-colors line-clamp-1">
                    {project.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 line-clamp-2 min-h-[2rem] leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/[0.05] space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Progress</span>
                      <span className="font-semibold text-slate-200 tabular-nums">
                        {project.progress || 0}%
                      </span>
                    </div>
                    <ProgressBar value={project.progress || 0} size="sm" showLabel={false} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className={`h-3.5 w-3.5 ${isOverdue ? 'text-rose-400' : 'text-slate-500'}`} />
                      <span className={isOverdue ? 'text-rose-400 font-medium' : ''}>
                        {project.dueDate
                          ? format(new Date(project.dueDate), 'MMM d, yyyy')
                          : 'No deadline'}
                      </span>
                    </span>
                    <span className="text-slate-400 font-medium tabular-nums">
                      {taskCount > 0 ? `${completedTaskCount}/${taskCount} tasks` : '0 tasks'}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Dense Table / List View */
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121526] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/[0.07] bg-white/[0.01] text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Project</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Priority</th>
                  <th className="px-4 py-3.5">Progress</th>
                  <th className="px-4 py-3.5">Due Date</th>
                  <th className="px-4 py-3.5 text-right">Tasks</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProjects.map((project) => {
                  const taskCount = project.Tasks ? project.Tasks.length : 0;
                  const doneCount = project.Tasks ? project.Tasks.filter(t => t.status === 'Done').length : 0;
                  const isOverdue = project.dueDate && new Date(project.dueDate) < today && project.status !== 'Completed';

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-5 py-3.5 max-w-[280px]">
                        <Link to={`/projects/${project.id}`} className="block">
                          <p className="font-semibold text-slate-200 group-hover:text-violet-300 transition-colors truncate">
                            {project.title}
                          </p>
                          {project.description && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {project.description}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <PriorityBadge priority={project.priority} />
                      </td>
                      <td className="px-4 py-3.5 w-36 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <ProgressBar value={project.progress || 0} size="sm" className="flex-1" showLabel={false} />
                          <span className="text-xs text-slate-400 tabular-nums w-8 text-right font-medium">
                            {project.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-400">
                        {project.dueDate ? (
                          <span className={isOverdue ? 'text-rose-400 font-medium flex items-center gap-1' : ''}>
                            {format(new Date(project.dueDate), 'MMM d, yyyy')}
                            {isOverdue && <AlertTriangle className="h-3 w-3" />}
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap text-xs text-slate-400 font-medium tabular-nums">
                        {taskCount > 0 ? `${doneCount}/${taskCount}` : '0'}
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <Link
                          to={`/projects/${project.id}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                        >
                          Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Project Modal with CustomSelect Dropdowns */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Project"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-project-form"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating…' : 'Create Project'}
            </button>
          </div>
        }
      >
        <form id="create-project-form" onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClass}
              placeholder="e.g., Mobile App Redesign"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
              placeholder="Brief description of goals, scope, and deliverables…"
            />
          </div>

          {/* Custom Dark Selects for Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Status</label>
              <CustomSelect
                value={formData.status}
                name="status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                options={statusOptions}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Priority</label>
              <CustomSelect
                value={formData.priority}
                name="priority"
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                options={priorityOptions}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
