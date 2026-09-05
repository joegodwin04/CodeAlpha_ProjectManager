import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckSquare, Search, Plus, Clock, FolderKanban, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import PriorityBadge from '../components/ui/PriorityBadge';
import StatusBadge from '../components/ui/StatusBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';

const inputClass = "block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";
const selectClass = "block w-full rounded-lg border border-slate-300 bg-white py-2.5 px-3 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";

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

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, formData);
      } else {
        await api.post('/tasks', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save task', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchData();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesProject = projectFilter === 'All' || task.projectId === projectFilter;
    return matchesSearch && matchesStatus && matchesProject;
  });

  // Group by status for summary
  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  if (loading) return <LoadingSpinner text="Loading tasks…" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">All tasks across every project.</p>
        </div>
        <button onClick={handleOpenCreateModal} disabled={projects.length === 0}
          title={projects.length === 0 ? 'Create a project first' : ''}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
          <Plus className="h-4 w-4" /> New Task
        </button>
      </div>

      {/* Status summary pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: 'All', count: tasks.length },
          { label: 'Todo', value: 'Todo', count: todoCount },
          { label: 'In Progress', value: 'In Progress', count: inProgressCount },
          { label: 'Done', value: 'Done', count: doneCount },
        ].map((s) => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s.value
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}>
            {s.label}
            <span className={`tabular-nums ${statusFilter === s.value ? 'text-indigo-500' : 'text-slate-400'}`}>{s.count}</span>
          </button>
        ))}
      </div>

      {/* Search + Project filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input type="text" placeholder="Search tasks…" value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors" />
        </div>
        <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className={`${selectClass} sm:w-48`}>
          <option value="All">All Projects</option>
          {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
        </select>
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={tasks.length === 0 ? "Create a task to start tracking your work." : "Try adjusting your search or filters."}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <li key={task.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => handleOpenEditModal(task)}>
                {/* Status control (stop propagation so click doesn't open modal) */}
                <select value={task.status}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => { e.stopPropagation(); handleStatusChange(task.id, e.target.value); }}
                  className="h-8 rounded-md border border-slate-300 bg-white py-0 pl-2 pr-7 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none shrink-0">
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>

                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${task.status === 'Done' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1 truncate">
                      <FolderKanban className="h-3 w-3 shrink-0" />
                      <span className="truncate">{task.Project?.title || 'Unknown'}</span>
                    </span>
                    {task.dueDate && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className={`flex items-center gap-1 ${
                          new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-600 font-medium' : ''
                        }`}>
                          <Clock className="h-3 w-3 shrink-0" />
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <PriorityBadge priority={task.priority} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Task' : 'New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
            <select required value={formData.projectId}
              onChange={(e) => setFormData({...formData, projectId: e.target.value})} className={selectClass}>
              {projects.map(p => (<option key={p.id} value={p.id}>{p.title}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
            <input type="text" required value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})} className={inputClass}
              placeholder="e.g., Setup CI/CD pipeline" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea rows={2} value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})} className={inputClass}
              placeholder="Optional details…" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className={selectClass}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
              <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className={selectClass}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
            <input type="date" value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className={inputClass} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">Cancel</button>
            <button type="submit" disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Saving…' : 'Save Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
