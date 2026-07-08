import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, Github, Linkedin, Mail, Code, Zap, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Navbar } from "../components/Navbar";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

export function Founder() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className="bg-velo-black min-h-screen text-white overflow-hidden relative" ref={containerRef}>
      <Navbar />
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.05] via-velo-black to-velo-black" />
        <motion.div 
          style={{ scale, opacity }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[150px] mix-blend-screen"
        />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">
        
        {/* Back Link */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group text-sm font-mono uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-32"
        >
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1 rounded-full bg-white/5">CEO & Founder</span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="overflow-hidden">
              <motion.h1 style={{ y: yText }} className="text-6xl sm:text-8xl lg:text-[8rem] font-display font-bold leading-[0.9] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/30 pb-4">
                Waseem.
              </motion.h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-xl sm:text-2xl font-light text-white/60 leading-relaxed max-w-2xl mb-10">
              At just 16 years old, Waseem leads Velo Service with a vision to redefine digital experiences through cutting-edge architecture and bespoke design.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
              <a href="mailto:waseemquqas@gmail.com" className="hover-target flex items-center gap-3 px-8 py-4 bg-white text-velo-black font-semibold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                Get in Touch
                <Mail className="w-4 h-4" />
              </a>
              <div className="flex gap-2">
                <a href="#" className="hover-target w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="hover-target w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              variants={itemVariants}
              className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 group"
            >
              {/* Using a placeholder for Waseem since we don't have his photo, using abstract high quality visual */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000" 
                alt="Waseem - CEO" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-50 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-6 left-6 z-20">
                <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-2">Age 16 // Visionary Developer</div>
                <div className="flex items-center gap-2 text-white/80 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Building the Future
                </div>
              </div>
              
              {/* Glitch Overlay Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-300 mix-blend-overlay">
                <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50"></div>
              </div>
            </motion.div>
            
            {/* Floating Badges */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="absolute -right-8 top-1/4 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl hidden md:block"
            >
              <div className="text-3xl font-display font-bold text-white mb-1">16<span className="text-emerald-500">.</span></div>
              <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase">Years Old</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Philosophy / Mindset Section */}
        <div className="py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Code, title: "Architectural Precision", desc: "Writing code that scales elegantly. Focusing on modularity, robust backends, and flawless frontends." },
              { icon: Zap, title: "High Performance", desc: "Speed is a feature. Every application is optimized for zero-latency interactions and fluid animations." },
              { icon: Lightbulb, title: "Creative Innovation", desc: "Pushing boundaries beyond standard templates. Creating bespoke visual identities that stand out globally." }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-colors group"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                  <item.icon className="w-5 h-5 text-white/70" />
                </div>
                <h3 className="text-xl font-display font-bold text-white mb-4">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Big Quote */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="py-32 text-center"
        >
          <p className="font-display font-bold text-3xl sm:text-5xl lg:text-7xl leading-tight text-white/20 hover:text-white transition-colors duration-700 cursor-default">
            "Age is a metric of time, <br />
            <span className="text-white">skill is a metric of obsession.</span>"
          </p>
        </motion.div>

      </div>
    </div>
  );
}
