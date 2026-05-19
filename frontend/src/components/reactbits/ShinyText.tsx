import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  className?: string;
}

/**
 * Animated shimmer text — gradient sweeps from left to right.
 * Adapts to light and dark themes via CSS variable colours.
 */
export function ShinyText({ text, className = '' }: ShinyTextProps) {
  return (
    <motion.span
      className={`inline-block text-transparent bg-clip-text ${
        'bg-[linear-gradient(110deg,var(--text-faint),45%,var(--text-primary),55%,var(--text-faint))]'
      } bg-[length:250%_100%] ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
    >
      {text}
    </motion.span>
  );
}
