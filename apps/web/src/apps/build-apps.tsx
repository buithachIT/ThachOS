import "server-only";
import { cacheLife } from "next/cache";
import { getAllContent, renderMdx } from "@/lib/content";
import { mdxComponents } from "@/lib/content/mdx-components";
import { groupSkills } from "@/lib/skills";
import type { AppContents } from "@/windows/WindowLayer";
import { AboutApp } from "./about/AboutApp";
import { ContactApp } from "./contact/ContactApp";
import { ExperienceApp } from "./experience/ExperienceApp";
import { ProjectsApp } from "./projects/ProjectsApp";

const render = (body: string) => renderMdx(body, mdxComponents);

/**
 * Load content, render every MDX body on the server, and build each app window's content.
 * Content only changes with a deploy, so it's cached and the page prerenders statically.
 * (Durations for `present` roles are therefore computed at build time.)
 */
export async function buildAppContents(): Promise<AppContents> {
  "use cache";
  cacheLife("max");
  const { profile, experiences, projects } = await getAllContent();
  const [profileBody, exp, proj] = await Promise.all([
    render(profile.body),
    Promise.all(experiences.map(async (e) => ({ ...e, body: await render(e.body) }))),
    Promise.all(projects.map(async (p) => ({ ...p, body: await render(p.body) }))),
  ]);
  const skills = groupSkills([...experiences, ...projects].map((e) => e.data.stack));

  return {
    about: <AboutApp profile={profile.data} body={profileBody} skills={skills} />,
    projects: <ProjectsApp projects={proj} />,
    experience: <ExperienceApp items={exp} />,
    contact: <ContactApp links={profile.data.links} />,
  };
}
