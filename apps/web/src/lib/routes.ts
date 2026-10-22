import { APP_IDS, type AppId, appIdSchema } from "@portfolio/shared";
import type { InitialWindow, WindowState } from "@/stores/windows";

/** Apps whose window has sub-pages in the URL (`/projects/<slug>`). */
const APPS_WITH_SUBPATH: readonly AppId[] = ["projects"];

/** `/` → no window; `/about` → about; `/projects/x` → projects + "x"; anything else → undefined. */
export function parsePath(pathname: string): InitialWindow | null | undefined {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const app = appIdSchema.safeParse(parts[0]);
  if (!app.success) return undefined;
  if (parts.length === 1) return { appId: app.data };
  if (parts.length === 2 && APPS_WITH_SUBPATH.includes(app.data)) {
    return { appId: app.data, subpath: decodeURIComponent(parts[1]!) };
  }
  return undefined;
}

export function pathOf(win: InitialWindow | null): string {
  if (!win) return "/";
  return win.subpath ? `/${win.appId}/${encodeURIComponent(win.subpath)}` : `/${win.appId}`;
}

/** The URL follows the focused window: the top one that isn't minimized. */
export function pathForWindows(windows: WindowState[]): string {
  const top = windows.filter((w) => !w.minimized).sort((a, b) => b.z - a.z)[0];
  return pathOf(top ? { appId: top.appId, subpath: top.subpath } : null);
}

/** Every route the site serves, for static params and the sitemap. */
export function allPaths(projectSlugs: string[]): string[][] {
  return [[], ...APP_IDS.map((id) => [id]), ...projectSlugs.map((slug) => ["projects", slug])];
}
