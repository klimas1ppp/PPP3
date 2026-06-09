type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  className?: string;
};

/** Tree mark from brand SVG: canopy, ∞ trunk, roots. */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const height = size;
  const width = Math.round(size * (600 / 608));

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        width={width}
        height={height}
        alt=""
        className={`logo-mark-light ${className ?? ""}`}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark-gold.svg"
        width={width}
        height={height}
        alt=""
        className={`logo-mark-dark ${className ?? ""}`}
        draggable={false}
      />
    </>
  );
}

export function Logo({ size = 40, showWordmark = true, className }: LogoProps) {
  return (
    <span className={`logo ${className ?? ""}`}>
      <LogoMark size={size} className="logo-mark" />
      {showWordmark && <span className="logo-word">PPP</span>}
    </span>
  );
}
