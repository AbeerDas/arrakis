import type { Metadata } from "next";

export const metadata: Metadata = { title: "Startups" };

export default function StartupsPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Startups</h1>
      <p className="mt-2 text-muted-foreground">
        The sortable, filterable master list will render here, backed by the
        <code className="mx-1">startups</code> and
        <code className="mx-1">contacts</code> tables and the nightly yc-oss
        refresh.
      </p>
    </div>
  );
}
