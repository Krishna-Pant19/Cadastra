import { FileText } from "lucide-react";
import type { LandCase } from "@/lib/cadastra/types";

/** Guardrail: show which documents a finding came from */
export function SourceChips({ docIds, c }: { docIds: string[]; c: LandCase }) {
  if (docIds.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {docIds.map((id) => {
        const doc = c.documents.find((d) => d.id === id);
        if (!doc) return null;
        return (
          <span key={id} className="inline-flex items-center gap-1 rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.68rem] text-muted-foreground">
            <FileText className="h-3 w-3" /> {doc.title}
          </span>
        );
      })}
    </div>
  );
}
