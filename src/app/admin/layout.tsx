import { AppNav } from "@/app/(app)/_components/app-nav";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin-only boundary, enforced server-side.
  const profile = await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col">
      <AppNav isAdmin email={profile.email} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
