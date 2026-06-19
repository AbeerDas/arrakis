import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { outreachProfiles, startups } from "@/db/schema";

export type OutreachProfile = {
  resumeText: string | null;
  resumeFormat: string;
  resumePdfPath: string | null;
  personalization: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  templates: string | null;
};

// Pre-filled examples on first visit: real emails that have landed replies.
// They define the target voice (specific, casual, punchy, human).
export const DEFAULT_TEMPLATES = `Hey Henry,

I applied through WaterlooWorks and wanted to reach out. I'm at a university of 40,000 people, and somehow the hardest thing is still finding people worth knowing. Cool to see what you did with Date Drop at Stanford, excited to see how I can extend that system further.

I also noticed you worked on the early LangChain product. I've spent the last few terms deep in that space, building AI agent systems at Spellbook (Khosla Ventures, recognized as Canada's fastest-growing startup in 2026), shipping nearly every new feature on the Associate platform during my term, and earning a return offer.

Portfolio writing on my recent coop work: www.abeerkdas.me/spellbook
Resume attached.

Cheers,
Abeer

---

Hey Daniel, Heinrich, and Nick!

I applied through WaterlooWorks and wanted to reach out. I did google EDI. It is genuinely wild that the physical economy still runs on that. The fact that every integration still gets built by hand every time by someone is exactly the kind of problem that makes agents interesting to work on when they're doing real work with real consequences rather than just answering questions.

I've spent the past year building agent systems in production at Spellbook (Khosla Ventures, recognized as Canada's fastest-growing startup in 2026) and BorderPass (Globe and Mail Top 30 Fastest Growing), earning return offers at both and shipping nearly every major feature on my own. Outside of work I co-built Sibyl, an 8-agent LangGraph pipeline that won 1st place at Hack for Humanity among 750+ participants, where the hard part was exactly what your self-healing angle gets at. This includes agents coordinating reliably in production, catching failures, and routing them correctly rather than silently getting things wrong.

Work at Spellbook in my portfolio: www.abeerkdas.me/spellbook
Resume attached.

Cheers,
Abeer`;

export async function getOutreachProfile(
  userId: string,
): Promise<OutreachProfile | null> {
  const db = getDb();
  const rows = await db
    .select({
      resumeText: outreachProfiles.resumeText,
      resumeFormat: outreachProfiles.resumeFormat,
      resumePdfPath: outreachProfiles.resumePdfPath,
      personalization: outreachProfiles.personalization,
      linkedinUrl: outreachProfiles.linkedinUrl,
      portfolioUrl: outreachProfiles.portfolioUrl,
      templates: outreachProfiles.templates,
    })
    .from(outreachProfiles)
    .where(eq(outreachProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

type CompanyContext = {
  name: string;
  oneLiner: string | null;
  description: string | null;
  website: string | null;
  batch: string | null;
  founderNames: string[];
  ycUrl: string | null;
};

const STYLE_RULES = `STYLE (follow these exactly):
- Before writing, research the company. Use the website URL, YC profile link, and founder names provided to find concrete, specific, non-obvious details: a recent launch, a technical blog post, a funding milestone, something a founder wrote or said publicly, an unusual approach. One genuinely specific detail is worth more than ten generic observations.
- Sound like a real person wrote it. Casual, warm, conversational. Never like an AI.
- Concise and punchy. Short, minimal sentences. Cut every filler word.
- Read it back as a natural, flowing conversation turned into a short email.
- Never use em dashes. Use a period or comma instead.
- Open with one specific, genuine line about THIS company or founder built on something you actually found. No generic flattery ("love what you're building" does not count).
- Then weave in one to three of my most relevant accomplishments, naturally, with the links inline where they fit (portfolio, notable companies, awards, the hackathon project).
- Close with my portfolio link and "Resume attached." on its own line, then sign off "Cheers," and my first name.
- Keep the subject line short and human.`;

function section(title: string, body: string | null | undefined): string {
  const v = body?.trim();
  return v ? `== ${title} ==\n${v}\n\n` : "";
}

export function buildOutreachPrompt(
  profile: OutreachProfile,
  company: CompanyContext,
  jobPosting?: string,
  notes?: string,
): string {
  const companyBlock = [
    `Name: ${company.name}`,
    company.oneLiner ? `One-liner: ${company.oneLiner}` : "",
    company.batch ? `YC batch: ${company.batch}` : "",
    company.founderNames.length
      ? `Founders: ${company.founderNames.join(", ")}`
      : "",
    company.website ? `Website: ${company.website}` : "",
    company.ycUrl ? `YC profile: ${company.ycUrl}` : "",
    company.description ? `About: ${company.description}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const aboutMe = [
    profile.personalization?.trim() ?? "",
    profile.linkedinUrl ? `LinkedIn: ${profile.linkedinUrl}` : "",
    profile.portfolioUrl ? `Portfolio: ${profile.portfolioUrl}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    `Write one cold outreach email I can send to the startup below, ready to paste and send.\n\n` +
    `${STYLE_RULES}\n\n` +
    `OUTPUT, in this order:\n` +
    `1. The subject line.\n` +
    `2. The email body, ready to paste and send.\n` +
    `3. A section titled "Other hooks you could swap in" — a short bulleted list of other genuinely specific, interesting things you found about the company or founders in your research that you did NOT use in the email above, but that I could drop in instead to personalize it. One concrete line each, no filler. If you honestly found nothing else worth using, write "Nothing else stood out."\n\n` +
    section("COMPANY", companyBlock) +
    section("JOB POSTING", jobPosting) +
    section("EXTRA NOTES FOR THIS EMAIL", notes) +
    section("ABOUT ME", aboutMe) +
    section(`MY RESUME (${profile.resumeFormat})`, profile.resumeText) +
    section(
      "EMAILS THAT HAVE WORKED (match this voice and structure)",
      profile.templates,
    )
  ).trim();
}

/**
 * Load the user's profile + a company, returning the assembled prompt. Returns
 * `{ needsProfile: true }` when there's no resume saved yet.
 */
export async function buildPromptForCompany(
  userId: string,
  companyId: string,
  jobPosting?: string,
  notes?: string,
): Promise<{ prompt: string } | { needsProfile: true } | { notFound: true }> {
  const profile = await getOutreachProfile(userId);
  if (!profile?.resumeText?.trim()) return { needsProfile: true };

  const db = getDb();
  const rows = await db
    .select({
      name: startups.name,
      oneLiner: startups.oneLiner,
      description: startups.description,
      website: startups.website,
      batch: startups.batch,
      founderNames: startups.founderNames,
      ycUrl: startups.sourceData,
    })
    .from(startups)
    .where(eq(startups.id, companyId))
    .limit(1);
  const row = rows[0];
  if (!row) return { notFound: true };

  const ycUrl =
    row.ycUrl && typeof row.ycUrl === "object" && "url" in row.ycUrl
      ? String((row.ycUrl as { url?: unknown }).url ?? "")
      : null;

  return {
    prompt: buildOutreachPrompt(
      profile,
      {
        name: row.name,
        oneLiner: row.oneLiner,
        description: row.description,
        website: row.website,
        batch: row.batch,
        founderNames: row.founderNames,
        ycUrl: ycUrl || null,
      },
      jobPosting,
      notes,
    ),
  };
}
