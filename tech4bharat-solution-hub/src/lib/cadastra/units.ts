// Karnataka land is measured in acres and guntas: 1 acre = 40 guntas.
// We store everything in guntas (integers are easier to compare).

export const GUNTAS_PER_ACRE = 40;
export const HECTARES_PER_ACRE = 0.404686;

/**
 * Parses extents written the way they appear on an RTC:
 * "3-20", "3.20", "3 A 20 G", "3 acre 20 gunta", "20 guntas", "3 acres".
 * Note: on an RTC "3.20" means 3 acres 20 guntas, NOT 3.2 acres.
 * Returns total guntas or null if we can't understand it.
 */
export function parseAcreGunta(input: string): number | null {
  const text = input.trim().toLowerCase();
  if (!text) return null;

  const pair = text.match(/^(\d+)\s*[-.:]\s*(\d{1,2})$/);
  if (pair) {
    const acres = Number(pair[1]);
    const guntas = Number(pair[2]);
    if (guntas >= GUNTAS_PER_ACRE) return null;
    return acres * GUNTAS_PER_ACRE + guntas;
  }

  const acreMatch = text.match(/(\d+)\s*(a|ac|acre|acres)\b/);
  const guntaMatch = text.match(/(\d+)\s*(g|gu|gunta|guntas|guntha|gunthas)\b/);
  if (acreMatch || guntaMatch) {
    const acres = acreMatch ? Number(acreMatch[1]) : 0;
    const guntas = guntaMatch ? Number(guntaMatch[1]) : 0;
    if (guntas >= GUNTAS_PER_ACRE && acreMatch) return null;
    return acres * GUNTAS_PER_ACRE + guntas;
  }

  if (/^\d+$/.test(text)) return Number(text) * GUNTAS_PER_ACRE;
  return null;
}

export function formatAcreGunta(totalGuntas: number): string {
  const rounded = Math.round(totalGuntas);
  const acres = Math.floor(rounded / GUNTAS_PER_ACRE);
  const guntas = rounded % GUNTAS_PER_ACRE;
  return `${acres} A ${String(guntas).padStart(2, "0")} G`;
}

export function guntasToAcres(guntas: number): number {
  return guntas / GUNTAS_PER_ACRE;
}

export function guntasToHectares(guntas: number): number {
  return guntasToAcres(guntas) * HECTARES_PER_ACRE;
}

/** Indian rupee formatting, e.g. 1250000 -> "₹12,50,000" */
export function formatRupees(amount: number): string {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

/** Short form for big amounts, e.g. 3250000 -> "₹32.5 lakh" */
export function formatLakh(amount: number): string {
  if (amount >= 1e7) return `₹${(amount / 1e7).toFixed(2)} crore`;
  return `₹${(amount / 1e5).toFixed(1)} lakh`;
}
