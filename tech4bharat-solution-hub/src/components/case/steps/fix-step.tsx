import { useState } from "react";
import { Check, Copy, Download, FileSignature, MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { consentMessage, draftFix, FIX_LABEL, FIX_OFFICE } from "@/lib/cadastra/drafts";
import { isAddressed, type Issue } from "@/lib/cadastra/discrepancies";
import type { ConsentStatus } from "@/lib/cadastra/types";
import type { CaseAnalysis } from "@/hooks/use-case-analysis";
import { useCases } from "@/store/case-store";

const STATUS_LABEL: Record<ConsentStatus, string> = {
  not_sent: "Not asked",
  sent: "Waiting",
  agreed: "Agreed",
  declined: "Disagreed",
};
const STATUS_VARIANT = { not_sent: "outline", sent: "medium", agreed: "success", declined: "high" } as const;

export function FixStep({ analysis }: { analysis: CaseAnalysis }) {
  const { active, dispatch } = useCases();
  const [open, setOpen] = useState<{ issue: Issue; text: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const status = (id: string): ConsentStatus => active.consents[id] ?? "not_sent";

  function send(personId: string) {
    dispatch({ type: "setConsent", personId, status: "sent" });
    setPreview(personId);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
      <section>
        <h3 className="text-xl font-semibold">Prepare the fixes</h3>
        <p className="mt-1 text-sm text-muted-foreground">We draft each application. Read it, edit if needed, and mark it ready.</p>
        {analysis.issues.length === 0 && <p className="mt-4 text-sm">Nothing to fix for this case.</p>}
        <ul className="mt-4 space-y-3">
          {analysis.issues.map((issue) => {
            const drafted = active.draftedIssueIds.includes(issue.id);
            const done = isAddressed(issue, active, analysis.signerIds);
            return (
              <li key={issue.id} className="sheet p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{FIX_LABEL[issue.fix]}</p>
                    <p className="text-xs text-muted-foreground">{issue.title} · to {FIX_OFFICE[issue.fix]}</p>
                  </div>
                  {done ? (
                    <Badge variant="success">Ready to file</Badge>
                  ) : drafted && issue.needsConsent ? (
                    <Badge variant="medium">Needs all heirs' consent</Badge>
                  ) : (
                    <Badge variant="outline">To do</Badge>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="paper" onClick={() => setOpen({ issue, text: draftFix(issue, active) })}>
                    <FileSignature /> {drafted ? "View draft" : "Draft application"}
                  </Button>
                  {drafted && (
                    <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "toggleDrafted", issueId: issue.id, drafted: false })}>
                      Undo
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <div className="flex items-end justify-between gap-2">
          <div>
            <h3 className="text-xl font-semibold">Family consent</h3>
            <p className="mt-1 text-sm text-muted-foreground">Every living heir agrees from their own phone.</p>
          </div>
          <Button
            size="sm"
            variant="accent"
            onClick={() => {
              analysis.signers.forEach((p) => status(p.id) === "not_sent" && dispatch({ type: "setConsent", personId: p.id, status: "sent" }));
              toast.success("Consent requests sent (simulated)");
            }}
          >
            <Send /> Ask all
          </Button>
        </div>
        <ul className="mt-4 space-y-2">
          {analysis.signers.map((p) => (
            <li key={p.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{p.phone ?? "no phone"}</p>
                </div>
                <Badge variant={STATUS_VARIANT[status(p.id)]}>{STATUS_LABEL[status(p.id)]}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {status(p.id) === "not_sent" ? (
                  <Button size="sm" variant="paper" onClick={() => send(p.id)}>
                    <MessageCircle /> Send WhatsApp request
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="ghost" onClick={() => setPreview(preview === p.id ? null : p.id)}>
                      {preview === p.id ? "Hide message" : "See message"}
                    </Button>
                    {status(p.id) !== "agreed" && (
                      <Button size="sm" variant="paper" onClick={() => dispatch({ type: "setConsent", personId: p.id, status: "agreed" })}>
                        <Check /> Simulate “AGREE”
                      </Button>
                    )}
                    {status(p.id) !== "declined" && (
                      <Button size="sm" variant="ghost" onClick={() => dispatch({ type: "setConsent", personId: p.id, status: "declined" })}>
                        <X /> Simulate “DISAGREE”
                      </Button>
                    )}
                  </>
                )}
              </div>
              {preview === p.id && (
                <div className="mt-3 rounded-lg bg-success/10 p-3 text-sm">
                  <p className="eyebrow mb-1 !text-success">WhatsApp preview · simulated</p>
                  <p>{consentMessage(p.name, active)}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
        {analysis.signers.some((p) => status(p.id) === "declined") && (
          <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Someone disagreed. Talk it through as a family, or with the Gram Panchayat, before filing.
          </p>
        )}
      </section>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{open ? FIX_LABEL[open.issue.fix] : ""}</DialogTitle>
          </DialogHeader>
          {open && (
            <Textarea
              value={open.text}
              onChange={(e) => setOpen({ ...open, text: e.target.value })}
              className="min-h-[360px] font-mono text-xs leading-relaxed"
            />
          )}
          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  if (!open) return;
                  void navigator.clipboard.writeText(open.text);
                  toast.success("Copied");
                }}
              >
                <Copy /> Copy
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  if (!open) return;
                  const blob = new Blob([open.text], { type: "text/plain" });
                  const a = document.createElement("a");
                  a.href = URL.createObjectURL(blob);
                  a.download = `${open.issue.fix}-application.txt`;
                  a.click();
                  URL.revokeObjectURL(a.href);
                }}
              >
                <Download /> Download
              </Button>
            </div>
            <Button
              onClick={() => {
                if (!open) return;
                dispatch({ type: "toggleDrafted", issueId: open.issue.id, drafted: true });
                setOpen(null);
                toast.success("Marked as ready", {
                  description: open.issue.needsConsent ? "Now get every heir's consent." : undefined,
                });
              }}
            >
              <Check /> Mark draft as ready
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
