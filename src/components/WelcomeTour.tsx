import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { X, Users, ArrowRight, ArrowLeft, Sparkles, Bot, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function WelcomeTour() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (user) {
      const hasSeenTour = localStorage.getItem(`velo_has_seen_tour_${user.uid || user.email}`);
      if (!hasSeenTour) {
        setIsVisible(true);
      }
    }
  }, [user]);

  const closeTour = () => {
    if (user) {
      localStorage.setItem(`velo_has_seen_tour_${user.uid || user.email}`, 'true');
    }
    setIsVisible(false);
  };

  const isAr = language === 'ar';

  const navigateTo = (path: string) => {
    closeTour();
    requestAnimationFrame(() => {
      navigate(path);
    });
  };

  const steps = [
    {
      id: 'welcome',
      title: isAr ? 'أهلاً بك في Velo Service' : 'Welcome to Velo Service',
      desc: isAr 
        ? 'بوابتك النخبوية لأحدث الحلول التقنية وخدمات الذكاء الاصطناعي فائقة التطور. اكتشف كيف يمكننا مساعدتك في تطوير أعمالك وإنجاز مهامك بسهولة وسرعة.' 
        : 'Your premium gateway to next-generation technical solutions and elite artificial intelligence services. Discover how we elevate your vision.',
      icon: <Sparkles className="w-10 h-10 text-white" />,
      color: 'from-white/5 to-transparent',
      badge: isAr ? 'بوابة ڤيلو الفاخرة' : 'VELO PORTAL',
    },
    {
      id: 'chat',
      title: isAr ? 'مساعد الذكاء الاصطناعي VGPT' : 'VGPT AI Assistant',
      desc: isAr ? 'تحدث مع أذكى نموذج ذكاء اصطناعي، اطلب خدماتك ونفذ مهامك بلمح البصر وبطريقة متطورة للغاية تلبي طموحاتك.' : 'Unlock unlimited chats with our bespoke custom models to build, refine, and elevate your creative vision.',
      icon: <Bot className="w-10 h-10 text-neutral-300" />,
      path: '/chat',
      color: 'from-neutral-400/5 to-transparent',
      badge: isAr ? 'الجيل القادم' : 'NEXT-GEN AI',
    },
    {
      id: 'services',
      title: isAr ? 'طلب خدمات بريميوم' : 'Premium Web Services',
      desc: isAr ? 'تصفح واطلب منصات ويب مخصصة، تصاميم واجهات فريدة، وأنظمة متكاملة مصممة بأعلى معايير الجودة من فريق ڤيلو المتميز.' : 'Commission custom web platforms, bespoke UI designs, and industry-leading web systems crafted by the Velo team.',
      icon: <Zap className="w-10 h-10 text-white" />,
      path: '/request-service',
      color: 'from-white/5 to-transparent',
      badge: isAr ? 'خدمات حصرية' : 'BESPOKE CREATIVE',
    },
    {
      id: 'team',
      title: isAr ? 'فريق ڤيلو التقني' : 'Velo Tech Team',
      desc: isAr ? 'تعرف على الخبراء، والمهندسين، والمصممين الذين يقفون خلف نجاح ريادتنا في النظم والبرمجيات الذكية.' : 'Meet the elite masterminds, architects, and designers driving success behind our revolutionary software ecosystems.',
      icon: <Users className="w-10 h-10 text-neutral-300" />,
      path: '/founder',
      color: 'from-neutral-500/5 to-transparent',
      badge: isAr ? 'المطورون النخبة' : 'TECH MASTERMINDS',
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      closeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const currentStepData = steps[currentStep];

  // Framer Motion variants for staggered container entrance - Optimized for performance
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.98, y: 15 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] as const,
        staggerChildren: 0.08,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.98, 
      y: -10, 
      transition: {
        duration: 0.25,
        ease: "easeIn" as const
      }
    }
  };

  // Step container animation configuration that drives parent and children stagger
  const stepContentVariants = {
    hidden: { opacity: 0, y: 15, filter: "blur(4px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
        staggerChildren: 0.08,
        delayChildren: 0.05
      }
    },
    exit: { 
      opacity: 0, 
      y: -15, 
      filter: "blur(4px)",
      transition: { duration: 0.25, ease: "easeIn" as const } 
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 12, filter: "blur(3px)" },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 100, damping: 15 } 
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="welcome-tour-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-hidden"
        >
          {/* Deep Cinematic Black Minimalist Backdrop with optimized blur */}
          <div 
            onClick={closeTour}
            className="absolute inset-0 bg-black/90 backdrop-blur-md cursor-pointer"
          />
          
          {/* Static Technical Line-Grid Pattern for maximum rendering performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-40">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          
          {/* Static Grayscale Ambient Aura Spotlights (Replaces heavy real-time motion layers to eliminate pointer lag) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[25%] left-[25%] w-[450px] h-[450px] bg-white/[0.02] rounded-full blur-[130px] opacity-75" />
            <div className="absolute bottom-[25%] right-[25%] w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[130px] opacity-75" />
          </div>

          {/* Premium Modal Container - Styled after the official Velo Glassmorphism Design */}
          <motion.div
            key="tour-modal"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative w-full max-w-2xl bg-[#080808]/95 border border-white/10 rounded-[28px] overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_50px_rgba(0,0,0,0.8)] backdrop-blur-md ${isAr ? 'text-right' : 'text-left'}`}
          >
            {/* Header Silver Glowing Progress Bar */}
            <div className="absolute top-0 left-0 right-0 flex h-[2px] bg-white/5 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-neutral-800 via-white to-neutral-800 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              />
            </div>

            <div className="relative p-8 md:p-14 min-h-[440px] flex flex-col justify-center overflow-hidden">
              {/* Dynamic Inner Light Highlight */}
              <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${currentStepData.color} rounded-full blur-[80px] pointer-events-none transition-all duration-700 opacity-30`} />
              
              {/* Close Button - Premium Glass Circle */}
              <button
                onClick={closeTour}
                className={`absolute top-8 ${isAr ? 'left-8' : 'right-8'} text-white/40 hover:text-white transition-all hover:rotate-90 p-2 bg-white/[0.03] hover:bg-white/[0.08] rounded-full border border-white/5 hover:border-white/10 z-20 cursor-pointer`}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Step Content with Fixed Stagger Animation Setup */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  variants={stepContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative z-10 flex flex-col items-center text-center w-full"
                >
                  {/* Premium Mono Badge */}
                  <motion.div 
                    variants={childVariants}
                    className="mb-4 px-3 py-1 bg-white/[0.03] border border-white/10 rounded-full text-[10px] font-mono tracking-widest text-neutral-300 uppercase shadow-inner"
                  >
                    {currentStepData.badge}
                  </motion.div>

                  {/* Icon Frame - High Fidelity Digital Button Design */}
                  <motion.div 
                    variants={childVariants}
                    className="mb-6 p-5 bg-gradient-to-b from-[#111111] to-[#070707] border border-white/10 rounded-[20px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_35px_rgba(0,0,0,0.6)] flex items-center justify-center relative group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -inset-0.5 bg-white/10 blur-xl opacity-20 rounded-full" />
                    <div className="relative z-10 text-white">
                      {currentStepData.icon}
                    </div>
                  </motion.div>
                  
                  {/* Metallic Chrome Heading */}
                  <motion.h2 
                    variants={childVariants}
                    className="text-2xl md:text-3xl font-display font-bold text-white mb-3 tracking-tight leading-tight"
                  >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400 drop-shadow-[0_2px_8px_rgba(255,255,255,0.05)]">
                      {currentStepData.title}
                    </span>
                  </motion.h2>
                  
                  {/* Premium description in gray palette */}
                  <motion.p 
                    variants={childVariants}
                    className="text-neutral-400 text-sm md:text-base max-w-md font-normal leading-relaxed mb-8"
                  >
                    {currentStepData.desc}
                  </motion.p>

                  {/* Context Button - Styled exactly after the premium Black Glossy buttons in the style guide */}
                  {currentStepData.path && (
                    <motion.button
                      variants={childVariants}
                      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateTo(currentStepData.path!)}
                      className="mb-4 px-6 py-2.5 bg-gradient-to-b from-white/[0.04] to-transparent hover:from-white/[0.08] hover:to-white/[0.02] border border-white/10 hover:border-white/20 rounded-full text-white font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.4)] text-xs uppercase tracking-wider"
                    >
                      <span>{isAr ? 'استكشف الآن' : 'Explore Now'}</span>
                      <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                    </motion.button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer Navigation Panel - Clean Obsidian Contrast */}
            <div className="relative z-10 px-8 py-5 bg-[#040404]/90 border-t border-white/5 flex items-center justify-between">
              {/* Back Button */}
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-4 py-2 text-white/40 hover:text-white transition-all flex items-center gap-2 disabled:opacity-0 disabled:pointer-events-none cursor-pointer rounded-xl hover:bg-white/5 text-xs font-semibold uppercase tracking-wider`}
              >
                <ArrowLeft className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                <span>{isAr ? 'السابق' : 'Back'}</span>
              </button>
              
              {/* Slide Dots Indicators */}
              <div className="flex gap-2 items-center">
                {steps.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentStep ? 'bg-white w-6 shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-white/20 hover:bg-white/40 w-1.5'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next/Get Started Button - Styled after the White Capsule Button from the style guide */}
              <button
                onClick={nextStep}
                className="px-6 py-2.5 bg-white text-neutral-950 hover:bg-neutral-200 rounded-full font-bold transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.25)] active:scale-97 cursor-pointer text-xs uppercase tracking-wider"
              >
                <span>{currentStep === steps.length - 1 ? (isAr ? 'ابدأ الاستخدام' : 'Get Started') : (isAr ? 'التالي' : 'Next')}</span>
                {currentStep < steps.length - 1 && <ArrowRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
