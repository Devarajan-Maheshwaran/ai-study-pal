// Lightweight SVG ring for topic mastery / quiz score
interface ProgressRingProps {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  label?: string;
}

export default function ProgressRing({ value, size = 56, stroke = 5, label }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          className="stroke-forge-rule fill-none" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          className="stroke-ink fill-none transition-all duration-700" />
      </svg>
      <span
        className="absolute font-mono text-[10px] font-semibold text-ink"
        style={{ top: '50%', transform: 'translateY(-60%) rotate(0)' }}
      >
        {value}%
      </span>
      {label && <span className="text-[10px] text-ink-faint font-mono">{label}</span>}
    </div>
  );
}
