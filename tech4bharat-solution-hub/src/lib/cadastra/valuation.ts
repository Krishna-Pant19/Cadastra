// Fair value range. We start from the Karnataka guidance value (minimum value
// for registration) and adjust for irrigation, road access and disputes.
// This is an indicative range for the bank conversation, not a valuation report.

import { guntasToAcres } from "./units";
import type { Irrigation, LandProfile } from "./types";

export const IRRIGATION_FACTOR: Record<Irrigation, number> = {
  dry: 1,
  wet: 1.3,
  garden: 1.5,
};

export const ROAD_FACTOR = 1.1;
export const DISPUTE_FACTOR = 0.75;
/** market price is usually a bit above guidance value */
export const MARKET_SPREAD = { low: 1.0, high: 1.35 };
/** typical loan-to-value banks use for agricultural land */
export const LOAN_TO_VALUE = 0.6;

export interface ValueEstimate {
  acres: number;
  guidanceTotal: number;
  low: number;
  high: number;
  indicativeLoan: number;
}

export function estimateValue(extentGuntas: number, land: LandProfile): ValueEstimate {
  const acres = guntasToAcres(extentGuntas);
  const guidanceTotal = acres * land.guidanceValuePerAcre;
  let factor = IRRIGATION_FACTOR[land.irrigation];
  if (land.roadAccess) factor *= ROAD_FACTOR;
  if (land.pendingDispute) factor *= DISPUTE_FACTOR;
  const base = guidanceTotal * factor;
  const low = base * MARKET_SPREAD.low;
  const high = base * MARKET_SPREAD.high;
  return {
    acres,
    guidanceTotal,
    low,
    high,
    indicativeLoan: land.pendingDispute ? 0 : low * LOAN_TO_VALUE,
  };
}
