import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User, Mail, Shield, FolderKanban, CheckCircle, Loader2,
  Settings, Lock, Activity, Calendar, HelpCircle, KeyRound, Check
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const inputClass =
  'block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all';

const TABS = ['Personal Info', 'Security'];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ projects: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
    securityAnswer: '',
  });
  const [securityQuestion, setSecurityQuestion] = useState(user?.securityQuestion || '');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setStats(data.stats);
        if (data.user?.securityQuestion) {
          setSecurityQuestion(data.user.securityQuestion);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!profileData.name.trim()) {
      return setMessage({ type: 'error', text: 'Full name is required.' });
    }
    if (!profileData.email.trim()) {
      return setMessage({ type: 'error', text: 'Email address is required.' });
    }

    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name: profileData.name.trim(),
        email: profileData.email.trim(),
      });
      if (updateUser) {
        updateUser(data);
      } else {
        localStorage.setItem('user', JSON.stringify(data));
      }

      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!passwordData.newPassword) {
      return setMessage({ type: 'error', text: 'New password is required.' });
    }
    if (passwordData.newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
    }
    if (!passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Please confirm your new password.' });
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New password and confirmation do not match.' });
    }
    if (!passwordData.securityAnswer.trim()) {
      return setMessage({ type: 'error', text: 'Security answer is required.' });
    }

    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        newPassword: passwordData.newPassword,
        securityAnswer: passwordData.securityAnswer.trim(),
      });

      setMessage({ type: 'success', text: data.message || 'Password updated successfully.' });
      setPasswordData({
        newPassword: '',
        confirmPassword: '',
        securityAnswer: '',
      });
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading account settings…" />;

  const initials = user?.name?.charAt(0)?.toUpperCase() || 'U';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6 pb-8 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 ring-1 ring-white/10">
          <Settings className="h-4.5 w-4.5 text-violet-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl leading-none">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage your account credentials and personal preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* ── Left column: avatar + metrics ─────────────────────────── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Avatar card */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-6 text-center shadow-sm">
            <div className="mx-auto mb-3.5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-violet-500/25 ring-2 ring-white/20">
              {initials}
            </div>
            <h2 className="text-base font-bold text-white truncate tracking-tight">{user?.name}</h2>
            <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">@{user?.username}</p>

            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-violet-300">
              <Shield className="h-3 w-3" />
              Pro Workspace
            </div>

            {memberSince && (
              <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-slate-500 border-t border-white/[0.05] pt-4">
                <Calendar className="h-3.5 w-3.5" />
                <span>Member since {memberSince}</span>
              </div>
            )}
          </div>

          {/* Activity / Productivity metrics card */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Activity className="h-3.5 w-3.5 text-violet-400" />
              Workspace Activity
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <FolderKanban className="h-3.5 w-3.5 text-blue-400" />
                  Projects
                </span>
                <span className="font-bold text-white tabular-nums">{stats.projects}</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                  Completed Tasks
                </span>
                <span className="font-bold text-white tabular-nums">{stats.completedTasks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: tabs + forms ────────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/[0.07] bg-[#121526] shadow-sm overflow-hidden">
            {/* Tab buttons */}
            <div className="flex border-b border-white/[0.07] bg-white/[0.01] px-6 pt-3">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    setMessage({ type: '', text: '' });
                  }}
                  className={`relative pb-3 px-4 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'text-violet-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Notification alert banner */}
            {message.text && (
              <div className="px-6 pt-5">
                <div
                  className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs sm:text-sm font-medium ${
                    message.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/25 text-rose-400'
                  }`}
                >
                  {message.type === 'success' ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                  ) : null}
                  <span>{message.text}</span>
                </div>
              </div>
            )}

            <div className="p-6">
              {/* ── Personal Info Tab ─────────────────────────────────── */}
              {activeTab === 'Personal Info' && (
                <form onSubmit={handleProfileSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="profile-name" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <User className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        id="profile-name"
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleProfileChange}
                        className={inputClass}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="profile-email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        id="profile-email"
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className={inputClass}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Username (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Username</label>
                    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5">
                      <span className="text-slate-500 text-sm font-semibold">@</span>
                      <span className="text-sm text-slate-300 font-medium">{user?.username}</span>
                      <span className="ml-auto rounded-md bg-white/[0.04] px-2 py-0.5 text-[11px] font-semibold text-slate-500 border border-white/[0.06]">
                        Read-only
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Security Tab ─────────────────────────────────────── */}
              {activeTab === 'Security' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <p className="text-xs sm:text-sm text-slate-400">
                    Update your password by answering your account's security verification question.
                  </p>

                  <div>
                    <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Lock className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        id="new-password"
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={inputClass}
                        placeholder="Enter new password (min. 6 characters)"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <Shield className="h-4 w-4 text-slate-500" />
                      </div>
                      <input
                        id="confirm-password"
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={inputClass}
                        placeholder="Re-enter your new password"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  {/* Security Verification */}
                  <div className="pt-3 border-t border-white/[0.06] space-y-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Security Verification
                      </label>
                      <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1.5">
                          <HelpCircle className="h-4 w-4 text-violet-400" /> Security Question
                        </div>
                        <p className="text-sm font-semibold text-white">
                          {securityQuestion || user?.securityQuestion || 'What was the name of your first school?'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="security-answer" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Security Answer
                      </label>
                      <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                          <KeyRound className="h-4 w-4 text-slate-500" />
                        </div>
                        <input
                          id="security-answer"
                          type="text"
                          name="securityAnswer"
                          value={passwordData.securityAnswer}
                          onChange={handlePasswordChange}
                          className={inputClass}
                          placeholder="Enter the answer you set during registration"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary"
                    >
                      {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {saving ? 'Updating…' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
