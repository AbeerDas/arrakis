import { requireUser } from "@/lib/auth";
import { syncProfile } from "@/lib/profile";
import { AppNav } from "./_components/app-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth boundary (proxy.ts is only an optimistic check; this is the real one).
  await requireUser();
  const profile = await syncProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav isAdmin={Boolean(profile?.isAdmin)} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
