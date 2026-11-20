// Discrepancy Detection Agent + Document Verification Agent (rule based).
// Every issue carries the ids of the documents it came from, so the UI can
// always show "where did this come from?" (our guardrail).

import { compareNames } from "./names";
import { computeSuccession } from "./succession";
import { normalizeSurveyNo } from "./survey";
import { formatAcreGunta } from "./units";
import { DOC_KIND_LABEL, type DocKind, type LandCase, type LandDocument } from "./types";

export type Severity = "high" | "medium" | "low";

export type IssueCode =
  | "MISSING_DOCUMENT"
  | "SURVEY_NO_MISMATCH"
  | "AREA_MISMATCH"
  | "NAME_VARIATION"
  | "NAME_MISMATCH"
  | "OWNER_DECEASED_NOT_MUTATED"
  | "HEIR_MISSING_FROM_FAMILY_TREE"
  | "INFORMAL_DIVISION"
  | "POSSESSION_AREA_MISMATCH";

export type FixKind =
  | "collect_document"
  | "name_correction"
  | "survey_correction"
  | "remeasurement"
  | "pauti_khata"
  | "family_tree_correction"
  | "partition_11e";

export interface Issue {
  id: string;
  code: IssueCode;
  severity: Severity;
  title: string;
  detail: string;
  docIds: string[];
  fix: FixKind;
  /** fixes that change ownership need every heir to agree */
  needsConsent: boolean;
}

/** RTC and survey sketch can differ a little due to rounding; 2% is our tolerance */
export const AREA_TOLERANCE = 0.02;

const first = (c: LandCase, kind: DocKind) => c.documents.find((d) => d.kind === kind);
const all = (c: LandCase, kind: DocKind) => c.documents.filter((d) => d.kind === kind);

export function requiredDocuments(c: LandCase): DocKind[] {
  const owner = c.family.find((p) => p.id === c.recordedOwnerId);
  const req: DocKind[] = ["rtc", "survey_sketch"];
  if (owner && !owner.alive) req.push("death_certificate", "family_tree");
  return req;
}

export function detectIssues(c: LandCase): Issue[] {
  const issues: Issue[] = [];
  const rtc = first(c, "rtc");
  const owner = c.family.find((p) => p.id === c.recordedOwnerId);

  // 1. Missing documents
  for (const kind of requiredDocuments(c)) {
    if (!first(c, kind)) {
      issues.push({
        id: `MISSING_DOCUMENT:${kind}`,
        code: "MISSING_DOCUMENT",
        severity: kind === "rtc" ? "high" : "medium",
        title: `${DOC_KIND_LABEL[kind]} is missing`,
        detail: `A bank-ready file needs the ${DOC_KIND_LABEL[kind]}. Upload a photo of it.`,
        docIds: [],
        fix: "collect_document",
        needsConsent: false,
      });
    }
  }
  if (!rtc) return issues; // nothing else can be compared without the RTC

  // 2. Survey number must match across documents
  const rtcSy = rtc.fields.surveyNo ? normalizeSurveyNo(rtc.fields.surveyNo) : "";
  if (rtcSy) {
    for (const doc of c.documents) {
      if (doc.id === rtc.id || !doc.fields.surveyNo) continue;
      if (normalizeSurveyNo(doc.fields.surveyNo) !== rtcSy) {
        issues.push({
          id: `SURVEY_NO_MISMATCH:${doc.id}`,
          code: "SURVEY_NO_MISMATCH",
          severity: "high",
          title: "Survey number does not match",
          detail: `RTC says Sy. No. ${rtc.fields.surveyNo} but the ${DOC_KIND_LABEL[doc.kind]} says ${doc.fields.surveyNo}.`,
          docIds: [rtc.id, doc.id],
          fix: "survey_correction",
          needsConsent: false,
        });
      }
    }
  }

  // 3. Area: RTC vs survey sketch
  const sketch = first(c, "survey_sketch");
  const rtcArea = rtc.fields.extentGuntas;
  const sketchArea = sketch?.fields.extentGuntas;
  if (sketch && rtcArea && sketchArea) {
    const diff = Math.abs(rtcArea - sketchArea) / rtcArea;
    if (diff > AREA_TOLERANCE) {
      issues.push({
        id: `AREA_MISMATCH:${sketch.id}`,
        code: "AREA_MISMATCH",
        severity: diff > 0.05 ? "high" : "medium",
        title: "Land area differs between RTC and survey map",
        detail: `RTC shows ${formatAcreGunta(rtcArea)}, survey sketch shows ${formatAcreGunta(sketchArea)} (${(diff * 100).toFixed(1)}% difference).`,
        docIds: [rtc.id, sketch.id],
        fix: "remeasurement",
        needsConsent: false,
      });
    }
  }

  // 4. Owner name across documents
  const rtcName = rtc.fields.ownerName;
  if (rtcName) {
    const compareTo: { doc: LandDocument; name: string }[] = [];
    for (const doc of c.documents) {
      if (doc.id === rtc.id) continue;
      if (doc.kind === "death_certificate" && doc.fields.deceasedName) {
        compareTo.push({ doc, name: doc.fields.deceasedName });
      } else if (doc.kind !== "family_tree" && doc.fields.ownerName) {
        compareTo.push({ doc, name: doc.fields.ownerName });
      }
    }
    for (const { doc, name } of compareTo) {
      const match = compareNames(rtcName, name);
      if (match === "same") continue;
      const different = match === "different";
      issues.push({
        id: `${different ? "NAME_MISMATCH" : "NAME_VARIATION"}:${doc.id}`,
        code: different ? "NAME_MISMATCH" : "NAME_VARIATION",
        severity: different ? "high" : "low",
        title: different ? "Owner name does not match" : "Owner name spelt differently",
        detail: `RTC: “${rtcName}” vs ${DOC_KIND_LABEL[doc.kind]}: “${name}”.`,
        docIds: [rtc.id, doc.id],
        fix: "name_correction",
        needsConsent: false,
      });
    }
  }

  // 5. Owner died but record still in his/her name
  const death = first(c, "death_certificate");
  if (owner && !owner.alive) {
    const deathDate = death?.fields.date ?? owner.diedOn;
    const inheritanceMutation = all(c, "mutation").find(
      (m) =>
        (m.fields.mutationType ?? "").toLowerCase().match(/pauti|inherit|varasat|succession/) &&
        (!deathDate || (m.fields.date ?? "") >= deathDate),
    );
    if (!inheritanceMutation) {
      const years = deathDate ? new Date().getFullYear() - Number(deathDate.slice(0, 4)) : null;
      issues.push({
        id: "OWNER_DECEASED_NOT_MUTATED",
        code: "OWNER_DECEASED_NOT_MUTATED",
        severity: "high",
        title: "Owner has died but RTC is still in their name",
        detail: `${owner.name} died${deathDate ? ` on ${deathDate}` : ""}${years ? ` (${years} years ago)` : ""}, but no inheritance (Pauti Khata) mutation is recorded. Banks will not accept the land until heirs' names are entered.`,
        docIds: [rtc.id, ...(death ? [death.id] : [])],
        fix: "pauti_khata",
        needsConsent: true,
      });
    }

    // 6. Family tree must list every legal heir (married daughters are often left out)
    const tree = first(c, "family_tree");
    if (tree?.fields.heirsListed) {
      const listed = tree.fields.heirsListed;
      const { heirs } = computeSuccession(c.family, owner.id);
      for (const heir of heirs) {
        const present = listed.some((n) => compareNames(n, heir.name) !== "different");
        if (!present) {
          issues.push({
            id: `HEIR_MISSING_FROM_FAMILY_TREE:${heir.personId}`,
            code: "HEIR_MISSING_FROM_FAMILY_TREE",
            severity: "high",
            title: `${heir.name} is a legal heir but missing from the family tree`,
            detail: `${heir.name} (${heir.relation}) has a legal share, but the family tree certificate does not list them. A mutation done on this certificate can be challenged later.`,
            docIds: [tree.id],
            fix: "family_tree_correction",
            needsConsent: true,
          });
        }
      }
    }
  }

  // 7. Family has divided the land informally
  const holders = new Set(c.possession.map((p) => p.personId));
  if (holders.size > 1) {
    const names = c.possession
      .map((p) => `${c.family.find((f) => f.id === p.personId)?.name ?? "?"} (${formatAcreGunta(p.guntas)})`)
      .join(", ");
    issues.push({
      id: "INFORMAL_DIVISION",
      code: "INFORMAL_DIVISION",
      severity: "medium",
      title: "Land is divided on the ground but not on paper",
      detail: `The family says the land is cultivated separately by ${names}, but the RTC shows one undivided survey number. A formal partition (11E sketch + hissa) is needed for separate loans.`,
      docIds: [rtc.id],
      fix: "partition_11e",
      needsConsent: true,
    });

    const sum = c.possession.reduce((s, p) => s + p.guntas, 0);
    if (rtcArea && Math.abs(sum - rtcArea) / rtcArea > AREA_TOLERANCE) {
      issues.push({
        id: "POSSESSION_AREA_MISMATCH",
        code: "POSSESSION_AREA_MISMATCH",
        severity: "medium",
        title: "Shares on the ground don't add up to the RTC area",
        detail: `Family-declared parts total ${formatAcreGunta(sum)} but RTC shows ${formatAcreGunta(rtcArea)}.`,
        docIds: [rtc.id],
        fix: "remeasurement",
        needsConsent: false,
      });
    }
  }

  return issues;
}

// ---------- readiness ----------

const PENALTY: Record<Severity, number> = { high: 25, medium: 12, low: 5 };

export function isAddressed(issue: Issue, c: LandCase, consentIds: string[]): boolean {
  if (!c.draftedIssueIds.includes(issue.id)) return false;
  if (!issue.needsConsent) return true;
  return consentIds.length > 0 && consentIds.every((id) => c.consents[id] === "agreed");
}

/**
 * 0-100 score. An addressed issue (fix drafted + consent where needed) still
 * costs a little because the office has not approved it yet.
 */
export function readinessScore(issues: Issue[], c: LandCase, consentIds: string[]): number {
  let score = 100;
  for (const issue of issues) {
    const p = PENALTY[issue.severity];
    score -= isAddressed(issue, c, consentIds) ? p * 0.2 : p;
  }
  return Math.max(0, Math.round(score));
}

export function readinessLabel(score: number): "Bank-ready" | "Needs fixes" | "Not ready" {
  if (score >= 80) return "Bank-ready";
  if (score >= 50) return "Needs fixes";
  return "Not ready";
}
