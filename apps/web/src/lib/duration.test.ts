import { describe, expect, it } from "vitest";
import { formatDuration, formatMonth } from "./duration";

const NOW = new Date(2026, 9, 17); // 17/10/2026

describe("formatDuration", () => {
  it.each([
    ["2025-10", "2026-02", "5 tháng"],
    ["2025-04", "2025-07", "4 tháng"],
    ["2024-01", "2024-12", "1 năm"],
    ["2023-04", "2024-11", "1 năm 8 tháng"],
    ["2025-03", "2025-03", "1 tháng"],
  ] as const)("%s → %s = %s", (start, end, expected) => {
    expect(formatDuration(start, end, NOW)).toBe(expected);
  });

  it("counts a present role up to the current month", () => {
    expect(formatDuration("2025-09", "present", NOW)).toBe("1 năm 2 tháng");
  });

  it("says under a month for a present role that started this month", () => {
    expect(formatDuration("2026-10", "present", NOW)).toBe("Dưới 1 tháng");
    expect(formatDuration("2027-01", "present", NOW)).toBe("Dưới 1 tháng");
  });
});

describe("formatMonth", () => {
  it("formats months and present", () => {
    expect(formatMonth("2025-04")).toBe("04/2025");
    expect(formatMonth("present")).toBe("Hiện tại");
  });
});
