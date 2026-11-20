import { describe, expect, it } from "vitest";
import { estimateValue } from "../valuation";

describe("fair value range", () => {
  it("dry land with road access: 4.5 acres at ₹6.5 lakh/acre", () => {
    const v = estimateValue(180, { irrigation: "dry", roadAccess: true, guidanceValuePerAcre: 650000, pendingDispute: false });
    expect(v.acres).toBe(4.5);
    expect(v.guidanceTotal).toBe(2925000);
    expect(Math.round(v.low)).toBe(3217500); // x1.1 road
    expect(Math.round(v.high)).toBe(4343625); // x1.35 market spread
    expect(Math.round(v.indicativeLoan)).toBe(1930500); // 60% of low
  });

  it("no loan figure while a dispute is pending", () => {
    const v = estimateValue(80, { irrigation: "wet", roadAccess: false, guidanceValuePerAcre: 800000, pendingDispute: true });
    expect(v.indicativeLoan).toBe(0);
  });
});
