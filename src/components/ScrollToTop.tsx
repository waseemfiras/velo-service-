import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after 500px scroll
      const scrolled = window.scrollY;
      if (scrolled > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Calculate progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = scrolled / totalHeight;
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run once on mount in case already scrolled
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // SVG parameters for scroll progress ring
  const radius = 24;
  const strokeWidth = 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - scrollProgress * circumference;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          id="scroll-to-top-btn"
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ 
            scale: 1.08,
            boxShadow: "0 0 25px rgba(168, 85, 247, 0.4)" // purple glow
          }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#0d0d12]/90 backdrop-blur-md border border-white/10 text-white cursor-pointer shadow-2xl overflow-visible focus:outline-none"
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          {/* Progress Circle Ring */}
          <svg className="absolute -rotate-90 w-14 h-14 pointer-events-none overflow-visible">
            {/* Background thin ring */}
            <circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-white/[0.04]"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated progress ring */}
            <motion.circle
              cx="28"
              cy="28"
              r={radius}
              className="stroke-purple-500"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset }}
              transition={{ ease: "easeOut", duration: 0.1 }}
              strokeLinecap="round"
            />
          </svg>

          {/* Glowing indicator light behind the arrow */}
          <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Up Arrow Icon */}
          <motion.div
            initial={{ y: 0 }}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            className="relative z-10"
          >
            <ArrowUp className="w-5 h-5 text-white/90 drop-shadow-[0_2px_8px_rgba(168,85,247,0.3)]" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
