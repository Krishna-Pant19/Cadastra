import { useMemo } from "react";
import { detectIssues, readinessLabel, readinessScore } from "@/lib/cadastra/discrepancies";
import { computeSuccession, consentPeople } from "@/lib/cadastra/succession";
import { estimateValue } from "@/lib/cadastra/valuation";
import type { LandCase } from "@/lib/cadastra/types";

/** Runs all the "agents" on a case. Cheap enough to recompute on every change. */
export function useCaseAnalysis(c: LandCase) {
  return useMemo(() => {
    const issues = detectIssues(c);
    const succession = computeSuccession(c.family, c.recordedOwnerId);
    const signers = consentPeople(c.family, c.recordedOwnerId);
    const signerIds = signers.map((p) => p.id);
    const score = readinessScore(issues, c, signerIds);
    const rtc = c.documents.find((d) => d.kind === "rtc");
    const value = rtc?.fields.extentGuntas ? estimateValue(rtc.fields.extentGuntas, c.land) : null;
    return { issues, succession, signers, signerIds, score, label: readinessLabel(score), rtc, value };
  }, [c]);
}

export type CaseAnalysis = ReturnType<typeof useCaseAnalysis>;
