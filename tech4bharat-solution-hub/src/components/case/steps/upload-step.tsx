import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Camera, FilePlus2, Loader2, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/case/field";
import { readDocument } from "@/lib/ocr.functions";
import { fileToResizedDataUrl } from "@/lib/image";
import { parseAcreGunta } from "@/lib/cadastra/units";
import { DOC_KIND_LABEL, type DocKind, type LandDocument } from "@/lib/cadastra/types";
import { useCases } from "@/store/case-store";
import { cn } from "@/lib/utils";

const newId = () => `d-${Math.random().toString(36).slice(2, 9)}`;

export function UploadStep({ onNext }: { onNext: () => void }) {
  const { cases, active, dispatch, select } = useCases();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string[]>([]);
  const [manualKind, setManualKind] = useState<DocKind>("rtc");
  const read = useServerFn(readDocument);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      setBusy((b) => [...b, file.name]);
      try {
        const imageDataUrl = await fileToResizedDataUrl(file);
        const r = await read({ data: { imageDataUrl } });
        const doc: LandDocument = {
          id: newId(),
          kind: r.kind,
          title: r.title || DOC_KIND_LABEL[r.kind],
          issuedBy: r.issuedBy || "Unknown office",
          source: "upload",
          confidence: r.confidence,
          rawText: r.rawText,
          fields: {
            ownerName: r.ownerName ?? undefined,
            surveyNo: r.surveyNo ?? undefined,
            extentGuntas: r.extentText ? (parseAcreGunta(r.extentText) ?? undefined) : undefined,
            khataNo: r.khataNo ?? undefined,
            village: r.village ?? undefined,
            date: r.date ?? undefined,
            deceasedName: r.deceasedName ?? undefined,
            heirsListed: r.heirsListed ?? undefined,
            mutationType: r.mutationType ?? undefined,
          },
        };
        dispatch({ type: "addDoc", doc });
        toast.success(`Read “${doc.title}”`, { description: `${Math.round(r.confidence * 100)}% confident — please check it in the next step.` });
      } catch (err) {
        toast.error(`Couldn't read ${file.name}`, {
          description: err instanceof Error ? err.message : "Try a clearer photo, or add it by hand.",
        });
      } finally {
        setBusy((b) => b.filter((n) => n !== file.name));
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function addManual() {
    dispatch({
      type: "addDoc",
      doc: { id: newId(), kind: manualKind, title: DOC_KIND_LABEL[manualKind], issuedBy: "", source: "upload", fields: {} },
    });
    toast.success(`${DOC_KIND_LABEL[manualKind]} added`, { description: "Fill in its details in the Read step." });
  }

  const updateInfo = (key: "title" | "village" | "hobli" | "taluk" | "district", value: string) =>
    dispatch({ type: "update", id: active.id, patch: { [key]: value } });

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <section>
        <h3 className="text-xl font-semibold">1. Pick a case</h3>
        <p className="mt-1 text-sm text-muted-foreground">Start with a sample family, or open a new case for your own papers.</p>
        <div className="mt-4 space-y-3">
          {cases.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => select(c.id)}
              className={cn(
                "sheet block w-full p-4 text-left transition hover:shadow-lift",
                c.id === active.id && "ring-2 ring-primary",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{c.summary}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {c.village ? `${c.village}, ${c.district}` : "New"}
                </span>
              </div>
            </button>
          ))}
          <Button variant="paper" className="w-full" onClick={() => dispatch({ type: "create" })}>
            <Plus /> Start a new case
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-semibold">2. Land details</h3>
            {active.isSample && (
              <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "reset", id: active.id })}>
                <RotateCcw /> Reset sample
              </Button>
            )}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["title", "Case name"],
                ["village", "Village"],
                ["hobli", "Hobli"],
                ["taluk", "Taluk"],
                ["district", "District"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className={cn("space-y-1", key === "title" && "sm:col-span-2")}>
                <Label htmlFor={`info-${key}`}>{label}</Label>
                <Input id={`info-${key}`} value={active[key]} onChange={(e) => updateInfo(key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold">3. Add papers</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            RTC / Pahani, Mutation Register, death certificate, family tree, survey sketch, sale deed. Kannada or English.
          </p>
          <label
            htmlFor="doc-upload"
            className="survey-grid mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 px-6 py-10 text-center transition hover:border-primary"
          >
            <Camera className="h-8 w-8 text-primary" />
            <span className="font-medium">Upload photos of documents</span>
            <span className="text-xs text-muted-foreground">JPG, PNG or WEBP — the AI reads owner, survey no. and extent</span>
          </label>
          <input
            id="doc-upload"
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            className="sr-only"
            onChange={(e) => handleFiles(e.target.files)}
          />
          {busy.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {busy.map((name) => (
                <li key={name} className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reading {name}…
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <div className="min-w-48 flex-1 space-y-1">
              <Label htmlFor="manual-kind">No photo? Add by hand</Label>
              <NativeSelect id="manual-kind" value={manualKind} onChange={(e) => setManualKind(e.target.value as DocKind)}>
                {Object.entries(DOC_KIND_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </NativeSelect>
            </div>
            <Button variant="paper" onClick={addManual}>
              <FilePlus2 /> Add
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md bg-secondary/60 px-4 py-3 text-sm">
          <span>
            <strong>{active.documents.length}</strong> paper{active.documents.length === 1 ? "" : "s"} in this case
          </span>
          <Button size="sm" onClick={onNext} disabled={busy.length > 0}>
            Continue to Read
          </Button>
        </div>
      </section>
    </div>
  );
}
