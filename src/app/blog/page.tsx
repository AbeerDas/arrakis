import type { Metadata } from "next";
import Link from "next/link";
import { getSortedPosts } from "@/content/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Case studies on what actually works in startup outreach: small, specific, personal effort.",
};

export default function BlogIndexPage() {
  const posts = getSortedPosts();

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Blog</h1>
      <p className="mt-3 text-muted-foreground">
        What actually works in outreach — specific, personal effort over
        polished but generic emails.
      </p>

      <ul className="mt-10 space-y-8">
        {posts.map((post) => (
          <li key={post.slug}>
            <article>
              <time className="text-sm text-muted-foreground">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                <Link href={`/blog/${post.slug}`} className="hover:underline">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted-foreground">{post.excerpt}</p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
