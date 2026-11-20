import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FileCheck2, FileSearch, Languages, MessageCircle, ScanText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParcelArt } from "@/components/landing/parcel-art";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cadastra — turn unclear land records into a bank-ready file" },
      {
        name: "description",
        content:
          "An AI helper for farming families: reads RTC and mutation papers, explains who owns what, finds gaps and builds a verified case file for the bank.",
      },
      { property: "og:title", content: "Cadastra — turn unclear land records into a bank-ready file" },
      {
        property: "og:description",
        content: "Reads land papers, explains shares in simple words, flags mismatches and drafts the fix.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const reality = [
  { k: "Outdated", v: "Owner died years ago, the RTC was never changed to the heirs." },
  { k: "Informal split", v: "Brothers divided the field, paper still shows one name." },
  { k: "Mismatch", v: "Survey number or area on the RTC differs from the survey map." },
  { k: "Result", v: "Bank says no. Families go to moneylenders or sell in distress." },
];

const steps = [
  { icon: Upload, title: "Upload", text: "Photos of the papers, straight from a phone." },
  { icon: ScanText, title: "Read", text: "AI reads owner, survey no. and extent." },
  { icon: Languages, title: "Explain", text: "Who owns what, in simple words." },
  { icon: FileSearch, title: "Find gaps", text: "Mismatches and missing heirs are flagged." },
  { icon: MessageCircle, title: "Fix & consent", text: "Draft applications, heirs agree from phone." },
  { icon: FileCheck2, title: "Case file", text: "Verified PDF with a fair value range." },
];

function Home() {
  return (
    <>
      <section className="survey-grid border-b border-border">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="animate-rise">
            <span className="stamp text-accent">Tech4Bharat · Team Apexbuilders</span>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Land papers your bank will <em className="text-primary">actually</em> accept.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Cadastra reads a family's RTC, mutation and survey papers, explains who owns what, finds every
              gap and builds a verified case file — before anyone visits the taluk office.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="xl">
                <Link to="/case">
                  Try with a sample case <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="xl" variant="paper">
                <Link to="/about">How it works</Link>
              </Button>
            </div>
          </div>
          <div className="sheet relative p-4 md:rotate-1">
            <ParcelArt />
            <p className="px-2 pb-1 font-mono text-xs text-muted-foreground">
              Sample: Hirebagewadi, Belagavi — 1 survey number, 3 problems on paper.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">The ground reality</p>
        <h2 className="mt-2 max-w-2xl text-3xl font-semibold sm:text-4xl">
          Land is the family's biggest asset. The records rarely match reality.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reality.map((r) => (
            <div key={r.k} className="sheet p-5">
              <p className="font-display text-xl font-semibold text-accent">{r.k}</p>
              <p className="mt-2 text-sm text-muted-foreground">{r.v}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
          Portals like Bhoomi only <strong className="text-foreground">display</strong> records, in formal
          language. Fixing anything can take 15–20 visits to the taluk office.
        </p>
      </section>

      <section className="border-y border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <p className="eyebrow text-ink-foreground/70">User journey</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Six steps, from a shoebox of papers to a case file.</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-lg bg-ink-foreground/15 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="bg-ink p-6">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-accent">0{i + 1}</span>
                  <s.icon className="h-5 w-5 text-ink-foreground/80" />
                </div>
                <p className="mt-4 font-display text-xl font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-ink-foreground/70">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="sheet grid gap-8 p-8 md:grid-cols-[1.4fr_1fr] md:p-12">
          <div>
            <h2 className="text-3xl font-semibold">Who it helps</h2>
            <ul className="mt-5 grid gap-3 text-muted-foreground sm:grid-cols-2">
              <li>• Families get formal loans instead of moneylenders</li>
              <li>• Heirs inherit without disputes</li>
              <li>• Fair land prices, fewer distress sales</li>
              <li>• Revenue offices get complete applications</li>
              <li>• Banks get collateral they can trust</li>
            </ul>
          </div>
          <div className="flex flex-col justify-center gap-3 md:items-end">
            <p className="text-sm text-muted-foreground md:text-right">
              Open one of three sample Karnataka cases and walk through all six steps.
            </p>
            <Button asChild size="xl" variant="accent">
              <Link to="/case">
                Open the demo <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
