import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import Layout from './components/Layout';

/**
 * ProtectedRoute — guards routes that require a *real* authenticated session.
 * Guests (isGuest === true) are NOT allowed through here — use WorkspaceRoute instead.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-bg text-slate-400">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

/**
 * WorkspaceRoute — allows both authenticated users AND guests.
 * Unauthenticated visitors with no guest flag are still redirected to Login.
 */
const WorkspaceRoute = ({ children }) => {
  const { user, loading, isGuest } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-bg text-slate-400">Loading…</div>;
  if (!user && !isGuest) return <Navigate to="/login" replace />;

  return children;
};

/**
 * PublicOnlyRoute — redirects authenticated users / guests away from auth pages.
 * Prevents a logged-in user from seeing the Login page.
 */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading, isGuest } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center bg-bg text-slate-400">Loading…</div>;
  if (user || isGuest) return <Navigate to="/" replace />;

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public auth pages — redirect away if already authenticated/guest */}
      <Route path="/login"          element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/register"       element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Workspace routes — accessible by authenticated users AND guests */}
      <Route path="/" element={
        <WorkspaceRoute>
          <Layout><Dashboard /></Layout>
        </WorkspaceRoute>
      } />
      <Route path="/projects" element={
        <WorkspaceRoute>
          <Layout><Projects /></Layout>
        </WorkspaceRoute>
      } />
      <Route path="/projects/:id" element={
        <WorkspaceRoute>
          <Layout><ProjectDetails /></Layout>
        </WorkspaceRoute>
      } />
      <Route path="/tasks" element={
        <WorkspaceRoute>
          <Layout><Tasks /></Layout>
        </WorkspaceRoute>
      } />

      {/* Profile — real auth only, guests redirected to login */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
