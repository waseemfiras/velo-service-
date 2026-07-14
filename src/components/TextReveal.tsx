import { motion } from 'motion/react';

export function TextReveal({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) {
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      } as const,
    },
    hidden: {
      opacity: 0,
      y: 50,
      rotateX: -45,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 100,
      } as const,
    },
  };

  return (
    <motion.div
      className={`flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      style={{ perspective: 1000 }}
    >
      {words.map((word, index) => (
        <span className="overflow-hidden inline-flex mr-[0.25em] pb-[0.1em]" key={index}>
          <motion.span
            variants={child}
            className="inline-block origin-bottom"
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
}
