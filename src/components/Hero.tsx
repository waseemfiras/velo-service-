import { motion, useScroll, useTransform, useMotionValue, useSpring, useVelocity } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TextReveal } from "./TextReveal";
import { Magnetic } from "./Magnetic";
import { useRef, useEffect } from "react";

const generatedScreens = [
  {
    src: "/src/assets/images/saas_dashboard_dark_1784287726427.jpg",
    title: "SaaS Dashboard",
    className: "w-[420px] h-[236px] top-[15%] right-[-5%] rotate-[8deg] z-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
    delay: 0.1,
    yOffset: -20,
    xOffset: 30,
    opacity: 0.5
  },
  {
    src: "/src/assets/images/luxury_agency_dark_1784287739782.jpg",
    title: "Luxury Agency",
    className: "w-[380px] h-[214px] top-[18%] left-[-2%] -rotate-[6deg] z-20 shadow-[0_20px_40px_rgba(0,0,0,0.6)]",
    delay: 0.3,
    yOffset: 20,
    xOffset: -20,
    opacity: 0.4
  },
  {
    src: "/src/assets/images/ecommerce_ui_dark_1784287763153.jpg",
    title: "E-commerce",
    className: "w-[460px] h-[258px] bottom-[12%] right-[2%] -rotate-[5deg] z-10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]",
    delay: 0.2,
    yOffset: -20,
    xOffset: 30,
    opacity: 0.5
  },
  {
    src: "/src/assets/images/portfolio_ui_dark_1784287787955.jpg",
    title: "Portfolio",
    className: "w-[400px] h-[300px] bottom-[15%] left-[5%] rotate-[4deg] z-20 shadow-[0_25px_50px_rgba(0,0,0,0.7)]",
    delay: 0.4,
    yOffset: 30,
    xOffset: -20,
    opacity: 0.6
  },
  {
    src: "/src/assets/images/analytics_ui_dark_1784287775997.jpg",
    title: "Analytics Dashboard",
    className: "w-[320px] h-[180px] top-[35%] right-[25%] rotate-[2deg] blur-[2px] z-0 shadow-[0_10px_20px_rgba(0,0,0,0.5)]",
    delay: 0.5,
    yOffset: 10,
    xOffset: -20,
    opacity: 0.25
  },
  {
    src: "/src/assets/images/banking_app_dark_1784287752803.jpg",
    title: "Mobile Banking App",
    className: "w-[240px] h-[426px] bottom-[25%] left-[25%] -rotate-[4deg] blur-[2px] z-0 shadow-[0_15px_30px_rgba(0,0,0,0.6)]",
    delay: 0.6,
    yOffset: -10,
    xOffset: -10,
    opacity: 0.25
  }
];

function FloatingScreen({ screen, mouseX, mouseY }: { screen: any, mouseX: any, mouseY: any }) {
  const xTransform = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-screen.xOffset, screen.xOffset]);
  const yTransform = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-screen.yOffset, screen.yOffset]);

  const velocityX = useVelocity(xTransform);
  const velocityY = useVelocity(yTransform);

  const filter = useTransform(() => {
    const vx = velocityX.get() || 0;
    const vy = velocityY.get() || 0;
    const speed = Math.sqrt(vx * vx + vy * vy);
    const blurAmount = Math.min(speed / 40, 5); // Tweak divisor to adjust blur intensity
    return blurAmount > 0.05 ? `blur(${blurAmount}px)` : "blur(0px)";
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: screen.opacity || 1, y: 0, scale: 1 }}
      transition={{ duration: 1.5, delay: screen.delay, type: "spring", stiffness: 100 }}
      style={{ x: xTransform, y: yTransform }}
      className={`absolute rounded-xl overflow-hidden border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.6)] ${screen.className} will-change-transform`}
    >
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 8 + screen.delay * 2, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
        style={{ filter }}
        className="w-full h-full relative group will-change-transform"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/10 to-black/40 z-10 pointer-events-none" />
        <img src={screen.src} alt={screen.title} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-xl" />
      </motion.div>
    </motion.div>
  );
}

function FloatingScreens() {
  const mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  const mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);

  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      animationFrameId = requestAnimationFrame(() => {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      });
    };
    
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouseX, mouseY]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none hidden lg:block overflow-hidden" style={{ perspective: "1000px" }}>
      {generatedScreens.map((screen, idx) => (
        <FloatingScreen key={idx} screen={screen} mouseX={smoothMouseX} mouseY={smoothMouseY} />
      ))}
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } as const },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-center px-6 pt-32 lg:pt-20 overflow-hidden bg-velo-black">
      {/* Ambient Cosmos Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-velo-black">
        {/* Subtle Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        {/* Dynamic, luxurious ambient lighting orbs pulsing in the background */}
        <motion.div
          animate={{
            scale: [1, 1.2, 0.9, 1.1, 1],
            x: [0, 30, -20, 15, 0],
            y: [0, -40, 20, -10, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-white/5 blur-[140px] pointer-events-none mix-blend-screen"
        />

        <motion.div
          animate={{
            scale: [1, 1.15, 1.3, 0.95, 1],
            x: [0, -50, 30, -20, 0],
            y: [0, 20, -30, 40, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-white/[0.03] blur-[160px] pointer-events-none mix-blend-screen"
        />

        <motion.div
          animate={{
            scale: [1, 1.25, 0.85, 1.1, 1],
            x: [20, -10, 40, -30, 20],
            y: [-15, 30, -10, 20, -15],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5,
          }}
          className="absolute top-[35%] left-[30%] w-[400px] h-[400px] rounded-full bg-white/5 blur-[120px] pointer-events-none mix-blend-screen"
        />

        {/* Elegant overlay gradients to preserve perfect reading contrast and seamless transitions */}
        <div className="absolute inset-0 bg-gradient-to-b from-velo-black/90 via-velo-black/60 to-velo-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-velo-black/95 via-transparent to-velo-black/95" />
      </div>

      <FloatingScreens />

      {/* Background Elements (A subtle premium center glow) */}
      <motion.div 
        style={{ y: backgroundY }} 
        animate={{ opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-white/5 rounded-full blur-[130px] pointer-events-none z-0" 
      />
      
      <motion.div style={{ y, opacity }} className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-white/80">Digital Excellence Studio</span>
          </motion.div>

          <h1 className="font-display font-bold text-5xl sm:text-7xl lg:text-[7rem] leading-[1.05] tracking-tighter mb-8 max-w-5xl">
            <TextReveal text="Crafting Digital" />
            <TextReveal text="Experiences" className="text-white/50" delay={0.2} />
          </h1>

          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-2xl text-white/60 max-w-2xl mb-12 font-light leading-relaxed drop-shadow-lg"
          >
            Velo Service is a premium tech agency specializing in bespoke UI/UX design, 
            robust full-stack development, and seamless API integrations.
          </motion.p>

          <motion.div variants={itemVariants}>
            <Magnetic intensity={0.2}>
              <Link to="/chat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-premium hover-target group px-8 py-3.5 text-white"
                >
                  <div className="btn-glow" />
                  <span className="relative z-10 text-lg tracking-wide">Discuss Your Project</span>
                  <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </motion.button>
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
