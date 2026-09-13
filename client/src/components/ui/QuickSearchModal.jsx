import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FolderKanban, CheckSquare, ArrowRight, X, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { GUEST_PROJECTS, GUEST_TASKS } from '../../data/guestDemoData';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';

const QuickSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isGuest } = useAuth();

  const [query, setQuery] = useState('');
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const cachedDataRef = useRef(null);

  // Fetch data when modal opens
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
      return;
    }

    // Auto-focus input on open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const loadSearchData = async () => {
      if (isGuest) {
        setProjects(GUEST_PROJECTS);
        setTasks(GUEST_TASKS);
        return;
      }

      // If cached recently, use cache first
      if (cachedDataRef.current) {
        setProjects(cachedDataRef.current.projects);
        setTasks(cachedDataRef.current.tasks);
      }

      setLoading(!cachedDataRef.current);
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks')
        ]);
        setProjects(projectsRes.data || []);
        setTasks(tasksRes.data || []);
        cachedDataRef.current = {
          projects: projectsRes.data || [],
          tasks: tasksRes.data || []
        };
      } catch (err) {
        console.error('Failed to load search data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSearchData();
  }, [isOpen, isGuest]);

  // Filter items based on query
  const { filteredProjects, filteredTasks, flattenedList } = useMemo(() => {
    const q = query.trim().toLowerCase();

    let matchedProjects = [];
    let matchedTasks = [];

    if (!q) {
      // Default: show up to 4 recent projects and 4 tasks
      matchedProjects = projects.slice(0, 4);
      matchedTasks = tasks.filter(t => t.status !== 'Done').slice(0, 4);
    } else {
      matchedProjects = projects.filter(p =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.status && p.status.toLowerCase().includes(q))
      );

      matchedTasks = tasks.filter(t =>
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.status && t.status.toLowerCase().includes(q)) ||
        (t.priority && t.priority.toLowerCase().includes(q)) ||
        (t.User?.name && t.User.name.toLowerCase().includes(q))
      );
    }

    const flat = [
      ...matchedProjects.map(p => ({ type: 'project', item: p })),
      ...matchedTasks.map(t => ({ type: 'task', item: t }))
    ];

    return {
      filteredProjects: matchedProjects,
      filteredTasks: matchedTasks,
      flattenedList: flat
    };
  }, [query, projects, tasks]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keep selected element visible when navigating with arrow keys
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const selectedEl = resultsContainerRef.current.querySelector('[data-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (flattenedList.length > 0) {
        setSelectedIndex(prev => (prev + 1) % flattenedList.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (flattenedList.length > 0) {
        setSelectedIndex(prev => (prev - 1 + flattenedList.length) % flattenedList.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedList.length > 0 && flattenedList[selectedIndex]) {
        handleSelectItem(flattenedList[selectedIndex]);
      }
    }
  };

  const handleSelectItem = (entry) => {
    onClose();
    if (entry.type === 'project') {
      navigate(`/projects/${entry.item.id}`);
    } else if (entry.type === 'task') {
      navigate(`/projects/${entry.item.projectId}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#121526] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="relative flex items-center border-b border-white/[0.08] px-4 py-3.5">
          <Search className="h-5 w-5 text-slate-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, assignees..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors mr-2 rounded"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-slate-400 border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search results body */}
        <div
          ref={resultsContainerRef}
          className="max-h-[60vh] overflow-y-auto p-2 divide-y divide-white/[0.04]"
        >
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent mb-2" />
              <p className="text-xs text-slate-400">Searching workspace...</p>
            </div>
          ) : flattenedList.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-300">No results found for "{query}"</p>
              <p className="mt-1 text-xs text-slate-500">Try searching for a different project, task, or team member.</p>
            </div>
          ) : (
            <>
              {/* Projects section */}
              {filteredProjects.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {query ? 'Projects' : 'Recent Projects'}
                  </div>
                  <div className="space-y-1">
                    {filteredProjects.map((project) => {
                      const flatIndex = flattenedList.findIndex(
                        f => f.type === 'project' && f.item.id === project.id
                      );
                      const isSelected = selectedIndex === flatIndex;

                      return (
                        <div
                          key={project.id}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ type: 'project', item: project })}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-violet-600/20 text-white shadow-sm ring-1 ring-violet-500/40'
                              : 'text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-slate-400 group-hover:text-slate-200'
                            }`}>
                              <FolderKanban className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate text-slate-100">
                                {project.title}
                              </p>
                              {project.description && (
                                <p className="text-xs text-slate-400 truncate max-w-md">
                                  {project.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <StatusBadge status={project.status} />
                            <ArrowRight className={`h-4 w-4 text-slate-500 transition-transform ${isSelected ? 'translate-x-0.5 text-violet-300' : 'opacity-0 group-hover:opacity-100'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tasks section */}
              {filteredTasks.length > 0 && (
                <div className="py-2">
                  <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {query ? 'Tasks' : 'Active Tasks'}
                  </div>
                  <div className="space-y-1">
                    {filteredTasks.map((task) => {
                      const flatIndex = flattenedList.findIndex(
                        f => f.type === 'task' && f.item.id === task.id
                      );
                      const isSelected = selectedIndex === flatIndex;

                      return (
                        <div
                          key={task.id}
                          data-selected={isSelected}
                          onClick={() => handleSelectItem({ type: 'task', item: task })}
                          onMouseEnter={() => setSelectedIndex(flatIndex)}
                          className={`group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-violet-600/20 text-white shadow-sm ring-1 ring-violet-500/40'
                              : 'text-slate-300 hover:bg-white/[0.04]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isSelected ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-slate-400 group-hover:text-slate-200'
                            }`}>
                              <CheckSquare className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                                {task.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                <span>{task.Project?.title || 'Project'}</span>
                                {task.User && (
                                  <>
                                    <span>·</span>
                                    <span className="inline-flex items-center gap-1 text-slate-400">
                                      <User className="h-3 w-3" />
                                      {task.User.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <PriorityBadge priority={task.priority} />
                            <StatusBadge status={task.status} />
                            <ArrowRight className={`h-4 w-4 text-slate-500 transition-transform ${isSelected ? 'translate-x-0.5 text-violet-300' : 'opacity-0 group-hover:opacity-100'}`} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center justify-between border-t border-white/[0.08] bg-[#0e1120] px-4 py-2.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-medium text-slate-400 border border-white/[0.08]">↑</kbd>
              <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-medium text-slate-400 border border-white/[0.08]">↓</kbd>
              <span className="text-slate-500 ml-0.5">to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-medium text-slate-400 border border-white/[0.08]">↵</kbd>
              <span className="text-slate-500 ml-0.5">to select</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 font-medium text-slate-400 border border-white/[0.08]">esc</kbd>
            <span className="text-slate-500 ml-0.5">to close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;
