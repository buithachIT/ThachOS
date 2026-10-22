import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { allPaths } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getProjects();
  return allPaths(projects.map((p) => p.slug)).map((path) => ({
    url: `${SITE_URL}/${path.join("/")}`.replace(/\/$/, "") || SITE_URL,
    changeFrequency: "monthly",
    priority: path.length === 0 ? 1 : 0.7,
  }));
}
