/**
 * The Arrakis mark — a sun cresting a dune. Inline SVG so it inherits the
 * surrounding text color via `currentColor` (works in both themes). The same
 * artwork lives at /public/arrakis.svg for favicon / external use.
 */
export function ArrakisLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 899 586"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="452.996" cy="449.781" r="135.5" />
      <path d="M62.5262 220.628C188.691 7.14649 464.029 -63.6368 677.511 62.5283C861.17 171.069 939.213 390.016 877.1 585H675.385C675.706 584.464 676.027 583.927 676.345 583.389C750.527 457.867 708.908 295.976 583.387 221.794C457.865 147.612 295.974 189.231 221.792 314.752C170.769 401.087 174.53 504.627 222.694 585H21.1385C-16.1551 467.459 -5.15207 335.145 62.5262 220.628Z" />
    </svg>
  );
}
