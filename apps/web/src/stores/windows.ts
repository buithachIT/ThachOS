import { type AppId, appIdSchema, getApp } from "@portfolio/shared";
import { z } from "zod";
import { createStore } from "zustand/vanilla";
import {
  CASCADE,
  cascadePosition,
  clampPosition,
  clampRect,
  clampSize,
  normalizeZ,
  type Rect,
  type Size,
} from "./window-geometry";

export type WindowState = {
  id: string;
  appId: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  /** Where the app is inside its window, e.g. a project slug. Mirrored in the URL. */
  subpath?: string;
};

export type WindowsState = {
  windows: WindowState[];
  /** Size of the desktop area windows live in (below the system bar). */
  viewport: Size;
  open: (appId: AppId) => string;
  close: (id: string) => void;
  focus: (id: string) => void;
  move: (id: string, x: number, y: number) => void;
  resize: (id: string, w: number, h: number) => void;
  minimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  closeAll: () => void;
  /** Commit a drag or resize in one update (one storage write, later one realtime event). */
  setRect: (id: string, rect: Rect) => void;
  setViewport: (viewport: Size) => void;
  setSubpath: (id: string, subpath: string | undefined) => void;
};

/** The window a page starts with, e.g. `/projects/aurore` → projects + "aurore". */
export type InitialWindow = { appId: AppId; subpath?: string };

/** Remembered position/size per app. Only geometry: the open-window list is never restored. */
export type LayoutStorage = {
  load: () => Partial<Record<AppId, Rect>>;
  save: (layout: Partial<Record<AppId, Rect>>) => void;
};

export const LAYOUT_STORAGE_KEY = "thachos-window-layout";

const rectSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  w: z.number().finite(),
  h: z.number().finite(),
});
const layoutSchema = z.partialRecord(appIdSchema, rectSchema);

/** Anything we can't trust (hand-edited, old format, "null") means no saved layout. */
export function parseLayout(raw: string | null): Partial<Record<AppId, Rect>> {
  if (!raw) return {};
  try {
    const result = layoutSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

export const browserLayoutStorage: LayoutStorage = {
  load() {
    try {
      return parseLayout(localStorage.getItem(LAYOUT_STORAGE_KEY));
    } catch {
      return {};
    }
  },
  save(layout) {
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // Storage blocked: layout just won't be remembered.
    }
  },
};

export const DEFAULT_VIEWPORT: Size = { w: 1280, h: 760 };

export function createWindowsStore(
  storage: LayoutStorage = browserLayoutStorage,
  viewport: Size = DEFAULT_VIEWPORT,
  initial?: InitialWindow,
) {
  let counter = 0;

  const store = createStore<WindowsState>()((set, get) => {
    const topZ = () => Math.max(0, ...get().windows.map((w) => w.z));

    const update = (id: string, patch: (w: WindowState) => Partial<WindowState>) =>
      set((s) => ({ windows: s.windows.map((w) => (w.id === id ? { ...w, ...patch(w) } : w)) }));

    const remember = (id: string) => {
      const win = get().windows.find((w) => w.id === id);
      if (!win) return;
      const { x, y, w, h } = win;
      storage.save({ ...storage.load(), [win.appId]: { x, y, w, h } });
    };

    /** First cascade step no open window sits on, so new windows never stack exactly. */
    const freeCascadeRect = (appId: AppId, vp: Size): Rect => {
      const size = getApp(appId).defaultSize;
      const taken = (r: Rect) => get().windows.some((w) => w.x === r.x && w.y === r.y);
      for (let n = 0; n < CASCADE.every; n++) {
        const rect = clampRect({ ...cascadePosition(n), ...size }, vp);
        if (!taken(rect)) return rect;
      }
      return clampRect({ ...cascadePosition(get().windows.length), ...size }, vp);
    };

    const raise = (id: string) =>
      set((s) => {
        const z = topZ() + 1;
        return { windows: normalizeZ(s.windows.map((w) => (w.id === id ? { ...w, z } : w))) };
      });

    return {
      // The initial window must be part of the *initial* state: the server render reads
      // getInitialState(), so opening it after creation would leave the server HTML empty.
      windows: initial ? [initialWindow(initial, viewport, ++counter)] : [],
      viewport,

      open(appId) {
        const existing = get().windows.find((w) => w.appId === appId);
        if (existing) {
          update(existing.id, () => ({ minimized: false }));
          raise(existing.id);
          return existing.id;
        }

        const vp = get().viewport;
        const saved = storage.load()[appId];
        const rect = saved ? clampRect(saved, vp) : freeCascadeRect(appId, vp);
        const id = `${appId}-${++counter}`;
        set((s) => ({
          windows: normalizeZ([
            ...s.windows,
            { id, appId, ...rect, z: topZ() + 1, minimized: false, maximized: false },
          ]),
        }));
        return id;
      },

      close: (id) => set((s) => ({ windows: s.windows.filter((w) => w.id !== id) })),

      focus(id) {
        if (!get().windows.some((w) => w.id === id)) return;
        update(id, () => ({ minimized: false }));
        raise(id);
      },

      move(id, x, y) {
        update(id, (w) => clampPosition({ ...w, x, y }, get().viewport));
        remember(id);
      },

      resize(id, w, h) {
        update(id, (win) =>
          clampRect({ ...win, ...clampSize({ w, h }, get().viewport) }, get().viewport),
        );
        remember(id);
      },

      setRect(id, rect) {
        update(id, () => clampRect(rect, get().viewport));
        remember(id);
      },

      minimize: (id) => update(id, () => ({ minimized: true })),

      toggleMaximize(id) {
        update(id, (w) => ({ maximized: !w.maximized }));
        raise(id);
      },

      closeAll: () => set({ windows: [] }),

      setSubpath: (id, subpath) => update(id, () => ({ subpath })),

      setViewport(vp) {
        set((s) => ({
          viewport: vp,
          // Keep untouched windows as the same object so they don't re-render.
          windows: s.windows.map((w) => {
            const r = clampRect(w, vp);
            return r.x === w.x && r.y === w.y && r.w === w.w && r.h === w.h ? w : { ...w, ...r };
          }),
        }));
      },
    };
  });

  return store;
}

export type WindowsStore = ReturnType<typeof createWindowsStore>;

/** Deep-link window: first cascade slot, default size, no saved layout (same on server and client). */
function initialWindow(initial: InitialWindow, viewport: Size, n: number): WindowState {
  const rect = clampRect({ ...cascadePosition(0), ...getApp(initial.appId).defaultSize }, viewport);
  return {
    id: `${initial.appId}-${n}`,
    appId: initial.appId,
    ...rect,
    z: 1,
    minimized: false,
    maximized: false,
    subpath: initial.subpath,
  };
}
