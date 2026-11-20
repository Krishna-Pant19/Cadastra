// All case data lives in the browser for the demo (localStorage).
// Later this moves to the FastAPI backend + Postgres.

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { SAMPLE_CASES, blankCase } from "@/lib/cadastra/sample-cases";
import type { ConsentStatus, LandCase, LandDocument, Person, Possession } from "@/lib/cadastra/types";

const STORAGE_KEY = "cadastra.cases.v1";

interface State {
  cases: LandCase[];
  activeId: string;
  hydrated: boolean;
}

type Action =
  | { type: "hydrate"; state: Pick<State, "cases" | "activeId"> }
  | { type: "select"; id: string }
  | { type: "create" }
  | { type: "reset"; id: string }
  | { type: "update"; id: string; patch: Partial<LandCase> }
  | { type: "addDoc"; doc: LandDocument }
  | { type: "updateDoc"; doc: LandDocument }
  | { type: "removeDoc"; docId: string }
  | { type: "upsertPerson"; person: Person }
  | { type: "removePerson"; personId: string }
  | { type: "setPossession"; possession: Possession[] }
  | { type: "setConsent"; personId: string; status: ConsentStatus }
  | { type: "toggleDrafted"; issueId: string; drafted: boolean };

const clone = <T,>(v: T): T => structuredClone(v);

function initialState(): State {
  return { cases: SAMPLE_CASES.map(clone), activeId: SAMPLE_CASES[0]!.id, hydrated: false };
}

function mapActive(state: State, fn: (c: LandCase) => LandCase): State {
  return { ...state, cases: state.cases.map((c) => (c.id === state.activeId ? fn(c) : c)) };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "hydrate":
      return { ...action.state, hydrated: true };
    case "select":
      return { ...state, activeId: action.id };
    case "create": {
      const id = `case-${Date.now().toString(36)}`;
      return { ...state, cases: [...state.cases, blankCase(id)], activeId: id };
    }
    case "reset": {
      const original = SAMPLE_CASES.find((s) => s.id === action.id);
      if (!original) return state;
      return { ...state, cases: state.cases.map((c) => (c.id === action.id ? clone(original) : c)) };
    }
    case "update":
      return { ...state, cases: state.cases.map((c) => (c.id === action.id ? { ...c, ...action.patch } : c)) };
    case "addDoc":
      return mapActive(state, (c) => ({ ...c, documents: [...c.documents, action.doc] }));
    case "updateDoc":
      return mapActive(state, (c) => ({
        ...c,
        documents: c.documents.map((d) => (d.id === action.doc.id ? action.doc : d)),
      }));
    case "removeDoc":
      return mapActive(state, (c) => ({ ...c, documents: c.documents.filter((d) => d.id !== action.docId) }));
    case "upsertPerson":
      return mapActive(state, (c) => {
        const exists = c.family.some((p) => p.id === action.person.id);
        return {
          ...c,
          family: exists
            ? c.family.map((p) => (p.id === action.person.id ? action.person : p))
            : [...c.family, action.person],
        };
      });
    case "removePerson":
      return mapActive(state, (c) => ({
        ...c,
        family: c.family.filter((p) => p.id !== action.personId),
        possession: c.possession.filter((p) => p.personId !== action.personId),
      }));
    case "setPossession":
      return mapActive(state, (c) => ({ ...c, possession: action.possession }));
    case "setConsent":
      return mapActive(state, (c) => ({ ...c, consents: { ...c.consents, [action.personId]: action.status } }));
    case "toggleDrafted":
      return mapActive(state, (c) => ({
        ...c,
        draftedIssueIds: action.drafted
          ? Array.from(new Set([...c.draftedIssueIds, action.issueId]))
          : c.draftedIssueIds.filter((id) => id !== action.issueId),
      }));
  }
}

interface Store {
  cases: LandCase[];
  active: LandCase;
  hydrated: boolean;
  dispatch: (a: Action) => void;
  select: (id: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function CaseProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // load saved cases after hydration (localStorage doesn't exist during SSR)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Pick<State, "cases" | "activeId">;
        if (Array.isArray(saved.cases) && saved.cases.length > 0) {
          dispatch({ type: "hydrate", state: saved });
          return;
        }
      }
    } catch {
      // corrupted storage -> start fresh
    }
    dispatch({ type: "hydrate", state: { cases: state.cases, activeId: state.activeId } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ cases: state.cases, activeId: state.activeId }));
  }, [state]);

  const select = useCallback((id: string) => dispatch({ type: "select", id }), []);
  const active = state.cases.find((c) => c.id === state.activeId) ?? state.cases[0]!;

  const value = useMemo(
    () => ({ cases: state.cases, active, hydrated: state.hydrated, dispatch, select }),
    [state.cases, active, state.hydrated, select],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCases(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCases must be used inside <CaseProvider>");
  return ctx;
}
