import type { MDXComponents } from "mdx/types";

/** Typography for MDX bodies, following docs/design.md. */
export const mdxComponents: MDXComponents = {
  h2: (p) => (
    <h3
      className="mt-6 mb-2 font-mono text-xs font-medium tracking-wider text-ink-muted uppercase first:mt-0"
      {...p}
    />
  ),
  h3: (p) => <h4 className="mt-4 mb-1 font-medium" {...p} />,
  p: (p) => <p className="mb-3 leading-relaxed last:mb-0" {...p} />,
  ul: (p) => <ul className="mb-3 list-[square] space-y-1.5 pl-5 marker:text-accent" {...p} />,
  ol: (p) => <ol className="mb-3 list-decimal space-y-1.5 pl-5" {...p} />,
  li: (p) => <li className="leading-relaxed" {...p} />,
  strong: (p) => <strong className="font-semibold" {...p} />,
  a: (p) => (
    <a
      className="text-accent underline decoration-1 underline-offset-2 hover:decoration-2"
      target={p.href?.startsWith("http") ? "_blank" : undefined}
      rel={p.href?.startsWith("http") ? "noreferrer" : undefined}
      {...p}
    />
  ),
  pre: (p) => (
    <pre
      className="mb-3 overflow-x-auto rounded-os border border-ink/30 bg-paper p-3 font-mono text-xs leading-relaxed [&>code]:bg-transparent [&>code]:p-0"
      {...p}
    />
  ),
  code: (p) => <code className="rounded-sm bg-ink/8 px-1 font-mono text-[0.9em]" {...p} />,
};
