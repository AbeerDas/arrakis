"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a blur + fade + rise once scrolled into view.
 * The hidden initial state is CSS-gated to `prefers-reduced-motion: no-preference`
 * (see globals.css `.reveal`), so reduced-motion and no-IO environments show
 * content immediately.
 */
export function Reveal({
  children,
  className,
  delayMs = 0,
  variant = "up",
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  /** Direction the content settles from. Defaults to a gentle rise. */
  variant?: "up" | "left" | "right" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      queueMicrotask(() => setShown(true));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal",
        variant !== "up" && `reveal-${variant}`,
        shown && "reveal--in",
        className,
      )}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  );
}
