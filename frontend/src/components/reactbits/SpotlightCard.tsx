import { useRef, useState } from 'react';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

/**
 * Card that follows mouse with a radial spotlight effect.
 * Colour adapts to light/dark automatically via the default.
 */
export function SpotlightCard({
  children,
  className = '',
  spotlightColor,
}: SpotlightCardProps) {
  const ref       = useRef<HTMLDivElement>(null);
  const [pos,     setPos]     = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const color =
    spotlightColor ??
    (document.documentElement.classList.contains('dark')
      ? 'rgba(255,255,255,0.05)'
      : 'rgba(0,0,0,0.04)');

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`spotlight-card ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity,
          background: `radial-gradient(480px circle at ${pos.x}px ${pos.y}px, ${color}, transparent 60%)`,
        }}
      />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
