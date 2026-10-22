"use client";

import type { Profile } from "@portfolio/shared";
import Image from "next/image";
import type { ReactNode } from "react";
import { openApp } from "@/desktop/open-app";
import type { SkillGroup } from "@/lib/skills";

type Props = { profile: Profile; body: ReactNode; skills: SkillGroup[] };

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("");

export function AboutApp({ profile, body, skills }: Props) {
  return (
    <article className="space-y-6 p-6">
      <header className="flex items-start gap-4">
        {profile.avatar ? (
          <Image
            src={profile.avatar}
            alt={profile.name}
            width={96}
            height={96}
            className="size-24 shrink-0 rounded-os border border-ink object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="grid size-24 shrink-0 place-items-center rounded-os border border-dashed border-ink/50 bg-paper font-mono text-2xl"
          >
            {initials(profile.name)}
          </div>
        )}
        <div className="min-w-0 space-y-1">
          <h3 className="text-xl font-semibold">{profile.name}</h3>
          <p className="font-mono text-sm text-accent">{profile.title}</p>
          <p className="text-sm text-ink-muted">{profile.location}</p>
          <p className="pt-1 leading-snug">{profile.tagline}</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <QuickOpen label="Xem Projects" onClick={() => openApp("projects")} />
        <QuickOpen label="Liên hệ" onClick={() => openApp("contact")} />
      </div>

      <div>{body}</div>

      <section aria-labelledby="about-skills">
        <h3
          id="about-skills"
          className="mb-1 font-mono text-xs font-medium tracking-wider text-ink-muted uppercase"
        >
          Công nghệ đã dùng
        </h3>
        <p className="mb-3 text-sm text-ink-muted">Đếm theo số công việc và project có dùng.</p>
        <dl className="space-y-2">
          {skills.map((group) => (
            <div key={group.count} className="grid grid-cols-[4.5rem_1fr] items-baseline gap-2">
              <dt className="font-mono text-xs text-ink-muted">{group.count} nơi</dt>
              <dd className="flex flex-wrap gap-1">
                {group.skills.map((s) => (
                  <span
                    key={s}
                    className="rounded-sm border border-ink/30 px-1.5 py-0.5 font-mono text-[11px]"
                  >
                    {s}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}

function QuickOpen({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-os border border-ink bg-surface px-3 py-1.5 font-mono text-xs shadow-os transition-[translate,box-shadow] duration-100 hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:translate-y-px active:shadow-none"
    >
      {label} →
    </button>
  );
}
