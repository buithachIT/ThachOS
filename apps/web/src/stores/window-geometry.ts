/** Pure geometry for the window manager. No React, no DOM. */

export type Size = { w: number; h: number };
export type Rect = { x: number; y: number; w: number; h: number };

export const MIN_SIZE: Size = { w: 320, h: 240 };
export const TITLE_BAR_HEIGHT = 36;
/** How much of the title bar must stay visible horizontally. */
export const MIN_VISIBLE_X = 80;
// x clears the desktop icon column (~120px wide).
export const CASCADE = { x: 136, y: 24, step: 32, every: 8 };
export const Z_LIMIT = 1000;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/** Enforce the minimum size, and shrink to the viewport when it is smaller than the window. */
export function clampSize(size: Size, viewport: Size): Size {
  return {
    w: Math.max(MIN_SIZE.w, Math.min(size.w, viewport.w)),
    h: Math.max(MIN_SIZE.h, Math.min(size.h, viewport.h)),
  };
}

/** Keep the title bar reachable: never above the desktop, never below it, and partly on screen sideways. */
export function clampPosition(rect: Rect, viewport: Size): Pick<Rect, "x" | "y"> {
  const minX = Math.min(0, MIN_VISIBLE_X - rect.w);
  const maxX = Math.max(0, viewport.w - MIN_VISIBLE_X);
  const maxY = Math.max(0, viewport.h - TITLE_BAR_HEIGHT);
  return { x: clamp(rect.x, minX, maxX), y: clamp(rect.y, 0, maxY) };
}

export function clampRect(rect: Rect, viewport: Size): Rect {
  const size = clampSize(rect, viewport);
  return { ...size, ...clampPosition({ ...rect, ...size }, viewport) };
}

/** Where the nth window opens: stepped diagonally so windows never stack exactly. */
export function cascadePosition(index: number): Pick<Rect, "x" | "y"> {
  const n = index % CASCADE.every;
  return { x: CASCADE.x + n * CASCADE.step, y: CASCADE.y + n * CASCADE.step };
}

/** Renumber z values 1..n keeping their order, once the top value passes Z_LIMIT. */
export function normalizeZ<T extends { id: string; z: number }>(items: T[]): T[] {
  const top = Math.max(0, ...items.map((i) => i.z));
  if (top <= Z_LIMIT) return items;
  const rank = new Map([...items].sort((a, b) => a.z - b.z).map((item, i) => [item.id, i + 1]));
  return items.map((item) => ({ ...item, z: rank.get(item.id) ?? item.z }));
}
