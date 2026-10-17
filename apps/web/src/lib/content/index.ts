import "server-only";
import path from "node:path";
import * as load from "./load";

export { ContentError } from "./load";
export { renderMdx } from "./mdx";

/**
 * Repo-level `content/` folder. `next dev`/`next build` run with cwd = apps/web.
 * Deploy (task 7) must keep that cwd or ship `content/` alongside the server output.
 */
export const CONTENT_DIR = path.resolve(process.cwd(), "../../content");

export const getProfile = () => load.loadProfile(CONTENT_DIR);
export const getExperiences = () => load.loadExperiences(CONTENT_DIR);
export const getProjects = () => load.loadProjects(CONTENT_DIR);
export const getAllContent = () => load.loadAllContent(CONTENT_DIR);
