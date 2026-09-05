import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, FolderKanban, CheckCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const inputClass = "block w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-colors";

const Profile = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ projects: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: user?.name || '', email: user?.email || '',
    password: '', confirmPassword: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }
    setSaving(true);
    try {
      const updateData = { name: formData.name, email: formData.email };
      if (formData.password) updateData.password = formData.password;
      const { data } = await api.put('/users/profile', updateData);
      localStorage.setItem('user', JSON.stringify(data));
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      window.location.reload();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="truncate text-sm text-slate-500">@{user?.username}</p>
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <FolderKanban className="h-4 w-4 text-slate-400" /> Projects
              </span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{stats.projects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle className="h-4 w-4 text-slate-400" /> Tasks Completed
              </span>
              <span className="text-sm font-semibold text-slate-900 tabular-nums">{stats.completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-5">Edit Information</h3>

          {message.text && (
            <div className={`mb-5 rounded-lg border px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input id="profile-name" type="text" name="name" value={formData.name}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input id="profile-email" type="email" name="email" value={formData.email}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 mt-5">
              <h4 className="text-sm font-medium text-slate-900 mb-4">Change Password</h4>
              <p className="text-xs text-slate-500 mb-3">Leave blank to keep your current password.</p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Shield className="h-4 w-4 text-slate-400" />
                    </div>
                    <input id="new-password" type="password" name="password" value={formData.password}
                      onChange={handleChange} className={inputClass} placeholder="Min. 6 characters" />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Shield className="h-4 w-4 text-slate-400" />
                    </div>
                    <input id="confirm-password" type="password" name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} className={inputClass} placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
