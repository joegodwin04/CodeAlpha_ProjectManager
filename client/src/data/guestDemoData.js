/**
 * guestDemoData.js
 *
 * Static demo data for Guest / Preview mode.
 * - No real user IDs, emails, or tokens.
 * - Never inserted into PostgreSQL.
 * - Used purely on the frontend to demonstrate the application's UI.
 *
 * Shape notes:
 *   - GUEST_PROJECTS_WITH_TASKS  — used by ProjectDetails (includes Tasks array)
 *   - GUEST_PROJECTS             — used by Projects list / Dashboard (no Tasks array needed)
 *   - GUEST_TASKS                — used by Tasks page / Dashboard (includes Project object)
 *   - GUEST_STATS                — used by Sidebar productivity card
 */

/** Tasks embedded inside each demo project (for ProjectDetails page) */
const PROJECT_TASKS = {
  'demo-p1': [
    {
      id: 'demo-t1',
      title: 'Redesign product listing cards',
      description: 'Update card layout with larger thumbnails and cleaner CTA hierarchy.',
      status: 'Done',
      priority: 'High',
      dueDate: '2026-08-20',
      projectId: 'demo-p1',
      createdAt: '2026-07-10T09:00:00Z',
      updatedAt: '2026-08-19T17:00:00Z',
    },
    {
      id: 'demo-t2',
      title: 'Improve mobile checkout flow',
      description: 'Reduce checkout steps from 5 to 3. Add Apple Pay and Google Pay.',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-09-15',
      projectId: 'demo-p1',
      createdAt: '2026-08-01T09:00:00Z',
      updatedAt: '2026-09-05T14:00:00Z',
    },
    {
      id: 'demo-t3',
      title: 'Integrate new design tokens',
      description: 'Apply v2.0 color and spacing tokens across all storefront components.',
      status: 'Todo',
      priority: 'Medium',
      dueDate: '2026-09-28',
      projectId: 'demo-p1',
      createdAt: '2026-08-10T10:00:00Z',
      updatedAt: '2026-08-10T10:00:00Z',
    },
  ],
  'demo-p2': [
    {
      id: 'demo-t4',
      title: 'Set up React Native project scaffold',
      description: 'Initialize monorepo, configure Metro bundler, and set up CI/CD pipelines.',
      status: 'Done',
      priority: 'High',
      dueDate: '2026-08-10',
      projectId: 'demo-p2',
      createdAt: '2026-08-01T09:00:00Z',
      updatedAt: '2026-08-09T18:00:00Z',
    },
    {
      id: 'demo-t5',
      title: 'Implement push notification service',
      description: 'Integrate Firebase Cloud Messaging for both iOS and Android.',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-09-20',
      projectId: 'demo-p2',
      createdAt: '2026-08-15T09:00:00Z',
      updatedAt: '2026-09-04T11:00:00Z',
    },
    {
      id: 'demo-t6',
      title: 'Build offline-mode data sync',
      description: 'Cache critical data locally with SQLite and sync on reconnect.',
      status: 'Todo',
      priority: 'Medium',
      dueDate: '2026-10-05',
      projectId: 'demo-p2',
      createdAt: '2026-08-20T10:00:00Z',
      updatedAt: '2026-08-20T10:00:00Z',
    },
  ],
  'demo-p3': [
    {
      id: 'demo-t7',
      title: 'Define API Gateway architecture',
      description: 'Document routing strategies, auth middleware, and rate-limit policies.',
      status: 'In Progress',
      priority: 'High',
      dueDate: '2026-09-20',
      projectId: 'demo-p3',
      createdAt: '2026-09-02T09:00:00Z',
      updatedAt: '2026-09-06T16:00:00Z',
    },
    {
      id: 'demo-t8',
      title: 'Migrate Auth Service',
      description: 'Port legacy auth endpoints to new gateway with JWT refresh token support.',
      status: 'Todo',
      priority: 'High',
      dueDate: '2026-10-01',
      projectId: 'demo-p3',
      createdAt: '2026-09-05T09:00:00Z',
      updatedAt: '2026-09-05T09:00:00Z',
    },
  ],
  'demo-p4': [
    {
      id: 'demo-t4a',
      title: 'Define design token system',
      description: 'Create color, spacing, radius, and typography tokens.',
      status: 'Done',
      priority: 'High',
      dueDate: '2026-05-20',
      projectId: 'demo-p4',
      createdAt: '2026-05-01T09:00:00Z',
      updatedAt: '2026-05-19T18:00:00Z',
    },
    {
      id: 'demo-t4b',
      title: 'Publish Storybook documentation',
      description: 'Document all 40+ components with live playground and accessibility notes.',
      status: 'Done',
      priority: 'Medium',
      dueDate: '2026-07-20',
      projectId: 'demo-p4',
      createdAt: '2026-06-01T09:00:00Z',
      updatedAt: '2026-07-20T17:00:00Z',
    },
  ],
  'demo-p5': [
    {
      id: 'demo-t9',
      title: 'Design dashboard wireframes',
      description: 'Create lo-fi wireframes for revenue, cohort, and funnel views.',
      status: 'Done',
      priority: 'Medium',
      dueDate: '2026-07-01',
      projectId: 'demo-p5',
      createdAt: '2026-06-10T09:00:00Z',
      updatedAt: '2026-06-30T17:00:00Z',
    },
    {
      id: 'demo-t10',
      title: 'Implement revenue metrics API',
      description: 'Expose daily/monthly revenue endpoints with date-range filtering.',
      status: 'Todo',
      priority: 'Low',
      dueDate: '2026-11-01',
      projectId: 'demo-p5',
      createdAt: '2026-07-01T09:00:00Z',
      updatedAt: '2026-07-01T09:00:00Z',
    },
  ],
};

/** Projects with embedded Tasks — used by ProjectDetails page */
export const GUEST_PROJECTS_WITH_TASKS = [
  {
    id: 'demo-p1',
    title: 'E-Commerce Platform Redesign',
    description:
      'Redesign the storefront UX, improve mobile checkout flow, and integrate the new design system across all product pages.',
    status: 'Active',
    priority: 'High',
    progress: 68,
    startDate: '2026-07-01',
    dueDate: '2026-09-30',
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-09-05T14:22:00Z',
    Tasks: PROJECT_TASKS['demo-p1'],
  },
  {
    id: 'demo-p2',
    title: 'Mobile App — iOS & Android',
    description:
      'Build cross-platform mobile app with React Native. Deliver core features: notifications, offline mode, and dashboard analytics.',
    status: 'Active',
    priority: 'High',
    progress: 42,
    startDate: '2026-08-01',
    dueDate: '2026-11-15',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-09-06T11:05:00Z',
    Tasks: PROJECT_TASKS['demo-p2'],
  },
  {
    id: 'demo-p3',
    title: 'API Gateway Consolidation',
    description:
      'Migrate 12 legacy microservices to a unified API Gateway. Implement rate limiting, auth middleware, and improved observability.',
    status: 'Planning',
    priority: 'Medium',
    progress: 15,
    startDate: '2026-09-15',
    dueDate: '2026-12-01',
    createdAt: '2026-09-01T08:00:00Z',
    updatedAt: '2026-09-07T09:00:00Z',
    Tasks: PROJECT_TASKS['demo-p3'],
  },
  {
    id: 'demo-p4',
    title: 'Design System v2.0',
    description:
      'Publish a fully-documented component library. Cover color tokens, typography, spacing, icons, and accessible interactive components.',
    status: 'Completed',
    priority: 'Medium',
    progress: 100,
    startDate: '2026-05-01',
    dueDate: '2026-07-31',
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
    Tasks: PROJECT_TASKS['demo-p4'],
  },
  {
    id: 'demo-p5',
    title: 'Internal Analytics Dashboard',
    description:
      'Build a real-time analytics dashboard with revenue metrics, user cohorts, funnel analysis, and exportable reports.',
    status: 'On Hold',
    priority: 'Low',
    progress: 30,
    startDate: '2026-06-01',
    dueDate: '2026-10-31',
    createdAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-08-15T16:00:00Z',
    Tasks: PROJECT_TASKS['demo-p5'],
  },
];

/** Projects without embedded Tasks — used by Projects list, Dashboard, Sidebar */
export const GUEST_PROJECTS = GUEST_PROJECTS_WITH_TASKS.map(({ Tasks: _tasks, ...p }) => p);

/** Flat task list with Project object — used by Tasks page and Dashboard */
export const GUEST_TASKS = [
  ...PROJECT_TASKS['demo-p1'].map((t) => ({
    ...t,
    Project: { id: 'demo-p1', title: 'E-Commerce Platform Redesign' },
  })),
  ...PROJECT_TASKS['demo-p2'].map((t) => ({
    ...t,
    Project: { id: 'demo-p2', title: 'Mobile App — iOS & Android' },
  })),
  ...PROJECT_TASKS['demo-p3'].map((t) => ({
    ...t,
    Project: { id: 'demo-p3', title: 'API Gateway Consolidation' },
  })),
  ...PROJECT_TASKS['demo-p4'].map((t) => ({
    ...t,
    Project: { id: 'demo-p4', title: 'Design System v2.0' },
  })),
  ...PROJECT_TASKS['demo-p5'].map((t) => ({
    ...t,
    Project: { id: 'demo-p5', title: 'Internal Analytics Dashboard' },
  })),
];

/** Pre-computed sidebar/header stats for guest mode */
export const GUEST_STATS = {
  projects: {
    total: GUEST_PROJECTS.length,
    active: GUEST_PROJECTS.filter((p) => p.status === 'Active').length,
    completed: GUEST_PROJECTS.filter((p) => p.status === 'Completed').length,
  },
  tasks: {
    total: GUEST_TASKS.length,
    completed: GUEST_TASKS.filter((t) => t.status === 'Done').length,
    inProgress: GUEST_TASKS.filter((t) => t.status === 'In Progress').length,
  },
};
