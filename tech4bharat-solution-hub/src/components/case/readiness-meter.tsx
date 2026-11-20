import { cn } from "@/lib/utils";

export function ReadinessMeter({ score, size = 72, className }: { score: number; size?: number; className?: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const tone = score >= 80 ? "stroke-success" : score >= 50 ? "stroke-warning" : "stroke-destructive";
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} className="fill-none stroke-secondary" strokeWidth="6" />
        <circle
          cx="32"
          cy="32"
          r={r}
          className={cn("fill-none transition-all duration-700", tone)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - score / 100)}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-semibold">{score}</span>
    </div>
  );
}
