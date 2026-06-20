import type { Metadata } from "next";
import { signOut } from "@/app/(auth)/actions";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Resume (PDF upload or pasted LaTeX), role profiles, custom tracker
          stages, and billing will live here.
        </p>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-sm font-semibold">Account</h2>
        <form action={signOut} className="mt-4">
          <button
            type="submit"
            className="text-destructive hover:text-destructive/80 text-sm"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
