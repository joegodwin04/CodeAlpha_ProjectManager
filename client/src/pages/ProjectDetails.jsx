import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { ArrowLeft, Calendar, Edit, Trash2, Plus, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const inputClass = "block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";
const selectClass = "block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";

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

  const fetchProjectDetails = async () => {
    setLoading(true);
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
  };

  useEffect(() => { fetchProjectDetails(); }, [id]);

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
      await api.put(`/projects/${id}`, projectFormData);
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
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, { ...taskFormData, projectId: id });
      } else {
        await api.post('/tasks', { ...taskFormData, projectId: id });
      }
      setIsTaskModalOpen(false);
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProjectDetails();
    } catch (error) {
      console.error('Failed to update status', error);
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

  if (loading) return <LoadingSpinner text="Loading project…" />;
  if (!project) return <div className="text-center py-20 text-slate-500">Project not found.</div>;

  const totalTasks = project.Tasks?.length || 0;
  const todoTasks = project.Tasks?.filter(t => t.status === 'Todo').length || 0;
  const inProgressTasks = project.Tasks?.filter(t => t.status === 'In Progress').length || 0;
  const doneTasks = project.Tasks?.filter(t => t.status === 'Done').length || 0;
  const calculatedProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : project.progress;

  return (
    <div className="space-y-6 pb-8">
      {/* Back link */}
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      {/* Project Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={project.status} />
              <PriorityBadge priority={project.priority} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{project.title}</h1>
            <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <Edit className="h-3.5 w-3.5" /> Edit
            </button>
            <button onClick={() => setShowDeleteConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4 border-t border-slate-100 pt-6">
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" /> Start Date
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-900">
              {project.startDate ? format(new Date(project.startDate), 'MMM d, yyyy') : '—'}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5 text-red-400" /> Due Date
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-900">
              {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tasks</dt>
            <dd className="mt-1.5 text-sm font-semibold text-slate-900">{totalTasks}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2.5">Progress</dt>
            <dd><ProgressBar value={calculatedProgress} size="md" /></dd>
          </div>
        </div>
      </div>

      {/* Task stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'To Do', value: todoTasks, color: 'border-l-slate-400' },
          { label: 'In Progress', value: inProgressTasks, color: 'border-l-blue-500' },
          { label: 'Done', value: doneTasks, color: 'border-l-emerald-500' },
        ].map((s) => (
          <div key={s.label} className={`rounded-lg border border-slate-200 bg-white px-4 py-3 border-l-4 ${s.color}`}>
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-0.5 text-xl font-bold text-slate-900 tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tasks section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
          <button onClick={() => handleOpenTaskModal()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors">
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>

        {totalTasks === 0 ? (
          <EmptyState
            icon={Plus}
            title="No tasks yet"
            description="Break this project into actionable tasks."
            action={
              <button onClick={() => handleOpenTaskModal()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors">
                <Plus className="h-4 w-4" /> Add First Task
              </button>
            }
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {project.Tasks.sort((a, b) => {
                if (a.status === 'Done' && b.status !== 'Done') return 1;
                if (a.status !== 'Done' && b.status === 'Done') return -1;
                return new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999');
              }).map((task) => (
                <li key={task.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group">
                  {/* Status select */}
                  <select value={task.status} onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                    className="h-8 rounded-md border border-slate-300 bg-white py-0 pl-2 pr-7 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shrink-0">
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>

                  {/* Task info */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className={`mt-0.5 flex items-center gap-1 text-xs ${
                        new Date(task.dueDate) < new Date() && task.status !== 'Done'
                          ? 'text-red-600 font-medium' : 'text-slate-500'
                      }`}>
                        <Clock className="h-3 w-3" />
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  {/* Priority + actions */}
                  <PriorityBadge priority={task.priority} />
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenTaskModal(task)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                      aria-label="Edit task">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDeleteTask(task.id)}
                      className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      aria-label="Delete task">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project" size="sm">
        <p className="text-sm text-slate-600">
          Are you sure you want to delete <strong>{project.title}</strong>? This will also delete all tasks within it. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 pt-5">
          <button onClick={() => setShowDeleteConfirm(false)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleDeleteProject}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
            Delete Project
          </button>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Project">
        <form onSubmit={handleUpdateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input type="text" required value={projectFormData.title}
              onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={3} value={projectFormData.description}
              onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={projectFormData.status} onChange={(e) => setProjectFormData({...projectFormData, status: e.target.value})} className={selectClass}>
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select value={projectFormData.priority} onChange={(e) => setProjectFormData({...projectFormData, priority: e.target.value})} className={selectClass}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
              <input type="date" value={projectFormData.startDate}
                onChange={(e) => setProjectFormData({...projectFormData, startDate: e.target.value})} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
              <input type="date" value={projectFormData.dueDate}
                onChange={(e) => setProjectFormData({...projectFormData, dueDate: e.target.value})} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-700 mb-1.5">
              <span>Progress Override</span>
              <span className="text-indigo-600">{projectFormData.progress}%</span>
            </label>
            <input type="range" min="0" max="100" value={projectFormData.progress}
              onChange={(e) => setProjectFormData({...projectFormData, progress: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            <p className="text-xs text-slate-500 mt-1">Progress is auto-calculated from tasks unless overridden.</p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsEditModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Task Modal */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={handleSaveTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input type="text" required value={taskFormData.title}
              onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})} className={inputClass}
              placeholder="e.g., Implement login page" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={2} value={taskFormData.description}
              onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})} className={inputClass}
              placeholder="Optional details…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={taskFormData.status} onChange={(e) => setTaskFormData({...taskFormData, status: e.target.value})} className={selectClass}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select value={taskFormData.priority} onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.value})} className={selectClass}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
            <input type="date" value={taskFormData.dueDate}
              onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})} className={inputClass} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsTaskModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetails;
