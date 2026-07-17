import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

export function SmoothScroll() {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Initialize Lenis with smooth physics
    const lenis = new Lenis({
      duration: 1.2,                     // Faster duration for snappier movement
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // standard ease-out
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.2,              // Slightly faster wheel
      touchMultiplier: 2,                // Faster on mobile
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis; // Expose globally

    // Connect to requestAnimationFrame
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Clean up on unmount
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  // Scroll to top or specific target on route change smoothly
  useEffect(() => {
    if (lenisRef.current) {
      const scrollTarget = sessionStorage.getItem('scrollTarget');
      if (location.pathname === '/' && scrollTarget) {
        sessionStorage.removeItem('scrollTarget');
        // Let layout settle first, then scroll beautifully
        setTimeout(() => {
          const element = document.getElementById(scrollTarget);
          if (element && lenisRef.current) {
            lenisRef.current.scrollTo(element, {
              offset: -80,
              duration: 1.8,
              easing: (t) => 1 - Math.pow(1 - t, 5),
            });
          }
        }, 150);
      } else {
        // Standard scroll to top on page change, unless we have a hash we want to scroll to
        const hash = location.hash || window.location.hash;
        if (hash) {
          const targetId = hash.replace('#', '').split('?')[0];
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element && lenisRef.current) {
              lenisRef.current.scrollTo(element, {
                offset: -80,
                duration: 1.8,
                easing: (t) => 1 - Math.pow(1 - t, 5),
              });
            }
          }, 150);
        } else {
          lenisRef.current.scrollTo(0, { immediate: true });
        }
      }
    }
  }, [location]);

  return null; // This is a provider/utility component, so it renders nothing
}
