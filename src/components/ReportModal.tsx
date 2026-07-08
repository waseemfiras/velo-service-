import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { localAddReport } from '../lib/localAuth';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const { user } = useAuth();
  const [issue, setIssue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;

    setLoading(true);
    setError('');

    try {
      await localAddReport(
        user && user.email ? user.email : 'مستخدم زائر',
        issue.trim()
      );
      
      setSubmitted(true);
      toast.success('تم إرسال الطلب بنجاح');
      setTimeout(() => {
        onClose();
        setTimeout(() => {
          setSubmitted(false);
          setIssue('');
        }, 500);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'فشلت عملية الإرسال، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6"
          >
            <div className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                    Report Issue
                  </h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                      <Send className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Report Sent</h3>
                    <p className="text-white/60">Thank you for helping us improve Velo.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-right">
                        {error}
                      </div>
                    )}
                    
                    <p className="text-white/60 text-sm mb-4">
                      Describe the issue you encountered. Our team will review it as soon as possible.
                    </p>
                    
                    <textarea
                      value={issue}
                      disabled={loading}
                      onChange={(e) => setIssue(e.target.value)}
                      placeholder="What went wrong?"
                      required
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors resize-none disabled:opacity-50"
                    />

                    <button
                      type="submit"
                      disabled={loading || !issue.trim()}
                      className="w-full bg-white text-black font-semibold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Submit Report
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
