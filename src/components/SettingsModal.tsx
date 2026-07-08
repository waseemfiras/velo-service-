import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, Bell, Shield, Settings, Lock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const [customCursor, setCustomCursorState] = useState(() => {
    return localStorage.getItem('velo_enable_custom_cursor') !== 'false';
  });

  const handleToggleCursor = (enabled: boolean) => {
    setCustomCursorState(enabled);
    localStorage.setItem('velo_enable_custom_cursor', enabled ? 'true' : 'false');
    window.dispatchEvent(new Event('velo_cursor_changed'));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSeeAllSettings = () => {
    onClose();
    navigate('/settings');
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] isolate">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, filter: 'blur(5px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 350, mass: 0.8 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg p-6"
          >
            <div className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                  <Settings className="w-6 h-6 text-emerald-400" />
                  Settings
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Language */}
                <section>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-400" /> Language / اللغة
                    </h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                      className="w-full bg-transparent text-white px-4 py-3 outline-none appearance-none cursor-pointer text-sm"
                    >
                      <option value="en" className="bg-[#111] text-white">English</option>
                      <option value="ar" className="bg-[#111] text-white">العربية</option>
                    </select>
                  </div>
                </section>

                {/* Performance & Cursor Optimization */}
                <section>
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400 animate-pulse" /> {t('setting_perf_title')}
                    </h3>
                  </div>
                  <p className="text-[11px] text-white/50 mb-3 leading-relaxed">
                    {t('setting_cursor_desc')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleCursor(false)}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        !customCursor
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('setting_disable')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleCursor(true)}
                      className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all ${
                        customCursor
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('setting_enable')}
                    </button>
                  </div>
                </section>

                {/* Notifications (Stub) */}
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" /> Notifications
                  </h3>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center opacity-50 cursor-not-allowed">
                    <span className="text-white">Receive updates by email</span>
                    <div className="w-12 h-6 bg-white/10 rounded-full p-1 cursor-not-allowed">
                      <div className="w-4 h-4 bg-white/40 rounded-full" />
                    </div>
                  </div>
                </section>

                {/* Privacy (Stub) */}
                <section>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" /> Privacy & Security
                  </h3>
                  <button disabled className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-white/50 cursor-not-allowed flex justify-between items-center">
                    <span>Manage account data</span>
                    <Lock className="w-4 h-4 text-white/30" />
                  </button>
                </section>

                {/* See All Settings Button */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleSeeAllSettings}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-2xl py-4 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
                  >
                    <Settings className="w-5 h-5 animate-spin-slow" />
                    See All Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
