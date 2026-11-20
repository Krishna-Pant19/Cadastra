// Turns a case into a short explanation in simple English.
// Sentences are short on purpose: this is read out loud at CSC kiosks.

import type { Issue } from "./discrepancies";
import { computeSuccession } from "./succession";
import { toString as fracStr } from "./fraction";
import { formatAcreGunta } from "./units";
import type { LandCase } from "./types";

export function explainCase(c: LandCase, issues: Issue[]): string[] {
  const out: string[] = [];
  const rtc = c.documents.find((d) => d.kind === "rtc");
  const owner = c.family.find((p) => p.id === c.recordedOwnerId);

  if (!rtc) {
    out.push("We need the RTC (Pahani) first. It is the main paper that says who owns the land.");
    return out;
  }

  const extent = rtc.fields.extentGuntas ? formatAcreGunta(rtc.fields.extentGuntas) : "an unknown area";
  out.push(
    `This land is survey number ${rtc.fields.surveyNo ?? "?"} in ${c.village} village, ${c.taluk} taluk. The RTC says it is ${extent} and belongs to ${rtc.fields.ownerName ?? "?"}.`,
  );

  if (owner && !owner.alive) {
    const { heirs } = computeSuccession(c.family, owner.id);
    out.push(`${owner.name} has passed away${owner.diedOn ? ` (${owner.diedOn.slice(0, 4)})` : ""}. By law, the land now belongs to the family together:`);
    out.push(
      heirs
        .map((h) => `${h.name} (${h.relation.toLowerCase()}${h.via ? `, in place of late ${h.via}` : ""}) gets ${fracStr(h.share)}`)
        .join("; ") + ".",
    );
    out.push("Daughters, including married daughters, get the same share as sons.");
  } else if (owner) {
    out.push(`${owner.name} is the living owner, so they can sign for the land themselves.`);
  }

  const serious = issues.filter((i) => i.severity === "high");
  if (issues.length === 0) {
    out.push("We did not find any problems. The papers match each other, so a bank should accept this land.");
  } else {
    out.push(
      `We found ${issues.length} problem${issues.length > 1 ? "s" : ""}${serious.length ? `, ${serious.length} of them serious` : ""}. Until these are fixed, a bank may refuse a loan against this land:`,
    );
    // same kind of problem on several papers -> one line
    const counts = new Map<string, number>();
    for (const issue of issues) counts.set(issue.title, (counts.get(issue.title) ?? 0) + 1);
    for (const [title, n] of counts) out.push(`• ${title}${n > 1 ? ` (on ${n} papers)` : ""}.`);
    out.push("Don't worry — each one has a clear fix. Go to the next steps to see them.");
  }
  return out;
}
