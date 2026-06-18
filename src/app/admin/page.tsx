import type { Metadata } from "next";

export const metadata: Metadata = { title: "Moat dashboard" };

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Moat dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Admin-only. Aggregated, anonymized signals across all users.
      </p>

      <div className="mt-6 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          Privacy guardrails (enforced in the data layer):
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Reads only structured signals — outreach counts, stage distribution,
            and custom stage labels.
          </li>
          <li>
            Never reads any user&apos;s sent email content or notes
            (<code>sent_email_body</code> is write-only).
          </li>
          <li>Never ties a data point to an identifiable user.</li>
        </ul>
        <p className="mt-4">
          Counts and charts render here once the tracker is live.
        </p>
      </div>
    </div>
  );
}
