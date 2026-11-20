// Case File Builder Agent: puts everything into one PDF for the bank.
import type { Issue } from "./discrepancies";
import { isAddressed } from "./discrepancies";
import { FIX_LABEL } from "./drafts";
import { toString as fracStr } from "./fraction";
import type { HeirShare } from "./succession";
import { formatAcreGunta } from "./units";
import type { ValueEstimate } from "./valuation";
import { DOC_KIND_LABEL, type LandCase } from "./types";

// built-in PDF fonts can't draw ₹ or curly quotes
const clean = (s: string) =>
  s.replace(/₹/g, "Rs. ").replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/[—–]/g, "-").replace(/•/g, "-").replace(/≠/g, "!=");
const rs = (n: number) => "Rs. " + Math.round(n).toLocaleString("en-IN");

export async function downloadCaseFile(opts: {
  c: LandCase;
  issues: Issue[];
  heirs: HeirShare[];
  signerIds: string[];
  score: number;
  label: string;
  value: ValueEstimate | null;
}) {
  const { jsPDF } = await import("jspdf");
  const { c, issues, heirs, signerIds, score, label, value } = opts;
  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;
  const line = (text: string, size = 10, bold = false) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    for (const part of pdf.splitTextToSize(clean(text), 180) as string[]) {
      if (y > 280) {
        pdf.addPage();
        y = 18;
      }
      pdf.text(part, 15, y);
      y += size * 0.5;
    }
    y += 1.5;
  };
  const heading = (t: string) => {
    y += 3;
    line(t, 13, true);
  };

  const rtc = c.documents.find((d) => d.kind === "rtc");
  line("CADASTRA - LAND CASE FILE", 16, true);
  line(`${c.title} | Generated ${new Date().toLocaleDateString("en-IN")}`, 9);
  line(`Readiness: ${score}/100 (${label})`, 11, true);

  heading("1. Land parcel");
  line(`Survey No. ${rtc?.fields.surveyNo ?? "-"}, ${c.village} village, ${c.hobli} hobli, ${c.taluk} taluk, ${c.district} district, Karnataka`);
  line(`Recorded owner (RTC): ${rtc?.fields.ownerName ?? "-"} | Extent: ${rtc?.fields.extentGuntas ? formatAcreGunta(rtc.fields.extentGuntas) : "-"} | Khata: ${rtc?.fields.khataNo ?? "-"}`);

  heading("2. Legal heirs and shares");
  if (heirs.length === 0) line("Owner is alive - no succession required.");
  for (const h of heirs) line(`- ${h.name} (${h.relation}${h.via ? `, via late ${h.via}` : ""}): ${fracStr(h.share)} | consent: ${c.consents[h.personId] ?? "not asked"}`);

  heading("3. Findings");
  if (issues.length === 0) line("No discrepancies found across documents.");
  for (const i of issues) {
    const status = isAddressed(i, c, signerIds) ? "fix prepared" : "open";
    line(`- [${i.severity.toUpperCase()}] ${i.title} (${status})`, 10, true);
    line(`  ${i.detail}`);
    line(`  Fix: ${FIX_LABEL[i.fix]} | Sources: ${i.docIds.map((id) => c.documents.find((d) => d.id === id)?.title ?? id).join(", ") || "-"}`, 9);
  }

  heading("4. Fair value range (indicative)");
  if (value) {
    line(`Guidance value: ${rs(value.guidanceTotal)} for ${value.acres.toFixed(2)} acres`);
    line(`Fair market range: ${rs(value.low)} - ${rs(value.high)}`);
    line(`Indicative loan at 60% LTV: ${value.indicativeLoan ? rs(value.indicativeLoan) : "not advised while dispute pending"}`);
  } else line("RTC extent missing - cannot estimate.");

  heading("5. Source documents");
  for (const d of c.documents) line(`- ${DOC_KIND_LABEL[d.kind]}: ${d.title} (${d.issuedBy || "-"}) ${d.source === "sample" ? "[sample record]" : d.confidence !== undefined ? `[AI read ${Math.round(d.confidence * 100)}%]` : "[entered by hand]"}`);

  y += 4;
  line("Disclaimer: Prototype output using sample records. Shares follow the Hindu Succession Act, 1956 (amended 2005) and must be confirmed by a revenue officer. Consent shown here is simulated.", 8);
  pdf.save(`cadastra-${(rtc?.fields.surveyNo ?? c.id).replace(/\//g, "-")}.pdf`);
}
