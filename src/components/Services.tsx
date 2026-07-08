import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "motion/react";
import { 
  PenTool, 
  Code2, 
  Server, 
  CheckCircle2, 
  ArrowRight, 
  X, 
  Layers, 
  Cpu, 
  Workflow, 
  Sparkles,
  ChevronRight,
  Monitor,
  Database,
  ArrowUpRight
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

// Define our services translation dictionary
const SERVICES_DATA = [
  {
    id: "01",
    icon: PenTool,
    colorClass: "from-fuchsia-500/20 to-violet-600/20",
    glowColor: "rgba(217, 70, 239, 0.12)",
    accentColor: "text-fuchsia-400",
    badgeBg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    techStack: ["Figma", "Adobe CC", "Spline 3D", "Miro", "Principle"],
    title: {
      en: "Website Design & UI/UX",
      ar: "تصميم المواقع وتجربة المستخدم"
    },
    shortDesc: {
      en: "Bespoke digital interfaces crafted with precision. We blend aesthetics with usability to create intuitive, engaging website user experiences.",
      ar: "واجهات رقمية مخصصة ومصممة بدقة متناهية. ندمج الجماليات مع سهولة الاستخدام لابتكار تجارب مستخدم متميزة وجذابة للمواقع."
    },
    longDesc: {
      en: "We design beautiful, highly converting website interfaces by putting the user first. Our deep discovery process focuses on human-centered research, user persona analysis, and responsive wireframing, culminating in highly interactive, state-of-the-art Figma design systems.",
      ar: "نحن نصمم واجهات مواقع جميلة وعالية التحويل من خلال وضع المستخدم أولاً. تركز عمليتنا العميقة على الأبحاث التي تركز على الإنسان، وتحليل شخصيات المستخدمين، وتخطيط الهيكل السلكي المستجيب لجميع الأجهزة والشاشات، وتتوج بنظام تصميم فيجما رائع ومتكامل."
    },
    tags: {
      en: ["Web Design", "UI/UX for Websites", "Figma Expert", "User Journey", "Prototypes"],
      ar: ["تصميم المواقع", "واجهات المواقع", "خبير فيجما", "رحلة المستخدم", "نماذج تفاعلية"]
    },
    features: {
      en: [
        "Interactive High-Fidelity Figma Prototypes",
        "Comprehensive User Journey Mapping",
        "Modern & Scalable Design Systems",
        "Responsive Website Layouts"
      ],
      ar: [
        "نماذج تفاعلية عالية الدقة في فيجما",
        "رسم خرائط رحلة المستخدم بالكامل",
        "أنظمة تصميم حديثة وقابلة للتطوير",
        "تصاميم ويب متوافقة مع كافة الأجهزة"
      ]
    },
    methodology: [
      {
        step: "01",
        title: { en: "Discover & Audit", ar: "الاستكشاف والتدقيق" },
        desc: { en: "Understanding goals, user needs, and analyzing the competitive landscape.", ar: "فهم أهداف المشروع واحتياجات الجمهور المستهدف مع تحليل المنافسين." }
      },
      {
        step: "02",
        title: { en: "UX Wireframing", ar: "الهيكلة وتجربة المستخدم" },
        desc: { en: "Crafting structural layouts, wireframes, and intuitive navigation loops.", ar: "بناء وتخطيط الهيكل السلكي وخرائط التنقل البديهية داخل الموقع." }
      },
      {
        step: "03",
        title: { en: "Visual Design", ar: "التصميم البصري والواجهات" },
        desc: { en: "Establishing custom color palettes, typography, and cohesive web identities.", ar: "صياغة لوحة الألوان المخصصة والخطوط المنسجمة لإنتاج هوية ويب فريدة." }
      },
      {
        step: "04",
        title: { en: "Interactive Prototype", ar: "النموذج التفاعلي والتسليم" },
        desc: { en: "Building high-fidelity interactive models for review and developer handoff.", ar: "بناء نموذج تفاعلي متكامل للمطورين لبدء مرحلة البرمجة والتدقيق الفني." }
      }
    ]
  },
  {
    id: "02",
    icon: Code2,
    colorClass: "from-cyan-500/20 to-blue-600/20",
    glowColor: "rgba(6, 182, 212, 0.12)",
    accentColor: "text-cyan-400",
    badgeBg: "bg-cyan-500/10 border-cyan-500/20",
    techStack: ["React", "Vite", "TypeScript", "Next.js", "Express", "Tailwind CSS"],
    title: {
      en: "Website Development & Engineering",
      ar: "برمجة وتطوير مواقع الويب"
    },
    shortDesc: {
      en: "Robust, scalable, and high-performance websites built on modern architectures like React, Vite, and Next.js.",
      ar: "مواقع ويب قوية، قابلة للتوسع وعالية الأداء مبنية على أحدث الهياكل البرمجية مثل React و Vite و Next.js."
    },
    longDesc: {
      en: "We build modern, lightning-fast web products designed for speed and conversions. Adhering to strict standards of code cleanliness, modularity, and responsiveness, we deliver end-to-end frontend and backend systems utilizing bleeding-edge frameworks.",
      ar: "نحن نطور منتجات ويب عصرية وسريعة البرق مصممة خصيصاً للتفوق وزيادة الأرباح والمبيعات. بالالتزام بالمعايير الصارمة لبرمجة نظيفة وموديولر، نسلم المواقع بأعلى مستويات الاحترافية والاستجابة الشاملة."
    },
    tags: {
      en: ["Website Dev", "React & Vite", "TypeScript", "Tailwind CSS", "Next.js"],
      ar: ["برمجة المواقع", "React & Vite", "TypeScript", "Tailwind CSS", "Next.js"]
    },
    features: {
      en: [
        "Single-Page Apps & Server-Side Rendering",
        "Clean, Modular & Maintainable Code",
        "Performance-Tuned & SEO-Ready Setup",
        "Fluid Framer Motion Animations"
      ],
      ar: [
        "تطبيقات ويب أحادية الصفحة وتحسين محركات البحث",
        "كود نظيف، موديولر، وسهل التحديث مستقبلاً",
        "إعدادات تضمن سرعة البرق وتصدر نتائج البحث",
        "تأثيرات حركية فائقة السلاسة عبر Motion"
      ]
    },
    methodology: [
      {
        step: "01",
        title: { en: "Architecture", ar: "البنية الأساسية والكود" },
        desc: { en: "Designing robust code structures, page routing, and clean asset pipelines.", ar: "تجهيز البنية البرمجية المتينة ومسارات التنقل خالية من التعقيد." }
      },
      {
        step: "02",
        title: { en: "Front-end Development", ar: "البرمجة والتفاعل" },
        desc: { en: "Translating pixel-perfect designs into highly responsive web interfaces.", ar: "تحويل التصاميم الإبداعية إلى واجهات ويب حقيقية ومستجيبة للأجهزة." }
      },
      {
        step: "03",
        title: { en: "Integrations & APIs", ar: "ربط الملحقات والبرمجيات" },
        desc: { en: "Connecting contact forms, Maps, WhatsApp, analytics and communications.", ar: "ربط النماذج الحية، الخرائط، إحصائيات جوجل، وملحقات الاتصال الفوري." }
      },
      {
        step: "04",
        title: { en: "Optimization & Launch", ar: "الفحص النهائي والأداء" },
        desc: { en: "Optimizing bundle sizes and performance to reach 100% on Google Lighthouse.", ar: "تحسين سرعة التحميل وتهيئة الموقع بالكامل لضمان علامة 100% على مؤشرات Google." }
      }
    ]
  },
  {
    id: "03",
    icon: Server,
    colorClass: "from-amber-500/20 to-rose-600/20",
    glowColor: "rgba(245, 158, 11, 0.12)",
    accentColor: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/20",
    techStack: ["Lighthouse", "Core Web Vitals", "Vite/Webpack", "SSL / DNS", "CI-CD"],
    title: {
      en: "Website Redesign & Optimization",
      ar: "تجديد المواقع وتحسين الأداء"
    },
    shortDesc: {
      en: "Upgrade your existing website. We specialize in website redesigns, extreme speed optimization, and ongoing maintenance.",
      ar: "ترقية وتطوير موقعك الحالي. نحن متخصصون في إعادة تصميم المواقع، وتسريع أدائها، وحزم الصيانة المستمرة."
    },
    longDesc: {
      en: "We breathe new life into existing sites. Whether your current website is slow, looks outdated, or is failing to attract leads, our optimization and redesign framework will modernize your tech stack, boost loading speed, and rebuild your user interface to modern standards.",
      ar: "نحن نمنح الحياة لموقعك الحالي. سواء كان موقعك بطيئاً، أو قديماً، أو لا يحقق المبيعات المرجوة، سيعيد فريقنا صياغة برمجته لتسريعه وتحديث واجهاته بالكامل طبقاً لأعلى المعايير العصرية."
    },
    tags: {
      en: ["Redesign", "Speed Tuning", "Maintenance", "Core Web Vitals", "SEO Audit"],
      ar: ["تجديد المواقع", "تسريع الأداء", "صيانة المواقع", "مؤشرات السرعة", "تدقيق السيو"]
    },
    features: {
      en: [
        "Modernization of Bloated & Stale Layouts",
        "Lightning-Fast Core Web Vitals Optimization",
        "Ongoing Content Updates & Tech Support",
        "Security Hardening & SSL Configurations"
      ],
      ar: [
        "إعادة تصميم كاملة وعصرية للهياكل القديمة",
        "تسريع أداء الموقع ومؤشرات السرعة الفنية",
        "باقات صيانة وتحديثات مستمرة وتأمين فني",
        "تعزيز دروع الحماية وشهادات الأمان والاستضافة"
      ]
    },
    methodology: [
      {
        step: "01",
        title: { en: "Technical Audit", ar: "فحص وتحليل الأداء" },
        desc: { en: "Analyzing page speeds, security vulnerabilities, and UX bottlenecks.", ar: "تحليل سرعة تحميل الصفحات الحالي، فحص الثغرات الأمنية ومشاكل تجربة المستخدم." }
      },
      {
        step: "02",
        title: { en: "Visual Makeover", ar: "التجديد البصري والماركة" },
        desc: { en: "Updating layouts, modern spacing, typography, and visual brand identity.", ar: "تحديث التصاميم البصرية، الهياكل، والخطوط بما يخدم الهوية العصرية للموقع." }
      },
      {
        step: "03",
        title: { en: "Refactoring & Tuning", ar: "البرمجة والتحسين الفعلي" },
        desc: { en: "Refactoring bloated scripts, compressing images, and caching configurations.", ar: "تعديل السكربتات البطيئة، ضغط الصور والملفات وتفعيل أنظمة التخزين المؤقت CDN." }
      },
      {
        step: "04",
        title: { en: "Security & Shielding", ar: "تفعيل الحماية والصيانة" },
        desc: { en: "Deploying automated backups, active firewalls, and reliable support.", ar: "تشغيل جدولة النسخ الاحتياطي، تعزيز دروع الحماية وتقديم الدعم الفني المستمر." }
      }
    ]
  }
];

interface ServiceCardProps {
  service: typeof SERVICES_DATA[0];
  index: number;
  onSelect: (service: typeof SERVICES_DATA[0]) => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, index, onSelect }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 120, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 120, damping: 15 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setCoords({ x: mouseX, y: mouseY });

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const currentTitle = service.title[language];
  const currentShortDesc = service.shortDesc[language];
  const currentTags = service.tags[language];
  const currentFeatures = service.features[language];

  return (
    <motion.div
      id={`service-card-${service.id}`}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ type: "spring", stiffness: 80, damping: 20, delay: index * 0.15 }}
      whileHover={{
        y: -12,
        scale: 1.03,
        borderColor: "rgba(255, 255, 255, 0.25)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 50px rgba(255, 255, 255, 0.04)",
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
      style={{
        transformStyle: "preserve-3d",
        rotateX,
        rotateY,
      }}
      className="group relative rounded-3xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 overflow-hidden transition-colors duration-500 flex flex-col justify-between min-h-[520px] shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] cursor-pointer text-right"
      onClick={() => onSelect(service)}
    >
      {/* Background Glowing Blur Orb behind/inside the glass */}
      <div 
        className={`absolute -top-16 -left-16 w-52 h-52 rounded-full bg-gradient-to-br ${service.colorClass} opacity-15 blur-[60px] group-hover:opacity-30 group-hover:scale-130 transition-all duration-700 pointer-events-none z-0`}
      />

      {/* Interactive Cursor Spotlight */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${service.glowColor}, transparent 80%)`
        }}
      />

      {/* Top Section */}
      <div className="relative z-10 flex-grow" style={{ transform: "translateZ(30px)" }}>
        {/* Card Header Info */}
        <div className="flex justify-between items-start mb-8">
          <motion.div 
            animate={{ 
              scale: isHovered ? 1.15 : 1, 
              rotate: isHovered ? 8 : 0,
              backgroundColor: isHovered ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.03)",
              borderColor: isHovered ? "rgba(255, 255, 255, 0.25)" : "rgba(255, 255, 255, 0.1)"
            }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center shadow-xl transition-colors duration-300 bg-white/[0.03]"
          >
            <service.icon className={`w-7 h-7 text-white/90 group-hover:${service.accentColor} transition-colors duration-300`} />
          </motion.div>
          <span className="text-white/20 font-display font-bold text-3xl tracking-tight group-hover:text-white/40 transition-colors duration-500">
            {service.id}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-2xl sm:text-3xl mb-4 text-white group-hover:text-white/95 transition-colors duration-300">
          {currentTitle}
        </h3>

        {/* Short Description */}
        <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6 font-light group-hover:text-white/80 transition-colors duration-300">
          {currentShortDesc}
        </p>

        {/* Frosted Micro Tags */}
        <div className="flex flex-wrap gap-2 mb-6 justify-start" style={{ direction: 'ltr' }}>
          {currentTags.slice(0, 3).map((tag, tIndex) => (
            <motion.span 
              key={tag} 
              animate={{ 
                y: isHovered ? -5 : 0, 
                scale: isHovered ? 1.05 : 1,
                borderColor: isHovered ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.05)",
                color: isHovered ? "rgba(255, 255, 255, 0.85)" : "rgba(255, 255, 255, 0.5)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 18, 
                delay: isHovered ? tIndex * 0.04 : 0 
              }}
              className="text-[10px] font-sans font-medium px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/5 backdrop-blur-sm transition-all"
            >
              {tag}
            </motion.span>
          ))}
          {currentTags.length > 3 && (
            <span className="text-[10px] font-sans font-medium px-2.5 py-1 rounded-full bg-white/[0.01] border border-white/5 text-white/30 backdrop-blur-sm">
              +{currentTags.length - 3}
            </span>
          )}
        </div>

        {/* Mini Feature Bullet Points */}
        <div className="space-y-3 mt-4 border-t border-white/5 pt-5 flex flex-col items-end">
          {currentFeatures.slice(0, 2).map((feat, fIndex) => (
            <motion.div 
              key={feat} 
              animate={{ 
                x: isHovered ? -4 : 0,
                color: isHovered ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.5)"
              }}
              transition={{ 
                type: "spring", 
                stiffness: 250, 
                damping: 20, 
                delay: isHovered ? fIndex * 0.05 + 0.1 : 0 
              }}
              className="flex items-center gap-3 text-xs justify-end w-full"
            >
              <span className="font-light truncate text-right flex-grow">{feat}</span>
              <CheckCircle2 className={`w-4 h-4 ${service.accentColor} opacity-70 shrink-0`} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Button */}
      <div className="relative z-10 mt-8 pt-4 border-t border-white/5" style={{ transform: "translateZ(20px)" }}>
        <button
          className="w-full flex items-center justify-between group/btn py-3 px-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 hover:border-white/20 text-xs sm:text-sm font-sans font-medium text-white/80 hover:text-white transition-all cursor-none"
        >
          <span>{language === 'ar' ? 'استكشف الخدمة' : 'Explore Service'}</span>
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300">
              {language === 'ar' ? 'عرض تفصيلي' : 'Detailed View'}
            </span>
            <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-185 group-hover/btn:rotate-180' : '-rotate-45 group-hover/btn:rotate-0'} transition-transform duration-300`} />
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export function Services() {
  const [selectedService, setSelectedService] = useState<typeof SERVICES_DATA[0] | null>(null);
  const { t, language } = useLanguage();

  return (
    <section id="services" className="py-32 px-6 relative z-10 overflow-hidden bg-[#08090A]">
      {/* Decorative background grid layout */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-20" />
      
      {/* Dynamic ambient glass glows in the background */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        
        {/* Section Header */}
        <div className="mb-24 flex flex-col md:flex-row gap-8 justify-between items-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`max-w-3xl ${language === 'ar' ? 'text-right' : 'text-left'} w-full`}
          >
            <h2 className="font-display font-bold text-4xl sm:text-6xl tracking-tighter mb-6 text-white">
              {t('services_section_title')}{' '}
              <span className="text-white/30 font-normal">{t('services_section_subtitle')}</span>
            </h2>
            <p className="text-white/55 text-base sm:text-lg font-light leading-relaxed">
              {t('services_section_desc')}
            </p>
          </motion.div>
        </div>

        {/* Services Grid with Perspective Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10" style={{ perspective: "1200px" }}>
          {SERVICES_DATA.map((service, index) => (
            <ServiceCard 
              key={service.id} 
              service={service} 
              index={index} 
              onSelect={setSelectedService}
            />
          ))}
        </div>
      </div>

      {/* Interactive Glassmorphic Service Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" id="service-modal-overlay">
            {/* Modal Backdrop with deep blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setSelectedService(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 40 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-[#111214]/90 border border-white/10 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] z-10 max-h-[90vh] flex flex-col text-right"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dynamic decorative backdrop radial glow based on the selected service */}
              <div className={`absolute -top-40 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr ${selectedService.colorClass} opacity-20 blur-[100px] pointer-events-none`} />

              {/* Modal Header */}
              <div className={`flex justify-between items-center px-6 py-6 sm:px-10 border-b border-white/5 relative z-10 bg-white/[0.01] ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex items-center gap-4 ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <selectedService.icon className={`w-5 h-5 ${selectedService.accentColor}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-sans font-semibold tracking-wider text-white/40 uppercase">
                      {language === 'ar' ? 'نظرة تفصيلية للخدمة' : 'Service Detail Overview'}
                    </span>
                    <h4 className="font-display font-bold text-lg sm:text-xl text-white">{selectedService.title[language]}</h4>
                  </div>
                </div>
                
                <button
                  id="close-service-modal-btn"
                  onClick={() => setSelectedService(null)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all cursor-none"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable Container) */}
              <div className="p-6 sm:p-10 overflow-y-auto relative z-10 flex-grow space-y-10 custom-scrollbar">
                
                {/* 2-Column Overview Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                  {/* Left Info: Key deliverables & description */}
                  <div className={`md:col-span-7 space-y-6 ${language === 'ar' ? 'md:order-2 text-right' : 'md:order-1 text-left'}`}>
                    <h5 className="text-xs font-sans font-semibold tracking-widest text-white/40 uppercase">
                      {language === 'ar' ? 'تفاصيل الخبرة والتقديم' : 'Expertise Details'}
                    </h5>
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed font-light">
                      {selectedService.longDesc[language]}
                    </p>

                    <div className="space-y-4">
                      <h5 className="text-xs font-sans font-semibold tracking-widest text-white/40 uppercase">
                        {language === 'ar' ? 'أبرز مخرجات وبنود العمل' : 'Key Deliverables'}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedService.features[language].map((feat) => (
                          <div key={feat} className={`flex items-center gap-3 text-xs text-white/70 ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                            <CheckCircle2 className={`w-4 h-4 ${selectedService.accentColor} shrink-0`} />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Info: Tech Stack Box */}
                  <div className={`md:col-span-5 bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden ${language === 'ar' ? 'md:order-1 text-right' : 'md:order-2 text-left'}`}>
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Cpu className="w-16 h-16 text-white" />
                    </div>
                    <h5 className="text-xs font-sans font-semibold tracking-widest text-white/40 uppercase mb-4">
                      {t('services_techStack')}
                    </h5>
                    <div className={`flex flex-wrap gap-2 ${language === 'ar' ? 'justify-start' : 'justify-start'}`} style={{ direction: 'ltr' }}>
                      {selectedService.techStack.map((tech) => (
                        <span 
                          key={tech} 
                          className="text-xs font-sans font-medium px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-white/80 hover:bg-white/[0.08] hover:text-white transition-colors cursor-none"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workflow Roadmap / Methodology (Interactive Step-by-Step) */}
                <div className="space-y-8 pt-6 border-t border-white/5">
                  <div className={`flex items-center gap-3 ${language === 'ar' ? 'flex-row-reverse text-right' : 'flex-row text-left'}`}>
                    <Workflow className={`w-5 h-5 ${selectedService.accentColor}`} />
                    <h5 className="text-sm font-display font-semibold tracking-wide text-white">
                      {language === 'ar' ? 'منهجية العمل (مراحل المشروع)' : 'How We Work (Our Project Pipeline)'}
                    </h5>
                  </div>
                  
                  {/* Timeline steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {selectedService.methodology.map((meth, mIdx) => (
                      <div key={meth.step} className="relative group/step bg-white/[0.01] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.03] hover:border-white/10 transition-all duration-300 text-right">
                        {/* Decorative background step connector (line) */}
                        {mIdx < 3 && (
                          <div className={`hidden lg:block absolute top-1/2 w-8 h-[1px] bg-white/10 z-0 pointer-events-none group-hover/step:bg-white/20 transition-colors ${language === 'ar' ? '-left-4' : '-right-4'}`} />
                        )}
                        
                        <div className={`flex justify-between items-center mb-3 relative z-10 ${language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <span className={`text-[9px] font-sans font-bold tracking-wider px-2 py-0.5 rounded-full ${selectedService.badgeBg} ${selectedService.accentColor}`}>
                            {language === 'ar' ? `المرحلة ${meth.step}` : `STAGE ${meth.step}`}
                          </span>
                          <span className="text-white/10 font-display font-bold text-xl group-hover/step:text-white/20 transition-colors">
                            {meth.step}
                          </span>
                        </div>

                        <h6 className="text-sm font-sans font-semibold text-white mb-2 group-hover/step:text-white transition-colors">
                          {meth.title[language]}
                        </h6>
                        <p className="text-xs text-white/50 leading-relaxed font-light group-hover/step:text-white/60 transition-colors">
                          {meth.desc[language]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer CTA */}
              <div className={`px-6 py-6 sm:px-10 border-t border-white/5 bg-white/[0.02] flex flex-col sm:flex-row gap-4 justify-between items-center relative z-10 ${language === 'ar' ? 'sm:flex-row-reverse' : 'sm:flex-row'}`}>
                <p className="text-xs text-white/45 text-center sm:text-left">
                  {language === 'ar' 
                    ? "جاهز لتطوير مشروعك؟ ناقش هذه المنهجية مباشرة مع مساعد فيلو." 
                    : "Ready to develop your project? Discuss this workflow directly with Velo Assistant."}
                </p>
                 <div className={`flex flex-wrap gap-3 w-full sm:w-auto ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-sans font-medium text-white/80 hover:text-white transition-all cursor-none"
                  >
                    {language === 'ar' ? 'إغلاق التفاصيل' : 'Close Details'}
                  </button>
                  <a
                    href="#chat"
                    onClick={() => {
                      setSelectedService(null);
                      // Scroll to chat/bot section
                      setTimeout(() => {
                        const chatEl = document.getElementById("chat");
                        if (chatEl) {
                          chatEl.scrollIntoView({ behavior: "smooth" });
                        }
                      }, 150);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-sans font-medium text-white/80 hover:text-white transition-all cursor-none"
                  >
                    <span>{t('hero_cta_start')}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                  <Link
                    id="request-service-modal-link"
                    to={`/request-service?service=${encodeURIComponent(selectedService.title.en)}`}
                    onClick={() => setSelectedService(null)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-sans font-bold transition-all shadow-md hover:shadow-xl cursor-none"
                  >
                    <span>{t('services_request_quotation')}</span>
                    <ArrowRight className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
