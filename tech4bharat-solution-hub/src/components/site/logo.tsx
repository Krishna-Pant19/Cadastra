// Little survey-plot mark: a parcel split into hissas with a boundary stone.
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M4 7 L26 4 L28 25 L6 28 Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M15 5.5 L17 26.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2" />
      <path d="M5 17 L16 16" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2.5 2" />
      <circle cx="22" cy="15" r="2.6" className="fill-accent" />
    </svg>
  );
}
