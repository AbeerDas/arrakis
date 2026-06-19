import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { DEFAULT_TEMPLATES, getOutreachProfile } from "@/lib/outreach";
import { OutreachForm } from "./_components/outreach-form";

export const metadata: Metadata = { title: "Outreach" };

export default async function OutreachPage() {
  const user = await requireUser();
  const profile = await getOutreachProfile(user.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Outreach setup</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        Save your resume and details once. The cold-email button on any startup
        builds a tailored prompt from this, ready to paste into Claude. Nothing
        here is sent anywhere automatically.
      </p>

      <div className="mt-8">
        <OutreachForm
          profile={profile}
          hasPdf={Boolean(profile?.resumePdfPath)}
          defaultTemplates={DEFAULT_TEMPLATES}
        />
      </div>
    </div>
  );
}
