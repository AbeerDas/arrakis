"use client";

import { useActionState } from "react";
import type { OutreachProfile } from "@/lib/outreach";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteResumePdf,
  saveOutreachProfile,
  type SaveState,
} from "../actions";

const textareaClass =
  "border-input bg-background focus-visible:ring-ring w-full rounded-lg border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none";

const initial: SaveState = { ok: false };

export function OutreachForm({
  profile,
  hasPdf,
  defaultTemplates,
}: {
  profile: OutreachProfile | null;
  hasPdf: boolean;
  defaultTemplates: string;
}) {
  const [state, action, pending] = useActionState(saveOutreachProfile, initial);

  return (
    <form action={action} className="space-y-7">
      <div className="space-y-2">
        <Label htmlFor="resume_format">Resume format</Label>
        <select
          id="resume_format"
          name="resume_format"
          defaultValue={profile?.resumeFormat ?? "text"}
          className="border-input bg-background h-10 rounded-lg border px-3 text-sm"
        >
          <option value="text">Plain text</option>
          <option value="latex">LaTeX</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume_text">Resume (paste text or LaTeX)</Label>
        <textarea
          id="resume_text"
          name="resume_text"
          rows={10}
          defaultValue={profile?.resumeText ?? ""}
          placeholder="Paste your resume here. This is what the prompt uses."
          className={textareaClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume_pdf">
          Resume PDF (optional, for your records)
        </Label>
        <input
          id="resume_pdf"
          name="resume_pdf"
          type="file"
          accept="application/pdf"
          className="text-muted-foreground file:bg-secondary file:text-secondary-foreground block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-1.5 file:text-sm"
        />
        {hasPdf ? (
          <p className="text-muted-foreground flex items-center gap-3 text-xs">
            A PDF is on file.
            <button
              type="button"
              onClick={() => deleteResumePdf()}
              className="text-spice underline-offset-4 hover:underline"
            >
              Remove
            </button>
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="personalization">About you / accomplishments</Label>
        <textarea
          id="personalization"
          name="personalization"
          rows={5}
          defaultValue={profile?.personalization ?? ""}
          placeholder="Anything worth personalizing with: who you are, notable work, awards, projects."
          className={textareaClass}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            name="linkedin_url"
            type="url"
            defaultValue={profile?.linkedinUrl ?? ""}
            placeholder="https://linkedin.com/in/you"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolio_url">Portfolio URL</Label>
          <Input
            id="portfolio_url"
            name="portfolio_url"
            type="url"
            defaultValue={profile?.portfolioUrl ?? ""}
            placeholder="https://yoursite.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="templates">Emails that have worked</Label>
        <p className="text-muted-foreground text-xs">
          These guide the voice. Separate multiple examples with a line of three
          dashes.
        </p>
        <textarea
          id="templates"
          name="templates"
          rows={12}
          defaultValue={profile?.templates ?? defaultTemplates}
          className={textareaClass}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending} className="rounded-xl">
          {pending ? "Saving…" : "Save"}
        </Button>
        {state.message ? (
          <span
            className={
              state.ok ? "text-spice text-sm" : "text-destructive text-sm"
            }
          >
            {state.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
