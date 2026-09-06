import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckSquare, Search, Plus, Clock, FolderKanban, Loader2, Edit, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import PriorityBadge from '../components/ui/PriorityBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import CustomSelect from '../components/ui/CustomSelect';

const inputClass = "block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 px-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all";

const statusOptions = ['Todo', 'In Progress', 'Done'];
const priorityOptions = ['Low', 'Medium', 'High'];

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '', projectId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [togglingTaskIds, setTogglingTaskIds] = useState(new Set());

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      if (projectsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, projectId: projectsRes.data[0].id }));
      }
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '',
      projectId: projects.length > 0 ? projects[0].id : ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title, description: task.description || '',
      status: task.status, priority: task.priority,
      dueDate: task.dueDate || '', projectId: task.projectId
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete task', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate || null,
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handleToggleTaskDone = async (task, e) => {
    e.stopPropagation();
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
    setTogglingTaskIds(prev => new Set(prev).add(task.id));
    try {
      await api.put(`/tasks/${task.id}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to toggle task completion', error);
      fetchData();
    } finally {
      setTogglingTaskIds(prev => { const next = new Set(prev); next.delete(task.id); return next; });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesProject = projectFilter === 'All' || String(task.projectId) === String(projectFilter);
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Group by status for summary
  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  if (loading) return <LoadingSpinner text="Loading tasks…" />;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Tasks</h1>
          <p className="mt-1 text-sm text-slate-400">Track and manage every deliverable across your projects.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          disabled={projects.length === 0}
          title={projects.length === 0 ? 'Create a project first' : ''}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All Tasks', value: 'All', count: tasks.length },
          { label: 'To Do', value: 'Todo', count: todoCount },
          { label: 'In Progress', value: 'In Progress', count: inProgressCount },
          { label: 'Completed', value: 'Done', count: doneCount },
        ].map((s) => (
          <button
            key={s.value}
            onClick={() => setStatusFilter(s.value)}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === s.value
                ? 'bg-violet-600/20 text-violet-200 border border-violet-500/40 shadow-sm'
                : 'bg-[#121526] border border-white/[0.07] text-slate-400 hover:border-white/[0.14] hover:text-slate-200'
            }`}
          >
            <span>{s.label}</span>
            <span className={`rounded-md px-1.5 py-0.5 text-[10px] tabular-nums font-bold ${
              statusFilter === s.value ? 'bg-violet-500/30 text-violet-100' : 'bg-white/[0.06] text-slate-400'
            }`}>
              {s.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Project filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search tasks by title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
          />
        </div>
        <div className="w-full sm:w-60 shrink-0">
          <CustomSelect
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: 'All', label: 'All Projects' },
              ...projects.map(p => ({ value: p.id, label: p.title }))
            ]}
          />
        </div>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={tasks.length === 0 ? "Create your first task to start tracking deliverables." : "No tasks match your filter criteria."}
          action={tasks.length === 0 && (
            <button
              onClick={handleOpenCreateModal}
              disabled={projects.length === 0}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" /> New Task
            </button>
          )}
        />
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-[#121526] overflow-hidden shadow-sm">
          <ul className="divide-y divide-white/[0.04]">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                onClick={() => handleOpenEditModal(task)}
              >
                {/* Completion checkbox */}
                <button
                  onClick={(e) => handleToggleTaskDone(task, e)}
                  disabled={togglingTaskIds.has(task.id)}
                  title={task.status === 'Done' ? 'Mark as Todo' : 'Mark as Done'}
                  className={`shrink-0 flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
                    task.status === 'Done'
                      ? 'border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-400 hover:border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                      : 'border-white/20 bg-transparent hover:border-violet-400 hover:bg-violet-500/10'
                  } ${togglingTaskIds.has(task.id) ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                  aria-label={task.status === 'Done' ? 'Mark as Todo' : 'Mark as Done'}
                >
                  {togglingTaskIds.has(task.id) ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : task.status === 'Done' ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  ) : null}
                </button>

                {/* Status control */}
                <div className="w-full sm:w-32 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <CustomSelect
                    size="sm"
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value, e)}
                    options={statusOptions}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium transition-colors ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {task.title}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.05]">
                      <FolderKanban className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate max-w-[140px] text-slate-300 font-medium">{task.Project?.title || 'Unknown Project'}</span>
                    </span>
                    {task.dueDate && (
                      <span className={`flex items-center gap-1.5 ${
                        new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-rose-400 font-medium' : 'text-slate-400'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                        {new Date(task.dueDate) < new Date() && task.status !== 'Done' && ' · Overdue'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 mt-1 sm:mt-0 w-full sm:w-auto shrink-0">
                  <PriorityBadge priority={task.priority} />

                  <div className="flex items-center gap-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(task); }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 transition-colors"
                      aria-label="Edit task"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteTask(task.id, e)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                      aria-label="Delete task"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
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
              form="task-page-modal-form"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : (editingTask ? 'Save Changes' : 'Create Task')}
            </button>
          </div>
        }
      >
        <form id="task-page-modal-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Task Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={inputClass}
              placeholder="e.g., Update database migrations"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
              placeholder="Provide context or acceptance criteria…"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Project</label>
            <CustomSelect
              value={formData.projectId}
              name="projectId"
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              options={projects.map(p => ({ value: p.id, label: p.title }))}
            />
          </div>

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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Due Date</label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className={inputClass}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
