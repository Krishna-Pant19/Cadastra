import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-semibold">Cadastra</span>
          </div>
          <p className="mt-2 max-w-xs text-muted-foreground">
            Built by Team Apexbuilders for the Tech4Bharat hackathon.
          </p>
        </div>
        <div className="text-muted-foreground">
          <p className="eyebrow mb-2">Sandbox disclosure</p>
          <p>
            Demo uses sample land records, not live government portals. WhatsApp consent is simulated.
            Nothing you enter leaves your browser except photos sent for reading.
          </p>
        </div>
        <div className="flex flex-col gap-1 md:items-end">
          <Link to="/case" className="hover:underline">Try the demo</Link>
          <Link to="/about" className="hover:underline">Architecture &amp; team</Link>
          <a href="mailto:krishnapant1905@gmail.com" className="hover:underline">krishnapant1905@gmail.com</a>
        </div>
      </div>
    </footer>
  );
}
