/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Home } from './pages/Home';
import { FullChat } from './pages/FullChat';
import { SettingsPage } from './pages/SettingsPage';
import { RequestService } from './pages/RequestService';
import { Founder } from './pages/Founder';
import { CustomCursor } from './components/CustomCursor';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { useVisitorTracking } from './hooks/useVisitorTracking';
import { SplashIntro } from './components/SplashIntro';
import { MaintenanceGuard } from './components/MaintenanceGuard';
import { ScrollToTop } from './components/ScrollToTop';
import { SmoothScroll } from './components/SmoothScroll';
import { StarryRain } from './components/StarryRain';
import { WelcomeTour } from './components/WelcomeTour';

function AnimatedRoutes() {
  const location = useLocation();
  useVisitorTracking(); // Track visitor when routes render
  
  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={location.pathname} 
        className="min-h-screen"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<FullChat />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/request-service" element={<RequestService />} />
          <Route path="/founder" element={<Founder />} />
          <Route path="/track-request" element={<Navigate to="/request-service?tab=track" replace />} />
          <Route path="/dashboard" element={<Navigate to="/request-service?tab=dashboard" replace />} />
          

        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <LanguageProvider>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {showSplash && <SplashIntro onComplete={() => setShowSplash(false)} />}
        </AnimatePresence>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Router>
          <SmoothScroll />
          <CustomCursor />
          <ScrollToTop />
          <MaintenanceGuard>
            <WelcomeTour />
            <main className="min-h-screen bg-velo-black selection:bg-white/20 selection:text-white overflow-x-hidden relative">
              {!showSplash && (
                <>
                  <div className="relative z-10">
                    <AnimatedRoutes />
                  </div>
                </>
              )}
            </main>
          </MaintenanceGuard>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

