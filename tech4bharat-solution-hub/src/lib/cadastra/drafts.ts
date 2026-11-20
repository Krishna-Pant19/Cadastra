// Drafts the application a family would submit for each kind of fix.
// Text is plain so it can be printed at a Nadakacheri / CSC and signed.

import type { FixKind, Issue } from "./discrepancies";
import { computeSuccession } from "./succession";
import { toString as fracStr } from "./fraction";
import { formatAcreGunta } from "./units";
import type { LandCase } from "./types";

export const FIX_LABEL: Record<FixKind, string> = {
  collect_document: "Get the missing document",
  name_correction: "Name correction application",
  survey_correction: "Survey number correction",
  remeasurement: "Re-measurement (survey) request",
  pauti_khata: "Pauti Khata (inheritance mutation)",
  family_tree_correction: "Correct the family tree certificate",
  partition_11e: "Partition with 11E sketch",
};

export const FIX_OFFICE: Record<FixKind, string> = {
  collect_document: "Village Accountant / Nadakacheri",
  name_correction: "Tahsildar",
  survey_correction: "Assistant Director of Land Records (ADLR)",
  remeasurement: "Assistant Director of Land Records (ADLR)",
  pauti_khata: "Tahsildar (under Sec. 128, KLR Act 1964)",
  family_tree_correction: "Tahsildar",
  partition_11e: "ADLR / Survey Department",
};

function today(): string {
  return new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function draftFix(issue: Issue, c: LandCase): string {
  const rtc = c.documents.find((d) => d.kind === "rtc");
  const sy = rtc?.fields.surveyNo ?? "____";
  const extent = rtc?.fields.extentGuntas ? formatAcreGunta(rtc.fields.extentGuntas) : "____";
  const owner = c.family.find((p) => p.id === c.recordedOwnerId);
  const { heirs } = computeSuccession(c.family, c.recordedOwnerId);
  const applicant = heirs[0]?.name ?? owner?.name ?? "Applicant";

  const header = [
    `To,`,
    `The ${FIX_OFFICE[issue.fix]},`,
    `${c.taluk} Taluk, ${c.district} District, Karnataka.`,
    ``,
    `Date: ${today()}`,
    ``,
  ];
  const ref = `Ref: Sy. No. ${sy}, ${c.village} village, ${c.hobli} hobli — extent ${extent}`;
  const footer = [
    ``,
    `Enclosures: copies of documents listed in the Cadastra case file.`,
    ``,
    `Yours faithfully,`,
    applicant,
  ];

  let body: string[];
  switch (issue.fix) {
    case "pauti_khata":
      body = [
        `Subject: Request to enter names of legal heirs (Pauti Khata) in the RTC`,
        ref,
        ``,
        `Sir/Madam,`,
        `The above land stands in the name of ${owner?.name ?? "____"}, who died on ${owner?.diedOn ?? "____"}. We, the legal heirs, request that our names be entered in the RTC as per the shares below:`,
        ``,
        ...heirs.map((h, i) => `  ${i + 1}. ${h.name} (${h.relation}${h.via ? `, through late ${h.via}` : ""}) — ${fracStr(h.share)} share`),
        ``,
        `All heirs have given consent (consent log attached). Death certificate and family tree certificate are enclosed.`,
      ];
      break;
    case "family_tree_correction":
      body = [
        `Subject: Request to include all legal heirs in the family tree (Vamshavruksha) certificate`,
        ref,
        ``,
        `Sir/Madam,`,
        `The family tree certificate issued for late ${owner?.name ?? "____"} does not include all legal heirs. ${issue.detail}`,
        `We request a corrected certificate listing all Class I heirs. All heirs agree to this correction.`,
      ];
      break;
    case "partition_11e":
      body = [
        `Subject: Request for 11E sketch for partition of the above survey number`,
        ref,
        ``,
        `Sir/Madam,`,
        `The family has been cultivating separate parts of this land. We request measurement and an 11E sketch so that the land can be partitioned into hissas as below:`,
        ``,
        ...c.possession.map((p, i) => {
          const person = c.family.find((f) => f.id === p.personId);
          return `  ${i + 1}. ${person?.name ?? "?"} — ${formatAcreGunta(p.guntas)}`;
        }),
        ``,
        `All co-owners have consented to this division.`,
      ];
      break;
    case "remeasurement":
      body = [
        `Subject: Request for re-measurement of land`,
        ref,
        ``,
        `Sir/Madam,`,
        `${issue.detail} We request that the land be measured and the correct extent be updated in the records.`,
      ];
      break;
    case "survey_correction":
      body = [
        `Subject: Correction of survey number in records`,
        ref,
        ``,
        `Sir/Madam,`,
        `${issue.detail} We request verification with the Akarband / Tippan and correction of the wrong entry.`,
      ];
      break;
    case "name_correction":
      body = [
        `Subject: Correction of name in land records`,
        ref,
        ``,
        `Sir/Madam,`,
        `${issue.detail} Both names refer to the same person. An affidavit and ID proof are enclosed. Kindly correct the entry.`,
      ];
      break;
    case "collect_document":
    default:
      body = [
        `Subject: Request for certified copy`,
        ref,
        ``,
        `Sir/Madam,`,
        `${issue.detail} Kindly issue a certified copy for the above land.`,
      ];
  }

  return [...header, ...body, ...footer].join("\n");
}

export function consentMessage(personName: string, c: LandCase): string {
  const rtc = c.documents.find((d) => d.kind === "rtc");
  return `Namaskara ${personName}, this is Cadastra on behalf of your family. We are preparing papers for land Sy. No. ${rtc?.fields.surveyNo ?? ""} in ${c.village}. Please check your share and reply AGREE to give consent, or DISAGREE if something is wrong.`;
}
