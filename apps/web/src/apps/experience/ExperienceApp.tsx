import type { Experience } from "@portfolio/shared";
import { formatDuration, formatMonth } from "@/lib/duration";
import type { Rendered } from "../types";
import { StackList } from "../ui";

/** Vertical timeline, most recent first (the loader already sorts by start). */
export function ExperienceApp({ items, now }: { items: Rendered<Experience>[]; now?: Date }) {
  return (
    <ol className="relative space-y-8 p-6 pl-10">
      <span aria-hidden="true" className="absolute top-8 bottom-8 left-[1.4rem] w-px bg-ink/30" />
      {items.map(({ slug, data, body }) => (
        <li key={slug} className="relative">
          <span
            aria-hidden="true"
            className="absolute top-1.5 -left-[1.2rem] size-2.5 border border-ink bg-accent"
          />
          <article className="space-y-2">
            <header>
              <h3 className="font-semibold">{data.company}</h3>
              <p className="font-mono text-sm text-accent">{data.role}</p>
              <p className="font-mono text-xs text-ink-muted">
                {formatMonth(data.start)} – {formatMonth(data.end)} ·{" "}
                {formatDuration(data.start, data.end, now)}
              </p>
            </header>
            <StackList stack={data.stack} />
            <div className="pt-1 text-sm">{body}</div>
          </article>
        </li>
      ))}
    </ol>
  );
}
