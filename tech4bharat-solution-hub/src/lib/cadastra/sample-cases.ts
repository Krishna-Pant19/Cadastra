// Sample land records for the demo. These are made up but modelled on real
// Bhoomi RTC printouts we looked at. NOT live government data.

import type { LandCase } from "./types";

const kallappa: LandCase = {
  id: "sample-hirebagewadi",
  title: "Kallappa Hosamani's land",
  summary: "Father died in 2017, sons split the land informally, daughter left out of family tree.",
  village: "Hirebagewadi",
  hobli: "Hirebagewadi",
  taluk: "Belagavi",
  district: "Belagavi",
  recordedOwnerId: "p-kallappa",
  isSample: true,
  documents: [
    {
      id: "d-rtc-1",
      kind: "rtc",
      title: "RTC (Pahani) 2024-25",
      issuedBy: "Bhoomi, Revenue Dept.",
      source: "sample",
      fields: {
        ownerName: "Kallappa Basappa Hosamani",
        surveyNo: "112/3",
        extentGuntas: 180, // 4 A 20 G
        khataNo: "214",
        village: "Hirebagewadi",
        date: "2025-01-14",
      },
    },
    {
      id: "d-sketch-1",
      kind: "survey_sketch",
      title: "Tippan / Akarband extract",
      issuedBy: "ADLR, Belagavi",
      source: "sample",
      fields: { ownerName: "Kallappa B. Hosamani", surveyNo: "Sy. No. 112/3", extentGuntas: 168, date: "2008-06-02" },
    },
    {
      id: "d-death-1",
      kind: "death_certificate",
      title: "Death certificate",
      issuedBy: "Gram Panchayat, Hirebagewadi",
      source: "sample",
      fields: { deceasedName: "Kallappa B Hosamani", date: "2017-03-12", village: "Hirebagewadi" },
    },
    {
      id: "d-tree-1",
      kind: "family_tree",
      title: "Vamshavruksha certificate",
      issuedBy: "Tahsildar, Belagavi",
      source: "sample",
      fields: {
        deceasedName: "Kallappa Hosamani",
        heirsListed: ["Gangavva Kallappa Hosamani", "Mallikarjun Kallappa Hosamani", "Shivanand Kallappa Hosamani"],
        date: "2018-11-20",
      },
    },
  ],
  family: [
    { id: "p-kallappa", name: "Kallappa Basappa Hosamani", gender: "M", relation: "Owner", alive: false, diedOn: "2017-03-12" },
    { id: "p-gangavva", name: "Gangavva Hosamani", gender: "F", relation: "Wife", spouseOfId: "p-kallappa", alive: true, phone: "+91 94480 1xxxx" },
    { id: "p-mallikarjun", name: "Mallikarjun Hosamani", gender: "M", relation: "Son", parentId: "p-kallappa", alive: true, phone: "+91 99020 3xxxx" },
    { id: "p-shivanand", name: "Shivanand Hosamani", gender: "M", relation: "Son", parentId: "p-kallappa", alive: true, phone: "+91 97411 5xxxx" },
    { id: "p-savitri", name: "Savitri Patil", gender: "F", relation: "Daughter", parentId: "p-kallappa", alive: true, phone: "+91 88611 2xxxx" },
  ],
  possession: [
    { personId: "p-mallikarjun", guntas: 90 },
    { personId: "p-shivanand", guntas: 90 },
  ],
  land: { irrigation: "dry", roadAccess: true, guidanceValuePerAcre: 650000, pendingDispute: false },
  consents: {},
  draftedIssueIds: [],
};

const hanumanthappa: LandCase = {
  id: "sample-hebbur",
  title: "Hanumanthappa's arecanut garden",
  summary: "Owner died in 2019, one son died earlier, survey number differs on the map.",
  village: "Hebbur",
  hobli: "Hebbur",
  taluk: "Tumakuru",
  district: "Tumakuru",
  recordedOwnerId: "p-hanu",
  isSample: true,
  documents: [
    {
      id: "d-rtc-2",
      kind: "rtc",
      title: "RTC (Pahani) 2024-25",
      issuedBy: "Bhoomi, Revenue Dept.",
      source: "sample",
      fields: { ownerName: "Hanumanthappa", surveyNo: "45/1A", extentGuntas: 90, khataNo: "77", village: "Hebbur", date: "2025-02-03" },
    },
    {
      id: "d-mr-2",
      kind: "mutation",
      title: "Mutation Register MR H12/2009-10",
      issuedBy: "Village Accountant, Hebbur",
      source: "sample",
      fields: { ownerName: "Hanumanthappa T.", surveyNo: "45/1 A", mutationType: "Sale", date: "2009-08-17" },
    },
    {
      id: "d-sketch-2",
      kind: "survey_sketch",
      title: "Hissa sketch",
      issuedBy: "ADLR, Tumakuru",
      source: "sample",
      fields: { ownerName: "Hanumanthappa", surveyNo: "45/1B", extentGuntas: 90, date: "2010-01-11" },
    },
    {
      id: "d-death-2",
      kind: "death_certificate",
      title: "Death certificate",
      issuedBy: "Tumakuru City Corporation",
      source: "sample",
      fields: { deceasedName: "Hanumanthappa Thimmaiah", date: "2019-07-30" },
    },
    {
      id: "d-tree-2",
      kind: "family_tree",
      title: "Survivorship certificate",
      issuedBy: "Tahsildar, Tumakuru",
      source: "sample",
      fields: {
        deceasedName: "Hanumanthappa",
        heirsListed: ["Nagaveni", "Lakshmamma", "Kiran Kumar", "Pavithra"],
        date: "2020-02-14",
      },
    },
  ],
  family: [
    { id: "p-hanu", name: "Hanumanthappa Thimmaiah", gender: "M", relation: "Owner", alive: false, diedOn: "2019-07-30" },
    { id: "p-jayamma", name: "Jayamma", gender: "F", relation: "Wife", spouseOfId: "p-hanu", alive: false, diedOn: "2012-04-02" },
    { id: "p-ramesh", name: "Ramesh", gender: "M", relation: "Son", parentId: "p-hanu", alive: false, diedOn: "2015-10-09" },
    { id: "p-lakshmamma", name: "Lakshmamma", gender: "F", relation: "Daughter-in-law", spouseOfId: "p-ramesh", alive: true, phone: "+91 90082 6xxxx" },
    { id: "p-kiran", name: "Kiran Kumar", gender: "M", relation: "Grandson", parentId: "p-ramesh", alive: true, phone: "+91 63621 4xxxx" },
    { id: "p-pavithra", name: "Pavithra", gender: "F", relation: "Granddaughter", parentId: "p-ramesh", alive: true, phone: "+91 70191 8xxxx" },
    { id: "p-nagaveni", name: "Nagaveni", gender: "F", relation: "Daughter", parentId: "p-hanu", alive: true, phone: "+91 96111 0xxxx" },
  ],
  possession: [],
  land: { irrigation: "garden", roadAccess: false, guidanceValuePerAcre: 900000, pendingDispute: false },
  consents: {},
  draftedIssueIds: [],
};

const shivalinge: LandCase = {
  id: "sample-keragodu",
  title: "Shivalingegowda's paddy land",
  summary: "Living owner, papers match. Shows what a clean, bank-ready file looks like.",
  village: "Keragodu",
  hobli: "Keragodu",
  taluk: "Mandya",
  district: "Mandya",
  recordedOwnerId: "p-shiva",
  isSample: true,
  documents: [
    {
      id: "d-rtc-3",
      kind: "rtc",
      title: "RTC (Pahani) 2024-25",
      issuedBy: "Bhoomi, Revenue Dept.",
      source: "sample",
      fields: { ownerName: "Shivalingegowda", surveyNo: "78/2", extentGuntas: 120, khataNo: "302", village: "Keragodu", date: "2025-03-21" },
    },
    {
      id: "d-sketch-3",
      kind: "survey_sketch",
      title: "Tippan extract",
      issuedBy: "ADLR, Mandya",
      source: "sample",
      fields: { ownerName: "Shivalingegowda", surveyNo: "78/2", extentGuntas: 120, date: "2016-09-05" },
    },
    {
      id: "d-deed-3",
      kind: "sale_deed",
      title: "Registered sale deed",
      issuedBy: "Sub-Registrar, Mandya",
      source: "sample",
      fields: { ownerName: "Sri Shivalingegowda", surveyNo: "Sy. No. 78/2", extentGuntas: 120, date: "2004-12-10" },
    },
  ],
  family: [
    { id: "p-shiva", name: "Shivalingegowda", gender: "M", relation: "Owner", alive: true, phone: "+91 94491 7xxxx" },
  ],
  possession: [],
  land: { irrigation: "wet", roadAccess: true, guidanceValuePerAcre: 800000, pendingDispute: false },
  consents: {},
  draftedIssueIds: [],
};

export const SAMPLE_CASES: LandCase[] = [kallappa, hanumanthappa, shivalinge];

export function blankCase(id: string): LandCase {
  return {
    id,
    title: "My land case",
    summary: "Started from uploaded photos.",
    village: "",
    hobli: "",
    taluk: "",
    district: "",
    recordedOwnerId: "p-owner",
    isSample: false,
    documents: [],
    family: [{ id: "p-owner", name: "Recorded owner", gender: "M", relation: "Owner", alive: true }],
    possession: [],
    land: { irrigation: "dry", roadAccess: false, guidanceValuePerAcre: 500000, pendingDispute: false },
    consents: {},
    draftedIssueIds: [],
  };
}
