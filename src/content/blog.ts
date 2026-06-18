/**
 * Blog post registry. Each MDX post lives at
 * `src/app/blog/<slug>/page.mdx`; add a matching entry here so it appears on
 * the index. Deliberately a plain array (no CMS) per the MVP spec.
 */
export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string; // ISO (YYYY-MM-DD)
  excerpt: string;
}

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "why-effort-wins",
    title: "Why small, visible effort beats a polished generic email",
    date: "2026-06-18",
    excerpt:
      "Real case studies from people who landed startup roles by doing something specific — and what that means for how you reach out.",
  },
];

export function getSortedPosts(): BlogPostMeta[] {
  return [...BLOG_POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}
