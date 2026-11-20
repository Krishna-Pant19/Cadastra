import type { ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function FieldRow({ label, children, mono }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="eyebrow !text-[0.65rem]">{label}</dt>
      <dd className={cn("text-sm", mono && "font-mono")}>{children ?? <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}

/** Plain native select, styled to match the inputs */
export function NativeSelect({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-md border border-input bg-paper px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}
