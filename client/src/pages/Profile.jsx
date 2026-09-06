import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, FolderKanban, CheckCircle, Loader2, HelpCircle, KeyRound } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SECURITY_QUESTIONS } from './Register';

const inputClass = "block w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors";
const selectClass = "block w-full rounded-lg border border-white/[0.08] bg-[#161922] py-2.5 pl-10 pr-8 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors cursor-pointer";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState({ projects: 0, completedTasks: 0 });
  const [loading, setLoading] = useState(true);
  const [currentSecurityQuestion, setCurrentSecurityQuestion] = useState(user?.securityQuestion || '');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
    securityQuestion: '',
    securityAnswer: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setStats(data.stats);
        if (data.user?.securityQuestion) {
          setCurrentSecurityQuestion(data.user.securityQuestion);
        }
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

    if (formData.password && formData.password.length < 6) {
      return setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      return setMessage({ type: 'error', text: 'Passwords do not match.' });
    }

    if ((formData.securityQuestion && !formData.securityAnswer.trim()) || 
        (!formData.securityQuestion && formData.securityAnswer.trim())) {
      return setMessage({ 
        type: 'error', 
        text: 'Both a security question and an answer are required to update your security settings.' 
      });
    }

    setSaving(true);
    try {
      const updateData = { name: formData.name, email: formData.email };
      if (formData.password) updateData.password = formData.password;
      if (formData.securityQuestion && formData.securityAnswer.trim()) {
        updateData.securityQuestion = formData.securityQuestion;
        updateData.securityAnswer = formData.securityAnswer.trim();
      }

      const { data } = await api.put('/users/profile', updateData);
      if (updateUser) {
        updateUser(data);
      } else {
        localStorage.setItem('user', JSON.stringify(data));
      }

      if (data.securityQuestion) {
        setCurrentSecurityQuestion(data.securityQuestion);
      }

      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      setFormData(prev => ({ 
        ...prev, 
        password: '', 
        confirmPassword: '',
        securityQuestion: '',
        securityAnswer: ''
      }));
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card */}
        <div className="rounded-xl border border-white/[0.06] bg-surface p-6 h-fit">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-2xl font-bold text-white shadow-lg shadow-violet-500/20">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-white">{user?.name}</h2>
              <p className="truncate text-sm text-slate-500">@{user?.username}</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t border-white/[0.06] pt-6">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Workspace Stats</h3>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <FolderKanban className="h-4 w-4 text-violet-400" /> Projects
              </span>
              <span className="text-sm font-semibold text-white tabular-nums">{stats.projects}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="h-4 w-4 text-emerald-400" /> Tasks Completed
              </span>
              <span className="text-sm font-semibold text-white tabular-nums">{stats.completedTasks}</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 rounded-xl border border-white/[0.06] bg-surface p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-slate-200 mb-6">Personal Information</h3>

          {message.text && (
            <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <input id="profile-name" type="text" name="name" value={formData.name}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-600" />
                </div>
                <input id="profile-email" type="email" name="email" value={formData.email}
                  onChange={handleChange} className={inputClass} />
              </div>
            </div>

            <div className="border-t border-white/[0.06] pt-6 mt-6">
              <h4 className="text-sm font-medium text-slate-200 mb-1">Security</h4>
              <p className="text-xs text-slate-500 mb-5">Leave the fields blank to keep your current password.</p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Shield className="h-4 w-4 text-slate-600" />
                    </div>
                    <input id="new-password" type="password" name="password" value={formData.password}
                      onChange={handleChange} className={inputClass} placeholder="Min. 6 characters" />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <Shield className="h-4 w-4 text-slate-600" />
                    </div>
                    <input id="confirm-password" type="password" name="confirmPassword" value={formData.confirmPassword}
                      onChange={handleChange} className={inputClass} placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>

            {/* Account Security (Security Question) */}
            <div className="border-t border-white/[0.06] pt-6 mt-6">
              <h4 className="text-sm font-medium text-slate-200 mb-1">Account Security</h4>
              <p className="text-xs text-slate-500 mb-4">
                Used to verify your identity if you ever need to reset your password.
              </p>

              <div className="mb-4 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5">
                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider block mb-1">
                  Current Recovery Question
                </span>
                <p className="text-sm font-medium text-slate-200">
                  {currentSecurityQuestion || (
                    <span className="text-amber-400/90 font-normal italic">
                      No security question configured yet. Select one below to protect your account.
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="profile-security-question" className="block text-sm font-medium text-slate-300 mb-1.5">
                    {currentSecurityQuestion ? 'Update Security Question' : 'Configure Security Question'}
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                      <HelpCircle className="h-4 w-4 text-slate-600" />
                    </div>
                    <select
                      id="profile-security-question"
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleChange}
                      className={selectClass}
                    >
                      <option value="" className="bg-[#1a1d27] text-slate-400">
                        {currentSecurityQuestion ? '-- Keep current question --' : '-- Choose a security question --'}
                      </option>
                      {SECURITY_QUESTIONS.map((q, idx) => (
                        <option key={idx} value={q} className="bg-[#1a1d27] text-slate-200">
                          {q}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.securityQuestion && (
                  <div>
                    <label htmlFor="profile-security-answer" className="block text-sm font-medium text-slate-300 mb-1.5">
                      New Security Answer
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                        <KeyRound className="h-4 w-4 text-slate-600" />
                      </div>
                      <input
                        id="profile-security-answer"
                        type="text"
                        name="securityAnswer"
                        value={formData.securityAnswer}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="Enter new secret answer"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Answers are encrypted before saving. Your existing answer is never displayed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button type="submit" disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
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
