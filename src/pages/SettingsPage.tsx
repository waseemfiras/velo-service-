import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lock, 
  User, 
  Settings, 
  Key, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Sparkles,
  Info,
  Globe
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { localChangePassword } from '../lib/localAuth';
import { useLanguage } from '../contexts/LanguageContext';

type SettingTab = 'account' | 'about' | 'general';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<SettingTab>('account');

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [customCursor, setCustomCursorState] = useState(() => {
    return localStorage.getItem('velo_enable_custom_cursor') !== 'false';
  });

  const handleToggleCursor = (enabled: boolean) => {
    setCustomCursorState(enabled);
    localStorage.setItem('velo_enable_custom_cursor', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('velo_cursor_changed'));
  };

  // Password strength checker helper
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(newPassword);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const isAr = language === 'ar';

    if (!user) {
      setError(isAr ? 'يرجى تسجيل الدخول أولاً لتغيير كلمة المرور.' : 'Please log in first to change your password.');
      return;
    }

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError(isAr ? 'يرجى ملء جميع الحقول المطلوبة.' : 'Please fill in all required fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError(isAr ? 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' : 'The new password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(isAr ? 'كلمة المرور الجديدة وتأكيدها غير متطابقين.' : 'The new password and confirmation do not match.');
      return;
    }

    if (strengthScore < 3) {
      setError(isAr 
        ? 'يرجى اختيار كلمة مرور أقوى تحتوي على أرقام وحروف ورموز خاصة.' 
        : 'Please choose a stronger password containing numbers, letters, and special symbols.'
      );
      return;
    }

    setLoading(true);
    const token = localStorage.getItem('velo_custom_token');

    try {
      if (!token) {
        throw new Error(isAr ? 'غير مصرح لك بالقيام بهذا الإجراء.' : 'You are not authorized to perform this action.');
      }

      // 1. Interacts with the secure backend change-password endpoint
      const response = await fetch('/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (isAr ? 'فشل تحديث كلمة المرور على الخادم.' : 'Failed to update password on the server.'));
      }

      // 2. Sync with local client auth storage to maintain offline/caching compatibility
      await localChangePassword(token, oldPassword, newPassword);

      setSuccess(isAr 
        ? 'تم تحديث كلمة المرور بنجاح وبشكل آمن على الخادم وقاعدة البيانات المحلية!' 
        : 'Password updated successfully and securely on both server and local cache!'
      );
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || (isAr ? 'فشل تغيير كلمة المرور، يرجى المحاولة لاحقاً.' : 'Failed to change password, please try again later.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Dynamic Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl transition-all group"
            >
              <ArrowLeft className="w-5 h-5 text-white/70 group-hover:text-white group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                All Settings
              </h1>
              <p className="text-sm text-white/50 mt-1">Customize your account, security, and profile details</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-sm text-white/70">
            <User className="w-4 h-4 text-emerald-400" />
            <span>{user ? user.email : 'Guest'}</span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                activeTab === 'account'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5" />
                <span className="font-semibold text-base">Security & Account</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                activeTab === 'about'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5" />
                <span className="font-semibold text-base">About You</span>
              </div>
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </button>

            <button
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                activeTab === 'general'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5" />
                <span className="font-semibold text-base">System Preferences</span>
              </div>
            </button>
          </div>

          {/* Right Content Area */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'account' && (
                <motion.div
                  key="account-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 relative"
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-400" />
                      Change Password (Secure System)
                    </h2>
                    <p className="text-sm text-white/50 mt-1">
                      Protect your account by creating a strong, complex password.
                    </p>
                  </div>

                  {!user ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
                      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                      <p className="font-semibold">Not Logged In</p>
                      <p className="text-sm text-white/60 mt-1">Please sign in or create an account to use this system.</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="space-y-6">
                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm text-left"
                          >
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{error}</span>
                          </motion.div>
                        )}

                        {success && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-2xl flex items-start gap-3 text-sm text-left"
                          >
                            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            <span>{success}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 text-left">
                          Current Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showOldPass ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/30 rounded-2xl px-4 py-3.5 pl-12 text-left outline-none transition-colors"
                            placeholder="Enter your current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPass(!showOldPass)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          >
                            {showOldPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 text-left">
                          New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPass ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/30 rounded-2xl px-4 py-3.5 pl-12 text-left outline-none transition-colors"
                            placeholder="Enter your new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          >
                            {showNewPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>

                        {/* Strong System - Realtime Strength Indicator */}
                        {newPassword && (
                          <div className="mt-3 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-white/40">Password Strength</span>
                              <span className={`font-semibold ${
                                strengthScore <= 1 ? 'text-red-400' :
                                strengthScore === 2 ? 'text-amber-400' :
                                strengthScore === 3 ? 'text-blue-400' : 'text-emerald-400'
                              }`}>
                                {strengthScore <= 1 ? 'Very Weak' :
                                 strengthScore === 2 ? 'Medium' :
                                 strengthScore === 3 ? 'Strong' : 'Excellent'}
                              </span>
                            </div>
                            
                            {/* Strength bar */}
                            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 1 ? 'bg-red-400' : ''}`} />
                              <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 2 ? 'bg-amber-400' : ''}`} />
                              <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 3 ? 'bg-blue-400' : ''}`} />
                              <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 4 ? 'bg-emerald-400' : ''}`} />
                            </div>

                            {/* Requirements list */}
                            <ul className="text-xs space-y-1.5 text-white/50">
                              <li className="flex items-center gap-2 justify-start">
                                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                <span>At least 6 characters</span>
                              </li>
                              <li className="flex items-center gap-2 justify-start">
                                <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                <span>Contains at least one uppercase letter (A-Z)</span>
                              </li>
                              <li className="flex items-center gap-2 justify-start">
                                <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                <span>Contains at least one number (0-9)</span>
                              </li>
                              <li className="flex items-center gap-2 justify-start">
                                <div className={`w-1.5 h-1.5 rounded-full ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                <span>Contains at least one special character (!@#$)</span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 text-left">
                          Confirm New Password *
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPass ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/30 rounded-2xl px-4 py-3.5 pl-12 text-left outline-none transition-colors"
                            placeholder="Re-enter your new password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                          >
                            {showConfirmPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-2xl py-4 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {loading ? 'Updating security...' : 'Update Password Securely'}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

              {activeTab === 'about' && (
                <motion.div
                  key="about-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 relative"
                >
                  <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-md rounded-3xl z-20 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                      <Lock className="w-7 h-7 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Add profile info (Coming Soon)</h3>
                    <p className="text-sm text-white/50 max-w-md mt-2 leading-relaxed">
                      We are working on developing a full profile and bio system to customize your experience. You will be able to edit this soon!
                    </p>
                    <span className="mt-4 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Coming Soon
                    </span>
                  </div>

                  {/* Dummy visual form layout underneath so it looks complete but locked */}
                  <div className="space-y-6 opacity-30 select-none text-left">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <User className="w-5 h-5 text-white" />
                        Profile & Bio Details
                      </h2>
                      <p className="text-sm text-white/50 mt-1">
                        Add information about yourself to enhance communication and personalization.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 text-left">Full Name</label>
                        <input disabled className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left outline-none" placeholder="e.g. Waseem Firas" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2 text-left">Phone Number</label>
                        <input disabled className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left outline-none" placeholder="+966 50 000 0000" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2 text-left">Bio Description</label>
                      <textarea disabled rows={3} className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-left outline-none resize-none" placeholder="Tell us more about your interests or field to get tailored services" />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'general' && (
                <motion.div
                  key="general-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 relative"
                >
                  <div className="space-y-6 text-left">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        <Globe className="w-5 h-5 text-emerald-400" />
                        Language & System Preferences
                      </h2>
                      <p className="text-sm text-white/50 mt-1">
                        Change the interface language and configure platform behavior.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-white/70">
                        Default Language / لغة واجهة النظام
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setLanguage('en')}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                            language === 'en'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="font-semibold text-lg">English</span>
                          <span className="text-xs text-white/40">Default Language</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setLanguage('ar')}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                            language === 'ar'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="font-semibold text-lg">العربية</span>
                          <span className="text-xs text-white/40">اللغة العربية</span>
                        </button>
                      </div>
                    </div>

                    {/* Performance & Cursor Optimization */}
                    <div className="space-y-4 pt-6 border-t border-white/10">
                      <div>
                        <h3 className="text-base font-bold text-white flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                          {t('setting_perf_title')}
                        </h3>
                        <p className="text-xs text-white/50 mt-1">
                          {t('setting_cursor_desc')}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => handleToggleCursor(false)}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                            !customCursor
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="font-semibold text-sm">{t('setting_disable')}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleCursor(true)}
                          className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                            customCursor
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                              : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                          }`}
                        >
                          <span className="font-semibold text-sm">{t('setting_enable')}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 bg-white/[0.01] p-4 rounded-2xl border border-white/5 flex gap-3 items-start">
                      <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="text-xs text-white/50 leading-relaxed">
                        <p className="font-semibold text-white/80 mb-1">Applying Changes Immediately</p>
                        Language updates and performance preferences are applied globally and instantly. All components, menus, and AI features will automatically adjust to your chosen direction and language structure.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
