// Hand-drawn style survey sketch used on the landing page.
export function ParcelArt() {
  return (
    <svg viewBox="0 0 420 340" className="h-auto w-full" role="img" aria-label="Survey sketch of a land parcel split between heirs">
      <defs>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="8" className="stroke-accent/30" strokeWidth="3" />
        </pattern>
      </defs>
      {/* outer boundary from RTC */}
      <path
        d="M40 60 L330 30 L380 270 L70 310 Z"
        className="fill-paper stroke-primary animate-draw"
        strokeWidth="3"
        strokeDasharray="600"
        strokeLinejoin="round"
      />
      {/* survey sketch boundary - slightly smaller: the mismatch */}
      <path d="M52 76 L318 48 L362 258 L82 294 Z" className="fill-none stroke-accent" strokeWidth="1.6" strokeDasharray="6 5" />
      {/* informal division line */}
      <path d="M190 44 L222 292" className="stroke-primary" strokeWidth="1.8" strokeDasharray="4 4" />
      <path d="M222 292 L222 292" />
      <rect x="226" y="150" width="120" height="70" fill="url(#hatch)" rx="4" />
      {/* boundary stones */}
      {[
        [40, 60],
        [330, 30],
        [380, 270],
        [70, 310],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6" className="fill-accent stroke-paper" strokeWidth="2" />
      ))}
      <g className="fill-foreground font-mono" fontSize="12">
        <text x="88" y="170">Mallikarjun</text>
        <text x="88" y="186" className="fill-muted-foreground">2 A 10 G</text>
        <text x="240" y="140">Shivanand</text>
        <text x="240" y="156" className="fill-muted-foreground">2 A 10 G</text>
        <text x="150" y="24" className="fill-primary">Sy. No. 112/3</text>
      </g>
      <g className="font-mono" fontSize="10.5">
        <rect x="236" y="296" width="168" height="34" rx="4" className="fill-destructive/10" />
        <text x="246" y="317" className="fill-destructive">RTC 4-20 ≠ sketch 4-08</text>
      </g>
    </svg>
  );
}
