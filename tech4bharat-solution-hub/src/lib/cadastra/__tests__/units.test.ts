import { describe, expect, it } from "vitest";
import { formatAcreGunta, parseAcreGunta } from "../units";

describe("acre-gunta units", () => {
  it("reads RTC style 3-20 and 3.20 as 3 acres 20 guntas", () => {
    expect(parseAcreGunta("3-20")).toBe(140);
    expect(parseAcreGunta("3.20")).toBe(140);
  });

  it("reads written forms", () => {
    expect(parseAcreGunta("4 acre 20 gunta")).toBe(180);
    expect(parseAcreGunta("20 guntas")).toBe(20);
    expect(parseAcreGunta("2 acres")).toBe(80);
  });

  it("rejects 40 or more guntas in the gunta column", () => {
    expect(parseAcreGunta("2-45")).toBeNull();
  });

  it("formats back to A/G", () => {
    expect(formatAcreGunta(168)).toBe("4 A 08 G");
  });
});
