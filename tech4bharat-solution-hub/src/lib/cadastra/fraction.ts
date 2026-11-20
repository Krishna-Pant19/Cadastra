// Tiny fraction helper so heir shares show up as 1/6 instead of 0.1666...

export interface Fraction {
  n: number;
  d: number;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

export function frac(n: number, d: number): Fraction {
  if (d === 0) throw new Error("denominator cannot be zero");
  const g = gcd(n, d) || 1;
  return { n: n / g, d: d / g };
}

export function mul(a: Fraction, b: Fraction): Fraction {
  return frac(a.n * b.n, a.d * b.d);
}

export function add(a: Fraction, b: Fraction): Fraction {
  return frac(a.n * b.d + b.n * a.d, a.d * b.d);
}

export function toNumber(f: Fraction): number {
  return f.n / f.d;
}

export function toString(f: Fraction): string {
  return f.d === 1 ? String(f.n) : `${f.n}/${f.d}`;
}
