"use client";

import { useEffect, useState } from "react";

/**
 * Reveals text letter by letter (blur + rise + fade), staggered on the dune
 * easing. Splits on spaces so words still wrap. Snaps in instantly under
 * reduced-motion. The full string is exposed via aria-label; the per-letter
 * spans are aria-hidden.
 */
export function LetterReveal({
  text,
  className,
  stepMs = 26,
  startDelayMs = 120,
}: {
  text: string;
  className?: string;
  stepMs?: number;
  startDelayMs?: number;
}) {
  const [on, setOn] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const reduceNow = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const id = requestAnimationFrame(() => {
      setReduce(reduceNow);
      setOn(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const words = text.split(" ");
  let i = 0;

  return (
    <span className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi}>
          <span className="inline-block whitespace-nowrap">
            {[...word].map((ch) => {
              const delay = startDelayMs + i++ * stepMs;
              const shown = on || reduce;
              return (
                <span
                  key={delay}
                  aria-hidden
                  className="inline-block"
                  style={
                    reduce
                      ? undefined
                      : {
                          opacity: shown ? 1 : 0,
                          transform: shown ? "none" : "translateY(0.32em)",
                          filter: shown ? "blur(0)" : "blur(8px)",
                          transition:
                            "opacity 0.6s var(--ease-dune), transform 0.6s var(--ease-dune), filter 0.6s var(--ease-dune)",
                          transitionDelay: `${delay}ms`,
                        }
                  }
                >
                  {ch}
                </span>
              );
            })}
          </span>
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}
