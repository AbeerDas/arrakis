import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const NEXT_UP = [
  {
    title: "New today",
    body: "A feed of startups added since your last visit, pulled from the nightly yc-oss refresh.",
  },
  {
    title: "Your active role",
    body: "The role profile your generated emails are tuned to, switchable from a dropdown.",
  },
  {
    title: "Recent outreach",
    body: "Jump back into tracker rows you have moved recently.",
  },
  {
    title: "Verified contacts",
    body: "Unlock the full verified founder list with a one-time payment.",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Scaffold is live — auth, schema, and the deploy pipeline are in place.
        Product features land here next.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {NEXT_UP.map((c) => (
          <div key={c.title} className="rounded-lg border p-5">
            <h2 className="font-medium">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
