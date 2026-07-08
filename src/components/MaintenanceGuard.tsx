import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { initializeFirebase } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Wrench, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { VeloLogo } from './VeloLogo';
import { UserMenu } from './UserMenu';

export function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  
  // Initialize state from local storage fallback to avoid delays
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    try {
      const local = localStorage.getItem("velo_global_config");
      if (local) {
        return JSON.parse(local).maintenance_mode ?? false;
      }
    } catch (e) {}
    return false;
  });
  
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>(() => {
    try {
      const local = localStorage.getItem("velo_global_config");
      if (local) {
        return JSON.parse(local).maintenance_message || "";
      }
    } catch (e) {}
    return "";
  });

  const [forceMaintenance, setForceMaintenance] = useState<boolean>(() => {
    return localStorage.getItem("velo_force_maintenance") === "true";
  });

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;

    const checkMaintenance = async () => {
      try {
        const { db } = await initializeFirebase();
        if (!db) {
          setChecking(false);
          return;
        }

        unsubscribe = onSnapshot(doc(db, 'settings', 'global_config'), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const mode = data.maintenance_mode ?? false;
            const msg = data.maintenance_message || "";
            setMaintenanceMode(mode);
            setMaintenanceMessage(msg);

            // Sync to local storage for instant loading next time
            try {
              const localConfig = JSON.parse(localStorage.getItem("velo_global_config") || "{}");
              localStorage.setItem("velo_global_config", JSON.stringify({
                ...localConfig,
                maintenance_mode: mode,
                maintenance_message: msg
              }));
            } catch (e) {}
          }
          setChecking(false);
        }, (error) => {
          console.error("Error fetching maintenance config:", error);
          setChecking(false);
        });
      } catch (err) {
        console.error("Failed to initialize Firebase for maintenance guard:", err);
        setChecking(false);
      }
    };

    checkMaintenance();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleToggleForce = () => {
    const nextVal = !forceMaintenance;
    setForceMaintenance(nextVal);
    if (nextVal) {
      localStorage.setItem("velo_force_maintenance", "true");
    } else {
      localStorage.removeItem("velo_force_maintenance");
    }
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-velo-black flex flex-col items-center justify-center text-white">
         <div className="w-16 h-16 rounded-full bg-white text-velo-black flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-pulse">
            <VeloLogo className="w-8 h-8" />
         </div>
      </div>
    );
  }

  // Determine if we should show the maintenance screen
  // Show if maintenance is active and the user is NOT an admin, OR if the admin is forcing/previewing it
  const showMaintenancePage = maintenanceMode && (!isAdmin || forceMaintenance);

  if (showMaintenancePage) {
    return (
      <div className="min-h-screen bg-velo-black flex flex-col p-6 relative overflow-hidden" dir="rtl">
        <div className="absolute top-6 left-6 z-50">
          <UserMenu />
        </div>
        
        {/* Admin Back-to-Normal Panel */}
        {isAdmin && (
          <div className="absolute top-6 right-6 z-50">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggleForce}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-2xl shadow-lg text-xs font-semibold backdrop-blur-md transition-all font-display"
            >
              <EyeOff className="w-4 h-4" />
              العودة للوحة الإدارة (رؤية الموقع)
            </motion.button>
          </div>
        )}

        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Ambient background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[500px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
            className="relative z-10 max-w-lg w-full text-center space-y-8"
          >
            <div className="mx-auto w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-8 relative">
              <Wrench className="w-10 h-10" />
              {isAdmin && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">
                  معاينة مدير
                </span>
              )}
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight">
                نحن في وضع الصيانة
              </h1>
              <h2 className="text-xl sm:text-2xl text-white/80 font-display tracking-wide" dir="ltr">
                We'll be back soon
              </h2>
            </div>
            
            <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              {maintenanceMessage ? maintenanceMessage : (
                <>
                  عذراً، الموقع يخضع حالياً لبعض التحديثات الفنية وسنعود للعمل في أقرب وقت ممكن. شكراً لتفهمكم.
                  <br/><br/>
                  <span dir="ltr" className="block">
                    Sorry, the site is currently undergoing technical updates and we will be back online as soon as possible. Thank you for your patience.
                  </span>
                </>
              )}
            </p>

            <div className="pt-8 border-t border-white/10 flex items-center justify-center gap-3 flex-row-reverse">
               <div className="w-8 h-8 rounded-full bg-white text-velo-black flex items-center justify-center shadow-lg">
                  <VeloLogo className="w-4 h-4" />
               </div>
               <span className="text-white/60 font-semibold tracking-wider text-sm font-display">VELO SERVICE</span>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Floating alert bar for Admin when maintenance is active but bypassed */}
      {maintenanceMode && isAdmin && !forceMaintenance && (
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none"
          dir="rtl"
        >
          <div className="bg-black/80 backdrop-blur-md border border-amber-500/30 text-white px-5 py-3 rounded-2xl shadow-[0_8px_32px_rgba(245,158,11,0.15)] flex items-center gap-4 pointer-events-auto max-w-xl w-full justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-white/90">
                وضع الصيانة نشط حالياً للزوار. أنت تتصفح كمسؤول.
              </p>
            </div>
            <button
              onClick={handleToggleForce}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/25 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 rounded-xl text-[11px] font-bold transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              معاينة صفحة الصيانة
            </button>
          </div>
        </motion.div>
      )}
      {children}
    </>
  );
}
