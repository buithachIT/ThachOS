import type { Experience } from "@portfolio/shared";

const toMonths = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return (y ?? 0) * 12 + (m ?? 1) - 1;
};

export const currentYearMonth = (now = new Date()) =>
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

/**
 * Length of a role, counting both the first and last month (10/2025–02/2026 = 5 tháng).
 * A `present` role that started this month is "Dưới 1 tháng".
 */
export function formatDuration(
  start: string,
  end: Experience["end"],
  now: Date = new Date(),
): string {
  const thisMonth = currentYearMonth(now);
  // Started this month, or (bad data) in the future.
  if (end === "present" && start >= thisMonth) return "Dưới 1 tháng";

  const months = toMonths(end === "present" ? thisMonth : end) - toMonths(start) + 1;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years && `${years} năm`, rest && `${rest} tháng`].filter(Boolean).join(" ");
}

/** "10/2025" or "Hiện tại". */
export const formatMonth = (ym: Experience["end"]) => {
  if (ym === "present") return "Hiện tại";
  const [y, m] = ym.split("-");
  return `${m}/${y}`;
};
