import "server-only";
import path from "node:path";
import { cacheLife } from "next/cache";
import * as load from "./load";

export { ContentError } from "./load";
export { renderMdx } from "./mdx";

/**
 * Repo-level `content/` folder. `next dev`/`next build` run with cwd = apps/web.
 * Deploy (task 7) must keep that cwd or ship `content/` alongside the server output.
 */
export const CONTENT_DIR = path.resolve(process.cwd(), "../../content");

// Content only changes with a deploy: cache every read for as long as possible.

export async function getProfile() {
  "use cache";
  cacheLife("max");
  return load.loadProfile(CONTENT_DIR);
}

export async function getExperiences() {
  "use cache";
  cacheLife("max");
  return load.loadExperiences(CONTENT_DIR);
}

export async function getProjects() {
  "use cache";
  cacheLife("max");
  return load.loadProjects(CONTENT_DIR);
}

export async function getAllContent() {
  "use cache";
  cacheLife("max");
  return load.loadAllContent(CONTENT_DIR);
}
