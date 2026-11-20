import { useState } from "react";
import { Pencil, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldRow, NativeSelect } from "@/components/case/field";
import { formatAcreGunta, parseAcreGunta } from "@/lib/cadastra/units";
import { DOC_KIND_LABEL, type DocKind, type LandDocument } from "@/lib/cadastra/types";
import { useCases } from "@/store/case-store";

export function ReadStep() {
  const { active, dispatch } = useCases();
  const [editing, setEditing] = useState<LandDocument | null>(null);

  if (active.documents.length === 0) {
    return <p className="text-muted-foreground">No papers yet. Go back and upload a photo or add one by hand.</p>;
  }

  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
        This is what we read from each paper. Check the values — especially anything read by AI — and correct
        them if needed. Every later finding points back to these papers.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {active.documents.map((doc) => (
          <article key={doc.id} className="sheet p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="eyebrow">{DOC_KIND_LABEL[doc.kind]}</p>
                <h4 className="mt-1 font-display text-lg font-semibold">{doc.title}</h4>
                <p className="text-xs text-muted-foreground">{doc.issuedBy || "Issuing office not set"}</p>
              </div>
              {doc.source === "sample" ? (
                <Badge variant="low">Sample record</Badge>
              ) : doc.confidence !== undefined ? (
                <Badge variant={doc.confidence >= 0.75 ? "success" : "medium"}>
                  <Sparkles className="mr-1 h-3 w-3" /> AI read · {Math.round(doc.confidence * 100)}%
                </Badge>
              ) : (
                <Badge variant="outline">Entered by hand</Badge>
              )}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
              {doc.kind === "death_certificate" ? (
                <FieldRow label="Deceased">{doc.fields.deceasedName}</FieldRow>
              ) : doc.kind === "family_tree" ? (
                <FieldRow label="For late">{doc.fields.deceasedName}</FieldRow>
              ) : (
                <FieldRow label="Owner">{doc.fields.ownerName}</FieldRow>
              )}
              <FieldRow label="Survey no." mono>{doc.fields.surveyNo}</FieldRow>
              {doc.fields.extentGuntas !== undefined && (
                <FieldRow label="Extent" mono>{formatAcreGunta(doc.fields.extentGuntas)}</FieldRow>
              )}
              {doc.fields.khataNo && <FieldRow label="Khata no." mono>{doc.fields.khataNo}</FieldRow>}
              <FieldRow label={doc.kind === "death_certificate" ? "Date of death" : "Date"} mono>{doc.fields.date}</FieldRow>
              {doc.fields.mutationType && <FieldRow label="Mutation type">{doc.fields.mutationType}</FieldRow>}
              {doc.fields.heirsListed && (
                <div className="col-span-2">
                  <FieldRow label="Heirs listed">{doc.fields.heirsListed.join(", ")}</FieldRow>
                </div>
              )}
            </dl>
            {doc.rawText && (
              <details className="mt-3 text-xs text-muted-foreground">
                <summary className="cursor-pointer">Text we read</summary>
                <p className="mt-1 whitespace-pre-wrap font-mono">{doc.rawText}</p>
              </details>
            )}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="paper" onClick={() => setEditing(structuredClone(doc))}>
                <Pencil /> Correct
              </Button>
              <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "removeDoc", docId: doc.id })}>
                <Trash2 /> Remove
              </Button>
            </div>
          </article>
        ))}
      </div>

      <DocumentDialog
        doc={editing}
        onClose={() => setEditing(null)}
        onSave={(doc) => {
          dispatch({ type: "updateDoc", doc });
          setEditing(null);
        }}
      />
    </div>
  );
}

function DocumentDialog({
  doc,
  onClose,
  onSave,
}: {
  doc: LandDocument | null;
  onClose: () => void;
  onSave: (d: LandDocument) => void;
}) {
  const [draft, setDraft] = useState<LandDocument | null>(doc);
  const [extentText, setExtentText] = useState("");
  const [heirsText, setHeirsText] = useState("");

  // reset local form whenever a new doc is opened
  const [openedId, setOpenedId] = useState<string | null>(null);
  if (doc && doc.id !== openedId) {
    setOpenedId(doc.id);
    setDraft(doc);
    setExtentText(doc.fields.extentGuntas !== undefined ? formatAcreGunta(doc.fields.extentGuntas).replace(" A ", "-").replace(" G", "") : "");
    setHeirsText(doc.fields.heirsListed?.join(", ") ?? "");
  }
  if (!doc && openedId) setOpenedId(null);

  const setField = (key: keyof LandDocument["fields"], value: string) =>
    setDraft((d) => (d ? { ...d, fields: { ...d.fields, [key]: value || undefined } } : d));

  const extentGuntas = extentText ? parseAcreGunta(extentText) : undefined;

  return (
    <Dialog open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Correct document details</DialogTitle>
        </DialogHeader>
        {draft && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Document type</Label>
              <NativeSelect value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value as DocKind })}>
                {Object.entries(DOC_KIND_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </NativeSelect>
            </div>
            <TextField label="Title" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            <TextField label="Issued by" value={draft.issuedBy} onChange={(v) => setDraft({ ...draft, issuedBy: v })} />
            {draft.kind === "death_certificate" || draft.kind === "family_tree" ? (
              <TextField label="Deceased person" value={draft.fields.deceasedName ?? ""} onChange={(v) => setField("deceasedName", v)} />
            ) : (
              <TextField label="Owner name" value={draft.fields.ownerName ?? ""} onChange={(v) => setField("ownerName", v)} />
            )}
            <TextField label="Survey no." value={draft.fields.surveyNo ?? ""} onChange={(v) => setField("surveyNo", v)} />
            <div className="space-y-1">
              <Label>Extent (acres-guntas)</Label>
              <Input value={extentText} placeholder="e.g. 4-20" onChange={(e) => setExtentText(e.target.value)} />
              {extentText && extentGuntas === null && <p className="text-xs text-destructive">Use the form 4-20 (4 acres 20 guntas)</p>}
            </div>
            <TextField label="Khata no." value={draft.fields.khataNo ?? ""} onChange={(v) => setField("khataNo", v)} />
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={draft.fields.date ?? ""} onChange={(e) => setField("date", e.target.value)} />
            </div>
            {draft.kind === "mutation" && (
              <TextField label="Mutation type" value={draft.fields.mutationType ?? ""} onChange={(v) => setField("mutationType", v)} />
            )}
            {draft.kind === "family_tree" && (
              <div className="space-y-1 sm:col-span-2">
                <Label>Heirs listed (comma separated)</Label>
                <Input value={heirsText} onChange={(e) => setHeirsText(e.target.value)} />
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            disabled={!draft || extentGuntas === null}
            onClick={() => {
              if (!draft) return;
              const heirs = heirsText.split(",").map((s) => s.trim()).filter(Boolean);
              onSave({
                ...draft,
                fields: {
                  ...draft.fields,
                  extentGuntas: extentGuntas ?? undefined,
                  heirsListed: draft.kind === "family_tree" ? heirs : draft.fields.heirsListed,
                },
              });
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
