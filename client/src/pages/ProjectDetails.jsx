import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ArrowLeft, Calendar, Edit, Trash2, Plus, Clock, Loader2,
  FolderKanban, Check
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';

const inputClass = "block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all";

const statusOptions = ['Planning', 'Active', 'On Hold', 'Completed'];
const taskStatusOptions = ['Todo', 'In Progress', 'Done'];
const priorityOptions = ['Low', 'Medium', 'High'];

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Track which tasks are currently being toggled
  const [togglingTaskIds, setTogglingTaskIds] = useState(new Set());

  const fetchProjectDetails = useCallback(async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      setProjectFormData({
        title: data.title,
        description: data.description || '',
        status: data.status,
        priority: data.priority,
        startDate: data.startDate || '',
        dueDate: data.dueDate || '',
        progress: data.progress
      });
    } catch (error) {
      console.error('Failed to fetch project', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project', error);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
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
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        title: task.title, description: task.description || '',
        status: task.status, priority: task.priority, dueDate: task.dueDate || ''
      });
    } else {
      setEditingTask(null);
      setTaskFormData({ title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '' });
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...taskFormData,
        dueDate: taskFormData.dueDate || null,
        projectId: id,
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

  // Toggle task between Done <-> Todo
  const handleToggleTaskDone = async (task) => {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    
    // Optimistic update
    setProject(prev => {
      if (!prev) return prev;
      const updatedTasks = prev.Tasks.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      );
      const total = updatedTasks.length;
      const done = updatedTasks.filter(t => t.status === 'Done').length;
      return {
        ...prev,
        Tasks: updatedTasks,
        progress: total > 0 ? Math.round((done / total) * 100) : 0
      };
    });

    setTogglingTaskIds(prev => new Set(prev).add(task.id));
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to toggle task status', error);
      fetchProjectDetails();
    } finally {
      setTogglingTaskIds(prev => {
        const next = new Set(prev);
        next.delete(task.id);
        return next;
      });
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    setProject(prev => {
      if (!prev) return prev;
      const updatedTasks = prev.Tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      const total = updatedTasks.length;
      const done = updatedTasks.filter(t => t.status === 'Done').length;
      return {
        ...prev,
        Tasks: updatedTasks,
        progress: total > 0 ? Math.round((done / total) * 100) : 0
      };
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
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchProjectDetails();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  if (loading) return <LoadingSpinner text="Loading project details…" />;
  if (!project) return null;

  const totalTasks = project.Tasks ? project.Tasks.length : 0;
  const doneTasks = project.Tasks ? project.Tasks.filter(t => t.status === 'Done').length : 0;
  const inProgressTasks = project.Tasks ? project.Tasks.filter(t => t.status === 'In Progress').length : 0;
  const todoTasks = project.Tasks ? project.Tasks.filter(t => t.status === 'Todo').length : 0;

  const calculatedProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : (project.progress || 0);

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Back link */}
      <Link to="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

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
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="btn-secondary"
            >
              <Edit className="h-4 w-4" /> Edit Project
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
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
          <button
            onClick={() => handleOpenTaskModal()}
            className="btn-primary"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>

        {totalTasks === 0 ? (
          <EmptyState
            icon={Plus}
            title="No tasks yet"
            description="Break this project into actionable tasks and milestones."
            onIconClick={() => handleOpenTaskModal()}
            iconAriaLabel="Add task"
            action={
              <button
                onClick={() => handleOpenTaskModal()}
                className="btn-primary"
              >
                <Plus className="h-4 w-4" /> Add First Task
              </button>
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
                  <li key={task.id} className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors group ${isDone ? 'opacity-70' : ''}`}>
                    
                    {/* Circular Completion Checkbox */}
                    <button
                      onClick={() => handleToggleTaskDone(task)}
                      disabled={isToggling}
                      title={isDone ? 'Mark as Todo' : 'Mark as Done'}
                      className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                        isDone
                          ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-400 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'border-white/20 bg-transparent hover:border-violet-400 hover:bg-violet-500/10'
                      } ${isToggling ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                      aria-label={isDone ? 'Mark task as Todo' : 'Mark task as Done'}
                    >
                      {isToggling ? (
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
                      {task.dueDate && (
                        <p className={`mt-1 flex items-center gap-1.5 text-xs ${
                          new Date(task.dueDate) < new Date() && !isDone
                            ? 'text-rose-400 font-medium' : 'text-slate-500'
                        }`}>
                          <Clock className="h-3.5 w-3.5" />
                          {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          {new Date(task.dueDate) < new Date() && !isDone && ' · Overdue'}
                        </p>
                      )}
                    </div>

                    {/* Status select + Priority + Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0 w-full sm:w-auto">
                      {/* Status selector */}
                      <div className="w-32 shrink-0">
                        <CustomSelect
                          size="sm"
                          value={task.status}
                          onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                          options={taskStatusOptions}
                        />
                      </div>

                      <PriorityBadge priority={task.priority} />

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
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        footer={
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-project-form"
              disabled={isSubmitting}
              className="btn-primary"
            >
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
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="task-modal-form"
              disabled={isSubmitting}
              className="btn-primary"
            >
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
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteProject}
              className="btn-danger"
            >
              Delete Project
            </button>
          </div>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to permanently delete <strong className="text-white font-semibold">{project.title}</strong> and all associated tasks? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
