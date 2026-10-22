"use client";

import type { Project } from "@portfolio/shared";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useWindowSubpath } from "@/stores/WindowsProvider";
import type { Rendered } from "../types";
import { DrawingPlaceholder, linkClass, StackChips, StackList } from "../ui";

type Props = { projects: Rendered<Project>[]; initialSlug?: string };

/** Featured first, otherwise keep the loader's `order`. */
const byFeatured = (a: Rendered<Project>, b: Rendered<Project>) =>
  Number(b.data.featured) - Number(a.data.featured);

export function ProjectsApp({ projects, initialSlug }: Props) {
  const [slug, setSlug] = useWindowSubpath(initialSlug);
  const [filters, setFilters] = useState<string[]>([]);

  const sorted = useMemo(() => [...projects].sort(byFeatured), [projects]);
  const allStack = useMemo(
    () => [...new Set(projects.flatMap((p) => p.data.stack))].sort((a, b) => a.localeCompare(b)),
    [projects],
  );
  const visible = sorted.filter((p) => filters.every((f) => p.data.stack.includes(f)));
  const selected = projects.find((p) => p.slug === slug);

  // Focus follows the viewer's own navigation only, never on first load (deep links, task 5).
  const [navigated, setNavigated] = useState(false);
  const lastOpened = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!navigated || slug) return;
    if (lastOpened.current) document.getElementById(cardId(lastOpened.current))?.focus();
  }, [slug, navigated]);

  const open = (next: string) => {
    setNavigated(true);
    lastOpened.current = next;
    setSlug(next);
  };

  if (selected) {
    return (
      <ProjectDetail project={selected} focusBack={navigated} onBack={() => setSlug(undefined)} />
    );
  }

  const toggle = (tech: string) =>
    setFilters((f) => (f.includes(tech) ? f.filter((x) => x !== tech) : [...f, tech]));

  return (
    <div className="space-y-4 p-6">
      <fieldset>
        <legend className="mb-2 font-mono text-xs tracking-wider text-ink-muted uppercase">
          Lọc theo công nghệ
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {allStack.map((tech) => {
            const on = filters.includes(tech);
            return (
              <button
                key={tech}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(tech)}
                className={`rounded-sm border px-2 py-0.5 font-mono text-[11px] max-md:min-h-11 max-md:px-3 focus-visible:outline-2 focus-visible:outline-accent ${
                  on ? "border-accent bg-accent text-accent-ink" : "border-ink/30 hover:border-ink"
                }`}
              >
                {tech}
              </button>
            );
          })}
        </div>
      </fieldset>

      {visible.length === 0 ? (
        <p className="py-8 text-center font-mono text-sm text-ink-muted">
          Không có project nào dùng đủ các công nghệ đã chọn.
        </p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
          {visible.map((p) => (
            <li key={p.slug}>
              {/* A real link: crawlers and no-JS readers can follow it; with JS it opens in-window. */}
              <a
                href={`/projects/${p.slug}`}
                id={cardId(p.slug)}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  open(p.slug);
                }}
                aria-labelledby={`project-${p.slug}-title`}
                aria-describedby={`project-${p.slug}-summary project-${p.slug}-stack`}
                className="group flex h-full w-full flex-col overflow-hidden rounded-os border border-ink bg-surface text-left shadow-os transition-[translate] duration-100 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <Cover project={p} />
                <span className="flex flex-1 flex-col gap-2 p-3">
                  <span className="flex items-baseline justify-between gap-2">
                    <span id={`project-${p.slug}-title`} className="font-semibold">
                      {p.data.title}
                    </span>
                    {p.data.featured && (
                      <span className="shrink-0 font-mono text-[10px] text-accent uppercase">
                        Nổi bật
                      </span>
                    )}
                  </span>
                  <span id={`project-${p.slug}-summary`} className="text-sm text-ink-muted">
                    {p.data.summary}
                  </span>
                  <span className="mt-auto pt-1">
                    <StackChips stack={p.data.stack} max={5} id={`project-${p.slug}-stack`} />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Cover({ project, large }: { project: Rendered<Project>; large?: boolean }) {
  const size = large ? "aspect-[2/1]" : "aspect-[16/9]";
  return project.data.cover ? (
    <Image
      src={project.data.cover}
      alt=""
      width={large ? 960 : 480}
      height={large ? 480 : 270}
      className={`${size} w-full border-b border-ink object-cover`}
    />
  ) : (
    <DrawingPlaceholder
      label={project.data.title}
      className={`${size} w-full border-0 border-b border-ink`}
    />
  );
}

const cardId = (slug: string) => `project-card-${slug}`;

function ProjectDetail({
  project,
  focusBack,
  onBack,
}: {
  project: Rendered<Project>;
  focusBack: boolean;
  onBack: () => void;
}) {
  const { data, body } = project;
  return (
    <article className="space-y-4 p-6">
      <button
        type="button"
        onClick={onBack}
        autoFocus={focusBack}
        className="font-mono text-xs hover:text-accent max-md:min-h-11 focus-visible:outline-2 focus-visible:outline-accent"
      >
        ← Tất cả project
      </button>
      {/* No placeholder here: a full-width empty drawing would push the case study off screen. */}
      {data.cover && <Cover project={project} large />}
      <header className="space-y-1">
        <h3 className="text-xl font-semibold">{data.title}</h3>
        <p className="font-mono text-xs text-ink-muted">
          {data.role} · {data.year}
        </p>
        <p>{data.summary}</p>
      </header>
      <StackList stack={data.stack} />
      {(data.links.demo || data.links.repo) && (
        <p className="flex gap-4 font-mono text-sm max-md:[&>a]:inline-flex max-md:[&>a]:min-h-11 max-md:[&>a]:items-center">
          {data.links.demo && (
            <a href={data.links.demo} target="_blank" rel="noreferrer" className={linkClass}>
              Demo ↗
            </a>
          )}
          {data.links.repo && (
            <a href={data.links.repo} target="_blank" rel="noreferrer" className={linkClass}>
              Mã nguồn ↗
            </a>
          )}
        </p>
      )}
      <div className="border-t border-ink/20 pt-4">{body}</div>
    </article>
  );
}
