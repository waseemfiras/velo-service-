import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { VeloLogo } from "./VeloLogo";

interface SplashIntroProps {
  onComplete: () => void;
}

export function SplashIntro({ onComplete }: SplashIntroProps) {
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    // Disable scrolling during the intro
    document.body.style.overflow = "hidden";
    
    const timer = setTimeout(() => {
      setIsDone(true);
    }, 1300); // 1.3 seconds duration for the entrance and logo draw
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleAnimationComplete = () => {
    document.body.style.overflow = "";
    onComplete();
  };

  return (
    <AnimatePresence onExitComplete={handleAnimationComplete}>
      {!isDone && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ 
            y: "-100%",
            transition: { 
              duration: 0.85, 
              ease: [0.76, 0, 0.24, 1],
              delay: 0.1
            }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-zinc-950 text-white"
        >
          {/* Subtle geometric grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />
          
          <div className="relative flex flex-col items-center">
            {/* Outer rings with delayed rotate & expand animations */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } 
              }}
              className="relative flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent shadow-[0_0_50px_rgba(255,255,255,0.02)]"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 1, 0.3, 1], 
                  scale: [0.5, 1.05, 0.98, 1],
                  transition: { duration: 1.0, ease: "easeInOut" }
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                <VeloLogo className="w-full h-full" />
              </motion.div>
              
              {/* Dynamic glowing core behind the logo */}
              <div className="absolute inset-0 rounded-2xl bg-white/[0.01] blur-xl" />
            </motion.div>

            {/* Typography revealing title */}
            <div className="overflow-hidden mt-8">
              <motion.h1 
                initial={{ y: 30, opacity: 0 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }
                }}
                className="font-display font-bold text-3xl sm:text-4xl tracking-[0.25em] text-center uppercase text-white"
              >
                VELO <span className="text-white/30 font-light">STUDIO</span>
              </motion.h1>
            </div>

            {/* Custom geometric loader line */}
            <div className="w-32 h-[1px] bg-white/10 mt-6 relative overflow-hidden rounded-full">
              <motion.div 
                initial={{ left: "-100%" }}
                animate={{ 
                  left: "100%",
                  transition: { 
                    duration: 1.1, 
                    ease: [0.65, 0, 0.35, 1], 
                    repeat: Infinity,
                    repeatDelay: 0.1
                  }
                }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white to-transparent"
              />
            </div>
            
            {/* Status indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute -bottom-24 flex items-center gap-2 font-mono text-[10px] tracking-widest text-white/50 uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>ENGINES ONLINE</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
