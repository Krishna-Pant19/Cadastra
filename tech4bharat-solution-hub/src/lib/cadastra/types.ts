// Core data types for a land case. Kept deliberately simple so the same shape
// can later be sent to a Python/FastAPI backend.

export type DocKind =
  | "rtc" // Record of Rights, Tenancy and Crops (Pahani)
  | "mutation" // Mutation Register (MR) extract
  | "death_certificate"
  | "family_tree" // Vamshavruksha / survivorship certificate
  | "survey_sketch" // Tippan / Akarband / Hissa sketch
  | "sale_deed"
  | "other";

export interface DocFields {
  ownerName?: string | undefined;
  surveyNo?: string | undefined;
  extentGuntas?: number | undefined;
  khataNo?: string | undefined;
  village?: string | undefined;
  /** ISO date (yyyy-mm-dd): issue date, or date of death for a death certificate */
  date?: string | undefined;
  deceasedName?: string | undefined;
  heirsListed?: string[] | undefined;
  mutationType?: string | undefined;
}

export interface LandDocument {
  id: string;
  kind: DocKind;
  title: string;
  issuedBy: string;
  source: "sample" | "upload";
  fields: DocFields;
  /** 0..1, only for documents read by AI */
  confidence?: number | undefined;
  rawText?: string | undefined;
}

export interface Person {
  id: string;
  name: string;
  gender: "M" | "F";
  /** Free text label shown in the UI, e.g. "Son", "Wife" */
  relation: string;
  parentId?: string | undefined;
  spouseOfId?: string | undefined;
  alive: boolean;
  diedOn?: string | undefined;
  phone?: string | undefined;
}

export interface Possession {
  personId: string;
  guntas: number;
}

export type Irrigation = "dry" | "wet" | "garden";

export interface LandProfile {
  irrigation: Irrigation;
  roadAccess: boolean;
  /** Karnataka guidance value in rupees per acre */
  guidanceValuePerAcre: number;
  pendingDispute: boolean;
}

export type ConsentStatus = "not_sent" | "sent" | "agreed" | "declined";

export interface LandCase {
  id: string;
  title: string;
  summary: string;
  village: string;
  hobli: string;
  taluk: string;
  district: string;
  recordedOwnerId: string;
  documents: LandDocument[];
  family: Person[];
  possession: Possession[];
  land: LandProfile;
  consents: Record<string, ConsentStatus>;
  /** issue ids for which the family has prepared a fix */
  draftedIssueIds: string[];
  isSample: boolean;
}

export const DOC_KIND_LABEL: Record<DocKind, string> = {
  rtc: "RTC / Pahani",
  mutation: "Mutation Register (MR)",
  death_certificate: "Death certificate",
  family_tree: "Family tree (Vamshavruksha)",
  survey_sketch: "Survey sketch (Tippan / Akarband)",
  sale_deed: "Sale deed",
  other: "Other document",
};
