import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/case", label: "Try the demo" },
  { to: "/about", label: "How it works" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-7 w-7 text-primary" />
          <span className="font-display text-xl font-semibold tracking-tight">Cadastra</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground font-medium" }}
              activeOptions={{ exact: true }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <Button asChild size="sm" variant="accent">
          <Link to="/case">Open a case</Link>
        </Button>
      </div>
    </header>
  );
}
