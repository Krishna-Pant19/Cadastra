import { describe, expect, it } from "vitest";
import { detectIssues, readinessLabel, readinessScore } from "../discrepancies";
import { compareNames } from "../names";
import { sameSurveyNo } from "../survey";
import { consentPeople } from "../succession";
import { SAMPLE_CASES } from "../sample-cases";

const [kallappa, hanumanthappa, shivalinge] = SAMPLE_CASES;
const codes = (c: (typeof SAMPLE_CASES)[number]) => detectIssues(c).map((i) => i.code);

describe("name and survey number matching", () => {
  it("treats initials and honorifics as the same person", () => {
    expect(compareNames("Kallappa Basappa Hosamani", "Kallappa B. Hosamani")).not.toBe("different");
    expect(compareNames("Shivalingegowda", "Sri Shivalingegowda")).toBe("same");
  });

  it("flags clearly different people", () => {
    expect(compareNames("Kallappa Hosamani", "Ramesh Gowda")).toBe("different");
  });

  it("normalises survey number formats", () => {
    expect(sameSurveyNo("Sy. No. 112/3", "112 / 3")).toBe(true);
    expect(sameSurveyNo("45/1A", "45/1 A")).toBe(true);
    expect(sameSurveyNo("45/1A", "45/1B")).toBe(false);
  });
});

describe("gap detection on sample cases", () => {
  it("Hirebagewadi: area gap, no inheritance mutation, daughter missing, informal split", () => {
    const found = codes(kallappa!);
    expect(found).toContain("AREA_MISMATCH");
    expect(found).toContain("OWNER_DECEASED_NOT_MUTATED");
    expect(found).toContain("HEIR_MISSING_FROM_FAMILY_TREE");
    expect(found).toContain("INFORMAL_DIVISION");
    const missingHeir = detectIssues(kallappa!).find((i) => i.code === "HEIR_MISSING_FROM_FAMILY_TREE");
    expect(missingHeir?.title).toContain("Savitri");
  });

  it("an RTC vs sketch gap within 2% is not flagged", () => {
    const c = structuredClone(kallappa!);
    c.documents.find((d) => d.kind === "survey_sketch")!.fields.extentGuntas = 177; // 1.7% less
    expect(codes(c)).not.toContain("AREA_MISMATCH");
  });

  it("Hebbur: survey number on sketch differs", () => {
    expect(codes(hanumanthappa!)).toContain("SURVEY_NO_MISMATCH");
    expect(codes(hanumanthappa!)).not.toContain("HEIR_MISSING_FROM_FAMILY_TREE");
  });

  it("Keragodu: clean record has no issues and is bank-ready", () => {
    const issues = detectIssues(shivalinge!);
    expect(issues).toEqual([]);
    const score = readinessScore(issues, shivalinge!, ["p-shiva"]);
    expect(score).toBe(100);
    expect(readinessLabel(score)).toBe("Bank-ready");
  });

  it("an inheritance fix only counts once every living heir has agreed", () => {
    const c = structuredClone(kallappa!);
    const issues = detectIssues(c);
    const heirs = consentPeople(c.family, c.recordedOwnerId).map((p) => p.id);
    const before = readinessScore(issues, c, heirs);
    c.draftedIssueIds = issues.map((i) => i.id);
    const draftedOnly = readinessScore(issues, c, heirs);
    for (const id of heirs) c.consents[id] = "agreed";
    const withConsent = readinessScore(issues, c, heirs);
    expect(before).toBeLessThan(draftedOnly);
    expect(draftedOnly).toBeLessThan(withConsent);
  });
});
