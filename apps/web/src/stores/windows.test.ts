import type { AppId } from "@portfolio/shared";
import { describe, expect, it, vi } from "vitest";
import { CASCADE, MIN_SIZE, MIN_VISIBLE_X, TITLE_BAR_HEIGHT, Z_LIMIT } from "./window-geometry";
import {
  browserLayoutStorage,
  createWindowsStore,
  type LayoutStorage,
  parseLayout,
} from "./windows";
import type { Rect } from "./window-geometry";

function memoryStorage(initial: Partial<Record<AppId, Rect>> = {}): LayoutStorage & {
  data: Partial<Record<AppId, Rect>>;
} {
  const s = {
    data: { ...initial },
    load: () => ({ ...s.data }),
    save: (layout: Partial<Record<AppId, Rect>>) => {
      s.data = { ...layout };
    },
  };
  return s;
}

const VIEWPORT = { w: 1280, h: 760 };
const setup = (storage = memoryStorage()) => {
  const store = createWindowsStore(storage, VIEWPORT);
  const win = (id: string) => store.getState().windows.find((w) => w.id === id)!;
  return { store, storage, win, s: store.getState };
};

describe("open", () => {
  it("opens one window per app; opening again focuses and restores it", () => {
    const { s, win } = setup();
    const about = s().open("about");
    s().open("projects");
    s().minimize(about);

    expect(s().open("about")).toBe(about);
    expect(s().windows).toHaveLength(2);
    expect(win(about).minimized).toBe(false);
    expect(win(about).z).toBeGreaterThan(win(s().windows[1]!.id).z);
  });

  it("cascades new windows so they never sit exactly on top of each other", () => {
    const { s, win } = setup();
    const a = win(s().open("about"));
    const b = win(s().open("contact"));
    expect(b.x - a.x).toBe(CASCADE.step);
    expect(b.y - a.y).toBe(CASCADE.step);
  });

  it("never opens on top of an existing window after one was closed", () => {
    const { s, win } = setup();
    const about = s().open("about"); // step 0
    const projects = s().open("projects"); // step 1
    s().close(about);
    const experience = win(s().open("experience"));
    const p = win(projects);
    expect([experience.x, experience.y]).not.toEqual([p.x, p.y]);
    expect([experience.x, experience.y]).toEqual([CASCADE.x, CASCADE.y]); // reuses free step 0
  });

  it("keeps a new window inside a small viewport", () => {
    const store = createWindowsStore(memoryStorage(), { w: 500, h: 400 });
    const id = store.getState().open("projects"); // default 840×600
    const w = store.getState().windows.find((x) => x.id === id)!;
    expect(w.w).toBeLessThanOrEqual(500);
    expect(w.h).toBeLessThanOrEqual(400);
    expect(w.y).toBeLessThanOrEqual(400 - TITLE_BAR_HEIGHT);
  });

  it("reopens at the remembered position and size", () => {
    const { s, win, storage } = setup();
    const id = s().open("about");
    s().move(id, 300, 200);
    s().resize(id, 500, 400);
    s().close(id);

    const again = win(s().open("about"));
    expect(again).toMatchObject({ x: 300, y: 200, w: 500, h: 400 });
    expect(storage.data.about).toEqual({ x: 300, y: 200, w: 500, h: 400 });
  });
});

describe("focus and z-index", () => {
  it("brings the focused window to the top", () => {
    const { s, win } = setup();
    const a = s().open("about");
    const b = s().open("projects");
    s().focus(a);
    expect(win(a).z).toBeGreaterThan(win(b).z);
  });

  it("renumbers z once it passes the limit, keeping the order", () => {
    const { s, win } = setup();
    const ids = [s().open("about"), s().open("projects"), s().open("contact")];
    for (let i = 0; i < Z_LIMIT; i++) s().focus(ids[i % 3]!);

    const zs = s().windows.map((w) => w.z);
    expect(Math.max(...zs)).toBeLessThanOrEqual(Z_LIMIT);
    // Last focus was ids[(Z_LIMIT - 1) % 3]; it must still be on top.
    const last = ids[(Z_LIMIT - 1) % 3]!;
    expect(win(last).z).toBe(Math.max(...zs));
  });
});

describe("move and resize limits", () => {
  it("enforces the minimum size", () => {
    const { s, win } = setup();
    const id = s().open("about");
    s().resize(id, 10, 10);
    expect(win(id)).toMatchObject({ w: MIN_SIZE.w, h: MIN_SIZE.h });
  });

  it("never lets the title bar leave the screen", () => {
    const { s, win } = setup();
    const id = s().open("about");
    const { w } = win(id);

    s().move(id, -5000, -5000);
    expect(win(id).x).toBe(MIN_VISIBLE_X - w);
    expect(win(id).y).toBe(0);

    s().move(id, 5000, 5000);
    expect(win(id).x).toBe(VIEWPORT.w - MIN_VISIBLE_X);
    expect(win(id).y).toBe(VIEWPORT.h - TITLE_BAR_HEIGHT);
  });

  it("pulls windows back in when the viewport shrinks", () => {
    const { s, win } = setup();
    const id = s().open("about");
    s().move(id, 1100, 600);
    s().setViewport({ w: 800, h: 500 });
    expect(win(id).x).toBeLessThanOrEqual(800 - MIN_VISIBLE_X);
    expect(win(id).y).toBeLessThanOrEqual(500 - TITLE_BAR_HEIGHT);
    expect(win(id).w).toBeLessThanOrEqual(800);
  });
});

describe("saved layout", () => {
  it.each([
    ["null", "null"],
    ["not JSON", "{oops"],
    ["wrong types", JSON.stringify({ about: { x: "a", y: 1, w: 2, h: 3 } })],
    ["unknown app", JSON.stringify({ nope: { x: 1, y: 1, w: 400, h: 300 } })],
  ])("ignores a corrupted value (%s)", (_label, raw) => {
    expect(parseLayout(raw)).toEqual({});
  });

  it("opens normally when the stored layout is corrupted", () => {
    vi.stubGlobal("localStorage", { getItem: () => "null", setItem: () => {} });
    try {
      const store = createWindowsStore(browserLayoutStorage, VIEWPORT);
      store.getState().open("about");
      expect(store.getState().windows[0]).toMatchObject({ x: CASCADE.x, y: CASCADE.y });
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("setRect commits position and size in one write", () => {
    const { s, win, storage } = setup();
    const id = s().open("about");
    s().setRect(id, { x: 200, y: 100, w: 10, h: 10 });
    expect(win(id)).toMatchObject({ x: 200, y: 100, w: MIN_SIZE.w, h: MIN_SIZE.h });
    expect(storage.data.about).toEqual({ x: 200, y: 100, w: MIN_SIZE.w, h: MIN_SIZE.h });
  });
});

describe("other actions", () => {
  it("minimize, toggleMaximize, close and closeAll", () => {
    const { s, win } = setup();
    const a = s().open("about");
    s().open("projects");

    s().minimize(a);
    expect(win(a).minimized).toBe(true);
    s().toggleMaximize(a);
    expect(win(a).maximized).toBe(true);
    s().toggleMaximize(a);
    expect(win(a).maximized).toBe(false);

    s().close(a);
    expect(s().windows.map((w) => w.appId)).toEqual(["projects"]);
    s().closeAll();
    expect(s().windows).toEqual([]);
  });

  it("keeps working when localStorage is blocked", () => {
    const blocked = () => {
      throw new Error("blocked");
    };
    vi.stubGlobal("localStorage", { getItem: blocked, setItem: blocked });
    try {
      const store = createWindowsStore(browserLayoutStorage, VIEWPORT);
      const id = store.getState().open("about");
      store.getState().move(id, 200, 150);
      expect(store.getState().windows[0]).toMatchObject({ x: 200, y: 150 });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
