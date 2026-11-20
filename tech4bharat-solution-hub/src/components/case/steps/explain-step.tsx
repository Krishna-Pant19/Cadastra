import { useEffect, useState } from "react";
import { Plus, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { NativeSelect } from "@/components/case/field";
import { explainCase } from "@/lib/cadastra/explain";
import { toNumber, toString as fracStr } from "@/lib/cadastra/fraction";
import { formatAcreGunta, parseAcreGunta } from "@/lib/cadastra/units";
import type { Person } from "@/lib/cadastra/types";
import type { CaseAnalysis } from "@/hooks/use-case-analysis";
import { useCases } from "@/store/case-store";

export function ExplainStep({ analysis }: { analysis: CaseAnalysis }) {
  const { active } = useCases();
  const paragraphs = explainCase(active, analysis.issues);
  const extent = analysis.rtc?.fields.extentGuntas;

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="sheet p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">In simple words</h3>
            <ReadAloud text={paragraphs.join(" ")} />
          </div>
          <div className="mt-4 space-y-3 text-[0.97rem] leading-relaxed">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        <div className="sheet p-6">
          <h3 className="text-xl font-semibold">Who owns what</h3>
          {analysis.succession.applicable ? (
            <table className="mt-4 w-full text-sm">
              <thead className="text-left text-muted-foreground">
                <tr>
                  <th className="pb-2 font-medium">Heir</th>
                  <th className="pb-2 font-medium">Share</th>
                  <th className="pb-2 text-right font-medium">Land</th>
                </tr>
              </thead>
              <tbody>
                {analysis.succession.heirs.map((h) => (
                  <tr key={h.personId} className="border-t border-border">
                    <td className="py-2">
                      <p className="font-medium">{h.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {h.relation}
                        {h.via ? ` · via late ${h.via}` : ""}
                      </p>
                    </td>
                    <td className="py-2 font-mono">{fracStr(h.share)}</td>
                    <td className="py-2 text-right font-mono">
                      {extent ? formatAcreGunta(extent * toNumber(h.share)) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
          {analysis.succession.notes.map((n) => (
            <p key={n} className="mt-3 text-sm text-muted-foreground">{n}</p>
          ))}
          <p className="mt-4 text-xs text-muted-foreground">
            Based on the Hindu Succession Act, 1956 (amended 2005). A revenue officer confirms before filing.
          </p>
        </div>
      </section>

      <FamilyEditor />
      <PossessionEditor />
    </div>
  );
}

function ReadAloud({ text }: { text: string }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  useEffect(() => setSupported(typeof window !== "undefined" && "speechSynthesis" in window), []);
  useEffect(() => () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);
  if (!supported) return null;
  return (
    <Button
      size="sm"
      variant="paper"
      onClick={() => {
        const synth = window.speechSynthesis;
        if (speaking) {
          synth.cancel();
          setSpeaking(false);
          return;
        }
        const u = new SpeechSynthesisUtterance(text.replace(/•/g, ""));
        u.lang = "en-IN";
        u.rate = 0.92;
        u.onend = () => setSpeaking(false);
        synth.speak(u);
        setSpeaking(true);
      }}
    >
      {speaking ? <VolumeX /> : <Volume2 />} {speaking ? "Stop" : "Read aloud"}
    </Button>
  );
}

const RELATIONS = ["Owner", "Wife", "Husband", "Son", "Daughter", "Mother", "Daughter-in-law", "Grandson", "Granddaughter", "Other"];

function FamilyEditor() {
  const { active, dispatch } = useCases();
  const update = (p: Person, patch: Partial<Person>) => dispatch({ type: "upsertPerson", person: { ...p, ...patch } });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold">Family tree</h3>
          <p className="text-sm text-muted-foreground">Shares update as you change this. Link children to their parent and spouses to each other.</p>
        </div>
        <Button
          size="sm"
          variant="paper"
          onClick={() =>
            dispatch({
              type: "upsertPerson",
              person: {
                id: `p-${Math.random().toString(36).slice(2, 8)}`,
                name: "New member",
                gender: "F",
                relation: "Daughter",
                parentId: active.recordedOwnerId,
                alive: true,
              },
            })
          }
        >
          <Plus /> Add member
        </Button>
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-secondary/60 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Relation</th>
              <th className="px-3 py-2 font-medium">M/F</th>
              <th className="px-3 py-2 font-medium">Child of</th>
              <th className="px-3 py-2 font-medium">Spouse of</th>
              <th className="px-3 py-2 font-medium">Alive</th>
              <th className="px-3 py-2 font-medium">Died on</th>
              <th className="px-3 py-2 font-medium">Phone</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {active.family.map((p) => {
              const others = active.family.filter((o) => o.id !== p.id);
              const isOwner = p.id === active.recordedOwnerId;
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">
                    <Input value={p.name} onChange={(e) => update(p, { name: e.target.value })} className="h-8" />
                  </td>
                  <td className="px-3 py-2">
                    <NativeSelect className="h-8" value={RELATIONS.includes(p.relation) ? p.relation : "Other"} onChange={(e) => update(p, { relation: e.target.value })} disabled={isOwner}>
                      {RELATIONS.map((r) => <option key={r}>{r}</option>)}
                    </NativeSelect>
                  </td>
                  <td className="px-3 py-2">
                    <NativeSelect className="h-8 w-16" value={p.gender} onChange={(e) => update(p, { gender: e.target.value as Person["gender"] })}>
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </NativeSelect>
                  </td>
                  <td className="px-3 py-2">
                    <NativeSelect className="h-8" value={p.parentId ?? ""} onChange={(e) => update(p, { parentId: e.target.value || undefined })} disabled={isOwner}>
                      <option value="">—</option>
                      {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </NativeSelect>
                  </td>
                  <td className="px-3 py-2">
                    <NativeSelect className="h-8" value={p.spouseOfId ?? ""} onChange={(e) => update(p, { spouseOfId: e.target.value || undefined })} disabled={isOwner}>
                      <option value="">—</option>
                      {others.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                    </NativeSelect>
                  </td>
                  <td className="px-3 py-2">
                    <Switch checked={p.alive} onCheckedChange={(alive) => update(p, { alive, diedOn: alive ? undefined : p.diedOn })} aria-label={`${p.name} alive`} />
                  </td>
                  <td className="px-3 py-2">
                    <Input type="date" className="h-8" disabled={p.alive} value={p.diedOn ?? ""} onChange={(e) => update(p, { diedOn: e.target.value || undefined })} />
                  </td>
                  <td className="px-3 py-2">
                    <Input className="h-8 font-mono" value={p.phone ?? ""} onChange={(e) => update(p, { phone: e.target.value || undefined })} placeholder="+91" />
                  </td>
                  <td className="px-2 py-2">
                    {!isOwner && (
                      <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "removePerson", personId: p.id })} aria-label={`Remove ${p.name}`}>
                        <Trash2 />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PossessionEditor() {
  const { active, dispatch } = useCases();
  const [personId, setPersonId] = useState("");
  const [extent, setExtent] = useState("");
  const living = active.family.filter((p) => p.alive);
  const guntas = parseAcreGunta(extent);

  return (
    <section>
      <h3 className="text-xl font-semibold">Who cultivates which part?</h3>
      <p className="text-sm text-muted-foreground">If the family has already divided the field among themselves, note it here.</p>
      <ul className="mt-3 space-y-2">
        {active.possession.map((p) => (
          <li key={p.personId} className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm">
            <span>{active.family.find((f) => f.id === p.personId)?.name ?? "?"}</span>
            <span className="flex items-center gap-2 font-mono">
              {formatAcreGunta(p.guntas)}
              <Button size="icon" variant="ghost" onClick={() => dispatch({ type: "setPossession", possession: active.possession.filter((x) => x.personId !== p.personId) })} aria-label="Remove part">
                <Trash2 />
              </Button>
            </span>
          </li>
        ))}
        {active.possession.length === 0 && <li className="text-sm text-muted-foreground">No informal division noted.</li>}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        <NativeSelect className="w-56" value={personId} onChange={(e) => setPersonId(e.target.value)}>
          <option value="">Choose person</option>
          {living.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </NativeSelect>
        <Input className="w-32 font-mono" placeholder="2-10" value={extent} onChange={(e) => setExtent(e.target.value)} />
        <Button
          variant="paper"
          disabled={!personId || !guntas}
          onClick={() => {
            if (!guntas) return;
            dispatch({
              type: "setPossession",
              possession: [...active.possession.filter((p) => p.personId !== personId), { personId, guntas }],
            });
            setExtent("");
            setPersonId("");
          }}
        >
          Add part
        </Button>
      </div>
    </section>
  );
}
