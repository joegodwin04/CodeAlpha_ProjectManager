import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, Edit, Trash2, CheckSquare, 
  FolderKanban, Plus, MoreVertical 
} from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit project state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task creation/edit state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: ''
  });

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

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await api.delete(`/projects/${id}`);
        navigate('/projects');
      } catch (error) {
        console.error('Failed to delete project', error);
      }
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

  // Task Handlers
  const handleOpenTaskModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || ''
      });
    } else {
      setEditingTask(null);
      setTaskFormData({
        title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: ''
      });
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
      
      // Auto-update project progress based on tasks
      // In a real scenario, the backend should calculate this
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
      fetchProjectDetails(); // Refresh to get updated stats
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'; // Planning
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'Medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'; // Low
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center">Loading project details...</div>;
  if (!project) return <div>Project not found</div>;

  // Calculate task statistics
  const totalTasks = project.Tasks?.length || 0;
  const todoTasks = project.Tasks?.filter(t => t.status === 'Todo').length || 0;
  const inProgressTasks = project.Tasks?.filter(t => t.status === 'In Progress').length || 0;
  const doneTasks = project.Tasks?.filter(t => t.status === 'Done').length || 0;
  
  // Calculate dynamic progress if there are tasks
  const calculatedProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : project.progress;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-4">
        <Link to="/projects" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Projects
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 dark:bg-gray-900 dark:ring-gray-800">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(project.priority)}`}>
                  {project.priority} Priority
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
              <p className="mt-4 text-base text-gray-600 dark:text-gray-400 max-w-3xl">
                {project.description || 'No description provided.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700"
              >
                <Edit className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-400" aria-hidden="true" />
                Edit
              </button>
              <button
                onClick={handleDeleteProject}
                className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:ring-gray-700 dark:hover:bg-red-900/20"
              >
                <Trash2 className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <dt className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="mr-2 h-4 w-4" /> Start Date
              </dt>
              <dd className="mt-2 text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                {project.startDate ? format(new Date(project.startDate), 'MMMM d, yyyy') : 'Not set'}
              </dd>
            </div>
            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <dt className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-red-500" /> Due Date
              </dt>
              <dd className="mt-2 text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                {project.dueDate ? format(new Date(project.dueDate), 'MMMM d, yyyy') : 'Not set'}
              </dd>
            </div>
            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <dt className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400 flex items-center">
                <CheckSquare className="mr-2 h-4 w-4" /> Tasks
              </dt>
              <dd className="mt-2 text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                {totalTasks} Total
              </dd>
            </div>
            <div className="border-t border-gray-100 pt-4 dark:border-gray-800">
              <dt className="text-sm font-medium leading-6 text-gray-500 dark:text-gray-400">Progress</dt>
              <dd className="mt-2 flex items-center gap-3 text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700 min-w-[100px]">
                  <div 
                    className={`h-full ${calculatedProgress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                    style={{ width: `${calculatedProgress}%` }}
                  />
                </div>
                <span>{calculatedProgress}%</span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-10">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Tasks</h2>
          <button
            onClick={() => handleOpenTaskModal()}
            className="mt-3 sm:mt-0 inline-flex items-center gap-x-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            <Plus className="-ml-0.5 h-4 w-4" aria-hidden="true" />
            Add Task
          </button>
        </div>

        {totalTasks === 0 ? (
          <div className="text-center rounded-lg border-2 border-dashed border-gray-300 p-12 dark:border-gray-700 bg-white dark:bg-gray-900">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No tasks yet</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Break this project down into actionable tasks.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl dark:bg-gray-900 dark:ring-gray-800">
            {/* Task stats */}
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 sm:px-6 flex gap-6 text-sm dark:bg-gray-800/50 dark:border-gray-800">
              <span className="font-medium text-gray-900 dark:text-white">{totalTasks} Total</span>
              <span className="text-gray-500 dark:text-gray-400">{todoTasks} Todo</span>
              <span className="text-blue-600 dark:text-blue-400">{inProgressTasks} In Progress</span>
              <span className="text-green-600 dark:text-green-400">{doneTasks} Done</span>
            </div>
            
            <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-800">
              {project.Tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map((task) => (
                <li key={task.id} className="relative flex justify-between gap-x-6 px-4 py-5 hover:bg-gray-50 sm:px-6 dark:hover:bg-gray-800/50">
                  <div className="flex min-w-0 gap-x-4 items-center">
                    <select
                      value={task.status}
                      onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                      className="h-8 rounded-md border-0 py-1 pl-2 pr-8 text-xs font-medium ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
                    >
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    <div className="min-w-0 flex-auto">
                      <p className={`text-sm font-semibold leading-6 text-gray-900 dark:text-white ${task.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span className={new Date(task.dueDate) < new Date() && task.status !== 'Done' ? 'text-red-500 font-medium' : ''}>
                            {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-x-4">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenTaskModal(task)} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit Project</h2>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  required
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData({...projectFormData, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={3}
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData({...projectFormData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={projectFormData.status}
                    onChange={(e) => setProjectFormData({...projectFormData, status: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={projectFormData.priority}
                    onChange={(e) => setProjectFormData({...projectFormData, priority: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    value={projectFormData.startDate}
                    onChange={(e) => setProjectFormData({...projectFormData, startDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                  <input
                    type="date"
                    value={projectFormData.dueDate}
                    onChange={(e) => setProjectFormData({...projectFormData, dueDate: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  />
                </div>
              </div>

              {/* Progress Slider */}
              <div>
                <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span>Manual Progress Override</span>
                  <span>{projectFormData.progress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={projectFormData.progress}
                  onChange={(e) => setProjectFormData({...projectFormData, progress: parseInt(e.target.value)})}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2 dark:bg-gray-700"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Note: Progress is normally calculated automatically from tasks, but you can override it here.
                </p>
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
              {editingTask ? 'Edit Task' : 'Add Task'}
            </h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                  type="text"
                  required
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  rows={2}
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) => setTaskFormData({...taskFormData, status: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) => setTaskFormData({...taskFormData, priority: e.target.value})}
                    className="mt-1 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Due Date</label>
                <input
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                  className="mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-700 dark:text-white dark:ring-gray-600"
                />
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
