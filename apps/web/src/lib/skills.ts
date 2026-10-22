export type SkillGroup = { count: number; skills: string[] };

/**
 * How many places (jobs + projects) used each technology, grouped by that count, most used first.
 * No made-up proficiency levels: the count is the only signal.
 */
export function groupSkills(stacks: string[][]): SkillGroup[] {
  const counts = new Map<string, number>();
  for (const stack of stacks) {
    for (const skill of new Set(stack)) counts.set(skill, (counts.get(skill) ?? 0) + 1);
  }
  const groups = new Map<number, string[]>();
  for (const [skill, count] of counts) groups.set(count, [...(groups.get(count) ?? []), skill]);
  return [...groups]
    .sort(([a], [b]) => b - a)
    .map(([count, skills]) => ({ count, skills: skills.sort((a, b) => a.localeCompare(b)) }));
}
