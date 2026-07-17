import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, Github, Linkedin, Mail, Code, Zap, Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";
import { useRef } from "react";
import { Navbar } from "../components/Navbar";
import { useLanguage } from "../contexts/LanguageContext";

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
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
  const { language } = useLanguage();
  const isAr = language === 'ar';
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  return (
    <div className={`bg-velo-black min-h-screen text-white overflow-hidden relative ${isAr ? 'text-right' : ''}`} ref={containerRef}>
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
          initial={{ opacity: 0, x: isAr ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link to="/" className={`btn-premium px-5 py-2 text-white/80 hover:text-white group text-sm font-mono tracking-widest ${isAr ? 'flex-row-reverse justify-end' : ''}`}>
            <div className="btn-glow" />
            {isAr ? (
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            ) : (
              <ArrowLeft className="relative z-10 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            )}
            <span className="relative z-10">{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
          </Link>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={`grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mb-32 ${isAr ? 'rtl' : 'ltr'}`}
        >
          <div className="lg:col-span-7 flex flex-col justify-center">
            <motion.div variants={itemVariants} className={`mb-6 inline-flex items-center gap-3 flex-wrap ${isAr ? 'flex-row-reverse self-start' : ''}`}>
              <span className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/80 border border-white/10 px-3 py-1.5 rounded-full bg-white/5 ${isAr ? 'flex-row-reverse' : ''}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isAr ? 'الرئيس التنفيذي والمؤسس' : 'CEO & Founder'}
              </span>
              <span className={`inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/50 border border-white/10 px-3 py-1.5 rounded-full bg-white/5 ${isAr ? 'flex-row-reverse' : ''}`}>
                🇵🇸 {isAr ? 'فلسطين' : 'Palestine'}
              </span>
            </motion.div>
            
            <motion.div variants={itemVariants} className="overflow-hidden">
              <motion.h1 style={{ y: yText }} className="text-6xl sm:text-8xl lg:text-[8rem] font-display font-bold leading-[0.9] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-white/30 pb-4 relative">
                {isAr ? 'وسيم.' : 'Waseem.'}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                  className={`absolute -bottom-2 h-1 bg-gradient-to-r from-emerald-500 to-transparent ${isAr ? 'right-0 bg-gradient-to-l' : 'left-0'}`}
                />
              </motion.h1>
            </motion.div>

            <motion.p variants={itemVariants} className="text-xl sm:text-2xl font-light text-white/60 leading-relaxed max-w-2xl mb-10">
              {isAr ? (
                <>في عمر <strong className="text-white">١٨ عاماً</strong> فقط، يقود وسيم وكالة Velo Service برؤية لإعادة تعريف التجارب الرقمية من خلال هندسة برمجية متطورة وتصاميم مخصصة، بفخر يبني المستقبل من <strong className="text-white">فلسطين</strong>.</>
              ) : (
                <>At just <strong className="text-white">18 years old</strong>, Waseem leads Velo Service with a vision to redefine digital experiences through cutting-edge architecture and bespoke design, proudly building from <strong className="text-white">Palestine</strong>.</>
              )}
            </motion.p>

            <motion.div variants={itemVariants} className={`flex flex-wrap gap-4 ${isAr ? 'flex-row-reverse self-start' : ''}`}>
              <a href="mailto:waseemquqas@gmail.com" className={`hover-target flex items-center gap-3 px-8 py-4 bg-white text-velo-black font-semibold rounded-full hover:bg-white/90 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 duration-300 ${isAr ? 'flex-row-reverse' : ''}`}>
                {isAr ? 'تواصل معي' : 'Get in Touch'}
                <Mail className="w-4 h-4" />
              </a>
              <div className="flex gap-2">
                <a href="#" className="hover-target w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="hover-target w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5 relative">
            <motion.div 
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
              className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-white/5 border border-white/10 group shadow-2xl"
            >
              {/* Using a placeholder for Waseem since we don't have his photo, using abstract high quality visual */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
              <img 
                src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000" 
                alt="Waseem - CEO" 
                className="w-full h-full object-cover mix-blend-luminosity opacity-50 group-hover:opacity-80 transition-opacity duration-700 group-hover:scale-105"
              />
              <div className={`absolute bottom-6 z-20 ${isAr ? 'right-6' : 'left-6'}`}>
                <div className="font-mono text-[10px] text-white/40 tracking-widest uppercase mb-2">
                  {isAr ? 'العمر ١٨ // مطور ذو رؤية' : 'Age 18 // Visionary Developer'}
                </div>
                <div className={`flex items-center gap-2 text-white/80 font-medium ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isAr ? 'نبني المستقبل' : 'Building the Future'}
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
              className={`absolute top-1/4 bg-white/10 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl hidden md:block ${isAr ? '-left-8' : '-right-8'}`}
            >
              <div className="text-3xl font-display font-bold text-white mb-1">{isAr ? '١٨' : '18'}<span className="text-emerald-500">.</span></div>
              <div className="text-[10px] font-mono tracking-widest text-white/50 uppercase">{isAr ? 'عاماً' : 'Years Old'}</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Philosophy / Mindset Section */}
        <div className="py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Code, 
                title: isAr ? "دقة معمارية" : "Architectural Precision", 
                desc: isAr ? "كتابة أكواد قابلة للتوسع بأناقة. التركيز على النمطية، والواجهات الخلفية القوية، والواجهات الأمامية الخالية من العيوب." : "Writing code that scales elegantly. Focusing on modularity, robust backends, and flawless frontends." 
              },
              { 
                icon: Zap, 
                title: isAr ? "أداء عالي" : "High Performance", 
                desc: isAr ? "السرعة هي ميزة. يتم تحسين كل تطبيق للحصول على تفاعلات خالية من التأخير وحركات سلسة." : "Speed is a feature. Every application is optimized for zero-latency interactions and fluid animations." 
              },
              { 
                icon: Lightbulb, 
                title: isAr ? "ابتكار إبداعي" : "Creative Innovation", 
                desc: isAr ? "تجاوز الحدود أبعد من القوالب القياسية. إنشاء هويات بصرية مخصصة تبرز عالمياً." : "Pushing boundaries beyond standard templates. Creating bespoke visual identities that stand out globally." 
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-colors group"
              >
                <div className={`w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white/10 transition-all ${isAr ? 'ml-auto' : ''}`}>
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
            {isAr ? (
              <>
                "العمر مقياس للوقت، <br />
                <span className="text-white">المهارة مقياس للشغف.</span>"
              </>
            ) : (
              <>
                "Age is a metric of time, <br />
                <span className="text-white">skill is a metric of obsession.</span>"
              </>
            )}
          </p>
        </motion.div>

      </div>
    </div>
  );
}
