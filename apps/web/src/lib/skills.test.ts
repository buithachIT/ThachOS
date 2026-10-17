import { describe, expect, it } from "vitest";
import { groupSkills } from "./skills";

describe("groupSkills", () => {
  it("groups by number of places used, most used first, alphabetical within a group", () => {
    const groups = groupSkills([
      ["Next.js", "Tailwind CSS"],
      ["Next.js", "PostgreSQL"],
      ["Next.js", "Tailwind CSS", "Docker"],
    ]);
    expect(groups).toEqual([
      { count: 3, skills: ["Next.js"] },
      { count: 2, skills: ["Tailwind CSS"] },
      { count: 1, skills: ["Docker", "PostgreSQL"] },
    ]);
  });

  it("counts a skill once per place even if listed twice", () => {
    expect(groupSkills([["Go", "Go"]])).toEqual([{ count: 1, skills: ["Go"] }]);
  });
});
