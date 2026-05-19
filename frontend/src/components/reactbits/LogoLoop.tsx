interface LogoLoopProps {
  items: string[];
  speed?: number;
}

/**
 * Infinite horizontal marquee for tech-stack badges.
 * Doubles items to create seamless loop via CSS animation.
 */
export function LogoLoop({ items, speed = 28 }: LogoLoopProps) {
  const doubled = [...items, ...items];

  return (
    <div className="relative overflow-hidden w-full">
      {/* fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10"
        style={{ background: 'linear-gradient(to right, var(--bg), transparent)' }} />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10"
        style={{ background: 'linear-gradient(to left, var(--bg), transparent)' }} />

      <div
        className="flex gap-6 w-max"
        style={{ animation: `logo-scroll ${speed}s linear infinite` }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="shrink-0 px-4 py-2 rounded-full border border-[var(--border-color)]
              bg-[var(--bg-card)] text-[var(--text-muted)] text-sm font-medium
              font-syne tracking-tight whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
