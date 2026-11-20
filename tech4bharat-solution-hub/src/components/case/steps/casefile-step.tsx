import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ReadinessMeter } from "@/components/case/readiness-meter";
import { downloadCaseFile } from "@/lib/cadastra/case-file-pdf";
import { formatLakh } from "@/lib/cadastra/units";
import type { CaseAnalysis } from "@/hooks/use-case-analysis";
import { useCases } from "@/store/case-store";

export function CaseFileStep({ analysis }: { analysis: CaseAnalysis }) {
  const { active } = useCases();
  const [busy, setBusy] = useState(false);
  const { value } = analysis;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="sheet flex items-center gap-5 p-6">
        <ReadinessMeter score={analysis.score} size={96} />
        <div>
          <p className="eyebrow">Readiness</p>
          <p className="font-display text-2xl font-semibold">{analysis.label}</p>
          <p className="text-sm text-muted-foreground">
            {analysis.issues.length} finding{analysis.issues.length === 1 ? "" : "s"}, {active.draftedIssueIds.length} fix{active.draftedIssueIds.length === 1 ? "" : "es"} prepared
          </p>
        </div>
      </div>
      <div className="sheet p-6">
        <p className="eyebrow">Fair value range (indicative)</p>
        {value ? (
          <>
            <p className="mt-1 font-display text-2xl font-semibold">
              {formatLakh(value.low)} – {formatLakh(value.high)}
            </p>
            <p className="text-sm text-muted-foreground">
              Guidance value {formatLakh(value.guidanceTotal)} · possible loan ~{formatLakh(value.indicativeLoan)}
            </p>
          </>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Add the RTC extent to estimate value.</p>
        )}
      </div>
      <div className="sheet p-6 lg:col-span-2">
        <h3 className="text-xl font-semibold">Download the case file</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          One PDF with parcel details, heirs and shares, every finding with its source paper, consent status and value range.
        </p>
        <Button
          className="mt-4"
          size="lg"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await downloadCaseFile({
                c: active,
                issues: analysis.issues,
                heirs: analysis.succession.heirs,
                signerIds: analysis.signerIds,
                score: analysis.score,
                label: analysis.label,
                value,
              });
            } catch {
              toast.error("Could not create the PDF. Please try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Download />} Download PDF
        </Button>
      </div>
    </div>
  );
}
