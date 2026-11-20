import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "How Cadastra works — architecture, agents & team" },
      {
        name: "description",
        content: "The agents behind Cadastra, the tech stack, our business model and the Apexbuilders team.",
      },
      { property: "og:title", content: "How Cadastra works — architecture, agents & team" },
      { property: "og:description", content: "Agents, tech stack, business model and team behind Cadastra." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

const flow = ["Farmer input (photo / voice)", "OCR + speech", "Agents", "Case file (PDF)"];

const agents = [
  { name: "Document Verification", text: "Checks every required paper is there and readable." },
  { name: "Succession & Lineage", text: "Applies inheritance rules to find rightful heirs and their shares." },
  { name: "Discrepancy Detection", text: "Matches names, survey numbers and area across papers." },
  { name: "Case File Builder", text: "Assembles the bank-ready dossier with sources for every fact." },
];

const stack: { area: string; now: string; next: string }[] = [
  { area: "OCR & vision", now: "Vision model through AI gateway", next: "Indic Tesseract, Google Vision" },
  { area: "Agents", now: "Rule engine in TypeScript (tested)", next: "LangGraph + Python FastAPI, pgvector" },
  { area: "Voice & language", now: "Simple English, read-aloud", next: "Bhashini, Whisper for Kannada voice" },
  { area: "Consent", now: "Simulated WhatsApp flow", next: "WhatsApp Business API" },
  { area: "Land & GIS", now: "Sample RTC records", next: "Bhoomi, ULPIN, GeoJSON maps" },
  { area: "App", now: "React + TanStack Start, jsPDF", next: "WeasyPrint for PDFs" },
];

const team = [
  { name: "Krishna Pant", role: "AI & ML Lead" },
  { name: "Shashwat Shandilya", role: "Full Stack Developer" },
  { name: "Dhanvi P", role: "Backend Lead" },
  { name: "Aryan Singh", role: "Frontend Lead" },
];

function About() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <p className="eyebrow">System architecture</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-semibold sm:text-5xl">Four small agents, one clear case file.</h1>

      <div className="mt-10 flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {flow.map((f, i) => (
          <div key={f} className="flex flex-1 items-center gap-2">
            <div className="sheet flex-1 px-4 py-5 text-center font-medium">{f}</div>
            {i < flow.length - 1 && <ArrowRight className="hidden h-5 w-5 shrink-0 text-accent md:block" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map((a) => (
          <div key={a.name} className="rounded-lg border border-border p-5">
            <p className="font-display text-lg font-semibold">{a.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{a.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-md bg-accent/10 px-4 py-3 text-sm">
        <strong>Guardrail:</strong> every finding links to the document it came from, and a human approves
        before anything is filed.
      </p>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold">Tech stack</h2>
        <p className="mt-2 text-sm text-muted-foreground">What runs in this prototype today, and what we plan for the pilot.</p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="py-2 pr-4 font-medium">Area</th>
                <th className="py-2 pr-4 font-medium">In this prototype</th>
                <th className="py-2 font-medium">Planned</th>
              </tr>
            </thead>
            <tbody>
              {stack.map((s) => (
                <tr key={s.area} className="border-b border-border/70">
                  <td className="py-3 pr-4 font-medium">{s.area}</td>
                  <td className="py-3 pr-4">{s.now}</td>
                  <td className="py-3 text-muted-foreground">{s.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="sheet p-6">
          <h2 className="text-2xl font-semibold">Business model</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• Small fee per case file through CSC kiosks</li>
            <li>• Banks and cooperatives pay per verified file</li>
            <li>• Partnerships with state revenue departments</li>
            <li>• Scale state by state, linked to SVAMITVA / ULPIN</li>
          </ul>
        </div>
        <div className="sheet p-6">
          <h2 className="text-2xl font-semibold">Feasibility &amp; disclosures</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>• All tools and data sources exist today; pilot through WhatsApp + CSC kiosks in one state.</li>
            <li>• Demo uses sample land records, not live government portals.</li>
            <li>• WhatsApp consent is simulated.</li>
            <li>• Designed for the DPDP Act 2023: encryption, Aadhaar masking, data stays on device in the demo.</li>
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-3xl font-semibold">Team Apexbuilders</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <div key={m.name} className="rounded-lg border border-border p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-lg text-primary-foreground">
                {m.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </div>
              <p className="mt-3 font-semibold">{m.name}</p>
              <p className="text-sm text-muted-foreground">{m.role}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg">
            <Link to="/case">Try the demo</Link>
          </Button>
          <a href="mailto:krishnapant1905@gmail.com" className="text-sm text-muted-foreground hover:underline">
            krishnapant1905@gmail.com
          </a>
        </div>
      </section>
    </div>
  );
}
