#!/usr/bin/env node
/**
 * migrateContentFields.ts
 *
 * One-off content migration for projects moving from the standalone
 * storyblok-starter-premium layout to the monorepo baseline.
 *
 * Upstream renamed a number of component fields (most visibly `href` -> `url`
 * on every nav/link component, and `target` -> `url` on buttons). Pushing the
 * new component schemas updates the *definitions* in Storyblok, but existing
 * *content* keeps the old keys — so every affected blok renders with an
 * undefined link until the stored content is migrated too.
 *
 * Usage:
 *   npm run migrate-content-fields              # dry run, writes nothing
 *   npm run migrate-content-fields -- --apply   # actually rewrite content
 *
 * Environment variables (via .env.local):
 *   NEXT_STORYBLOK_OAUTH_TOKEN — Management API OAuth token (required)
 *   NEXT_STORYBLOK_SPACE_ID    — Storyblok space ID (required)
 *
 * Stories that were published are re-published after the update; drafts stay
 * drafts. Run the dry run first and read the report.
 */

import StoryblokClient from "storyblok-js-client";

/**
 * Pure renames only: same field type, same option values, same semantics.
 * Verified by diffing the old and new generated cms/components.*.json.
 */
const RENAMES: Record<string, Record<string, string>> = {
  // href -> url
  navItems: { href: "url" },
  items: { href: "url" },
  links: { href: "url" },
  socialSharing: { href: "url" },
  // target -> url
  buttons: { target: "url" },
  "teaser-card": { target: "url" },
  tile: { button_target: "button_url" },
  feature: { cta_target: "cta_url" },
  // renamed, identical option values / type
  cta: { contentAlign: "align" },
  slider: { typeProp: "variant" },
  footer: { byline: "copyright" },
};

/**
 * Changes this script deliberately does NOT make, because they are not
 * mechanical renames. Reported so they cannot be forgotten.
 */
const MANUAL_REVIEW: Array<[string, string]> = [
  ["buttons.icon", "removed upstream with no replacement — icons on buttons will be lost"],
  ["cta.fullWidth", "closest new field is `padding`, but the boolean is likely inverted — check before mapping"],
  ["footer.navItems", "became `navGroups` ({ heading, items }); the group's own link has no home — restructure by hand"],
  ["*.type", 'internal "type for interface resolution" field, dropped upstream — no action needed'],
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Counts = Record<string, number>;

function migrateContent(node: unknown, counts: Counts): boolean {
  let changed = false;

  if (Array.isArray(node)) {
    for (const child of node) if (migrateContent(child, counts)) changed = true;
    return changed;
  }

  if (node === null || typeof node !== "object") return false;

  const obj = node as Record<string, unknown>;
  const component = typeof obj.component === "string" ? obj.component : undefined;
  const renames = component ? RENAMES[component] : undefined;

  if (renames) {
    for (const [from, to] of Object.entries(renames)) {
      // Only move it if the old key is present and the new one is not already set,
      // so re-running the migration is a no-op rather than a data-loss event.
      if (from in obj && !(to in obj && obj[to] !== null && obj[to] !== "")) {
        obj[to] = obj[from];
        delete obj[from];
        counts[`${component}.${from} -> ${to}`] = (counts[`${component}.${from} -> ${to}`] || 0) + 1;
        changed = true;
      }
    }
  }

  for (const value of Object.values(obj)) {
    if (value && typeof value === "object" && migrateContent(value, counts)) changed = true;
  }

  return changed;
}

async function main(): Promise<void> {
  const oauthToken = process.env.NEXT_STORYBLOK_OAUTH_TOKEN;
  const spaceId = process.env.NEXT_STORYBLOK_SPACE_ID;

  if (!oauthToken || !spaceId) {
    console.error("✖ missing NEXT_STORYBLOK_OAUTH_TOKEN or NEXT_STORYBLOK_SPACE_ID");
    process.exit(1);
  }

  const apply = process.argv.includes("--apply");
  console.log(apply ? "▶ APPLY — content will be rewritten\n" : "▶ DRY RUN — nothing will be written (pass --apply to commit)\n");

  const client = new StoryblokClient({ oauthToken });

  // ── Collect every story in the space ──────────────────────────
  const ids: number[] = [];
  for (let page = 1; ; page++) {
    const res = await client.get(`spaces/${spaceId}/stories`, { page, per_page: 100 });
    const batch = res.data.stories as Array<{ id: number; is_folder: boolean }>;
    ids.push(...batch.filter((s) => !s.is_folder).map((s) => s.id));
    if (batch.length < 100) break;
    await sleep(200);
  }
  console.log(`found ${ids.length} stories\n`);

  const counts: Counts = {};
  const touched: string[] = [];

  for (const id of ids) {
    const { data } = await client.get(`spaces/${spaceId}/stories/${id}`);
    const story = data.story;

    if (!migrateContent(story.content, counts)) {
      await sleep(150);
      continue;
    }
    touched.push(story.full_slug);

    if (apply) {
      const wasPublished = story.published === true;
      await client.put(`spaces/${spaceId}/stories/${id}`, {
        story: { content: story.content },
        ...(wasPublished ? { publish: 1 } : {}),
      });
    }
    await sleep(250);
  }

  // ── Report ────────────────────────────────────────────────────
  console.log(`stories ${apply ? "updated" : "that would change"}: ${touched.length}`);
  for (const slug of touched) console.log(`  ${slug}`);

  console.log("\nfield migrations:");
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) console.log("  none — content already migrated");
  for (const [key, n] of entries) console.log(`  ${String(n).padStart(5)} × ${key}`);

  console.log("\nNOT handled automatically — review by hand:");
  for (const [field, why] of MANUAL_REVIEW) console.log(`  ${field}\n      ${why}`);

  if (!apply && touched.length > 0) console.log("\nRe-run with --apply to commit these changes.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
