import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import {
  type ContentEntry,
  type Experience,
  experienceSchema,
  type Profile,
  type Project,
  profileSchema,
  projectSchema,
} from "@portfolio/shared";
import { parse as parseYaml } from "yaml";
import type { z } from "zod";

/** Thrown when one or more content files are invalid. Lists every problem, one per line. */
export class ContentError extends Error {
  constructor(public readonly problems: string[]) {
    const list = problems.map((p) => "  - " + p).join("\n");
    super(`Nội dung không hợp lệ:\n${list}`);
    this.name = "ContentError";
  }
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

type Parsed<T> = { ok: true; entry: ContentEntry<T> } | { ok: false; problems: string[] };

async function parseFile<T>(
  contentDir: string,
  file: string,
  schema: z.ZodType<T, unknown>,
): Promise<Parsed<T>> {
  const label = path.join("content", path.relative(contentDir, file));
  const slug = path.basename(file, ".mdx");
  const raw = await readFile(file, "utf8");

  const match = FRONTMATTER.exec(raw);
  if (!match) return { ok: false, problems: [`${label}: thiếu frontmatter (khối ---)`] };

  let frontmatter: unknown;
  try {
    frontmatter = parseYaml(match[1] ?? "");
  } catch (error) {
    return { ok: false, problems: [`${label}: YAML lỗi: ${(error as Error).message}`] };
  }

  const result = schema.safeParse(frontmatter ?? {});
  if (!result.success) {
    return {
      ok: false,
      problems: result.error.issues.map(
        (issue) => `${label}: ${issue.path.join(".") || "(gốc)"}: ${issue.message}`,
      ),
    };
  }
  return { ok: true, entry: { slug, data: result.data, body: (match[2] ?? "").trim() } };
}

async function loadCollection<T>(
  contentDir: string,
  folder: string,
  schema: z.ZodType<T, unknown>,
): Promise<ContentEntry<T>[]> {
  const dir = path.join(contentDir, folder);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".mdx")).sort();
  const results = await Promise.all(
    files.map((f) => parseFile(contentDir, path.join(dir, f), schema)),
  );

  const problems = results.flatMap((r) => (r.ok ? [] : r.problems));
  if (problems.length > 0) throw new ContentError(problems);
  return results.flatMap((r) => (r.ok ? [r.entry] : []));
}

export async function loadProfile(contentDir: string): Promise<ContentEntry<Profile>> {
  const result = await parseFile(contentDir, path.join(contentDir, "profile.mdx"), profileSchema);
  if (!result.ok) throw new ContentError(result.problems);
  return result.entry;
}

/** Experiences, most recent `start` first. */
export async function loadExperiences(contentDir: string): Promise<ContentEntry<Experience>[]> {
  const entries = await loadCollection(contentDir, "experience", experienceSchema);
  return entries.sort((a, b) => b.data.start.localeCompare(a.data.start));
}

/** Projects by ascending `order`. */
export async function loadProjects(contentDir: string): Promise<ContentEntry<Project>[]> {
  const entries = await loadCollection(contentDir, "projects", projectSchema);
  return entries.sort((a, b) => a.data.order - b.data.order);
}

/** Load and validate everything; collects problems across all files before throwing. */
export async function loadAllContent(contentDir: string) {
  const [profile, experiences, projects] = await Promise.allSettled([
    loadProfile(contentDir),
    loadExperiences(contentDir),
    loadProjects(contentDir),
  ]);
  if (
    profile.status === "fulfilled" &&
    experiences.status === "fulfilled" &&
    projects.status === "fulfilled"
  ) {
    return { profile: profile.value, experiences: experiences.value, projects: projects.value };
  }
  throw new ContentError([profile, experiences, projects].flatMap(problemsOf));
}

function problemsOf(result: PromiseSettledResult<unknown>): string[] {
  if (result.status === "fulfilled") return [];
  if (result.reason instanceof ContentError) return result.reason.problems;
  throw result.reason;
}
