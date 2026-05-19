import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

interface CountUpProps {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/**
 * Animates a number from 0 to the target value when scrolled into view.
 */
export function CountUp({ to, duration = 1.6, suffix = '', prefix = '', className = '' }: CountUpProps) {
  const ref             = useRef<HTMLSpanElement>(null);
  const isInView        = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      setValue(Math.floor(progress * to));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, to, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}
