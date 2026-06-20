import { cn } from "@/lib/utils";

/**
 * Minimal hover/focus tooltip. Wraps a single interactive child and shows a
 * label bubble above it. No portal/deps: the bubble is absolutely positioned
 * inside an inline-flex wrapper, so keep the child a normal inline element.
 */
export function Tooltip({
  label,
  children,
  side = "top",
  className,
}: {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  return (
    <span className={cn("group/tt relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "bg-foreground text-background pointer-events-none absolute left-1/2 z-[90] w-max max-w-[15rem] -translate-x-1/2 rounded-md px-2 py-1 text-xs font-medium whitespace-normal opacity-0 shadow-md transition-opacity duration-150 group-focus-within/tt:opacity-100 group-hover/tt:opacity-100",
          side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
        )}
      >
        {label}
      </span>
    </span>
  );
}
