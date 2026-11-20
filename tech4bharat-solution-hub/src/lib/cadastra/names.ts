// Name matching. Same person is often written differently across papers:
// "Kallappa Basappa Hosamani", "Kallappa B. Hosamani", "Sri Kallappa Hosamani".

const HONORIFICS = new Set(["sri", "shri", "smt", "srimati", "kum", "late", "dr", "mr", "mrs", "ms", "s/o", "w/o", "d/o"]);

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t && !HONORIFICS.has(t))
    .join(" ");
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min((prev[j] ?? 0) + 1, (cur[j - 1] ?? 0) + 1, (prev[j - 1] ?? 0) + cost);
    }
    prev = cur;
  }
  return prev[b.length] ?? 0;
}

function ratio(a: string, b: string): number {
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return 1;
  return 1 - levenshtein(a, b) / longest;
}

/**
 * 0..1 similarity. Initials ("B.") are matched against any token starting
 * with that letter, so "Kallappa B Hosamani" ~ "Kallappa Basappa Hosamani".
 */
export function nameSimilarity(a: string, b: string): number {
  const ta = normalizeName(a).split(" ").filter(Boolean);
  const tb = normalizeName(b).split(" ").filter(Boolean);
  if (!ta.length || !tb.length) return 0;

  const [short, long] = ta.length <= tb.length ? [ta, tb] : [tb, ta];
  const used = new Set<number>();
  let score = 0;
  for (const token of short) {
    let best = 0;
    let bestIdx = -1;
    long.forEach((other, idx) => {
      if (used.has(idx)) return;
      let s = ratio(token, other);
      if (token.length === 1 && other.startsWith(token)) s = 0.9;
      if (other.length === 1 && token.startsWith(other)) s = 0.9;
      if (s > best) {
        best = s;
        bestIdx = idx;
      }
    });
    if (bestIdx >= 0) used.add(bestIdx);
    score += best;
  }
  // missing tokens (e.g. father's name dropped) cost a little, not a lot
  const coverage = short.length / long.length;
  return (score / short.length) * (0.85 + 0.15 * coverage);
}

export type NameMatch = "same" | "variation" | "different";

export function compareNames(a: string, b: string): NameMatch {
  if (normalizeName(a) === normalizeName(b)) return "same";
  const s = nameSimilarity(a, b);
  if (s >= 0.72) return "variation";
  return "different";
}
