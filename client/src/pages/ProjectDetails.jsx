import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket, joinProjectRoom, leaveProjectRoom } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { GUEST_PROJECTS_WITH_TASKS } from '../data/guestDemoData';
import {
  ArrowLeft, Calendar, Edit, Trash2, Plus, Clock, Loader2,
  FolderKanban, Check, Lock, Eye, MessageSquare,
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';
import GuestAuthPrompt from '../components/ui/GuestAuthPrompt';
import TaskComments from '../components/ui/TaskComments';

const inputClass = "block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all";

const statusOptions = ['Planning', 'Active', 'On Hold', 'Completed'];
const taskStatusOptions = ['Todo', 'In Progress', 'Done'];
const priorityOptions = ['Low', 'Medium', 'High'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isGuest, user } = useAuth();

  // ── Guest mode: load from static demo data (no API call) ──────────────────
  const guestProject = isGuest
    ? GUEST_PROJECTS_WITH_TASKS.find((p) => p.id === id) ?? null
    : null;

  // Real-user state
  const [project, setProject] = useState(isGuest ? guestProject : null);
  const [loading, setLoading] = useState(!isGuest); // guests start pre-loaded

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', userId: ''
  });
  const [users, setUsers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [togglingTaskIds, setTogglingTaskIds] = useState(new Set());

  // Guest prompt state
  const [guestPromptOpen, setGuestPromptOpen] = useState(false);
  const [guestPromptAction, setGuestPromptAction] = useState('perform this action');

  // Fetch registered users for task assignment
  useEffect(() => {
    if (isGuest) return;
    const fetchUsers = async () => {
      try {
        const { data } = await api.get('/users');
        setUsers(data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, [isGuest]);

  // Track which task's comment section is expanded (one at a time)
  const [expandedCommentTaskId, setExpandedCommentTaskId] = useState(null);

  const toggleComments = (taskId) => {
    setExpandedCommentTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // ── Authenticated fetch ───────────────────────────────────────────────────
  const fetchProjectDetails = useCallback(async () => {
    if (isGuest) return; // never call the API in guest mode
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      setProjectFormData({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        dueDate: data.dueDate ? data.dueDate.split('T')[0] : '',
        progress: data.progress,
      });
    } catch (error) {
      console.error('Failed to fetch project', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, isGuest]);

  useEffect(() => {
    if (isGuest) {
      // Guest: if no matching demo project, redirect back to projects list
      if (!guestProject) navigate('/projects');
      return;
    }
    fetchProjectDetails();
  }, [fetchProjectDetails, isGuest, guestProject, navigate]);

  // ── Real-time task updates via Socket.IO ──────────────────────────────────
  useEffect(() => {
    if (isGuest || !id) return;

    const socket = getSocket();
    joinProjectRoom(id);

    const handleTaskUpdated = (updatedTask) => {
      if (!updatedTask || !updatedTask.id) return;

      setProject((prev) => {
        if (!prev || !Array.isArray(prev.Tasks)) return prev;

        const taskExists = prev.Tasks.some((t) => t.id === updatedTask.id);
        if (!taskExists) return prev;

        const updatedTasks = prev.Tasks.map((t) =>
          t.id === updatedTask.id ? { ...t, ...updatedTask } : t
        );

        const total = updatedTasks.length;
        const done = updatedTasks.filter((t) => t.status === 'Done').length;
        const newProgress = total > 0 ? Math.round((done / total) * 100) : 0;

        return {
          ...prev,
          Tasks: updatedTasks,
          progress: newProgress,
        };
      });
    };

    socket.on('taskUpdated', handleTaskUpdated);

    return () => {
      socket.off('taskUpdated', handleTaskUpdated);
      leaveProjectRoom(id);
    };
  }, [id, isGuest]);

  // ── Mutation handlers — all no-ops when isGuest ───────────────────────────
  const openGuestPrompt = (action) => {
    setGuestPromptAction(action);
    setGuestPromptOpen(true);
  };

  const handleDeleteProject = async () => {
    if (isGuest) { openGuestPrompt('delete this project'); return; }
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    if (isGuest) { openGuestPrompt('edit this project'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        ...projectFormData,
        startDate: projectFormData.startDate || null,
        dueDate: projectFormData.dueDate || null,
      };
      await api.put(`/projects/${id}`, payload);
      setIsEditModalOpen(false);
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to update project', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTaskModal = (task = null) => {
    if (isGuest) {
      openGuestPrompt(task ? 'edit tasks' : 'add a task');
      return;
    }
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        userId: task.userId || (user ? user.id : '')
      });
    } else {
      setEditingTask(null);
      setTaskFormData({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        dueDate: '',
        userId: user ? user.id : ''
      });
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (isGuest) { openGuestPrompt('save tasks'); return; }
    setIsSubmitting(true);
    try {
      const payload = {
        ...taskFormData,
        dueDate: taskFormData.dueDate || null,
        projectId: id,
        userId: taskFormData.userId || user?.id,
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setIsTaskModalOpen(false);
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleTaskDone = async (task) => {
    if (isGuest) { openGuestPrompt('toggle task completion'); return; }
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    setProject((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.Tasks.map((t) =>
        t.id === task.id ? { ...t, status: newStatus } : t
      );
      const total = updatedTasks.length;
      const done = updatedTasks.filter((t) => t.status === 'Done').length;
      return { ...prev, Tasks: updatedTasks, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
    });
    setTogglingTaskIds((prev) => new Set(prev).add(task.id));
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to toggle task status', error);
      fetchProjectDetails();
    } finally {
      setTogglingTaskIds((prev) => { const next = new Set(prev); next.delete(task.id); return next; });
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    if (isGuest) { openGuestPrompt('change task status'); return; }
    setProject((prev) => {
      if (!prev) return prev;
      const updatedTasks = prev.Tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t);
      const total = updatedTasks.length;
      const done = updatedTasks.filter((t) => t.status === 'Done').length;
      return { ...prev, Tasks: updatedTasks, progress: total > 0 ? Math.round((done / total) * 100) : 0 };
    });
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to update task status', error);
      fetchProjectDetails();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (isGuest) { openGuestPrompt('delete tasks'); return; }
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchProjectDetails();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (loading) return <LoadingSpinner text="Loading project details…" />;
  if (!project) return null;

  const totalTasks = project.Tasks ? project.Tasks.length : 0;
  const doneTasks = project.Tasks ? project.Tasks.filter((t) => t.status === 'Done').length : 0;
  const inProgressTasks = project.Tasks ? project.Tasks.filter((t) => t.status === 'In Progress').length : 0;
  const todoTasks = project.Tasks ? project.Tasks.filter((t) => t.status === 'Todo').length : 0;
  const calculatedProgress = totalTasks > 0
    ? Math.round((doneTasks / totalTasks) * 100)
    : (project.progress || 0);

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Back link */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      {/* Guest demo banner */}
      {isGuest && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3">
          <Eye className="h-4 w-4 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-300/90">
            <span className="font-semibold">Demo Preview —</span> You're viewing sample project data. Sign in to manage your own projects and tasks.
          </p>
        </div>
      )}

      {/* Project Header Hero */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{project.title}</h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          {/* Action buttons — locked for guests */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {isGuest ? (
              <>
                <button
                  onClick={() => openGuestPrompt('edit this project')}
                  className="inline-flex items-center gap-2 btn-secondary opacity-60 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" /> Edit Project
                </button>
                <button
                  onClick={() => openGuestPrompt('delete this project')}
                  className="inline-flex items-center gap-2 btn-danger opacity-60 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" /> Delete
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditModalOpen(true)} className="btn-secondary">
                  <Edit className="h-4 w-4" /> Edit Project
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Metadata grid */}
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-white/[0.06] pt-6">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-slate-400" /> Start Date
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-200">
              {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : '—'}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-rose-400" /> Due Date
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-200">
              {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : '—'}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <FolderKanban className="h-3.5 w-3.5 text-violet-400" /> Total Tasks
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-200 tabular-nums">{totalTasks}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Overall Progress</dt>
            <dd><ProgressBar value={calculatedProgress} size="md" /></dd>
          </div>
        </div>
      </div>

      {/* Task stats ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'To Do', value: todoTasks, indicator: 'bg-slate-500' },
          { label: 'In Progress', value: inProgressTasks, indicator: 'bg-violet-500' },
          { label: 'Done', value: doneTasks, indicator: 'bg-emerald-500' },
        ].map((s) => (
          <div key={s.label} className="relative rounded-2xl border border-white/[0.07] bg-[#121526] px-5 py-4 overflow-hidden shadow-sm">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.indicator}`} />
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-white tabular-nums tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-white tracking-tight">Project Tasks</h2>
          {isGuest ? (
            <button
              onClick={() => openGuestPrompt('add a task')}
              className="inline-flex items-center gap-2 btn-secondary opacity-70 cursor-pointer"
            >
              <Lock className="h-4 w-4" /> Add Task
            </button>
          ) : (
            <button onClick={() => handleOpenTaskModal()} className="btn-primary">
              <Plus className="h-4 w-4" /> Add Task
            </button>
          )}
        </div>

        {totalTasks === 0 ? (
          <EmptyState
            icon={Plus}
            title="No tasks yet"
            description="Break this project into actionable tasks and milestones."
            action={
              !isGuest && (
                <button onClick={() => handleOpenTaskModal()} className="btn-primary">
                  <Plus className="h-4 w-4" /> Add First Task
                </button>
              )
            }
          />
        ) : (
          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] overflow-hidden shadow-sm">
            <ul className="divide-y divide-white/[0.04]">
              {project.Tasks.slice().sort((a, b) => {
                if (a.status === 'Done' && b.status !== 'Done') return 1;
                if (a.status !== 'Done' && b.status === 'Done') return -1;
                return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
              }).map((task) => {
                const isDone = task.status === 'Done';
                const isToggling = togglingTaskIds.has(task.id);

                return (
                  <React.Fragment key={task.id}>
                    <li className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group ${isDone ? 'opacity-70' : ''}`}>

                      {/* Completion toggle — prompts guest */}
                      <button
                        onClick={() => isGuest ? openGuestPrompt('toggle task completion') : handleToggleTaskDone(task)}
                        disabled={!isGuest && isToggling}
                        title={isGuest ? 'Sign in to manage tasks' : (isDone ? 'Mark as Todo' : 'Mark as Done')}
                        className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                          isGuest
                            ? 'border-white/10 bg-transparent cursor-pointer opacity-50'
                            : isDone
                              ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-400 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] cursor-pointer'
                              : 'border-white/20 bg-transparent hover:border-violet-400 hover:bg-violet-500/10 cursor-pointer'
                        } ${!isGuest && isToggling ? 'opacity-50 cursor-wait' : ''}`}
                        aria-label={isDone ? 'Mark task as Todo' : 'Mark task as Done'}
                      >
                        {!isGuest && isToggling ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isDone ? (
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        ) : null}
                      </button>

                      {/* Task info */}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium transition-colors ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {task.title}
                        </p>
                        {task.description && !isDone && (
                          <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{task.description}</p>
                        )}
                        <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
                          {task.dueDate && (
                            <p className={`flex items-center gap-1.5 ${
                              new Date(task.dueDate) < new Date() && !isDone
                                ? 'text-rose-400 font-medium' : 'text-slate-500'
                            }`}>
                              <Clock className="h-3.5 w-3.5" />
                              {format(new Date(task.dueDate), 'MMM d, yyyy')}
                              {new Date(task.dueDate) < new Date() && !isDone && ' · Overdue'}
                            </p>
                          )}
                          {task.User && (
                            <div className="flex items-center gap-1.5 text-slate-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
                              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-[9px] font-bold text-violet-300 ring-1 ring-white/10">
                                {task.User.name?.charAt(0)?.toUpperCase() || 'U'}
                              </div>
                              <span className="text-slate-300 font-medium truncate max-w-[120px]">
                                {task.User.id === user?.id ? `${task.User.name} (You)` : task.User.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status + Priority + Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0 w-full sm:w-auto">

                        {/* Status — read-only badge for guests, interactive select for auth users */}
                        <div className="w-32 shrink-0">
                          {isGuest ? (
                            <span
                              className={`inline-flex items-center rounded-md px-2.5 py-1.5 text-xs font-semibold cursor-pointer ${
                                task.status === 'Done'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : task.status === 'In Progress'
                                    ? 'bg-violet-500/15 text-violet-400'
                                    : 'bg-slate-500/15 text-slate-400'
                              }`}
                              onClick={() => openGuestPrompt('change task status')}
                              title="Sign in to change status"
                            >
                              {task.status}
                            </span>
                          ) : (
                            <CustomSelect
                              size="sm"
                              value={task.status}
                              onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                              options={taskStatusOptions}
                            />
                          )}
                        </div>

                        <PriorityBadge priority={task.priority} />

                        {/* Edit / Comments / Delete — hidden for guests */}
                        {!isGuest && (
                          <div className="flex items-center gap-1">
                            {/* Comments toggle — always visible so users know comments exist */}
                            <button
                              onClick={() => toggleComments(task.id)}
                              className={`rounded-lg p-1.5 transition-colors ${
                                expandedCommentTaskId === task.id
                                  ? 'bg-violet-500/20 text-violet-300'
                                  : 'text-slate-400 hover:bg-white/[0.08] hover:text-slate-200'
                              }`}
                              aria-label="Toggle comments"
                              title="Comments"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </button>
                            {/* Edit / Delete — hover-reveal on desktop */}
                            <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenTaskModal(task)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 transition-colors"
                                aria-label="Edit task"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                                aria-label="Delete task"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                    {/* Inline comment panel — expands below task row */}
                    {!isGuest && expandedCommentTaskId === task.id && (
                      <li className="border-t border-white/[0.04] bg-[#0d0f1f] px-6 py-4 animate-fade-in">
                        <TaskComments taskId={task.id} currentUser={user} />
                      </li>
                    )}
                  </React.Fragment>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* ── Modals (authenticated users only) ───────────────────────────── */}
      {!isGuest && (
        <>
          {/* Edit Project Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Edit Project"
            footer={
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" form="edit-project-form" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            }
          >
            <form id="edit-project-form" onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Project Title</label>
                <input
                  type="text"
                  required
                  value={projectFormData.title || ''}
                  onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={projectFormData.description || ''}
                  onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Status</label>
                  <CustomSelect
                    value={projectFormData.status}
                    name="status"
                    onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value })}
                    options={statusOptions}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Priority</label>
                  <CustomSelect
                    value={projectFormData.priority}
                    name="priority"
                    onChange={(e) => setProjectFormData({ ...projectFormData, priority: e.target.value })}
                    options={priorityOptions}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    value={projectFormData.startDate || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={projectFormData.dueDate || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, dueDate: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </form>
          </Modal>

          {/* Add / Edit Task Modal */}
          <Modal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            title={editingTask ? 'Edit Task' : 'Add New Task'}
            footer={
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" form="task-modal-form" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSubmitting ? 'Saving…' : (editingTask ? 'Save Changes' : 'Create Task')}
                </button>
              </div>
            }
          >
            <form id="task-modal-form" onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className={inputClass}
                  placeholder="e.g., Design user onboarding wireframes"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  className={inputClass}
                  placeholder="Details, acceptance criteria, or notes…"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Status</label>
                  <CustomSelect
                    value={taskFormData.status}
                    name="status"
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                    options={taskStatusOptions}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Priority</label>
                  <CustomSelect
                    value={taskFormData.priority}
                    name="priority"
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                    options={priorityOptions}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Due Date</label>
                <input
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Assignee</label>
                <CustomSelect
                  value={taskFormData.userId || user?.id}
                  name="userId"
                  onChange={(e) => setTaskFormData({ ...taskFormData, userId: e.target.value })}
                  placeholder="Select assignee"
                  options={users.map(u => ({
                    value: u.id,
                    label: u.id === user?.id ? `${u.name} (You)` : u.name,
                    sublabel: u.email,
                    avatar: u.name?.charAt(0)?.toUpperCase() || 'U'
                  }))}
                />
              </div>
            </form>
          </Modal>

          {/* Delete Project Confirmation Modal */}
          <Modal
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            title="Delete Project"
            size="sm"
            footer={
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-secondary">Cancel</button>
                <button type="button" onClick={handleDeleteProject} className="btn-danger">Delete Project</button>
              </div>
            }
          >
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete <strong className="text-white font-semibold">{project.title}</strong> and all associated tasks? This action cannot be undone.
            </p>
          </Modal>
        </>
      )}

      {/* Guest auth prompt — shown for any locked action */}
      <GuestAuthPrompt
        isOpen={guestPromptOpen}
        onClose={() => setGuestPromptOpen(false)}
        action={guestPromptAction}
      />
    </div>
  );
};

export default ProjectDetails;
