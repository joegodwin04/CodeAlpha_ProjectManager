import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FolderKanban, CheckSquare, AlertTriangle, ArrowRight, Plus,
  TrendingUp, Clock, Target, Zap, CheckCircle2, Calendar, Layers
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import PriorityBadge from '../components/ui/PriorityBadge';
import ProgressBar from '../components/ui/ProgressBar';
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { format, isAfter, parseISO, addDays } from 'date-fns';

/* ─── Chart palette ─── */
const TASK_COLORS   = { Todo: '#64748b', 'In Progress': '#8b5cf6', Done: '#10b981' };
const PROJECT_COLORS = { Planning: '#64748b', Active: '#8b5cf6', 'On Hold': '#f59e0b', Completed: '#10b981' };

/* ─── Dark tooltip ─── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg bg-[#232738] border border-white/[0.08] px-3 py-2.5 shadow-xl text-xs">
      {label && <p className="font-medium text-slate-400 mb-1.5">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold text-slate-200 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color || p.fill }} />
          <span style={{ color: p.color || p.fill }}>{p.name || p.dataKey}:</span>
          <span className="text-slate-200">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

/* ─── Custom legend ─── */
const DarkLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
    {payload?.map((entry, i) => (
      <span key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
        {entry.value}
      </span>
    ))}
  </div>
);

/* ─── Donut Chart with centered label overlay ─── */
const DonutChart = ({ data, colors, total, centerLabel = 'Total', height = 240 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-600" style={{ height }}>
        <Layers className="h-8 w-8 opacity-30" />
        <p className="text-sm">No data yet</p>
      </div>
    );
  }
  return (
    <div className="relative" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="46%"
            innerRadius="52%"
            outerRadius="70%"
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={colors[entry.name] || '#8b5cf6'} />
            ))}
          </Pie>
          <RechartsTooltip content={<DarkTooltip />} />
          <Legend content={<DarkLegend />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Perfectly-centered overlay text — reliable across all breakpoints */}
      <div
        className="absolute pointer-events-none"
        style={{ top: 0, left: 0, right: 0, height: '78%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="text-center leading-none">
          <p className="text-[28px] font-bold text-white tabular-nums">{total}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-medium uppercase tracking-wide">{centerLabel}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── KPI Stat Card ─── */
const KpiCard = ({ icon: Icon, label, value, sub, iconColor, iconBg, accentColor }) => (
  <div className="rounded-xl bg-surface border border-white/[0.06] p-5 flex flex-col gap-4 hover:border-white/[0.10] transition-all">
    <div className="flex items-center justify-between">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      {accentColor && (
        <div className={`h-1.5 w-1.5 rounded-full ${accentColor} ring-4 ring-current ring-opacity-20`} />
      )}
    </div>
    <div>
      <p className="text-[28px] font-bold text-white tabular-nums leading-none">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─── Section header helper ─── */
const SectionHeader = ({ title, sub, to, linkLabel = 'View all' }) => (
  <div className="flex items-end justify-between border-b border-white/[0.06] px-5 py-4 shrink-0">
    <div>
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    {to && (
      <Link to={to} className="flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors">
        {linkLabel} <ArrowRight className="h-3 w-3" />
      </Link>
    )}
  </div>
);

/* ─── Chart Card wrapper ─── */
const ChartCard = ({ title, sub, children, minHeight = 300 }) => (
  <div className="rounded-xl bg-surface border border-white/[0.06] flex flex-col overflow-hidden" style={{ minHeight }}>
    <div className="px-5 pt-5 pb-1 shrink-0">
      <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
    <div className="flex-1 min-h-0 px-2 pb-4">
      {children}
    </div>
  </div>
);

/* ─── Empty state for lists ─── */
const ListEmpty = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-600">
    <Icon className="h-7 w-7 opacity-30" />
    <p className="text-sm">{text}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks'),
        ]);
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

  /* ─── Derived stats ─── */
  const totalTasks      = tasks.length;
  const doneTasks       = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks       = tasks.filter(t => t.status === 'Todo').length;
  const completionRate  = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(t => t.status !== 'Done' && t.dueDate && new Date(t.dueDate) < today);

  const activeProjects    = projects.filter(p => p.status === 'Active').length;
  const completedProjects = projects.filter(p => p.status === 'Completed').length;
  const planningProjects  = projects.filter(p => p.status === 'Planning').length;
  const onHoldProjects    = projects.filter(p => p.status === 'On Hold').length;

  /* ─── Recent tasks (5 most recently updated) ─── */
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 6);

  /* ─── Upcoming deadlines — not-Done tasks with future due dates, sorted nearest first ─── */
  const upcomingDeadlines = tasks
    .filter(t => t.status !== 'Done' && t.dueDate)
    .map(t => ({ ...t, dueDateObj: new Date(t.dueDate) }))
    .filter(t => isAfter(t.dueDateObj, new Date(today.getTime() - 86400000))) // include today
    .sort((a, b) => a.dueDateObj - b.dueDateObj)
    .slice(0, 6);

  /* ─── Chart data ─── */
  const taskStatusData = [
    { name: 'Todo',        value: todoTasks },
    { name: 'In Progress', value: inProgressTasks },
    { name: 'Done',        value: doneTasks },
  ].filter(d => d.value > 0);

  const projectStatusData = [
    { name: 'Planning',  value: planningProjects },
    { name: 'Active',    value: activeProjects },
    { name: 'On Hold',   value: onHoldProjects },
    { name: 'Completed', value: completedProjects },
  ].filter(d => d.value > 0);

  /* Active project progress — top 6 by progress, exclude Completed */
  const projectProgressData = projects
    .filter(p => p.status !== 'Completed')
    .map(p => ({
      name: p.title.length > 20 ? p.title.substring(0, 20) + '…' : p.title,
      progress: p.progress ?? 0,
    }))
    .sort((a, b) => b.progress - a.progress)
    .slice(0, 6);

  /* Priority distribution */
  const priorityData = [
    {
      name: 'High',
      Active: tasks.filter(t => t.priority === 'High' && t.status !== 'Done').length,
      Done:   tasks.filter(t => t.priority === 'High' && t.status === 'Done').length,
    },
    {
      name: 'Medium',
      Active: tasks.filter(t => t.priority === 'Medium' && t.status !== 'Done').length,
      Done:   tasks.filter(t => t.priority === 'Medium' && t.status === 'Done').length,
    },
    {
      name: 'Low',
      Active: tasks.filter(t => t.priority === 'Low' && t.status !== 'Done').length,
      Done:   tasks.filter(t => t.priority === 'Low' && t.status === 'Done').length,
    },
  ];

  const isOverdue = (task) => task.dueDate && new Date(task.dueDate) < today && task.status !== 'Done';

  return (
    <div className="space-y-6 pb-8 animate-fade-in">

      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here's what's happening across your workspace today.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 transition-all w-fit"
        >
          <Plus className="h-4 w-4" /> New Project
        </Link>
      </div>

      {/* ═══ ROW 1: KPI CARDS ═══ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={CheckCircle2}
          label="Task Completion"
          value={`${completionRate}%`}
          sub={`${doneTasks} of ${totalTasks} tasks done`}
          iconColor="text-emerald-400"
          iconBg="bg-emerald-500/15"
          accentColor="bg-emerald-400"
        />
        <KpiCard
          icon={Zap}
          label="In Progress"
          value={inProgressTasks}
          sub={`${todoTasks} tasks still to do`}
          iconColor="text-violet-400"
          iconBg="bg-violet-500/15"
          accentColor="bg-violet-400"
        />
        <KpiCard
          icon={FolderKanban}
          label="Active Projects"
          value={activeProjects}
          sub={`${projects.length} total · ${completedProjects} completed`}
          iconColor="text-blue-400"
          iconBg="bg-blue-500/15"
          accentColor="bg-blue-400"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Overdue Tasks"
          value={overdueTasks.length}
          sub={overdueTasks.length === 0 ? 'All tasks on track' : 'Need attention'}
          iconColor={overdueTasks.length > 0 ? 'text-red-400' : 'text-slate-400'}
          iconBg={overdueTasks.length > 0 ? 'bg-red-500/15' : 'bg-slate-500/10'}
          accentColor={overdueTasks.length > 0 ? 'bg-red-400' : undefined}
        />
      </div>

      {/* ═══ ROW 2: DONUT CHARTS ═══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Task Status Overview" sub={`${totalTasks} total tasks`} minHeight={320}>
          <DonutChart
            data={taskStatusData}
            colors={TASK_COLORS}
            total={totalTasks}
            centerLabel="Tasks"
            height={270}
          />
        </ChartCard>

        <ChartCard title="Project Status Overview" sub={`${projects.length} total projects`} minHeight={320}>
          <DonutChart
            data={projectStatusData}
            colors={PROJECT_COLORS}
            total={projects.length}
            centerLabel="Projects"
            height={270}
          />
        </ChartCard>
      </div>

      {/* ═══ ROW 3: BAR CHARTS ═══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Active Project Progress */}
        <ChartCard title="Active Project Progress" sub="Completion by project" minHeight={300}>
          {projectProgressData.length > 0 ? (
            <div className="h-full" style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={projectProgressData}
                  layout="vertical"
                  margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={120}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    content={<DarkTooltip />}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    formatter={(value) => [`${value}%`, 'Progress']}
                  />
                  <Bar dataKey="progress" name="Progress" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ListEmpty icon={FolderKanban} text="No active projects" />
          )}
        </ChartCard>

        {/* Tasks by Priority */}
        <ChartCard title="Tasks by Priority" sub="Active vs completed" minHeight={300}>
          {totalTasks > 0 ? (
            <div style={{ minHeight: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={priorityData}
                  margin={{ top: 4, right: 8, left: -16, bottom: 4 }}
                  barGap={3}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <RechartsTooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Legend content={<DarkLegend />} />
                  <Bar dataKey="Active" name="Active" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="Done"   name="Done"   fill="#10b981" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ListEmpty icon={CheckSquare} text="No tasks yet" />
          )}
        </ChartCard>
      </div>

      {/* ═══ ROW 4: RECENT TASKS + UPCOMING DEADLINES ═══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Tasks */}
        <div className="rounded-xl bg-surface border border-white/[0.06] flex flex-col overflow-hidden">
          <SectionHeader title="Recent Activity" sub="Latest task updates" to="/tasks" linkLabel="View all" />
          {recentTasks.length === 0 ? (
            <ListEmpty icon={CheckSquare} text="No tasks yet" />
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {recentTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                  {/* Status dot */}
                  <div className={`h-2 w-2 rounded-full shrink-0 ${
                    task.status === 'Done' ? 'bg-emerald-400' :
                    task.status === 'In Progress' ? 'bg-violet-400' : 'bg-slate-500'
                  }`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${task.status === 'Done' ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">
                      {task.Project?.title || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-xl bg-surface border border-white/[0.06] flex flex-col overflow-hidden">
          <SectionHeader title="Upcoming Deadlines" sub="Tasks due soon" to="/tasks" linkLabel="View all" />
          {upcomingDeadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-600">
              <Calendar className="h-7 w-7 opacity-30" />
              <p className="text-sm">No upcoming deadlines</p>
              <p className="text-xs text-slate-700">All clear — great job staying on top of things!</p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {upcomingDeadlines.map((task) => {
                const daysLeft = Math.ceil((task.dueDateObj - new Date()) / 86400000);
                const isUrgent = daysLeft <= 2;
                const isDue    = daysLeft <= 0;
                return (
                  <li key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      isDue    ? 'bg-red-500/20 text-red-400' :
                      isUrgent ? 'bg-amber-500/15 text-amber-400' :
                                 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {isDue ? '!' : `${daysLeft}d`}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-600 truncate">{task.Project?.title || ''}</span>
                        <span className={`flex items-center gap-1 text-xs ${
                          isDue ? 'text-red-400 font-medium' : isUrgent ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          <Clock className="h-3 w-3" />
                          {format(task.dueDateObj, 'MMM d, yyyy')}
                          {isDue && ' · Overdue'}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <PriorityBadge priority={task.priority} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ═══ ROW 5: RECENT PROJECTS + PROJECT SUMMARY ═══ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Recent Projects */}
        <div className="rounded-xl bg-surface border border-white/[0.06] flex flex-col overflow-hidden">
          <SectionHeader title="Recent Projects" to="/projects" linkLabel="View all" />
          {projects.length === 0 ? (
            <ListEmpty icon={FolderKanban} text="No projects yet — create your first one!" />
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {[...projects]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map((project) => (
                  <li key={project.id}>
                    <Link
                      to={`/projects/${project.id}`}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-200">{project.title}</p>
                        <div className="mt-0.5">
                          <StatusBadge status={project.status} />
                        </div>
                      </div>
                      <div className="w-28 shrink-0">
                        <ProgressBar value={project.progress ?? 0} size="sm" showLabel={true} />
                      </div>
                    </Link>
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* Project Summary */}
        <div className="rounded-xl bg-surface border border-white/[0.06] flex flex-col overflow-hidden">
          <SectionHeader title="Project Summary" sub="Status breakdown" />
          <div className="flex-1 px-5 py-4 space-y-3">
            {[
              { label: 'Active',    value: activeProjects,    color: 'bg-blue-500',    text: 'text-blue-400' },
              { label: 'Planning',  value: planningProjects,  color: 'bg-slate-500',   text: 'text-slate-400' },
              { label: 'On Hold',   value: onHoldProjects,    color: 'bg-amber-500',   text: 'text-amber-400' },
              { label: 'Completed', value: completedProjects, color: 'bg-emerald-500', text: 'text-emerald-400' },
            ].map((row) => {
              const pct = projects.length > 0 ? Math.round((row.value / projects.length) * 100) : 0;
              return (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${row.color}`} />
                      <span className="text-sm text-slate-400">{row.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold tabular-nums ${row.text}`}>{row.value}</span>
                      <span className="text-xs text-slate-600 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color} transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="flex items-center justify-center py-8 text-slate-600 text-sm">
                No projects yet
              </div>
            )}

            {/* Totals footer */}
            {projects.length > 0 && (
              <div className="pt-3 mt-1 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-xs text-slate-500">Total projects</span>
                <span className="text-sm font-bold text-white tabular-nums">{projects.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
