// Succession & Lineage Agent (rule based).
//
// Simplified Hindu Succession Act, 1956 (as amended in 2005) for a male owner
// dying without a will (Section 8, Class I heirs):
//   - widow, mother, each son and each daughter get one equal share
//   - a son/daughter who died BEFORE the owner: their share goes as one
//     "branch" to their own widow/widower and children, split equally
// This covers the common rural cases we saw. Anything else is flagged for a
// lawyer / revenue officer instead of guessing.

import { add, frac, mul, type Fraction } from "./fraction";
import type { Person } from "./types";

export interface HeirShare {
  personId: string;
  name: string;
  relation: string;
  share: Fraction;
  /** name of the predeceased child through whom this person inherits */
  via?: string | undefined;
}

export interface SuccessionResult {
  applicable: boolean;
  heirs: HeirShare[];
  notes: string[];
}

/** true if the person was alive when the owner died */
export function survived(person: Person, owner: Person): boolean {
  if (person.alive) return true;
  if (!person.diedOn || !owner.diedOn) return false;
  return person.diedOn > owner.diedOn;
}

function childrenOf(family: Person[], id: string): Person[] {
  return family.filter((p) => p.parentId === id);
}

function spousesOf(family: Person[], id: string): Person[] {
  return family.filter((p) => p.spouseOfId === id);
}

export function computeSuccession(family: Person[], ownerId: string): SuccessionResult {
  const owner = family.find((p) => p.id === ownerId);
  if (!owner) {
    return { applicable: false, heirs: [], notes: ["Recorded owner is not in the family list."] };
  }
  if (owner.alive) {
    return {
      applicable: false,
      heirs: [],
      notes: [`${owner.name} is alive, so no inheritance is needed. The owner can act directly.`],
    };
  }

  const notes: string[] = [];
  if (owner.gender === "F") {
    notes.push(
      "Owner is a woman: Section 15 of the Act applies. Shares below follow the same Class I pattern but must be checked by an officer.",
    );
  }

  // Each entry is one equal "unit" of the estate.
  const units: { members: Person[]; via?: Person }[] = [];

  for (const spouse of spousesOf(family, owner.id)) {
    if (survived(spouse, owner)) units.push({ members: [spouse] });
  }

  const mother = family.find((p) => p.relation.toLowerCase() === "mother");
  if (mother && survived(mother, owner)) units.push({ members: [mother] });

  for (const child of childrenOf(family, owner.id)) {
    if (survived(child, owner)) {
      units.push({ members: [child] });
      continue;
    }
    // predeceased child -> share goes to their branch
    const branch = [
      ...spousesOf(family, child.id).filter((p) => survived(p, owner)),
      ...childrenOf(family, child.id).filter((p) => survived(p, owner)),
    ];
    if (branch.length > 0) {
      units.push({ members: branch, via: child });
    } else {
      notes.push(`${child.name} died before the owner and left no heirs, so no share passes through them.`);
    }
  }

  if (units.length === 0) {
    return {
      applicable: true,
      heirs: [],
      notes: [...notes, "No Class I heir found. Class II heirs (father, siblings…) need a legal review."],
    };
  }

  const unitShare = frac(1, units.length);
  const heirs: HeirShare[] = [];
  for (const unit of units) {
    const each = mul(unitShare, frac(1, unit.members.length));
    for (const m of unit.members) {
      heirs.push({
        personId: m.id,
        name: m.name,
        relation: m.relation,
        share: each,
        via: unit.via?.name,
      });
    }
  }

  const deadAfterOwner = heirs.filter((h) => !family.find((p) => p.id === h.personId)?.alive);
  for (const h of deadAfterOwner) {
    notes.push(`${h.name} died after the owner. Their share now passes to their own heirs (needs a second mutation).`);
  }

  return { applicable: true, heirs, notes };
}

/** sanity check used in tests and in the UI */
export function totalShare(heirs: HeirShare[]): Fraction {
  return heirs.reduce((sum, h) => add(sum, h.share), frac(0, 1));
}

/** People whose consent is needed for any fix: living heirs, or the owner if alive */
export function consentPeople(family: Person[], ownerId: string): Person[] {
  const owner = family.find((p) => p.id === ownerId);
  if (!owner) return [];
  if (owner.alive) return [owner];
  const { heirs } = computeSuccession(family, ownerId);
  return heirs
    .map((h) => family.find((p) => p.id === h.personId))
    .filter((p): p is Person => !!p && p.alive);
}
