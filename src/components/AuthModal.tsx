import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Loader2, Smartphone, Shield, Apple } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
  signInWithPopup, 
  OAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber 
} from 'firebase/auth';
import { initializeFirebase, googleProvider } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { localLogin, localRegister } from '../lib/localAuth';
import { VeloLogo } from './VeloLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthMethod = 'email' | 'phone';

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { setCustomUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      // Clean up recaptcha widget on unmount if any
      const container = document.getElementById('recaptcha-container');
      if (container) container.innerHTML = '';
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // تسجيل الدخول بالنظام المخصص والآمن محلياً
        const data = await localLogin(email, password);
        
        // حفظ رمز الجلسة في التخزين المحلي وتحديث حالة المستخدم الموحدة
        localStorage.setItem('velo_custom_token', data.token);
        setCustomUser(data.user);
        toast.success('تم تسجيل الدخول بنجاح');
        onClose();
      } else {
        // إنشاء حساب بالنظام المخصص والآمن محلياً
        await localRegister(email, password);
        
        // تسجيل الدخول التلقائي للمستخدم بعد إنشاء الحساب بنجاح
        const loginData = await localLogin(email, password);
        
        localStorage.setItem('velo_custom_token', loginData.token);
        setCustomUser(loginData.user);
        toast.success('تم إنشاء الحساب وتسجيل الدخول بنجاح');
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'فشلت عملية التحقق، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { auth } = await initializeFirebase();
      if (!auth) {
        throw new Error('خدمة المصادقة عبر الهاتف غير متوفرة حالياً (تتطلب Firebase)');
      }
      
      if (!otpSent) {
        // Validate phone number format roughly (must start with +)
        const trimmedPhone = phoneNumber.trim();
        if (!trimmedPhone.startsWith('+')) {
          throw new Error('Please enter the country code first (e.g. +962 7 9xxx xxxx)');
        }

        // Initialize invisible recaptcha verifier
        const container = document.getElementById('recaptcha-container');
        if (container) container.innerHTML = '';
        
        const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => {}
        });
        (window as any).recaptchaVerifier = verifier;

        const result = await signInWithPhoneNumber(auth, trimmedPhone, verifier);
        setConfirmationResult(result);
        setOtpSent(true);
      } else {
        if (!verificationCode.trim()) {
          throw new Error('Please enter the 6-digit verification code.');
        }
        await confirmationResult.confirm(verificationCode.trim());
        toast.success('تم تسجيل الدخول بنجاح');
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-phone-number') {
        setError('The phone number you entered is invalid. Please make sure to include the country code.');
      } else if (err.code === 'auth/invalid-verification-code') {
        setError('The code you entered is invalid. Please try again.');
      } else {
        setError(err.message || 'Phone authentication failed. Please try again.');
      }
      // Reset reCAPTCHA on failure
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhoneInput = () => {
    setOtpSent(false);
    setVerificationCode('');
    setConfirmationResult(null);
    setError('');
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6"
          >
            <div className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-white via-neutral-100 to-neutral-200 text-neutral-950 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] border border-white/50">
                      <VeloLogo className="w-5 h-5 text-velo-black" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                      {isLogin ? 'Welcome Back' : 'Join Velo'}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-6">
                  <p className="text-white/60 text-sm mb-4 leading-relaxed">
                    {isLogin 
                      ? "Sign in to unlock unlimited VGPT AI chats, premium services, and your personal dashboard on Velo Service."
                      : "Create an account on Velo Service to unlock unlimited VGPT AI chats and premium web services."}
                  </p>
                </div>

                {/* Tabs to select Email vs Phone */}
                {!otpSent && (
                  <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mb-6">
                    <button
                      onClick={() => {
                        setAuthMethod('email');
                        setError('');
                      }}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
                        authMethod === 'email' 
                          ? 'bg-white text-black shadow-md' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Mail className="w-4 h-4" />
                      Email
                    </button>
                    <button
                      onClick={() => {
                        setAuthMethod('phone');
                        setError('');
                      }}
                      className={`flex-1 py-3 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
                        authMethod === 'phone' 
                          ? 'bg-white text-black shadow-md' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      Phone
                    </button>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* reCAPTCHA Invisible Element */}
                <div id="recaptcha-container"></div>

                {authMethod === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-black font-semibold rounded-2xl py-4 flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Sign Up')}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    {!otpSent ? (
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Phone Number (e.g. +962791234567)"
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors font-mono"
                        />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-white/40 text-xs px-1">
                          Enter 6-digit verification code sent to {phoneNumber}
                        </p>
                        <div className="relative">
                          <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                          <input
                            type="text"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Verification Code"
                            required
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-colors text-center tracking-[0.5em] font-mono text-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      {otpSent && (
                        <button
                          type="button"
                          onClick={handleBackToPhoneInput}
                          className="flex-1 bg-white/5 border border-white/10 text-white font-medium rounded-2xl py-4 hover:bg-white/10 transition-colors"
                        >
                          Change Number
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className={`font-semibold rounded-2xl py-4 flex items-center justify-center hover:bg-white/90 transition-colors disabled:opacity-50 ${
                          otpSent ? 'flex-[2] bg-white text-black' : 'w-full bg-white text-black'
                        }`}
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : otpSent ? (
                          'Verify & Sign In'
                        ) : (
                          'Send Code'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {authMethod === 'email' && (
                  <p className="mt-8 text-center text-white/50 text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-white hover:underline font-medium"
                    >
                      {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                  </p>
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
