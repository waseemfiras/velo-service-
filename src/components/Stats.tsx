import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useEffect, useState } from "react";

function Counter({ from, to, duration = 2 }: { from: number; to: number; duration?: number }) {
  const [count, setCount] = useState(from);
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const updateCounter = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      // easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      
      setCount(Math.floor(easeProgress * (to - from) + from));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCounter);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          animationFrame = requestAnimationFrame(updateCounter);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    if (nodeRef.current) observer.observe(nodeRef.current);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      observer.disconnect();
    };
  }, [from, to, duration]);

  return <span ref={nodeRef}>{count}</span>;
}

export function Stats() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <section className="py-20 px-6 relative overflow-hidden" ref={containerRef}>
      <motion.div 
        style={{ scale, opacity }}
        className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-12 md:p-24 backdrop-blur-md relative"
      >
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=2070')] opacity-5 mix-blend-overlay rounded-[3rem] object-cover pointer-events-none" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10 divide-y md:divide-y-0 md:divide-x divide-white/10">
          <div className="flex flex-col items-center justify-center text-center pt-6 md:pt-0 first:pt-0">
            <h3 className="font-display font-bold text-6xl md:text-8xl mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              <Counter from={0} to={150} />+
            </h3>
            <p className="text-white/50 font-medium tracking-widest uppercase text-sm">Projects Delivered</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center pt-12 md:pt-0">
            <h3 className="font-display font-bold text-6xl md:text-8xl mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              <Counter from={0} to={45} />+
            </h3>
            <p className="text-white/50 font-medium tracking-widest uppercase text-sm">Expert Developers</p>
          </div>
          <div className="flex flex-col items-center justify-center text-center pt-12 md:pt-0">
            <h3 className="font-display font-bold text-6xl md:text-8xl mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              <Counter from={0} to={99} />%
            </h3>
            <p className="text-white/50 font-medium tracking-widest uppercase text-sm">Client Satisfaction</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
