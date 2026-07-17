import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, X, ArrowLeft, ArrowRight, Layers, Sliders, ExternalLink } from "lucide-react";
import { Magnetic } from "./Magnetic";

// Curated showcase of 6 premium projects for the main interactive spotlight
const featuredProjects = [
  {
    id: 1,
    title: "Fintech Dashboard UI",
    category: "UI/UX Design",
    year: "2026",
    tags: ["React", "Framer Motion", "Tailwind"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 2,
    title: "E-Commerce Platform",
    category: "Full-Stack Web",
    year: "2026",
    tags: ["Next.js", "GraphQL", "NodeJS"],
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 3,
    title: "AI Chat Integration",
    category: "API & Backend",
    year: "2025",
    tags: ["Gemini API", "Express", "Vite"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 4,
    title: "Aether Capital Portal",
    category: "Web3/Blockchain",
    year: "2026",
    tags: ["Solidity", "Web3JS", "React"],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 5,
    title: "Kallisto Identity",
    category: "Brand Design",
    year: "2025",
    tags: ["Branding", "Vector", "Illustrator"],
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=1200",
  },
  {
    id: 6,
    title: "Quantum Dev Studio",
    category: "Product Design",
    year: "2026",
    tags: ["Figma", "UI/UX", "Component System"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200",
  }
];

// Complete set of 20 detailed projects for the full screen grid
const allProjectsList = [
  {
    id: 1,
    title: "Fintech Dashboard UI",
    category: "UI/UX Design",
    year: "2026",
    tags: ["React", "Framer Motion", "Tailwind"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    title: "E-Commerce Platform",
    category: "Full-Stack Web",
    year: "2026",
    tags: ["Next.js", "GraphQL", "NodeJS"],
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    title: "AI Chat Integration",
    category: "API & Backend",
    year: "2025",
    tags: ["Gemini API", "Express", "Vite"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 4,
    title: "Aether Capital Portal",
    category: "Web3/Blockchain",
    year: "2026",
    tags: ["Solidity", "Web3JS", "React"],
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 5,
    title: "Kallisto Identity",
    category: "Brand Design",
    year: "2025",
    tags: ["Branding", "Vector", "Illustrator"],
    image: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 6,
    title: "Quantum Dev Studio",
    category: "Product Design",
    year: "2026",
    tags: ["Figma", "UI/UX", "Component System"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 7,
    title: "Verdant Smart App",
    category: "IoT Systems",
    year: "2025",
    tags: ["React Native", "C++", "Sensors"],
    image: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 8,
    title: "Zenith Clock App",
    category: "Full-Stack Web",
    year: "2025",
    tags: ["Svelte", "D3.js", "WebAudio"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 9,
    title: "Synthesis Synthesizer",
    category: "API & Backend",
    year: "2026",
    tags: ["PyTorch", "Midi", "WebAudio"],
    image: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 10,
    title: "Monolith VR Museum",
    category: "Interactive 3D",
    year: "2026",
    tags: ["Three.js", "WebXR", "Blender"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 11,
    title: "Aura Skincare Shop",
    category: "Brand Design",
    year: "2025",
    tags: ["Design Strategy", "Web Design"],
    image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 12,
    title: "Artemis Routing OS",
    category: "API & Backend",
    year: "2026",
    tags: ["Rust", "PostgreSQL", "gRPC"],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 13,
    title: "Nova Smart Wearable",
    category: "Product Design",
    year: "2025",
    tags: ["Mobile UX", "Hardware Hub"],
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 14,
    title: "Pluto Protocol DEX",
    category: "Web3/Blockchain",
    year: "2026",
    tags: ["Web3", "Ethers.js", "React"],
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 15,
    title: "Horizon Real Estate",
    category: "Full-Stack Web",
    year: "2025",
    tags: ["Nuxt.js", "Django", "Tailwind"],
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 16,
    title: "Echo Smart Driver",
    category: "Product Design",
    year: "2026",
    tags: ["CAD", "Acoustics", "Figma"],
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 17,
    title: "Oasis Interactive Menu",
    category: "UI/UX Design",
    year: "2025",
    tags: ["React Native", "Expo", "Redux"],
    image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 18,
    title: "Hyperion Car Cluster",
    category: "Interactive 3D",
    year: "2026",
    tags: ["Unity", "C#", "Embedded UI"],
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 19,
    title: "Chronos Calendar App",
    category: "Full-Stack Web",
    year: "2025",
    tags: ["React", "Express", "Node"],
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 20,
    title: "Solstice Music Fest",
    category: "Interactive 3D",
    year: "2026",
    tags: ["WebGL", "PixiJS", "Framer Motion"],
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800",
  }
];

export function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAllOpen, setIsAllOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAutoplay, setIsAutoplay] = useState(true);

  // Auto change project image if not hovered / interacted
  useEffect(() => {
    if (!isAutoplay || isAllOpen) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredProjects.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoplay, isAllOpen]);

  // Handle body scroll locking when viewing all projects
  useEffect(() => {
    if (isAllOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isAllOpen]);

  // Extract unique categories for grid filters
  const categories = ["All", "UI/UX Design", "Full-Stack Web", "API & Backend", "Brand Design", "Product Design", "Interactive 3D"];

  const filteredProjects = filter === "All" 
    ? allProjectsList 
    : allProjectsList.filter(p => p.category === filter);

  return (
    <section id="work" className="py-24 sm:py-32 px-4 sm:px-6 relative z-10 bg-black/40 backdrop-blur-[2px]" ref={containerRef}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header section with responsive visual layouts */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 sm:mb-24 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="flex items-center gap-2 text-white/40 uppercase font-mono text-xs tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
              <span>SELECTED ARCHIVES</span>
            </div>
            <h2 className="font-display font-bold text-5xl sm:text-7xl tracking-tighter leading-none">
              Selected <span className="text-white/30 font-light italic">Works</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Magnetic>
              <button 
                onClick={() => setIsAllOpen(true)}
                className="btn-premium group px-8 py-3.5 text-white"
              >
                <div className="btn-glow" />
                <Layers className="relative z-10 w-4 h-4 text-white group-hover:text-white transition-colors" />
                <span className="relative z-10 text-white font-semibold text-sm tracking-wide">View 20 Projects</span>
                <ArrowUpRight className="relative z-10 w-4 h-4 text-white group-hover:text-white transition-colors transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </Magnetic>
          </motion.div>
        </div>

        {/* Dynamic Spotlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Interactive Navigation Items */}
          <div className="lg:col-span-5 flex flex-col gap-2 order-2 lg:order-1">
            {featuredProjects.map((project, index) => {
              const isActive = index === activeIndex;
              return (
                <div
                  key={project.id}
                  onMouseEnter={() => {
                    setActiveIndex(index);
                    setIsAutoplay(false);
                  }}
                  onMouseLeave={() => setIsAutoplay(true)}
                  onClick={() => setActiveIndex(index)}
                  className="group relative py-6 sm:py-8 px-4 sm:px-6 rounded-2xl cursor-pointer transition-all duration-300 select-none overflow-hidden"
                >
                  {/* Item background card highlight */}
                  <div className={`absolute inset-0 bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`} />
                  
                  <div className="relative z-10 flex items-start gap-4 sm:gap-6">
                    {/* Number styling */}
                    <span className={`font-mono text-sm tracking-wider transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/25 group-hover:text-white/60'}`}>
                      0{index + 1}
                    </span>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center gap-4">
                        <h3 className={`font-display text-xl sm:text-2xl font-semibold tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/80'}`}>
                          {project.title}
                        </h3>
                        <ArrowUpRight className={`w-5 h-5 shrink-0 transition-all duration-300 ${isActive ? 'text-white opacity-100 translate-x-0' : 'text-white/0 opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:text-white group-hover:translate-x-0'}`} />
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                        <span className={`text-xs transition-colors duration-300 ${isActive ? 'text-white/60 font-medium' : 'text-white/20'}`}>
                          {project.category}
                        </span>
                        <span className="text-white/10 text-xs">•</span>
                        <span className="font-mono text-[10px] bg-white/5 text-white/40 px-2 py-0.5 rounded border border-white/5">
                          {project.year}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic interactive loading progress indicator (only shows on active) */}
                  {isActive && (
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/30"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 5, ease: "linear" }}
                      style={{ originX: 0 }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: High-performance Animated Single Showcase Frame */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-zinc-950">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={activeIndex}
                  initial={{ 
                    opacity: 0, 
                    scale: 1.25, 
                    rotate: -1,
                    filter: "blur(20px)",
                    clipPath: "inset(12% 12% 12% 12% round 40px)" 
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotate: 0,
                    filter: "blur(0px)",
                    clipPath: "inset(0% 0% 0% 0% round 24px)" 
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.85, 
                    rotate: 1,
                    filter: "blur(20px)",
                    clipPath: "inset(12% 12% 12% 12% round 40px)" 
                  }}
                  transition={{ 
                    duration: 0.95, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="absolute inset-0 w-full h-full select-none"
                >
                  {/* Subtle dark vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 z-10 pointer-events-none" />
                  
                  <img
                    src={featuredProjects[activeIndex].image}
                    alt={featuredProjects[activeIndex].title}
                    className="object-cover w-full h-full"
                  />

                  {/* Absolute image overlay statistics and details */}
                  <div className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      <div className="flex gap-1.5 mb-2">
                        {featuredProjects[activeIndex].tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="text-[10px] font-mono tracking-wider uppercase bg-black/60 text-white/80 px-2.5 py-1 rounded-full border border-white/5 backdrop-blur-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="font-display font-bold text-2xl text-white tracking-tight">
                        {featuredProjects[activeIndex].title}
                      </h4>
                    </motion.div>

                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                      className="hidden sm:flex flex-col items-end font-mono text-[10px] tracking-widest text-white/50"
                    >
                      <span>FRAME REF // 0{featuredProjects[activeIndex].id}</span>
                      <span>VELO ARCHIVE_2026</span>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>

      {/* FULL-PAGE IMMERSIVE ALL PROJECTS OVERLAY (20 projects list) */}
      <AnimatePresence>
        {isAllOpen && (
          <motion.div
            initial={{ 
              opacity: 0, 
              clipPath: "circle(0% at 50% 50%)" 
            }}
            animate={{ 
              opacity: 1, 
              clipPath: "circle(150% at 50% 50%)" 
            }}
            exit={{ 
              opacity: 0, 
              clipPath: "circle(0% at 50% 50%)" 
            }}
            transition={{ 
              duration: 0.95, 
              ease: [0.76, 0, 0.24, 1] 
            }}
            className="fixed inset-0 z-[1000] bg-zinc-950 overflow-y-auto overflow-x-hidden p-4 sm:p-8"
          >
            {/* Floating Close Button (Top Right) */}
            <div className="fixed top-6 right-6 z-[1050]">
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAllOpen(false)}
                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-zinc-900/90 backdrop-blur-md hover:bg-white hover:text-black hover:border-white transition-all duration-300 text-white shadow-2xl"
                title="إغلاق / Close"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Ambient visual background glow details */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-white/[0.01] rounded-full blur-3xl pointer-events-none" />
            
            <div className="max-w-7xl mx-auto relative z-10 pt-16 pb-24">
              
              {/* Close Button & Header Row */}
              <div className="flex justify-between items-center mb-16">
                <motion.button 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  onClick={() => setIsAllOpen(false)}
                  className="flex items-center gap-2 group text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="font-mono text-xs tracking-widest uppercase">Go Back Home</span>
                </motion.button>
              </div>

              {/* Decorative Title Block */}
              <div className="text-center mb-20">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <span className="font-mono text-[10px] bg-white/5 text-white/60 px-3.5 py-1.5 rounded-full border border-white/5 uppercase tracking-widest inline-block mb-4">
                    VELO LABS CREATIVE VAULT
                  </span>
                  <h1 className="font-display font-bold text-5xl sm:text-7xl tracking-tighter text-white">
                    Vault of <span className="text-white/40 italic font-light">All Projects</span>
                  </h1>
                  <p className="text-white/40 max-w-xl mx-auto mt-4 text-sm sm:text-base font-sans leading-relaxed">
                    Explore our immersive digital portfolio representing 20 creative experiments, high-performance systems, and bespoke application frontends.
                  </p>
                </motion.div>
              </div>

              {/* Dynamic Categorization Filter Bar */}
              <motion.div 
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap justify-center gap-2 mb-16 max-w-3xl mx-auto"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 sm:px-5 py-2.5 rounded-full text-xs font-medium tracking-wide transition-all duration-300 ${filter === cat ? 'bg-white text-black font-semibold' : 'bg-white/[0.03] hover:bg-white/[0.08] text-white/60 hover:text-white border border-white/5'}`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>

              {/* Responsive Staggered Grid of 20 Projects */}
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProjects.map((project, idx) => (
                    <motion.div
                      layout
                      key={project.id}
                      initial={{ scale: 0.95, opacity: 0, y: 30 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.9, opacity: 0, y: 20 }}
                      transition={{ 
                        duration: 0.65, 
                        ease: [0.16, 1, 0.3, 1],
                        delay: idx * 0.03
                      }}
                      className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-3xl p-4 hover:border-white/25 transition-colors duration-500 overflow-hidden relative"
                    >
                      {/* Project image container */}
                      <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-5 bg-zinc-950">
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500 z-10" />
                        <motion.img 
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          src={project.image} 
                          alt={project.title} 
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                        <span className="absolute top-4 left-4 z-20 font-mono text-[10px] bg-black/70 text-white/80 border border-white/5 px-2.5 py-1 rounded-md backdrop-blur-sm">
                          {project.year}
                        </span>
                      </div>

                      {/* Info & metadata block */}
                      <div className="flex flex-col flex-grow justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-white/40 tracking-wide font-mono uppercase">
                              {project.category}
                            </span>
                            <span className="text-xs font-mono text-white/20">0{project.id}</span>
                          </div>
                          <h3 className="font-display font-bold text-xl text-white group-hover:text-white/90 transition-colors tracking-tight line-clamp-1 mb-3">
                            {project.title}
                          </h3>
                        </div>

                        <div>
                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 pt-1 mb-4">
                            {project.tags.map((tag) => (
                              <span 
                                key={tag} 
                                className="text-[9px] font-mono tracking-wide uppercase bg-white/5 text-white/50 px-2 py-0.5 rounded border border-white/5"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Trigger action button inside card */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-white/50 group-hover:text-white transition-colors">
                            <span className="font-mono tracking-wider text-[10px] uppercase">EXP_REFERENCE_INDEX</span>
                            <div className="flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                              <span>Launch Details</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Bottom Close Button */}
              {filteredProjects.length > 0 && (
                <div className="flex justify-center mt-20">
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setIsAllOpen(false)}
                    className="btn-premium group px-10 py-4 text-white shadow-xl"
                  >
                    <div className="btn-glow" />
                    <ArrowLeft className="relative z-10 w-4 h-4 text-white transition-colors transform group-hover:-translate-x-1" />
                    <span className="relative z-10 text-white font-semibold text-sm tracking-wide">إغلاق المعرض والعودة / Close & Go Back</span>
                  </motion.button>
                </div>
              )}

              {/* Empty state when no projects match the filter */}
              {filteredProjects.length === 0 && (
                <div className="text-center py-20">
                  <span className="text-white/20 font-mono text-sm block mb-2">NO ARCHIVES MATCH THIS CATEGORY</span>
                  <button 
                    onClick={() => setFilter("All")}
                    className="text-white underline text-xs font-mono"
                  >
                    Reset Filter
                  </button>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
