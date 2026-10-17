"use client";

import { useEffect } from "react";
import { parsePath, pathForWindows } from "@/lib/routes";
import type { WindowState } from "@/stores/windows";
import { useWindowsApi } from "@/stores/WindowsProvider";

/** Which windows exist and where they are; focus changes alone don't change it. */
const historyKey = (windows: WindowState[]) =>
  windows
    .map((w) => `${w.appId}:${w.subpath ?? ""}`)
    .sort()
    .join("|");

/**
 * Keeps the URL and the windows in step, without reloading. Opening/closing a window or
 * changing its sub-page adds a history entry; only switching focus replaces the current one,
 * so clicking between windows doesn't flood Back. Back/Forward re-open what the URL says;
 * `/` means an empty desktop, so it closes every window.
 *
 * Note: this uses history.pushState, so Next's router keeps the tree of the first URL.
 * Don't rely on usePathname/<Link> inside the desktop for window state.
 */
export function UrlSync() {
  const store = useWindowsApi();

  useEffect(() => {
    let applying = false;
    let lastKey = historyKey(store.getState().windows);

    const unsubscribe = store.subscribe((state) => {
      const key = historyKey(state.windows);
      const changed = key !== lastKey;
      lastKey = key;
      if (applying) return;
      const path = pathForWindows(state.windows);
      if (path === window.location.pathname) return;
      if (changed) window.history.pushState(null, "", path);
      else window.history.replaceState(null, "", path);
    });

    const onPopState = () => {
      const target = parsePath(window.location.pathname);
      if (target === undefined) return;
      applying = true;
      try {
        const api = store.getState();
        if (target === null) {
          api.closeAll();
        } else {
          const id = api.open(target.appId);
          api.setSubpath(id, target.subpath);
        }
      } finally {
        applying = false;
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      unsubscribe();
      window.removeEventListener("popstate", onPopState);
    };
  }, [store]);

  return null;
}
