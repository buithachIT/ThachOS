import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ContentError, loadAllContent, loadExperiences, loadProfile, loadProjects } from "./load";

let dir: string;

beforeEach(async () => {
  dir = await mkdtemp(path.join(tmpdir(), "content-"));
  await mkdir(path.join(dir, "experience"));
  await mkdir(path.join(dir, "projects"));
});

afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

const write = (file: string, frontmatter: string, body = "Nội dung.") =>
  writeFile(path.join(dir, file), `---\n${frontmatter.trim()}\n---\n\n${body}\n`);

const PROFILE = `
name: Bùi Công Thạch
title: Fullstack Developer
tagline: Xây web nhanh
location: Hồ Chí Minh
links:
  email: a@example.com
  github: https://github.com/example
`;

const experience = (company: string, start: string, end = "present") => `
company: ${company}
role: Developer
start: "${start}"
end: "${end}"
stack: [Next.js]
`;

const project = (title: string, order: number) => `
title: ${title}
summary: Một câu
stack: [Next.js]
role: Fullstack
year: 2025
order: ${order}
`;

async function expectContentError(promise: Promise<unknown>) {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ContentError);
  return error as ContentError;
}

describe("loadProfile", () => {
  it("parses valid frontmatter and keeps the MDX body", async () => {
    await write("profile.mdx", PROFILE, "Giới thiệu **dài**.");
    const profile = await loadProfile(dir);
    expect(profile.slug).toBe("profile");
    expect(profile.data.name).toBe("Bùi Công Thạch");
    expect(profile.data.links.email).toBe("a@example.com");
    expect(profile.body).toBe("Giới thiệu **dài**.");
  });

  it("reports the file and field when a required field is missing", async () => {
    await write("profile.mdx", PROFILE.replace("title: Fullstack Developer\n", ""));
    const error = await expectContentError(loadProfile(dir));
    expect(error.problems).toEqual([expect.stringMatching(/content\/profile\.mdx: title: /)]);
  });

  it("reports a file without frontmatter", async () => {
    await writeFile(path.join(dir, "profile.mdx"), "Chỉ có thân, không có frontmatter.");
    const error = await expectContentError(loadProfile(dir));
    expect(error.message).toContain("content/profile.mdx: thiếu frontmatter");
  });
});

describe("loadExperiences", () => {
  it("sorts by start, most recent first, and uses the file name as slug", async () => {
    await write("experience/old.mdx", experience("Old", "2022-01", "2023-01"));
    await write("experience/new.mdx", experience("New", "2025-09"));
    await write("experience/mid.mdx", experience("Mid", "2024-03", "2025-08"));
    const entries = await loadExperiences(dir);
    expect(entries.map((e) => e.slug)).toEqual(["new", "mid", "old"]);
  });

  it("rejects end before start and a bad month format", async () => {
    await write("experience/backwards.mdx", experience("A", "2025-05", "2024-01"));
    await write("experience/bad-month.mdx", experience("B", "2025-13"));
    const error = await expectContentError(loadExperiences(dir));
    expect(error.problems).toEqual([
      expect.stringMatching(/experience\/backwards\.mdx: end: /),
      expect.stringMatching(/experience\/bad-month\.mdx: start: /),
    ]);
  });
});

describe("loadProjects", () => {
  it("sorts by order and applies defaults", async () => {
    await write("projects/b.mdx", project("B", 2));
    await write("projects/a.mdx", project("A", 1));
    const entries = await loadProjects(dir);
    expect(entries.map((e) => e.data.title)).toEqual(["A", "B"]);
    expect(entries[0]?.data.featured).toBe(false);
    expect(entries[0]?.data.links).toEqual({});
  });

  it("names the file and field when a project is missing order", async () => {
    await write("projects/no-order.mdx", project("X", 1).replace("order: 1", ""));
    const error = await expectContentError(loadProjects(dir));
    expect(error.problems).toEqual([expect.stringMatching(/projects\/no-order\.mdx: order: /)]);
  });
});

describe("loadAllContent", () => {
  it("collects problems from every collection before failing", async () => {
    await write("profile.mdx", PROFILE.replace("name: Bùi Công Thạch\n", ""));
    await write("projects/p.mdx", project("P", 1).replace("summary: Một câu\n", ""));
    const error = await expectContentError(loadAllContent(dir));
    expect(error.problems).toHaveLength(2);
    expect(error.message).toContain("content/profile.mdx: name: ");
    expect(error.message).toContain("content/projects/p.mdx: summary: ");
  });
});

describe("repo content", () => {
  it("is valid", async () => {
    const content = await loadAllContent(
      path.resolve(import.meta.dirname, "../../../../../content"),
    );
    expect(content.projects.length).toBeGreaterThan(0);
    expect(content.experiences.length).toBeGreaterThan(0);
  });
});
