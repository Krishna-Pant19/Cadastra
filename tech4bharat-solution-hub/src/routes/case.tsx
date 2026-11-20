import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReadinessMeter } from "@/components/case/readiness-meter";
import { UploadStep } from "@/components/case/steps/upload-step";
import { ReadStep } from "@/components/case/steps/read-step";
import { ExplainStep } from "@/components/case/steps/explain-step";
import { GapsStep } from "@/components/case/steps/gaps-step";
import { FixStep } from "@/components/case/steps/fix-step";
import { CaseFileStep } from "@/components/case/steps/casefile-step";
import { useCaseAnalysis } from "@/hooks/use-case-analysis";
import { useCases } from "@/store/case-store";
import { cn } from "@/lib/utils";

const STEPS = ["Upload", "Read", "Explain", "Find gaps", "Fix & consent", "Case file"] as const;

export const Route = createFileRoute("/case")({
  validateSearch: (search: Record<string, unknown>): { step: number } => {
    const n = Number(search["step"]);
    return { step: Number.isInteger(n) && n >= 1 && n <= STEPS.length ? n : 1 };
  },
  head: () => ({
    meta: [
      { title: "Cadastra demo — build a land case file" },
      { name: "description", content: "Walk a Karnataka land case through upload, reading, explanation, gap finding, consent and a bank-ready PDF." },
      { property: "og:title", content: "Cadastra demo — build a land case file" },
      { property: "og:description", content: "Six steps from unclear land papers to a verified case file." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CasePage,
});

function CasePage() {
  const { step } = Route.useSearch();
  const navigate = useNavigate({ from: "/case" });
  const { active } = useCases();
  const analysis = useCaseAnalysis(active);
  const go = (s: number) => {
    void navigate({ search: { step: s } });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Case</p>
          <h1 className="text-3xl font-semibold">{active.title}</h1>
          <p className="text-sm text-muted-foreground">
            {analysis.rtc?.fields.surveyNo ? `Sy. No. ${analysis.rtc.fields.surveyNo} · ` : ""}
            {[active.village, active.taluk, active.district].filter(Boolean).join(", ") || "Location not set"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ReadinessMeter score={analysis.score} />
          <div className="text-sm">
            <p className="font-semibold">{analysis.label}</p>
            <p className="text-muted-foreground">{analysis.issues.length} findings</p>
          </div>
        </div>
      </div>

      <ol className="mt-8 grid grid-cols-3 gap-2 md:grid-cols-6">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => go(i + 1)}
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left text-sm transition",
                step === i + 1 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-paper hover:bg-secondary",
              )}
            >
              <span className="block font-mono text-xs opacity-70">0{i + 1}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-8 animate-rise" key={`${active.id}-${step}`}>
        {step === 1 && <UploadStep onNext={() => go(2)} />}
        {step === 2 && <ReadStep />}
        {step === 3 && <ExplainStep analysis={analysis} />}
        {step === 4 && <GapsStep analysis={analysis} />}
        {step === 5 && <FixStep analysis={analysis} />}
        {step === 6 && <CaseFileStep analysis={analysis} />}
      </div>

      <div className="mt-10 flex justify-between border-t border-border pt-6">
        <Button variant="paper" disabled={step === 1} onClick={() => go(step - 1)}>
          <ArrowLeft /> Back
        </Button>
        {step < STEPS.length && (
          <Button onClick={() => go(step + 1)}>
            {STEPS[step]} <ArrowRight />
          </Button>
        )}
      </div>
    </div>
  );
}
