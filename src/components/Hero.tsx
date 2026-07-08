import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TextReveal } from "./TextReveal";
import { Magnetic } from "./Magnetic";
import { useRef, useState } from "react";

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
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVideoEnded, setIsVideoEnded] = useState(false);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex flex-col justify-center px-6 pt-20 overflow-hidden bg-velo-black">
      {/* Smart Video Background */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVideoEnded ? 0.6 : 0.9 }}
          transition={{ duration: 2 }}
          className="w-full h-full"
        >
          <video
            src="https://res.cloudinary.com/gnurrb2w/video/upload/v1783039372/kling_20260703_Image_to_Video__2082_0_oijaxl.mp4"
            autoPlay
            muted
            playsInline
            onEnded={() => setIsVideoEnded(true)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>
        {/* Dark elegant gradient overlay to ensure text is readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-velo-black/60 via-velo-black/20 to-velo-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-velo-black/60 via-transparent to-velo-black/60" />
      </div>

      {/* Background Elements (Subtle glows) */}
      <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]) }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
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
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="hover-target group relative inline-flex items-center gap-4 px-8 py-4 bg-white text-velo-black font-semibold rounded-full overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_80px_rgba(255,255,255,0.3)] transition-all duration-500"
                >
                  <span className="relative z-10 text-lg">Discuss Your Project</span>
                  <div className="relative z-10 w-10 h-10 rounded-full bg-velo-black/10 flex items-center justify-center group-hover:bg-velo-black/20 transition-colors">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-rotate-45 transition-transform duration-300" />
                  </div>
                </motion.button>
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
