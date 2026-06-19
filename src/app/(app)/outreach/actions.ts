"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { outreachProfiles } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { buildPromptForCompany } from "@/lib/outreach";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type SaveState = { ok: boolean; message?: string };

const RESUME_BUCKET = "resumes";

export async function saveOutreachProfile(
  _prev: SaveState,
  formData: FormData,
): Promise<SaveState> {
  const user = await requireUser();
  const db = getDb();

  const str = (k: string) => {
    const v = formData.get(k);
    return typeof v === "string" && v.trim() ? v.trim() : null;
  };

  // Optional PDF upload (stored for the user's own attachment reference).
  let resumePdfPath: string | null | undefined = undefined;
  const file = formData.get("resume_pdf");
  if (file instanceof File && file.size > 0) {
    if (file.type !== "application/pdf") {
      return { ok: false, message: "Resume file must be a PDF." };
    }
    if (file.size > 8_000_000) {
      return { ok: false, message: "PDF must be under 8MB." };
    }
    const admin = getSupabaseAdmin();
    // Idempotent bucket creation (private).
    await admin.storage.createBucket(RESUME_BUCKET, { public: false });
    const path = `${user.id}/resume.pdf`;
    const { error } = await admin.storage
      .from(RESUME_BUCKET)
      .upload(path, file, { upsert: true, contentType: "application/pdf" });
    if (error) return { ok: false, message: `Upload failed: ${error.message}` };
    resumePdfPath = path;
  }

  const values = {
    userId: user.id,
    resumeText: str("resume_text"),
    resumeFormat: str("resume_format") ?? "text",
    personalization: str("personalization"),
    linkedinUrl: str("linkedin_url"),
    portfolioUrl: str("portfolio_url"),
    templates: str("templates"),
    ...(resumePdfPath !== undefined ? { resumePdfPath } : {}),
    updatedAt: new Date(),
  };

  await db
    .insert(outreachProfiles)
    .values(values)
    .onConflictDoUpdate({
      target: outreachProfiles.userId,
      set: {
        resumeText: values.resumeText,
        resumeFormat: values.resumeFormat,
        personalization: values.personalization,
        linkedinUrl: values.linkedinUrl,
        portfolioUrl: values.portfolioUrl,
        templates: values.templates,
        ...(resumePdfPath !== undefined ? { resumePdfPath } : {}),
        updatedAt: new Date(),
      },
    });

  revalidatePath("/outreach");
  return { ok: true, message: "Saved." };
}

export type PromptResult =
  | { ok: true; prompt: string }
  | { ok: false; reason: "needs-profile" | "not-found" };

/** Called from the per-company modal: assemble the prompt to copy into Claude. */
export async function generateOutreachPrompt(
  companyId: string,
  jobPosting: string,
  notes: string,
): Promise<PromptResult> {
  const user = await requireUser();
  const result = await buildPromptForCompany(
    user.id,
    companyId,
    jobPosting,
    notes,
  );
  if ("prompt" in result) return { ok: true, prompt: result.prompt };
  if ("needsProfile" in result) return { ok: false, reason: "needs-profile" };
  return { ok: false, reason: "not-found" };
}

/** Remove the saved resume PDF. */
export async function deleteResumePdf(): Promise<void> {
  const user = await requireUser();
  const admin = getSupabaseAdmin();
  await admin.storage.from(RESUME_BUCKET).remove([`${user.id}/resume.pdf`]);
  const db = getDb();
  await db
    .update(outreachProfiles)
    .set({ resumePdfPath: null, updatedAt: new Date() })
    .where(eq(outreachProfiles.userId, user.id));
  revalidatePath("/outreach");
}
