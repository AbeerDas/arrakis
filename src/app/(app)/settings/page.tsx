import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <p className="mt-2 text-muted-foreground">
        Resume (PDF upload or pasted LaTeX), role profiles, custom tracker
        stages, and billing will live here.
      </p>
    </div>
  );
}
