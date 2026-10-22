"use client";

import type { Profile } from "@portfolio/shared";
import { useRef, useState } from "react";
import { linkClass } from "../ui";

export function ContactApp({ links }: { links: Profile["links"] }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2500);
  };

  const rows = [
    { label: "GitHub", href: links.github, text: links.github.replace(/^https?:\/\//, "") },
    links.linkedin && {
      label: "LinkedIn",
      href: links.linkedin,
      text: links.linkedin.replace(/^https?:\/\//, ""),
    },
    links.website && {
      label: "Website",
      href: links.website,
      text: links.website.replace(/^https?:\/\//, ""),
    },
  ].filter((r): r is { label: string; href: string; text: string } => Boolean(r));

  return (
    <div className="space-y-6 p-6">
      <p>Cách nhanh nhất để liên lạc là email.</p>

      <div className="space-y-2">
        <p className="font-mono text-xs tracking-wider text-ink-muted uppercase">Email</p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`mailto:${links.email}`}
            className={`font-mono max-md:inline-flex max-md:min-h-11 max-md:items-center ${linkClass}`}
          >
            {links.email}
          </a>
          <button
            type="button"
            onClick={copy}
            className="rounded-os border border-ink px-2.5 py-1 font-mono text-xs max-md:min-h-11 hover:bg-ink/10 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Copy email
          </button>
          <span role="status" aria-live="polite" className="font-mono text-xs text-accent">
            {status === "copied" && "Đã copy!"}
            {status === "failed" && "Không copy được, hãy chọn và copy tay."}
          </span>
        </div>
      </div>

      <dl className="space-y-2">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[5.5rem_1fr] items-baseline gap-2">
            <dt className="font-mono text-xs tracking-wider text-ink-muted uppercase">
              {row.label}
            </dt>
            <dd className="min-w-0 truncate">
              <a
                href={row.href}
                target="_blank"
                rel="noreferrer"
                className={`font-mono text-sm max-md:inline-flex max-md:min-h-11 max-md:items-center ${linkClass}`}
              >
                {row.text}
              </a>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
