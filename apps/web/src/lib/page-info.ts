import "server-only";
import { getApp } from "@portfolio/shared";
import { getAllContent } from "@/lib/content";
import type { InitialWindow } from "@/stores/windows";
import { pathOf } from "./routes";
import { SITE_NAME } from "./site";

export type PageInfo = { path: string; title: string; description: string };

/** Title and description for a route; shared by page metadata and its OG image. */
export async function pageInfo(win: InitialWindow | null): Promise<PageInfo | null> {
  const { profile, projects } = await getAllContent();
  const path = pathOf(win);
  const person = `${profile.data.name} – ${profile.data.title}`;

  if (!win) return { path, title: `${SITE_NAME} · ${person}`, description: profile.data.tagline };

  if (win.appId === "projects" && win.subpath) {
    const project = projects.find((p) => p.slug === win.subpath);
    if (!project) return null;
    return { path, title: project.data.title, description: project.data.summary };
  }

  const descriptions = {
    about: profile.data.tagline,
    projects: `Các project của ${profile.data.name}: ${projects.map((p) => p.data.title).join(", ")}.`,
    experience: `Kinh nghiệm làm việc của ${profile.data.name}.`,
    contact: `Liên hệ ${profile.data.name}: email, GitHub.`,
  } as const;
  return { path, title: getApp(win.appId).title, description: descriptions[win.appId] };
}
