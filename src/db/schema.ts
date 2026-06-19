/**
 * Arrakis data model (PRD section 6).
 *
 * Conventions:
 * - All access is server-side via Drizzle using the privileged Postgres
 *   connection. RLS is enabled default-deny on every table (see the migration)
 *   so Supabase's auto-generated PostgREST/anon API exposes nothing; the only
 *   read/write path is application server code that enforces authz.
 * - `profiles` is 1:1 with Supabase `auth.users` (linked by a FK + trigger added
 *   in the migration). `is_admin` / `is_paid` are plain booleans checked in code.
 *
 * PRIVACY HARD LINES (do not violate without an explicit new product decision):
 * - `tracker_entries.sent_email_body` is WRITE-ONLY at MVP. It is stored for the
 *   owning user's benefit only. No admin view, export, or aggregate query may
 *   ever read it. The moat dashboard reads ONLY stage_ids, custom stage labels,
 *   and counts — never any user's written content.
 * - There is deliberately NO reply field anywhere in this schema.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Drives the paywall: `scraped` is always free; `verified` is gated by paid status. */
export const contactOrigin = pgEnum("contact_origin", ["scraped", "verified"]);

/** Resume input formats the user can supply. */
export const resumeFormat = pgEnum("resume_format", ["pdf", "latex", "text"]);

/** Stripe one-time payment lifecycle. */
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "paid",
  "failed",
  "refunded",
]);

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

// ---------------------------------------------------------------------------
// profiles — 1:1 with auth.users
// ---------------------------------------------------------------------------

export const profiles = pgTable("profiles", {
  // No default: equals auth.users.id, populated by the on-signup trigger.
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  // Drives the "new since your last visit" startup view.
  lastActiveAt: timestamp("last_active_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// startups — shared master list
// ---------------------------------------------------------------------------

export const startups = pgTable(
  "startups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    oneLiner: text("one_liner"),
    description: text("description"),
    website: text("website"),
    batch: text("batch"),
    status: text("status"),
    foundedDate: date("founded_date"),
    industry: text("industry"),
    subindustry: text("subindustry"),
    tags: jsonb("tags")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    regions: jsonb("regions")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    teamSize: integer("team_size"),
    // Logo + growth signals surfaced from the source for the list/tiles/filters.
    logoUrl: text("logo_url"),
    stage: text("stage"),
    location: text("location"),
    // Founder NAMES come from yc-oss (no emails); reachable emails live in `contacts`.
    founderNames: jsonb("founder_names")
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'::jsonb`),
    // Designed to support more sources later; `yc-oss` for MVP.
    source: text("source").notNull().default("yc-oss"),
    // Stable id from the source (e.g. yc-oss company id), for nightly dedupe.
    externalId: text("external_id"),
    // Raw source payload, retained to diff future refreshes against.
    sourceData: jsonb("source_data"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("startups_source_external_id_key").on(t.source, t.externalId),
    index("startups_industry_idx").on(t.industry),
    index("startups_batch_idx").on(t.batch),
    index("startups_stage_idx").on(t.stage),
    index("startups_team_size_idx").on(t.teamSize),
    index("startups_first_seen_at_idx").on(t.firstSeenAt),
  ],
);

// ---------------------------------------------------------------------------
// outreach_profiles — one per user; inputs for the cold-email prompt wrapper.
// Pre-MVP: the assembled prompt is copied to the clipboard and run in Claude.
// ---------------------------------------------------------------------------

export const outreachProfiles = pgTable("outreach_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  resumeText: text("resume_text"),
  // "text" | "latex" — how to label the resume block in the prompt.
  resumeFormat: text("resume_format").notNull().default("text"),
  // Path in the Supabase Storage `resumes` bucket (for the user's own reference).
  resumePdfPath: text("resume_pdf_path"),
  // About / accomplishments / anything else worth personalizing with.
  personalization: text("personalization"),
  linkedinUrl: text("linkedin_url"),
  portfolioUrl: text("portfolio_url"),
  // Example emails that have worked, used as few-shot in the prompt.
  templates: text("templates"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------------------
// contacts — founder/cofounder contacts on a startup
// ---------------------------------------------------------------------------

export const contacts = pgTable(
  "contacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    name: text("name"),
    email: text("email").notNull(),
    roleTitle: text("role_title"),
    origin: contactOrigin("origin").notNull().default("verified"),
    // A small fixed set stays visible to free users as a teaser.
    isTeaser: boolean("is_teaser").notNull().default(false),
    addedByUserId: uuid("added_by_user_id").references(() => profiles.id, {
      onDelete: "set null",
    }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("contacts_startup_id_idx").on(t.startupId),
    index("contacts_origin_idx").on(t.origin),
  ],
);

// ---------------------------------------------------------------------------
// resumes — versioned, one active per user
// ---------------------------------------------------------------------------

export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull().default(1),
    isActive: boolean("is_active").notNull().default(true),
    format: resumeFormat("format").notNull(),
    // For `pdf`: path in the Supabase Storage `resumes` bucket.
    filePath: text("file_path"),
    // For `latex` / `text`: the pasted source.
    sourceText: text("source_text"),
    parsedSummary: text("parsed_summary"),
    createdAt: createdAt(),
  },
  (t) => [index("resumes_user_id_idx").on(t.userId)],
  // A partial unique index enforcing one active resume per user is added in the
  // migration (Drizzle cannot express partial unique indexes in the schema).
);

// ---------------------------------------------------------------------------
// role_profiles — outreach tracks, one active at a time per user
// ---------------------------------------------------------------------------

export const roleProfiles = pgTable(
  "role_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    toneNotes: text("tone_notes"),
    baseEmailBody: text("base_email_body"),
    // Reserved for preferences learned from the user's line edits (logic is post-scaffold).
    stylePreferences: jsonb("style_preferences")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    isActive: boolean("is_active").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("role_profiles_user_id_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// tracker_stages — default stages (user_id NULL) + per-user custom stages
// ---------------------------------------------------------------------------

export const trackerStages = pgTable(
  "tracker_stages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // NULL => a built-in default stage shared by everyone.
    userId: uuid("user_id").references(() => profiles.id, {
      onDelete: "cascade",
    }),
    label: text("label").notNull(),
    isDefault: boolean("is_default").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("tracker_stages_user_label_key").on(t.userId, t.label)],
);

// ---------------------------------------------------------------------------
// tracker_entries — one private row per (user, startup)
// ---------------------------------------------------------------------------

export const trackerEntries = pgTable(
  "tracker_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    startupId: uuid("startup_id")
      .notNull()
      .references(() => startups.id, { onDelete: "cascade" }),
    notes: text("notes"),
    // WRITE-ONLY at MVP. Stored for the owner only. Never read by admin tooling,
    // exports, or the moat dashboard. See the privacy note at the top of this file.
    sentEmailBody: text("sent_email_body"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex("tracker_entries_user_startup_key").on(t.userId, t.startupId),
    index("tracker_entries_user_id_idx").on(t.userId),
    index("tracker_entries_startup_id_idx").on(t.startupId),
  ],
);

// ---------------------------------------------------------------------------
// tracker_entry_stages — the checked-stage set for a tracker entry (m:n)
// ---------------------------------------------------------------------------

export const trackerEntryStages = pgTable(
  "tracker_entry_stages",
  {
    trackerEntryId: uuid("tracker_entry_id")
      .notNull()
      .references(() => trackerEntries.id, { onDelete: "cascade" }),
    stageId: uuid("stage_id")
      .notNull()
      .references(() => trackerStages.id, { onDelete: "cascade" }),
    checkedAt: timestamp("checked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.trackerEntryId, t.stageId] })],
);

// ---------------------------------------------------------------------------
// payments — Stripe one-time unlock records (webhook-driven, idempotent)
// ---------------------------------------------------------------------------

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    stripeCheckoutSessionId: text("stripe_checkout_session_id").unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    amount: integer("amount"), // in the smallest currency unit (e.g. cents)
    currency: text("currency").notNull().default("usd"),
    status: paymentStatus("status").notNull().default("pending"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("payments_user_id_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const profilesRelations = relations(profiles, ({ many }) => ({
  resumes: many(resumes),
  roleProfiles: many(roleProfiles),
  trackerEntries: many(trackerEntries),
  trackerStages: many(trackerStages),
  payments: many(payments),
}));

export const startupsRelations = relations(startups, ({ many }) => ({
  contacts: many(contacts),
  trackerEntries: many(trackerEntries),
}));

export const contactsRelations = relations(contacts, ({ one }) => ({
  startup: one(startups, {
    fields: [contacts.startupId],
    references: [startups.id],
  }),
}));

export const trackerEntriesRelations = relations(
  trackerEntries,
  ({ one, many }) => ({
    user: one(profiles, {
      fields: [trackerEntries.userId],
      references: [profiles.id],
    }),
    startup: one(startups, {
      fields: [trackerEntries.startupId],
      references: [startups.id],
    }),
    stages: many(trackerEntryStages),
  }),
);

export const trackerEntryStagesRelations = relations(
  trackerEntryStages,
  ({ one }) => ({
    entry: one(trackerEntries, {
      fields: [trackerEntryStages.trackerEntryId],
      references: [trackerEntries.id],
    }),
    stage: one(trackerStages, {
      fields: [trackerEntryStages.stageId],
      references: [trackerStages.id],
    }),
  }),
);

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type Profile = typeof profiles.$inferSelect;
export type Startup = typeof startups.$inferSelect;
export type NewStartup = typeof startups.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type RoleProfile = typeof roleProfiles.$inferSelect;
export type TrackerStage = typeof trackerStages.$inferSelect;
export type TrackerEntry = typeof trackerEntries.$inferSelect;
export type Payment = typeof payments.$inferSelect;
