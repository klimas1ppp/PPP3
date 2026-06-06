type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/** Three pillars = PPP. Gold cap = yield. Body = principal. */
export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 38 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <Pillar x={4} />
      <Pillar x={15} />
      <Pillar x={26} />
    </svg>
  );
}

function Pillar({ x }: { x: number }) {
  const w = 8;
  const h = 26;
  const y = 4;
  const yieldH = 6;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={2.5} className="logo-pillar-body" />
      <rect x={x} y={y} width={w} height={yieldH} rx={2.5} className="logo-pillar-yield" />
      <line
        x1={x + 1.5}
        y1={y + yieldH}
        x2={x + w - 1.5}
        y2={y + yieldH}
        className="logo-pillar-line"
      />
    </g>
  );
}

export function Logo({ size = 32, showWordmark = true, className }: LogoProps) {
  return (
    <span className={`logo ${className ?? ""}`}>
      <LogoMark size={size} className="logo-mark" />
      {showWordmark && <span className="logo-word">PPP</span>}
    </span>
  );
}
