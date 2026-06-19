import { cn } from "@/lib/utils";

// Crisp topographic "dune contour" lines that drift slowly. Pure SVG; motion is
// CSS (globals.css `.contour-a` / `.contour-b`) and disabled under
// reduced-motion. Two interleaved groups drift in opposite directions for a
// gentle flowing feel. Color derives from --spice.
const W = 1440;
const H = 760;
const COUNT = 18;
const STEP = 36;

function buildLine(baseY: number, amp: number, phase: number, freq: number) {
  const pts: string[] = [];
  for (let x = -120; x <= W + 120; x += STEP) {
    const y = baseY + Math.sin((x / W) * Math.PI * freq + phase) * amp;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M ${pts.join(" L ")}`;
}

export function DuneContours({ className }: { className?: string }) {
  const lines = Array.from({ length: COUNT }, (_, i) => {
    const baseY = (H / (COUNT + 1)) * (i + 1);
    const amp = 16 + (i % 5) * 9;
    const phase = i * 0.7;
    const freq = 3 + (i % 3);
    return {
      d: buildLine(baseY, amp, phase, freq),
      even: i % 2 === 0,
      opacity: 0.1 + (i % 6) * 0.03,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMin slice"
      className={cn("h-full w-full", className)}
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <radialGradient id="contour-fade" cx="50%" cy="18%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="1" />
          <stop offset="70%" stopColor="white" stopOpacity="0.5" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
        <mask id="contour-mask">
          <rect x="0" y="0" width={W} height={H} fill="url(#contour-fade)" />
        </mask>
      </defs>
      <g
        mask="url(#contour-mask)"
        fill="none"
        stroke="var(--spice)"
        strokeWidth={1.25}
      >
        {lines.map((l, i) => (
          <path
            key={i}
            d={l.d}
            opacity={l.opacity}
            className={l.even ? "contour-a" : "contour-b"}
          />
        ))}
      </g>
    </svg>
  );
}
