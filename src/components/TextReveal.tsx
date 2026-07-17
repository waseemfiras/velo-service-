import { motion } from 'motion/react';

export function TextReveal({ text, className = "", delay = 0 }: { text: string, className?: string, delay?: number }) {
  // Split into words, then letters
  const words = text.split(" ");
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.02, delayChildren: delay },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: 40,
      scale: 0.95,
      filter: "blur(10px)",
      rotateX: -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      rotateX: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        mass: 0.5,
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
      {words.map((word, wordIndex) => (
        <span className="inline-flex mr-[0.25em] pb-[0.1em] whitespace-nowrap overflow-visible" key={wordIndex}>
          {word.split("").map((letter, letterIndex) => (
            <motion.span
              variants={child}
              key={letterIndex}
              className="inline-block origin-bottom"
              style={{ willChange: "transform, filter, opacity" }}
            >
              {letter}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}
