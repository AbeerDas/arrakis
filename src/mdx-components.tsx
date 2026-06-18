import type { MDXComponents } from "mdx/types";
import Link from "next/link";

// Required by @next/mdx. Provides default styling for MDX blog posts without
// pulling in the Tailwind typography plugin (kept dependency-light for MVP).
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1 className="text-3xl font-semibold tracking-tight" {...props} />
    ),
    h2: (props) => (
      <h2 className="mt-10 text-xl font-semibold tracking-tight" {...props} />
    ),
    h3: (props) => <h3 className="mt-8 text-lg font-semibold" {...props} />,
    p: (props) => <p className="mt-4 leading-7 text-foreground/90" {...props} />,
    ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6" {...props} />,
    ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6" {...props} />,
    li: (props) => <li className="leading-7" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="mt-6 border-l-2 pl-6 italic text-muted-foreground"
        {...props}
      />
    ),
    a: ({ href = "#", ...props }) => (
      <Link
        href={href}
        className="font-medium underline underline-offset-4"
        {...props}
      />
    ),
    hr: (props) => <hr className="my-10" {...props} />,
    ...components,
  };
}
