import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Magnetic } from "./Magnetic";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { UserMenu } from "./UserMenu";
import { AuthModal } from "./AuthModal";
import { SettingsModal } from "./SettingsModal";
import { ReportModal } from "./ReportModal";
import { AdminDashboard } from "./AdminDashboard";
import { Clock, Menu, X as CloseIcon, Globe } from "lucide-react";

export function Navbar() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const getDaysLeft = () => {
    const currentDay = new Date().getDay();
    const targetDate = new Date("2026-07-09T00:00:00Z"); 
    const diffTime = Math.max(0, targetDate.getTime() - new Date().getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : ((currentDay % 7) + 1);
  };

  const daysLeft = getDaysLeft();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <>
      <motion.nav
        initial={{ y: "-100%", opacity: 0 }}
        animate={hidden ? "hidden" : "visible"}
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: "-100%", opacity: 0 },
        }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
      >
        <div className="absolute inset-0 bg-velo-black/50 backdrop-blur-md border-b border-white/10" />
        
        <div className="relative max-w-7xl mx-auto w-full flex items-center justify-between">
          <Magnetic intensity={0.1}>
            <Link to="/" className="font-display font-bold text-2xl tracking-tighter hover-target inline-block">
              VELO<span className="text-white/50">SERVICE</span>
            </Link>
          </Magnetic>
          
          <div className="hidden lg:flex items-center gap-5 px-5 py-2 bg-white/[0.03] border border-white/10 rounded-full backdrop-blur-md shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] hover:border-white/20 transition-all duration-300">
            <Magnetic intensity={0.2}><a href="/#services" className="text-xs font-display font-medium text-white/70 hover:text-white transition-colors hover-target px-2.5 py-1">{t('services')}</a></Magnetic>
            <Magnetic intensity={0.2}>
              <Link to="/request-service" className="text-xs font-display font-medium text-emerald-400 hover:text-emerald-300 transition-colors hover-target px-2.5 py-1">
                {t('requestService')}
              </Link>
            </Magnetic>
            <Magnetic intensity={0.2}>
              <Link to="/chat" className="text-xs font-display font-medium text-white/70 hover:text-white transition-colors hover-target px-2.5 py-1">
                {t('aiChat')}
              </Link>
            </Magnetic>
            <Magnetic intensity={0.2}><a href="/#work" className="text-xs font-display font-medium text-white/70 hover:text-white transition-colors hover-target px-2.5 py-1">{t('work')}</a></Magnetic>
            <Magnetic intensity={0.2}><a href="/#contact" className="text-xs font-display font-medium text-white/70 hover:text-white transition-colors hover-target px-2.5 py-1">{t('contact')}</a></Magnetic>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <Magnetic intensity={0.3}>
                <Link to="/request-service">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-6 py-2.5 bg-white text-velo-black font-semibold text-xs sm:text-sm rounded-full overflow-hidden group shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-shadow hover-target"
                  >
                    <span className="relative z-10">{language === 'ar' ? 'طلب مشروع' : 'Start Project'}</span>
                    <div className="absolute inset-0 bg-white/80 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  </motion.button>
                </Link>
              </Magnetic>
            </div>
            
            {!loading && (
              user ? (
                <UserMenu 
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenReport={() => setIsReportOpen(true)}
                  onOpenAdmin={() => setIsAdminOpen(true)}
                />
              ) : (
                <Magnetic intensity={0.2}>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAuthOpen(true);
                    }}
                    className="px-5 py-2 bg-transparent border border-white/20 text-white font-medium text-xs rounded-full hover:bg-white/10 transition-colors hover-target"
                  >
                    {language === 'ar' ? 'دخول' : 'Login'}
                  </motion.button>
                </Magnetic>
              )
            )}

            {/* Mobile Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors relative z-50 hover-target"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%", filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: "100%", filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed inset-0 z-50 bg-velo-black/95 backdrop-blur-2xl flex flex-col p-6 pt-24 gap-6 lg:hidden overflow-y-auto text-right"
          >
            {/* Close button inside drawer */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-white bg-white/10 rounded-full transition-colors z-50"
              aria-label="Close Mobile Menu"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
             <div className="flex flex-col gap-4 mt-4">
              <a 
                href="/#services" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-display font-medium text-white/80 hover:text-white border-b border-white/5 pb-3"
              >
                {t('services')}
              </a>
              <Link 
                to="/request-service" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-display font-medium text-emerald-400 hover:text-emerald-300 border-b border-white/5 pb-3"
              >
                {t('requestService')}
              </Link>
              <Link 
                to="/chat" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-display font-medium text-white/80 hover:text-white border-b border-white/5 pb-3"
              >
                {t('aiChat')}
              </Link>
              <a 
                href="/#work" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-display font-medium text-white/80 hover:text-white border-b border-white/5 pb-3"
              >
                {t('work')}
              </a>
              <a 
                href="/#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-display font-medium text-white/80 hover:text-white border-b border-white/5 pb-3"
              >
                {t('contact')}
              </a>
            </div>

            <div className="flex flex-col gap-4 mt-auto pb-8">
              <Link to="/request-service" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                <button className="w-full py-4 bg-white text-velo-black font-semibold text-center rounded-full hover-target shadow-lg text-sm">
                  {language === 'ar' ? 'طلب مشروع جديد' : 'Start Project'}
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </>
  );
}
