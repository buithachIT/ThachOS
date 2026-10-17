"use client";

import type { AppId } from "@portfolio/shared";
import { type ReactNode, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { useWindows, windowsStore } from "@/stores/windows";
import { Window } from "./Window";

export type AppContents = Partial<Record<AppId, ReactNode>>;

/** Renders open windows over the desktop and keeps the store's viewport in sync with it. */
export function WindowLayer({ apps }: { apps: AppContents }) {
  const ref = useRef<HTMLDivElement>(null);
  // Strings only: useShallow compares items by identity, so tuples here would loop forever.
  const ids = useWindows(useShallow((s) => s.windows.map((w) => w.id)));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () =>
      windowsStore.getState().setViewport({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 isolate">
      {ids.map((id) => (
        <Window key={id} id={id} apps={apps} />
      ))}
    </div>
  );
}
