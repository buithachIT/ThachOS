"use client";

import { getApp } from "@portfolio/shared";
import { APP_ICONS } from "@/desktop/icons";
import { useWindows, windowsStore } from "@/stores/windows";
import { focusWindowElement } from "./focus";

/** Open windows in the system bar. Click focuses a window, restoring it if minimized. */
export function Taskbar() {
  // Only changes on open/close/focus and at the end of a drag, never during one.
  const windows = useWindows((s) => s.windows);
  if (windows.length === 0) return null;
  const top = Math.max(...windows.map((w) => w.z));

  return (
    <nav aria-label="Cửa sổ đang mở" className="min-w-0 overflow-x-auto">
      <ul className="flex gap-1">
        {windows.map((win) => {
          const app = getApp(win.appId);
          const Icon = APP_ICONS[app.icon];
          const isActive = win.z === top && !win.minimized;
          return (
            <li key={win.id}>
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => {
                  windowsStore.getState().focus(win.id);
                  requestAnimationFrame(() => focusWindowElement(win.id));
                }}
                className={`flex h-7 items-center gap-1.5 rounded-os border px-2 font-mono text-xs ${
                  isActive ? "border-ink bg-paper" : "border-transparent hover:border-ink/40"
                } ${win.minimized ? "text-ink-muted" : ""}`}
              >
                <Icon className="size-3.5" />
                {app.title}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
