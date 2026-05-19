import { motion } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  animateBy?: 'words' | 'chars';
  delay?: number;
}

/**
 * Animates text word-by-word or char-by-char with a blur+fade entrance.
 */
export function BlurText({
  text,
  className = '',
  animateBy = 'words',
  delay = 0.06,
}: BlurTextProps) {
  const units = animateBy === 'words' ? text.split(' ') : text.split('');

  const variants = {
    hidden: { opacity: 0, filter: 'blur(8px)', y: 12 },
    visible: (i: number) => ({
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { delay: i * delay, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    }),
  };

  return (
    <span className={`inline-flex flex-wrap gap-[0.28em] ${className}`}>
      {units.map((unit, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={variants}
          className="inline-block"
        >
          {unit}
        </motion.span>
      ))}
    </span>
  );
}
