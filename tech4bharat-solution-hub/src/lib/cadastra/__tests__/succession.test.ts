import { describe, expect, it } from "vitest";
import { computeSuccession, consentPeople, totalShare } from "../succession";
import { toString } from "../fraction";
import { SAMPLE_CASES } from "../sample-cases";
import type { Person } from "../types";

const [kallappa, hanumanthappa, shivalinge] = SAMPLE_CASES;

describe("succession (Class I heirs)", () => {
  it("widow, two sons and a married daughter get 1/4 each", () => {
    const r = computeSuccession(kallappa!.family, kallappa!.recordedOwnerId);
    expect(r.heirs).toHaveLength(4);
    expect(r.heirs.map((h) => toString(h.share))).toEqual(["1/4", "1/4", "1/4", "1/4"]);
    expect(r.heirs.some((h) => h.name === "Savitri Patil")).toBe(true);
  });

  it("predeceased son's half is split between his widow and two children", () => {
    const r = computeSuccession(hanumanthappa!.family, hanumanthappa!.recordedOwnerId);
    const share = (name: string) => toString(r.heirs.find((h) => h.name === name)!.share);
    expect(share("Nagaveni")).toBe("1/2");
    expect(share("Lakshmamma")).toBe("1/6");
    expect(share("Kiran Kumar")).toBe("1/6");
    expect(share("Pavithra")).toBe("1/6");
    // wife died before owner -> no share
    expect(r.heirs.find((h) => h.name === "Jayamma")).toBeUndefined();
  });

  it("shares always add up to the whole land", () => {
    for (const c of SAMPLE_CASES.slice(0, 2)) {
      const r = computeSuccession(c.family, c.recordedOwnerId);
      expect(toString(totalShare(r.heirs))).toBe("1");
    }
  });

  it("no succession when the owner is alive; the owner gives consent", () => {
    const r = computeSuccession(shivalinge!.family, shivalinge!.recordedOwnerId);
    expect(r.applicable).toBe(false);
    expect(consentPeople(shivalinge!.family, shivalinge!.recordedOwnerId).map((p) => p.id)).toEqual(["p-shiva"]);
  });

  it("a spouse who died after the owner still inherits", () => {
    const family: Person[] = [
      { id: "o", name: "Owner", gender: "M", relation: "Owner", alive: false, diedOn: "2015-01-01" },
      { id: "w", name: "Wife", gender: "F", relation: "Wife", spouseOfId: "o", alive: false, diedOn: "2020-01-01" },
      { id: "s", name: "Son", gender: "M", relation: "Son", parentId: "o", alive: true },
    ];
    const r = computeSuccession(family, "o");
    expect(r.heirs.map((h) => toString(h.share))).toEqual(["1/2", "1/2"]);
    // but only living people can give consent
    expect(consentPeople(family, "o").map((p) => p.id)).toEqual(["s"]);
  });
});
