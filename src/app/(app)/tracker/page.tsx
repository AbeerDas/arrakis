import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tracker" };

export default function TrackerPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Tracker</h1>
      <p className="mt-2 text-muted-foreground">
        Your private, spreadsheet-style pipeline — one row per startup, with
        notes, the email you sent, and default + custom stage checkboxes. Visible
        only to you.
      </p>
    </div>
  );
}
