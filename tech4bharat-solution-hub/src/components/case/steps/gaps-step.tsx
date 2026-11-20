import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SourceChips } from "@/components/case/source-chips";
import { FIX_LABEL } from "@/lib/cadastra/drafts";
import type { Severity } from "@/lib/cadastra/discrepancies";
import { formatAcreGunta } from "@/lib/cadastra/units";
import type { CaseAnalysis } from "@/hooks/use-case-analysis";
import { useCases } from "@/store/case-store";

const ICON: Record<Severity, typeof AlertTriangle> = { high: OctagonAlert, medium: AlertTriangle, low: Info };
const LABEL: Record<Severity, string> = { high: "Serious", medium: "Needs attention", low: "Minor" };

export function GapsStep({ analysis }: { analysis: CaseAnalysis }) {
  const { active } = useCases();
  const { issues } = analysis;
  const count = (s: Severity) => issues.filter((i) => i.severity === s).length;

  const rtcArea = analysis.rtc?.fields.extentGuntas;
  const sketchArea = active.documents.find((d) => d.kind === "survey_sketch")?.fields.extentGuntas;

  if (issues.length === 0) {
    return (
      <div className="sheet flex items-center gap-4 p-8">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <div>
          <p className="font-display text-xl font-semibold">No gaps found</p>
          <p className="text-sm text-muted-foreground">All papers agree with each other. You can go straight to the case file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        {issues.map((issue) => {
          const Icon = ICON[issue.severity];
          return (
            <article key={issue.id} className="sheet flex gap-4 p-5">
              <Icon
                className={
                  issue.severity === "high"
                    ? "mt-0.5 h-5 w-5 shrink-0 text-destructive"
                    : issue.severity === "medium"
                      ? "mt-0.5 h-5 w-5 shrink-0 text-warning-foreground"
                      : "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
                }
              />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-semibold">{issue.title}</h4>
                  <Badge variant={issue.severity}>{LABEL[issue.severity]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{issue.detail}</p>
                <SourceChips docIds={issue.docIds} c={active} />
                <p className="text-xs">
                  <span className="text-muted-foreground">Fix: </span>
                  <span className="font-medium">{FIX_LABEL[issue.fix]}</span>
                </p>
              </div>
            </article>
          );
        })}
      </div>

      <aside className="space-y-4">
        <div className="sheet p-5">
          <p className="eyebrow">Summary</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span>Serious</span><span className="font-mono">{count("high")}</span></li>
            <li className="flex justify-between"><span>Needs attention</span><span className="font-mono">{count("medium")}</span></li>
            <li className="flex justify-between"><span>Minor</span><span className="font-mono">{count("low")}</span></li>
          </ul>
        </div>
        {rtcArea && sketchArea && (
          <div className="sheet p-5">
            <p className="eyebrow">Area check</p>
            <AreaBar label="RTC" guntas={rtcArea} max={Math.max(rtcArea, sketchArea)} tone="bg-primary" />
            <AreaBar label="Survey sketch" guntas={sketchArea} max={Math.max(rtcArea, sketchArea)} tone="bg-accent" />
          </div>
        )}
      </aside>
    </div>
  );
}

function AreaBar({ label, guntas, max, tone }: { label: string; guntas: number; max: number; tone: string }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-xs">
        <span>{label}</span>
        <span className="font-mono">{formatAcreGunta(guntas)}</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-secondary">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${(guntas / max) * 100}%` }} />
      </div>
    </div>
  );
}
